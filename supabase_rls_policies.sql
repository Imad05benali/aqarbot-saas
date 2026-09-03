-- ==========================================
-- SUPABASE RLS POLICIES FOR AQARBOT SAAS
-- ==========================================

-- 1. Enable Row Level Security (RLS) on ALL tables
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.morocco_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metrics ENABLE ROW LEVEL SECURITY;
-- Note: Supabase provides an auth.users table natively, but if you have a public.users table, add it here too.

-- ------------------------------------------
-- POLICIES FOR: agencies
-- ------------------------------------------
CREATE POLICY "Allow public SELECT on agencies"
ON public.agencies FOR SELECT TO public, anon, authenticated USING (true);

CREATE POLICY "Allow public INSERT on agencies"
ON public.agencies FOR INSERT TO public, anon, authenticated WITH CHECK (true);

-- ------------------------------------------
-- POLICIES FOR: morocco_properties
-- ------------------------------------------
CREATE POLICY "Allow public SELECT on morocco_properties"
ON public.morocco_properties FOR SELECT TO public, anon, authenticated USING (true);

CREATE POLICY "Allow public INSERT on morocco_properties"
ON public.morocco_properties FOR INSERT TO public, anon, authenticated WITH CHECK (true);

-- ------------------------------------------
-- POLICIES FOR: leads
-- ------------------------------------------
CREATE POLICY "Allow public SELECT on leads"
ON public.leads FOR SELECT TO public, anon, authenticated USING (true);

CREATE POLICY "Allow public INSERT on leads"
ON public.leads FOR INSERT TO public, anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public UPDATE/DELETE on leads"
ON public.leads FOR ALL TO public, anon, authenticated USING (true);

-- ------------------------------------------
-- POLICIES FOR: conversations
-- ------------------------------------------
CREATE POLICY "Allow public SELECT on conversations"
ON public.conversations FOR SELECT TO public, anon, authenticated USING (true);

CREATE POLICY "Allow public INSERT on conversations"
ON public.conversations FOR INSERT TO public, anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public UPDATE/DELETE on conversations"
ON public.conversations FOR ALL TO public, anon, authenticated USING (true);

-- ------------------------------------------
-- POLICIES FOR: dashboard_metrics
-- ------------------------------------------
CREATE POLICY "Allow public SELECT on dashboard_metrics"
ON public.dashboard_metrics FOR SELECT TO public, anon, authenticated USING (true);

CREATE POLICY "Allow public INSERT/UPDATE on dashboard_metrics"
ON public.dashboard_metrics FOR ALL TO public, anon, authenticated USING (true);
