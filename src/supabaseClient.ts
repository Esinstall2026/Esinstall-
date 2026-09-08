const SUPABASE_URL = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) || "https://bwmdnfymizyvhokykkuo.supabase.co").replace(/\/$/, "");
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) || "sb_publishable_9YgECLDb1-QwQnCVIM2ASQ_uW_Y1q79";

export const supabaseConfig = { url: SUPABASE_URL, key: SUPABASE_KEY };

export async function supabaseFetch<T>(path: string, init: RequestInit = {}, accessToken?: string): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken || SUPABASE_KEY}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const text = await response.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) {
    const message = typeof body === "object" && body && "msg" in body ? String((body as { msg: unknown }).msg) : `Supabase ${response.status}`;
    throw new Error(message);
  }
  return body as T;
}

export function isSupabaseConfigured() { return Boolean(SUPABASE_URL && SUPABASE_KEY); }
