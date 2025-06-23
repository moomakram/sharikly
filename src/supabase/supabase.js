import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://YOUR_SERVER_IP:3000';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
