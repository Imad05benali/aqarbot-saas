import os
import re
import json
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


def _resolve_agency_for_router(phone_number: str = None, client_name: str = "Prospect") -> str:
    """Resolve agency_id: first from existing lead, then fallback to newest agency."""
    if phone_number:
        try:
            existing = supabase.table("leads").select("agency_id").eq("phone_number", phone_number).limit(1).execute()
            if existing.data and existing.data[0].get("agency_id"):
                return existing.data[0]["agency_id"]
        except Exception:
            pass

    # Fallback to the newest registered agency
    agency_id = None
    try:
        agency_res = supabase.table("agencies").select("id").order("created_at", desc=True).limit(1).execute()
        if agency_res.data:
            agency_id = agency_res.data[0]["id"]
    except Exception:
        pass

    # Lead didn't exist, so let's automatically create them now!
    if agency_id and phone_number:
        try:
            res = supabase.table("leads").insert({
                "phone_number": phone_number,
                "agency_id": agency_id,
                "full_name": client_name,
                "city": "Unknown",
                "sector": "Unknown",
                "status": "new"
            }).execute()
            logger.info(f"Auto-created lead: {res.data}")
        except Exception as e:
            logger.error(f"CRITICAL Error auto-creating lead. Exception: {e}", exc_info=True)

    return agency_id


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
                    client_phone = contact_info.get("wa_id", message_obj.get("from"))
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

                    # 2.5 MULTI-TENANT: Resolve agency_id & Auto-create lead
                    agency_id = _resolve_agency_for_router(client_phone, client_name)
                    print(f"AGENCY: Resolved agency_id={agency_id} for phone={client_phone}")

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
                    try:
                        pause_res = supabase.table("leads").select("is_ai_paused").eq("phone_number", client_phone).limit(1).execute()
                        if pause_res.data and pause_res.data[0].get("is_ai_paused"):
                            print(f"MANUAL MODE: AI paused for {client_phone}; skipping auto-reply.")
                            continue
                    except Exception as e:
                        logger.error(f"Error checking lead pause state: {e}")

                    # 3. LLM State Machine Routing
                    try:
                        llm_response = LLMService.chat_with_agent(client_phone, client_text, agency_id)
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
                                presentation_msg = LLMService.chat_with_agent(client_phone, context, agency_id)
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


@router.post("/webhook")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    PRODUCTION WEBHOOK (loop-safe):
    - Replies 200 OK to Meta IMMEDIATELY, before any DB/Gemini/WhatsApp work.
      A slow handler used to make Meta time out and re-deliver the same
      message, which triggered duplicate replies and repeated images.
    - All processing runs once per message id (durable dedup table), so even
      a forced redelivery can never produce a second answer.
    """
    print("\n--- INCOMING WHATSAPP WEBHOOK START ---")
    try:
        payload = await request.json()
    except Exception as e:
        logger.error(f"Bad webhook payload: {e}")
        return {"status": "bad payload"}

    if "entry" not in payload:
        return {"status": "no entry"}

    # Acknowledge Meta first; heavy work continues in the background task.
    background_tasks.add_task(_process_webhook_payload, payload)
    return {"status": "received"}
