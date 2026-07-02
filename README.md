# aqarbot-saas
# 🚀 AqarBot — Plateforme SaaS Immobilière Multi-Tenant

AqarBot huwa platform SaaS premium dedicated l-les agences immobilières f l-Maroc. S-system kay-khlli dynamic real-estate brokers y-gaddo des chatbots IA automatiques bach y-capturiw w y-gadd les leads smoothly smoothly m3a dashboard dynamic, unified CRM, w Live Chat Takeover hub.

---

## 🛠️ Stack Technique

* **Frontend:** React.js / Vite, TypeScript, Tailwind CSS
* **Backend Framework:** Next.js (Website & Registration layer)
* **Database & Security:** Supabase (PostgreSQL), Row-Level Security (RLS)
* **AI Engine:** Integration dynamic d l-Chatbot IA

---

## 🔒 Multi-Tenancy & Isolation d Data

S-system m-bni 3la architecture **Multi-Tenant** robusta direct live:
* **Strict Data Isolation:** Koll agence kat-chouf gha dynamic data w counters dyalha bo7dha te7t la clé unique `agency_id`.
* **Supabase Auth Integration:** Les requêtes `.select()` w `.insert()` f `Dashboard.tsx`, `CRM.tsx`, w `Chat.tsx` kollhom m-lockyin dynamic safely b dynamic UUID session token.
* **Empty State Management:** Mlli user jdid completely kay-tsjjel, counters dyalo f l-Dashboard (`Total Clients`, `Active AI Chats`) kay-kouno initialisés f **`0`** completely.

---

## ⚙️ Structure d la Base de Données (Schema Patched)

La table `leads` w `conversations` t-updat-at la structure dyalha f database bach t-welli text-isolated string tracking context safely:

```sql
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.lead_profiles(id) ON DELETE CASCADE, 
    agency_id TEXT, -- Hada huwa l-9fel dyal l-mouchkil d l-UUID context!
    city TEXT NOT NULL,                                           
    sector TEXT,                                                  
    property_type TEXT,                                           
    budget TEXT,                                                  
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
