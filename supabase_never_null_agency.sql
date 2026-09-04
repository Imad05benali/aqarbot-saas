-- ============================================================================
-- NEVER-NULL agency_id guarantee
-- Every insert into users / leads / conversations / conversation_history that
-- arrives without an agency_id (or with an explicit NULL) is automatically
-- assigned the active (default) agency id by a BEFORE INSERT trigger, and the
-- columns are made NOT NULL so no future row can slip through unassigned.
--
-- Idempotent: safe to run again.
-- ============================================================================

-- 1. Backfill any remaining NULL rows to the active/default agency ------------
-- users: newly signed-up accounts (e.g. agar@gmail.com, tazi@gmail.com).
UPDATE public.users u
SET agency_id = COALESCE(
    (SELECT a.id FROM public.agencies a WHERE a.is_default ORDER BY a.created_at ASC LIMIT 1),
    (SELECT a.id FROM public.agencies a ORDER BY a.created_at ASC LIMIT 1)
)
WHERE u.agency_id IS NULL;

-- leads / conversations / conversation_history (safety net; normally empty).
UPDATE public.leads l
SET agency_id = COALESCE(
    (SELECT a.id FROM public.agencies a WHERE a.is_default ORDER BY a.created_at ASC LIMIT 1),
    (SELECT a.id FROM public.agencies a ORDER BY a.created_at ASC LIMIT 1)
)
WHERE l.agency_id IS NULL;

UPDATE public.conversations c
SET agency_id = COALESCE(
    (SELECT l.agency_id FROM public.leads l WHERE l.phone_number = c.phone ORDER BY l.created_at ASC LIMIT 1),
    (SELECT a.id FROM public.agencies a WHERE a.is_default ORDER BY a.created_at ASC LIMIT 1),
    (SELECT a.id FROM public.agencies a ORDER BY a.created_at ASC LIMIT 1)
)
WHERE c.agency_id IS NULL;

UPDATE public.conversation_history ch
SET agency_id = COALESCE(
    (SELECT l.agency_id FROM public.leads l WHERE l.phone_number = ch.phone_number ORDER BY l.created_at ASC LIMIT 1),
    (SELECT a.id FROM public.agencies a WHERE a.is_default ORDER BY a.created_at ASC LIMIT 1),
    (SELECT a.id FROM public.agencies a ORDER BY a.created_at ASC LIMIT 1)
)
WHERE ch.agency_id IS NULL;

-- 2. Trigger function: assign the active agency to any NULL insert -------------
-- SECURITY DEFINER so it can read agencies even when an RLS-restricted role
-- (anon/authenticated via PostgREST) performs the insert.
CREATE OR REPLACE FUNCTION public.assign_default_agency_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id uuid;
BEGIN
    IF NEW.agency_id IS NULL THEN
        SELECT a.id INTO v_id
        FROM public.agencies a
        WHERE a.is_default
        ORDER BY a.created_at ASC
        LIMIT 1;
        IF v_id IS NULL THEN
            SELECT a.id INTO v_id
            FROM public.agencies a
            ORDER BY a.created_at ASC
            LIMIT 1;
        END IF;
        NEW.agency_id := v_id;
    END IF;
    RETURN NEW;
END $$;

-- 3. Wire the trigger onto every tenant table ---------------------------------
DROP TRIGGER IF EXISTS trg_users_default_agency ON public.users;
CREATE TRIGGER trg_users_default_agency
BEFORE INSERT ON public.users
FOR EACH ROW EXECUTE FUNCTION public.assign_default_agency_id();

DROP TRIGGER IF EXISTS trg_leads_default_agency ON public.leads;
CREATE TRIGGER trg_leads_default_agency
BEFORE INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.assign_default_agency_id();

DROP TRIGGER IF EXISTS trg_conversations_default_agency ON public.conversations;
CREATE TRIGGER trg_conversations_default_agency
BEFORE INSERT ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.assign_default_agency_id();

DROP TRIGGER IF EXISTS trg_conversation_history_default_agency ON public.conversation_history;
CREATE TRIGGER trg_conversation_history_default_agency
BEFORE INSERT ON public.conversation_history
FOR EACH ROW EXECUTE FUNCTION public.assign_default_agency_id();

-- 4. Hard constraint: no NULL may ever be written again -----------------------
ALTER TABLE public.users              ALTER COLUMN agency_id SET NOT NULL;
ALTER TABLE public.leads              ALTER COLUMN agency_id SET NOT NULL;
ALTER TABLE public.conversations      ALTER COLUMN agency_id SET NOT NULL;
ALTER TABLE public.conversation_history ALTER COLUMN agency_id SET NOT NULL;

-- 5. Verify ---------------------------------------------------------------
-- SELECT 'users' t, count(*) FROM public.users WHERE agency_id IS NULL
-- UNION ALL SELECT 'leads', count(*) FROM public.leads WHERE agency_id IS NULL
-- UNION ALL SELECT 'conversations', count(*) FROM public.conversations WHERE agency_id IS NULL
-- UNION ALL SELECT 'conversation_history', count(*) FROM public.conversation_history WHERE agency_id IS NULL;
