import os
import re
import json
import asyncio
import logging
from fastapi import APIRouter, Request, HTTPException, Query, BackgroundTasks
from fastapi.responses import PlainTextResponse
from app.services.llm_service import LLMService
from app.services.whatsapp_service import WhatsAppService
from app.api.endpoints.properties import search_properties
from app.core.supabase import supabase

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

router = APIRouter()

VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN", "aqarbot_secret_token_2026")

# In-memory session store (Simple State Machine)
sessions = {}
# In-memory deduplication store (cheap first line of defense; the durable
# dedup lives in public.processed_webhook_messages so it survives cold starts).
processed_messages = set()


def _normalize_phone(raw: str) -> str:
    """Extract digits from Meta's `from`/`wa_id` field (always 2126XXXXXXXX)."""
    return re.sub(r"\D", "", raw or "")


def _resolve_agency_id(receiving_phone_number_id: str = None) -> str:
    """
    Deterministic agency resolution for an inbound message.

    Order of preference:
      1. The WhatsApp number that RECEIVED the message, if any agency has
         registered it (agencies.whatsapp_phone_number_id). This is the only
         signal that stays correct when several agencies exist.
      2. The explicitly-marked default agency (agencies.is_default).
      3. The oldest agency (stable fallback; never NULL).
    """
    try:
        if receiving_phone_number_id:
            res = supabase.table("agencies").select("id") \
                .eq("whatsapp_phone_number_id", receiving_phone_number_id).limit(1).execute()
            if res.data:
                return res.data[0]["id"]
        res = supabase.table("agencies").select("id") \
            .eq("is_default", True).order("created_at", desc=False).limit(1).execute()
        if res.data:
            return res.data[0]["id"]
        res = supabase.table("agencies").select("id") \
            .order("created_at", desc=False).limit(1).execute()
        if res.data:
            return res.data[0]["id"]
    except Exception as e:
        logger.error(f"Error resolving agency: {e}")
    return None


def _resolve_or_create_lead(phone_number: str = None, client_name: str = "Prospect",
                            receiving_phone_number_id: str = None) -> tuple:
    """
    Resolve (agency_id, is_ai_paused, full_name) for an inbound phone number.

    - Existing lead: reuse it (back-filling agency_id instead of duplicating).
    - New number: auto-create the lead under the agency resolved from the
      receiving WhatsApp number, or the default agency.
    Every returned agency_id is a real agencies.id - never null/mismatched -
    so the CRM / Hub / Dashboard and the LLM memory all agree on the tenant.
    """
    if not phone_number:
        return None, False, None

    lead = None
    try:
        existing = supabase.table("leads").select("id,agency_id,is_ai_paused,full_name") \
            .eq("phone_number", phone_number).order("created_at", desc=False).limit(1).execute()
        if existing.data:
            lead = existing.data[0]
    except Exception:
        pass

    if lead:
        agency_id = lead.get("agency_id")
        # Lead exists but is unattached: resolve + link instead of duplicating.
        if not agency_id:
            agency_id = _resolve_agency_id(receiving_phone_number_id)
            if agency_id:
                try:
                    supabase.table("leads").update({"agency_id": agency_id}).eq("id", lead["id"]).execute()
                except Exception as e:
                    logger.error(f"Error back-filling lead agency_id: {e}")
        return agency_id, bool(lead.get("is_ai_paused")), lead.get("full_name")

    # New client: attach to the receiving number's agency (or the default).
    agency_id = _resolve_agency_id(receiving_phone_number_id)
    if agency_id:
        try:
            supabase.table("leads").insert({
                "phone_number": phone_number,
                "agency_id": agency_id,
                "full_name": client_name or "Prospect",
                "city": "Unknown",
                "sector": "Unknown",
                "status": "new"
            }).execute()
            logger.info(f"Auto-created lead: {phone_number} under agency {agency_id}")
        except Exception as e:
            logger.error(f"CRITICAL Error auto-creating lead. Exception: {e}", exc_info=True)

    return agency_id, False, client_name or "Prospect"


