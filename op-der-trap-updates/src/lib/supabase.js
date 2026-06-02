import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://zfdpnhmbpsgeoewifeje.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmZHBuaG1icHNnZW9ld2lmZWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTEzMDUsImV4cCI6MjA5MzU2NzMwNX0.WaTWrRMCvY3ZNwSI1W3lVF6BKq1l-I8xfcJ-RgXbI3I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
