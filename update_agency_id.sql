-- =======================================================
-- MIGRATION SCRIPT: UPDATE AGENCY ID
-- OLD ID: 26b6c791-8394-46df-b870-0e5a5b08d2fd
-- NEW ID: bfd1aeaf-a912-4f26-8fbb-d597ee6ab02e
-- =======================================================

-- 1. Update the 'leads' table
UPDATE public.leads
SET agency_id = 'bfd1aeaf-a912-4f26-8fbb-d597ee6ab02e'
WHERE agency_id = '26b6c791-8394-46df-b870-0e5a5b08d2fd';

-- 2. Update the 'conversations' table
UPDATE public.conversations
SET agency_id = 'bfd1aeaf-a912-4f26-8fbb-d597ee6ab02e'
WHERE agency_id = '26b6c791-8394-46df-b870-0e5a5b08d2fd';

-- 3. Update the 'conversation_history' table (Used by the LLM)
-- Wait: Let's check if conversation_history has an agency_id. If it does not, it uses phone_number
-- I'll wrap it in a safe DO block in case the column doesn't exist, to prevent the query from crashing.
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversation_history' AND column_name='agency_id') THEN
    EXECUTE 'UPDATE public.conversation_history SET agency_id = ''bfd1aeaf-a912-4f26-8fbb-d597ee6ab02e'' WHERE agency_id = ''26b6c791-8394-46df-b870-0e5a5b08d2fd''';
  END IF;
END $$;
