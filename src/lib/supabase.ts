import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Agregamos esto temporalmente para depurar
console.log("Supabase URL cargada:", supabaseUrl); 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);