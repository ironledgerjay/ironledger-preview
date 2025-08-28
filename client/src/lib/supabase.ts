import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wbikdrduhotwnklrbrlt.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiaWtkcmR1aG90d25rbHJicmx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQyNTAzNzksImV4cCI6MjAzOTgyNjM3OX0.kSNqLTBJNWsaJQBPB_Eh_Vb-xJYGF-qQofjOb8S8hzc';

export const supabase = createClient(supabaseUrl, supabaseKey);
