-- ============================================================================
-- Performance indexes for the AqarBot WhatsApp pipeline (idempotent, safe to
-- re-run). Speeds up:
--   1. conversation_history fetches (per-phone, 24h window)
--   2. lead agency/pause lookups by phone_number (webhook hot path)
--   3. Dashboard "AI paused" lead counts per agency
--   4. Hub session list (conversations per agency)
--   5. morocco_properties fuzzy ILIKE '%token%' search (pg_trgm GIN)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Conversation memory: the webhook fetches the last 24h per phone, ordered asc.
CREATE INDEX IF NOT EXISTS idx_conversation_history_phone_time
    ON public.conversation_history (phone_number, created_at);

-- Lead hot path: every inbound message resolves agency_id + is_ai_paused by phone.
CREATE INDEX IF NOT EXISTS idx_leads_phone_number
    ON public.leads (phone_number);

-- Dashboard "manual mode" counters (agency + paused) and agency-scoped lists.
CREATE INDEX IF NOT EXISTS idx_leads_agency_paused
    ON public.leads (agency_id, is_ai_paused);

-- Hub en Direct session list: newest conversations per agency.
CREATE INDEX IF NOT EXISTS idx_conversations_agency_time
    ON public.conversations (agency_id, created_at);

-- Property fuzzy search: ILIKE '%token%' across the searched columns.
CREATE INDEX IF NOT EXISTS idx_prop_city_trgm
    ON public.morocco_properties USING gin ("City" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_prop_sector_trgm
    ON public.morocco_properties USING gin ("Nighberd" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_prop_title_trgm
    ON public.morocco_properties USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_prop_desc_trgm
    ON public.morocco_properties USING gin ("desc" gin_trgm_ops);

-- Frequent exact filters used with the fuzzy pass.
CREATE INDEX IF NOT EXISTS idx_prop_city_type
    ON public.morocco_properties ("City", "Type");
