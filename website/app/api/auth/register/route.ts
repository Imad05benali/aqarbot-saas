import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-only service-role client (never shipped to the browser). The env var
// is preferred; the fallback matches the project URL/key used by the rest of
// the repo (backend/app/core/supabase.py) so the route works out of the box.
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_URL = envUrl.startsWith('http')
  ? envUrl
  : 'https://lvplxnfcuofvffbnurye.supabase.co';

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cGx4bmZjdW9mdmZmYm51cnllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ5ODgwMCwiZXhwIjoyMDk2MDc0ODAwfQ.-m_zWWKej3LFe6SK6QEB_aPvqYbn84Wj9LsCPkFi-gs';

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function POST(request: Request) {
  let authUserId: string | null = null;
  let agencyId: string | null = null;

  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const fullName = String(body?.fullName ?? '').trim();
    const agencyName = String(body?.agencyName ?? '').trim();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const phone = String(body?.phone ?? '').trim();
    const password = String(body?.password ?? '');

    if (!fullName || !agencyName || !email || !password) {
      return NextResponse.json({ ok: false, error: 'Tous les champs sont requis.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "L'adresse email est invalide." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: 'Le mot de passe doit contenir au moins 8 caractères.' },
        { status: 400 }
      );
    }

    // ── Step 0: create the Supabase Auth user ────────────────────────────
    // email_confirm: true so the register -> login flow works immediately,
    // exactly as the client-side signUp + login prefill already assumed.
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, agency_name: agencyName, phone },
    });

    if (authError || !authData.user) {
      const message = authError?.message ?? '';
      const status = /already|exists/i.test(message) ? 409 : 400;
      return NextResponse.json(
        {
          ok: false,
          error: status === 409
            ? 'Un compte existe déjà avec cet email.'
            : `Erreur lors de la création du compte : ${message}`,
        },
        { status }
      );
    }
    authUserId = authData.user.id;

    // ── Step 1: create the AGENCY FIRST and retrieve its generated id ───
    const { data: agency, error: agencyError } = await admin
      .from('agencies')
      .insert({
        agency_name: agencyName,
        email: email || null,
        phone_number: phone || null,
      })
      .select('id')
      .single();

    if (agencyError || !agency?.id) {
      throw new Error(`Impossible de créer l'agence : ${agencyError?.message ?? 'erreur inconnue'}`);
    }
    agencyId = agency.id as string;

    // ── Step 2: create the OWNER user row tied exclusively to that agency ─
    const { error: userError } = await admin.from('users').insert({
      id: authUserId,
      agency_id: agencyId,
      full_name: fullName,
      email,
      role: 'Owner',
    });

    if (userError) {
      throw new Error(`Impossible de créer le compte administrateur : ${userError.message}`);
    }

    return NextResponse.json({ ok: true, agency_id: agencyId, user_id: authUserId });
  } catch (err) {
    // ── Rollback: undo partial provisioning so no orphan agency/user is left ─
    const message = err instanceof Error ? err.message : "Erreur lors de l'inscription.";
    try {
      if (agencyId) {
        await admin.from('agencies').delete().eq('id', agencyId);
      }
    } catch {
      // best-effort cleanup
    }
    try {
      if (authUserId) {
        await admin.auth.admin.deleteUser(authUserId);
      }
    } catch {
      // best-effort cleanup
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
