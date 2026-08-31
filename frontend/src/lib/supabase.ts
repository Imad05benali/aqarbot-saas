import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lvplxnfcuofvffbnurye.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cGx4bmZjdW9mdmZmYm51cnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0OTg4MDAsImV4cCI6MjA5NjA3NDgwMH0.Px4xJz5cwDGaN5rfVeF0ohjm9MK8JYW-annrLZRSjn0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
