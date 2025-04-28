import { createClient } from '@supabase/supabase-js';

// URL та ключ з .env.local
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Створення клієнта Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;