# ── Client name capture ───────────────────────────────────────────────────
GENERIC_NAMES = {"prospect", "unknown", "n/a", "null", "none", "client", "undefined"}
NOISE_ANSWERS = {
    "salam", "salut", "bonjour", "bonsoir", "hello", "hi", "hey", "slt",
    "wesh", "hllo", "ok", "okay", "wakha", "mzyan", "mzyana", "safi", "la",
    "no", "yes", "aha", "nam", "fine", "merci", "chokran", "shukran",
}
# Tokens the bot's own question uses, so we know the previous reply asked for the name.
NAME_ASK_MARKERS = ("smiytek", "smiya", "ismek", "ismk", "nom", "name", "t9ol", "t-9ol", "اسمك", "الاسم")
# Client messages that explicitly introduce a name (Darija / Arabic / French / English).
NAME_INTRO_PATTERNS = (
    r"\b(?:ana|ismi|smiyti|smiyeti|smiya dyali|smiya dyal|je m'appelle|je suis|my name is|i am|i'm)\b",
    r"(?:اسمي|انا)",
)


def _name_is_missing(full_name, profile_name: str = "") -> bool:
    """Blank/generic names, or a name that is only today's WhatsApp display name."""
    if not full_name or not str(full_name).strip():
        return True
    v = str(full_name).strip().lower()
    if v in GENERIC_NAMES:
        return True
    if profile_name and v == str(profile_name).strip().lower():
        return True
    return False


def _last_bot_message_asked_name(phone_number: str, agency_id: str = None) -> bool:
    """True when the bot's previous reply asked the client for their name.

    Agency-scoped when an agency_id is available, so one agency's turn logic
    can never be influenced by another agency's history.
    """
    try:
        query = supabase.table("conversation_history").select("content") \
            .eq("phone_number", phone_number).eq("role", "model") \
            .order("created_at", desc=True).limit(1)
        if agency_id:
            query = query.eq("agency_id", agency_id)
        res = query.execute()
        if res.data and res.data[0].get("content"):
            last = res.data[0]["content"].lower()
            return any(m in last for m in NAME_ASK_MARKERS)
    except Exception:
        pass
    return False


def _try_capture_client_name(phone_number: str, client_text: str, profile_name: str, stored_name, agency_id: str = None) -> str:
    """
    Returns the client's name (or None) when this message answers the bot's
    name question — either the previous bot message asked for it, or the
    client used an explicit "my name is ..." phrasing. Persisting happens
    in the caller.
    """
    if not _name_is_missing(stored_name, profile_name):
        return None
    text = (client_text or "").strip()
    letters = re.sub(r"[^a-zA-Z\u0600-\u06FF]", "", text).lower()
    if not letters or letters in NOISE_ANSWERS:
        return None
    asked = _last_bot_message_asked_name(phone_number, agency_id)
    explicit = any(re.search(p, text, re.IGNORECASE) for p in NAME_INTRO_PATTERNS)
    if not (asked or explicit):
        return None
    try:
        name = LLMService.extract_client_name(text)
    except Exception as e:
        logger.error(f"Name extraction failed: {e}")
        return None
    if not name:
        return None
    name = str(name).strip()
    low = name.lower()
    if low in GENERIC_NAMES or low in NOISE_ANSWERS or len(low) < 2:
        return None
    return name[:80]


def _collect_message_ids(payload: dict) -> list:
    """Return every inbound WhatsApp message id present in the payload."""
    ids = []
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})
            for msg in value.get("messages", []) or []:
                mid = msg.get("id")
                if mid:
                    ids.append(mid)
    return ids


def _claim_message_ids(message_ids: list) -> set:
    """
    Durable deduplication: returns the ids that were ALREADY processed, and
    records the new ones so a concurrent/retried delivery can never trigger a
    second reply (this is what caused the message/image spam).
    """
    if not message_ids:
        return set()
    already = set()
    try:
        res = supabase.table("processed_webhook_messages").select("message_id").in_("message_id", message_ids).execute()
        if res.data:
            already = {row["message_id"] for row in res.data}
        # Claim the new ids (existing rows are ignored on conflict).
        supabase.table("processed_webhook_messages").upsert(
            [{"message_id": mid} for mid in message_ids],
            on_conflict="message_id",
        ).execute()
    except Exception as e:
        logger.error(f"Dedup store unavailable (falling back to memory-only): {e}")
    return already


