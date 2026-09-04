-- ========================================================================
-- conversation_history is the LLM memory layer. Every row is written by
-- the backend service role, and every agency's dashboard reads its own
-- history by (phone_number + agency_id) instead of phone alone.
--
-- This migration:
--   1. Adds agency_id to conversation_history (nullable, back-compatible).
--   2. Adds an index for the per-agency read path.
--   3. Drops the old wide-open policy and installs tenant-scoped RLS so an
--      authenticated user only sees their own agency's history.
-- ========================================================================

-- 1. Column
ALTER TABLE public.conversation_history
    ADD COLUMN IF NOT EXISTS agency_id uuid;

-- 2. Indexes (both selectors the webhook + dashboard use)
CREATE INDEX IF NOT EXISTS idx_conversation_history_phone_agency
    ON public.conversation_history (phone_number, agency_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_agency_time
    ON public.conversation_history (agency_id, created_at);

-- 3. Row level security — tenant isolation for authenticated users
--    The webhook/service role still inserts freely (service role bypasses RLS);
--    authenticated dashboard reads are scoped to the viewer's agency.
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for conversation_history"
    ON public.conversation_history;

CREATE POLICY "tenant conversation_history select"
    ON public.conversation_history FOR SELECT
    TO authenticated
    USING (
        agency_id IS NULL OR agency_id = public.get_my_agency_id()
    );

CREATE POLICY "tenant conversation_history insert"
    ON public.conversation_history FOR INSERT
    TO authenticated
    WITH CHECK (
        agency_id IS NULL OR agency_id = public.get_my_agency_id()
    );
