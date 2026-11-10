import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const IS_DEMO_MODE = !supabaseUrl || !supabaseAnonKey
export const db = IS_DEMO_MODE
  ? null
  : createClient(supabaseUrl, supabaseAnonKey)