async def _process_webhook_payload(payload: dict):
    """
    Heavy processing — runs AFTER the endpoint already replied 200 to Meta.
    Idempotent per message id: each inbound message triggers at most one reply.
    """
    try:
        # Durable idempotency: claim every message id up-front.
        all_ids = _collect_message_ids(payload)
        previously_seen = _claim_message_ids(all_ids)

        for entry in payload.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})

                if "statuses" in value:
                    continue

                # Per-change scope so a previous message can never bleed into
                # the next iteration (source of duplicated replies).
                client_phone = None
                client_name = "Prospect"
                client_text = ""
                msg_id = None
                agency_id = None

                if "messages" in value and value["messages"]:
                    message_obj = value["messages"][0]
                    contact_info = value.get("contacts", [{}])[0]
                    # Phone always comes from Meta's `from` field (wa_id as a fallback).
                    client_phone = _normalize_phone(message_obj.get("from") or contact_info.get("wa_id"))
                    client_name = contact_info.get("profile", {}).get("name", "Prospect")
                    msg_id = message_obj.get("id")

                    # 1. Deduplication (memory + durable store)
                    if msg_id and (msg_id in processed_messages or msg_id in previously_seen):
                        print(f"DEBUG: Skipping duplicate message {msg_id}")
                        continue
                    if msg_id:
                        processed_messages.add(msg_id)
                        if len(processed_messages) > 1000:
                            processed_messages.clear()

                    # 2. Clean input
                    client_text = message_obj.get("text", {}).get("body", "").strip()
                    print(f"MESSAGE: From {client_name} ({client_phone}): '{client_text}'")

                    # 2.5 MULTI-TENANT: resolve the tenant from the WhatsApp
                    # number that RECEIVED this message (value.metadata.
                    # phone_number_id), falling back to the lead's existing
                    # agency / the default agency. Every inbound message is
                    # guaranteed a lead row with phone_number + agency_id set.
                    receiving_number_id = (value.get("metadata", {}) or {}).get("phone_number_id")
                    agency_id, ai_paused, lead_full_name = _resolve_or_create_lead(
                        client_phone, client_name, receiving_number_id
                    )
                    print(f"AGENCY: Resolved agency_id={agency_id} for phone={client_phone} (received on {receiving_number_id})")

                    if agency_id:
                        try:
                            supabase.table("conversations").insert({
                                "agency_id": agency_id,
                                "phone": client_phone,
                                "message": client_text,
                                "sender": "client"
                            }).execute()
                        except Exception as e:
                            logger.error(f"Error saving client message to conversations: {e}")

                    # 2.6 MANUAL TAKEOVER: if the lead is paused (AI off), record
                    # the message but do NOT auto-reply — the agent answers from
                    # the Hub.
                    if ai_paused:
                        print(f"MANUAL MODE: AI paused for {client_phone}; skipping auto-reply.")
                        continue

                    # 2.7 LEAD NAME CAPTURE: when the bot asked for the client's
                    # full name and this message answers it, persist the name on
                    # the lead so the dashboard + every future turn use it.
                    if agency_id:
                        captured_name = _try_capture_client_name(
                            client_phone, client_text, client_name, lead_full_name, agency_id
                        )
                        if captured_name:
                            try:
                                supabase.table("leads").update({"full_name": captured_name}) \
                                    .eq("phone_number", client_phone).execute()
                                lead_full_name = captured_name
                                print(f"LEAD NAME: captured '{captured_name}' for {client_phone}")
                            except Exception as e:
                                logger.error(f"Error saving lead full_name for {client_phone}: {e}")
                    ask_for_name = _name_is_missing(lead_full_name, client_name)

                    # 3. LLM State Machine Routing
                    try:
                        llm_response = LLMService.chat_with_agent(
                            client_phone, client_text, agency_id,
                            client_full_name=lead_full_name,
                            ask_for_name=ask_for_name,
                        )
                        print(f"LLM RESPONSE: {llm_response}")

                        # Strip markdown JSON backticks if present
                        json_str = llm_response
                        if "```json" in json_str:
                            match = re.search(r"```json\n(.*?)```", json_str, re.DOTALL)
                            if match:
                                json_str = match.group(1).strip()
                        elif "```" in json_str:
                            match = re.search(r"```\n(.*?)```", json_str, re.DOTALL)
                            if match:
                                json_str = match.group(1).strip()

                        is_json = False
                        parsed_json = {}
                        if json_str.startswith("{") and json_str.endswith("}"):
                            try:
                                parsed_json = json.loads(json_str)
                                is_json = True
                            except json.JSONDecodeError:
                                pass

                        if not is_json:
                            # Plain text conversation
                            if agency_id:
                                try:
                                    supabase.table("conversations").insert({
                                        "agency_id": agency_id,
                                        "phone": client_phone,
                                        "message": llm_response,
                                        "sender": "ai"
                                    }).execute()
                                except Exception as e:
                                    logger.error(f"Error saving AI message: {e}")
                            await WhatsAppService.send_whatsapp_message(client_phone, llm_response)
                        else:
                            status = parsed_json.get("status")
                            if status == "ready_to_search":
                                # Execute search
                                operation = parsed_json.get("operation", "")
                                city = parsed_json.get("city", "")
                                prop_type = parsed_json.get("property_type", "")
                                budget = str(parsed_json.get("max_budget", ""))
                                search_query = f"{operation} {city} {prop_type} {budget}".strip()

                                search_results = await search_properties(query=search_query, limit=3)
                                props = search_results.get("properties", []) if isinstance(search_results, dict) else []

                                # Format properties as system message to feed back to LLM
                                context = "SYSTEM: Search completed. Present these properties concisely:\n"
                                if props:
                                    for p in props:
                                        img = p.get("image_url", "N/A")
                                        context += f"- Title: {p.get('title')} | Price: {p.get('new_price')} DH | City: {p.get('City')} | image_url: {img}\n"
                                else:
                                    context += "No properties found matching criteria."

                                # Ask LLM for the presentation message
                                presentation_msg = LLMService.chat_with_agent(
                                    client_phone, context, agency_id, client_full_name=lead_full_name
                                )
                                if agency_id:
                                    try:
                                        supabase.table("conversations").insert({
                                            "agency_id": agency_id,
                                            "phone": client_phone,
                                            "message": presentation_msg,
                                            "sender": "ai"
                                        }).execute()
                                    except Exception as e:
                                        logger.error(f"Error saving AI presentation message: {e}")
                                await WhatsAppService.send_whatsapp_message(client_phone, presentation_msg)

                            elif status == "send_image":
                                img_url = parsed_json.get("image_url")
                                caption = parsed_json.get("caption", "Here is the property!")
                                if agency_id:
                                    try:
                                        supabase.table("conversations").insert({
                                            "agency_id": agency_id,
                                            "phone": client_phone,
                                            "message": f"[Image Sent] {caption}",
                                            "sender": "ai"
                                        }).execute()
                                    except Exception:
                                        pass
                                if img_url:
                                    await WhatsAppService.send_whatsapp_image(client_phone, img_url, caption)
                                else:
                                    await WhatsAppService.send_whatsapp_message(client_phone, caption)

                    except Exception as inner_e:
                        logger.error(f"WEBHOOK INNER ERROR: {str(inner_e)}", exc_info=True)
                        fallback = "Sma7 lia bzaf, kayn chi mouchkil tekniki daba. Ghadi n-jawbek dghia ghir issebek l-fara7!"
                        if client_phone:
                            await WhatsAppService.send_whatsapp_message(client_phone, fallback)

        logger.info("--- INCOMING WHATSAPP WEBHOOK END ---")
    except Exception as e:
        logger.error(f"CRITICAL WEBHOOK PROCESSING ERROR: {str(e)}", exc_info=True)


