import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) || "https://bwmdnfymizyvhokykkuo.supabase.co").replace(/\/$/, "");
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) || "sb_publishable_9YgECLDb1-QwQnCVIM2ASQ_uW_Y1q79";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export const supabaseConfig = { url: SUPABASE_URL, key: SUPABASE_KEY };
export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_KEY);
