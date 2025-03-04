import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = 'https://arscmhkqmllgwkdfpwrl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyc2NtaGtxbWxsZ3drZGZwd3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNzYwNzcsImV4cCI6MjA1NTY1MjA3N30.VIohQC4cIYNTNNwvjPCFghVA0MpowYSyvlvuf_2WMIE';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey); 