@router.get("/webhook")
async def whatsapp_verify(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token")
):
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        print("INFO: WhatsApp Webhook Verified Successfully!")
        return PlainTextResponse(content=hub_challenge)
    raise HTTPException(status_code=403, detail="Verification token mismatch")


def _process_webhook_payload_task(payload: dict):
    """
    Sync bridge for the heavy async pipeline. FastAPI runs sync background
    tasks in a WORKER THREAD, so long Gemini calls / retry sleeps never block
    the event loop — a slow message can no longer stall other inbound
    messages (or other endpoints) on the same instance.
    """
    try:
        asyncio.run(_process_webhook_payload(payload))
    except Exception as e:
        logger.error(f"CRITICAL WEBHOOK BACKGROUND ERROR: {str(e)}", exc_info=True)


@router.post("/webhook")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    PRODUCTION WEBHOOK (loop-safe, low-latency):
    - Replies 200 OK to Meta IMMEDIATELY, before any DB/Gemini/WhatsApp work,
      so Meta never times out or re-delivers (the source of duplicate replies).
    - All processing runs ONCE per message id (durable dedup table) in a
      background worker thread — never on the event loop.
    """
    print("\n--- INCOMING WHATSAPP WEBHOOK START ---")
    try:
        payload = await request.json()
    except Exception as e:
        logger.error(f"Bad webhook payload: {e}")
        return {"status": "bad payload"}

    if "entry" not in payload:
        return {"status": "no entry"}

    # Acknowledge Meta first; heavy work continues in a background worker thread.
    background_tasks.add_task(_process_webhook_payload_task, payload)
    return {"status": "received"}
