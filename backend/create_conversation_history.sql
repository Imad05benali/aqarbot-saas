-- 1. Conversation History Table
CREATE TABLE IF NOT EXISTS public.conversation_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'model')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast phone_number lookups
CREATE INDEX IF NOT EXISTS idx_conversation_history_phone_number ON public.conversation_history (phone_number);
