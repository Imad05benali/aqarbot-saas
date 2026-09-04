-- =====================================================================
-- AQARBOT SCHEMA FIXES — run ONCE in the Supabase SQL editor
-- Restores columns dropped by the strict-schema rebuild, re-applies
-- tenant RLS policies, and includes a seed template for agency + owner.
-- Idempotent: safe to run more than once.
-- =====================================================================

-- ---------------------------------------------------------------
-- 0. HELPER: current user's agency id (SECURITY DEFINER avoids
--    recursive RLS on the users table)
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_agency_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT agency_id FROM public.users WHERE id = auth.uid()
$$;

-- ---------------------------------------------------------------
-- 1. RESTORE MISSING COLUMNS
-- ---------------------------------------------------------------
-- AI pause flag per lead (Chat "takeover" toggle, dashboard stat)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_ai_paused boolean NOT NULL DEFAULT false;

-- Lead telemetry written by backend/app/database.py
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS darija_intent text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_message text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS latency_ms integer;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tokens_used integer;

-- Agency branding (stored on agencies, not users)
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS agency_logo text;

-- ---------------------------------------------------------------
-- 2. ROW LEVEL SECURITY — tenant isolation for authenticated users
--    Owner = the user whose users.agency_id points at the agency.
-- ---------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Drop old wide-open policies (they targeted the pre-rebuild schema).
DROP POLICY IF EXISTS "Allow public SELECT on agencies" ON public.agencies;
DROP POLICY IF EXISTS "Allow public INSERT on agencies" ON public.agencies;
DROP POLICY IF EXISTS "Allow public SELECT on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public INSERT on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public UPDATE/DELETE on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public SELECT on conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow public INSERT on conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow public UPDATE/DELETE on conversations" ON public.conversations;

-- users: a user reads/updates their own row; Owners also manage team rows
CREATE POLICY "tenant users self or agency select"
ON public.users FOR SELECT
TO authenticated
USING (id = auth.uid() OR agency_id = public.get_my_agency_id());

CREATE POLICY "tenant users self or agency insert"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid() OR agency_id = public.get_my_agency_id());

CREATE POLICY "tenant users self or agency update"
ON public.users FOR UPDATE
TO authenticated
USING (id = auth.uid() OR agency_id = public.get_my_agency_id());

-- agencies: the owner's agency only; bootstrap insert allowed while the
-- authenticated user has no agency yet
CREATE POLICY "tenant agencies select"
ON public.agencies FOR SELECT
TO authenticated
USING (id = public.get_my_agency_id());

CREATE POLICY "tenant agencies insert bootstrap"
ON public.agencies FOR INSERT
TO authenticated
WITH CHECK (public.get_my_agency_id() IS NULL OR id = public.get_my_agency_id());

CREATE POLICY "tenant agencies update"
ON public.agencies FOR UPDATE
TO authenticated
USING (id = public.get_my_agency_id());

-- leads: scoped to the owner's agency
CREATE POLICY "tenant leads select"
ON public.leads FOR SELECT
TO authenticated
USING (agency_id = public.get_my_agency_id());

CREATE POLICY "tenant leads insert"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (agency_id = public.get_my_agency_id());

CREATE POLICY "tenant leads update delete"
ON public.leads FOR ALL
TO authenticated
USING (agency_id = public.get_my_agency_id());

-- conversations: scoped to the owner's agency
CREATE POLICY "tenant conversations select"
ON public.conversations FOR SELECT
TO authenticated
USING (agency_id = public.get_my_agency_id());

CREATE POLICY "tenant conversations insert"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (agency_id = public.get_my_agency_id());

CREATE POLICY "tenant conversations update delete"
ON public.conversations FOR ALL
TO authenticated
USING (agency_id = public.get_my_agency_id());

-- ---------------------------------------------------------------
-- 3. SEED (optional — uncomment and replace the placeholders)
--    Run AFTER creating your account in the app (so auth.users has
--    your email), or skip and let the app bootstrap the agency from
--    the Settings > Profil page.
-- ---------------------------------------------------------------
-- DO $$
-- DECLARE
--   new_agency uuid;
-- BEGIN
--   INSERT INTO public.agencies (agency_name, email, phone_number)
--   VALUES ('NOM_DE_VOTRE_AGENCE', 'votre@email.com', '+212600000000')
--   RETURNING id INTO new_agency;
--
--   INSERT INTO public.users (id, agency_id, full_name, email, role)
--   SELECT id, new_agency, COALESCE(raw_user_meta_data->>'full_name', email), email, 'Owner'
--   FROM auth.users
--   WHERE email = 'votre@email.com'
--   ON CONFLICT (id) DO UPDATE
--     SET agency_id = EXCLUDED.agency_id, role = 'Owner';
-- END $$;
