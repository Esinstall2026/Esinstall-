import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import "./auth.css";
import { supabase } from "./supabaseClient";

export type AccessRole = "Admin" | "User";
export type AccessUser = { username: string; displayName: string; role: AccessRole; team?: string };
const SESSION_KEY = "es-install-session-v1";
const TEAMS = ["Team Alpha", "Team Bravo", "Team Charlie"];
const ACCESS_TIMEOUT_MS = 8000;

function saveUser(user: AccessUser) { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }
export function getSession(): AccessUser | null { try { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) as AccessUser : null; } catch { return null; } }
export async function signOut() { await supabase.auth.signOut(); localStorage.removeItem(SESSION_KEY); window.location.reload(); }

async function withTimeout<T>(promise: PromiseLike<T>, ms = ACCESS_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<T>((_, reject) => { timer = setTimeout(() => reject(new Error("A validação da sessão demorou demais. Tente entrar novamente.")), ms); }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function profileFor(userId: string, email: string): Promise<AccessUser> {
  const { data, error } = await withTimeout(supabase.from("profiles").select("display_name,role,team").eq("id", userId).maybeSingle());
  if (error) throw error;
  if (!data) throw new Error("Usuário autenticado sem perfil. Peça ao administrador para configurar o acesso.");
  return { username: email, displayName: data.display_name, role: data.role, team: data.team || undefined };
}

export async function authenticate(email: string, secret: string): Promise<AccessUser> {
  const { data, error } = await withTimeout(supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: secret }));
  if (error || !data.user) throw error || new Error("Usuário ou senha inválidos.");
  const user = await profileFor(data.user.id, data.user.email || email);
  saveUser(user); return user;
}

async function register(email: string, secret: string, displayName: string, team: string): Promise<string> {
  const { data, error } = await withTimeout(supabase.auth.signUp({ email: email.trim().toLowerCase(), password: secret }));
  if (error || !data.user) throw error || new Error("Não foi possível criar o usuário.");
  if (!data.session) return "Cadastro criado. Confirme o e-mail e depois faça login.";
  const { error: profileError } = await withTimeout(supabase.from("profiles").insert({ id: data.user.id, display_name: displayName, role: "User", team }));
  if (profileError) throw profileError;
  saveUser({ username: data.user.email || email, displayName, role: "User", team });
  return "Acesso criado com sucesso.";
}

export function LoginScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState(""); const [secret, setSecret] = useState(""); const [displayName, setDisplayName] = useState(""); const [team, setTeam] = useState(TEAMS[0]); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(""); setBusy(true); try { if (mode === "login") { await authenticate(email, secret); window.location.reload(); } else { const message = await register(email, secret, displayName, team); if (getSession()) window.location.reload(); else setError(message); } } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível concluir o acesso."); } finally { setBusy(false); } };
  return <div className="auth-shell"><div className="auth-card">
    <div className="brand auth-brand"><div className="brand-mark">ES</div><div><strong>ES INSTALL</strong><span>Operations Platform</span></div></div>
    <span className="gold-label">SECURE ACCESS</span><h1>{mode === "login" ? "Sign in" : "Criar acesso"}</h1><p className="muted">{mode === "login" ? "Acesse o ES INSTALL com sua conta central." : "Crie um usuário de equipe para o teste real de acesso."}</p>
    <form onSubmit={submit} className="auth-form">
      {mode === "register" && <label className="field"><span>Nome</span><input required value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Nome do usuário" /></label>}
      <label className="field"><span>E-mail</span><input required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@empresa.com" /></label>
      <label className="field"><span>Senha</span><input required minLength={6} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={secret} onChange={e => setSecret(e.target.value)} placeholder="Mínimo de 6 caracteres" /></label>
      {mode === "register" && <label className="field"><span>Equipe</span><select value={team} onChange={e => setTeam(e.target.value)}>{TEAMS.map(t => <option key={t}>{t}</option>)}</select></label>}
      {error && <div className="auth-error">{error}</div>}
      <button className="primary auth-submit" disabled={busy} type="submit">{busy ? "Processando…" : mode === "login" ? "Entrar no ES INSTALL →" : "Criar usuário →"}</button>
    </form>
    <button className="ghost auth-demo" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Criar acesso de usuário" : "Já tenho acesso · Entrar"}</button>
    <small className="auth-note">V14 · autenticação central Supabase. Usuários de equipe entram como User e ficam vinculados à equipe selecionada. Perfil Admin deve ser atribuído pelo administrador.</small>
  </div></div>;
}

export function AccessGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false); const [session, setSession] = useState<AccessUser | null>(null);
  useEffect(() => {
    let active = true;
    const restore = async () => {
      try {
        const { data, error } = await withTimeout(supabase.auth.getSession());
        if (error) throw error;
        if (!data.session) {
          localStorage.removeItem(SESSION_KEY);
          if (active) setSession(null);
          return;
        }
        try {
          const user = await profileFor(data.session.user.id, data.session.user.email || "");
          saveUser(user);
          if (active) setSession(user);
        } catch {
          await withTimeout(supabase.auth.signOut(), 4000).catch(() => undefined);
          localStorage.removeItem(SESSION_KEY);
          if (active) setSession(null);
        }
      } catch (error) {
        localStorage.removeItem(SESSION_KEY);
        if (active) setSession(null);
        console.warn("ES INSTALL access validation failed; showing sign-in.", error);
      } finally {
        if (active) setReady(true);
      }
    };
    void restore();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, authSession) => {
      if (!authSession) { setSession(null); localStorage.removeItem(SESSION_KEY); return; }
      try { const user = await profileFor(authSession.user.id, authSession.user.email || ""); saveUser(user); setSession(user); } catch { await withTimeout(supabase.auth.signOut(), 4000).catch(() => undefined); }
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);
  const stableSession = useMemo(() => session, [session]);
  if (!ready) return <div className="auth-shell"><div className="auth-card"><span className="gold-label">ES INSTALL</span><h1>Verificando acesso…</h1><p className="muted">Validando a sessão central.</p></div></div>;
  if (!stableSession) return <LoginScreen />;
  return <>{children}<div className="session-badge"><span>{stableSession.displayName} · {stableSession.role}{stableSession.team ? ` · ${stableSession.team}` : ""}</span><button onClick={() => signOut()}>Sair</button></div></>;
}
export function canAccessAdminModules(user: AccessUser) { return user.role === "Admin"; }
