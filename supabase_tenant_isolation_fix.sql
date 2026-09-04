-- ============================================================================
-- Multi-tenant isolation fix
-- 1) Agencies get an explicit WhatsApp-number mapping + a default flag so the
--    webhook can ALWAYS resolve the correct tenant for an inbound message.
-- 2) Orphaned rows written before the agency_id column existed (mainly
--    conversation_history) are backfilled from leads / the default agency so
--    no row leaks across tenants and the LLM memory + Hub history are intact.
--
-- Idempotent: safe to run again.
-- ============================================================================

-- 1. Agencies: per-WhatsApp-number routing + explicit default -----------------
ALTER TABLE public.agencies
    ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id text;
ALTER TABLE public.agencies
    ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;

-- The first agency ever created is the default one.
UPDATE public.agencies
SET is_default = true
WHERE id = (SELECT id FROM public.agencies ORDER BY created_at ASC LIMIT 1);

-- Register the CURRENT production WhatsApp number on that default agency so
-- inbound routing works today. (When you add a second agency with its own
-- WhatsApp number, set its whatsapp_phone_number_id here too - inbound
-- messages will then route to whichever agency owns the receiving number.)
UPDATE public.agencies
SET whatsapp_phone_number_id = '1292581033944682'
WHERE is_default = true
  AND (whatsapp_phone_number_id IS NULL OR whatsapp_phone_number_id = '');

-- 2. Backfill orphaned rows (NULL agency_id) ---------------------------------
-- conversation_history: the LLM memory / Hub transcripts written before the
-- column existed (205 of 243 rows at the time of writing).
UPDATE public.conversation_history ch
SET agency_id = COALESCE(
    (SELECT l.agency_id FROM public.leads l
      WHERE l.phone_number = ch.phone_number
      ORDER BY l.created_at ASC LIMIT 1),
    (SELECT a.id FROM public.agencies a WHERE a.is_default ORDER BY a.created_at ASC LIMIT 1),
    (SELECT a.id FROM public.agencies a ORDER BY a.created_at ASC LIMIT 1)
)
WHERE ch.agency_id IS NULL;

-- conversations: safety net (already correct in practice).
UPDATE public.conversations c
SET agency_id = COALESCE(
    (SELECT l.agency_id FROM public.leads l
      WHERE l.phone_number = c.phone
      ORDER BY l.created_at ASC LIMIT 1),
    (SELECT a.id FROM public.agencies a WHERE a.is_default ORDER BY a.created_at ASC LIMIT 1),
    (SELECT a.id FROM public.agencies a ORDER BY a.created_at ASC LIMIT 1)
)
WHERE c.agency_id IS NULL;

-- leads: safety net (already correct in practice).
UPDATE public.leads l
SET agency_id = COALESCE(
    (SELECT a.id FROM public.agencies a WHERE a.is_default ORDER BY a.created_at ASC LIMIT 1),
    (SELECT a.id FROM public.agencies a ORDER BY a.created_at ASC LIMIT 1)
)
WHERE l.agency_id IS NULL;

-- 3. Verify: should print zero rows -----------------------------------------
-- SELECT 'conversation_history' AS tbl, count(*) AS orphaned
-- FROM public.conversation_history WHERE agency_id IS NULL
-- UNION ALL
-- SELECT 'conversations', count(*) FROM public.conversations WHERE agency_id IS NULL
-- UNION ALL
-- SELECT 'leads', count(*) FROM public.leads WHERE agency_id IS NULL;
