import { FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type AccessRole = "Admin" | "User";
export type AccessUser = {
  username: string;
  displayName: string;
  role: AccessRole;
  team?: string;
};

type SeedUser = AccessUser & { password: string };

const USERS: SeedUser[] = [
  { username: "admin", password: "ESInstall@2026", displayName: "Administrator", role: "Admin" },
  { username: "teambravo", password: "ESInstall@2026", displayName: "Team Bravo User", role: "User", team: "Team Bravo" },
  { username: "teamalpha", password: "ESInstall@2026", displayName: "Team Alpha User", role: "User", team: "Team Alpha" },
  { username: "teamcharlie", password: "ESInstall@2026", displayName: "Team Charlie User", role: "User", team: "Team Charlie" }
];

const SESSION_KEY = "es-install-session-v1";

export function getSession(): AccessUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as AccessUser : null;
  } catch {
    return null;
  }
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
  window.location.reload();
}

export function authenticate(username: string, password: string): AccessUser | null {
  const found = USERS.find(user => user.username === username.trim().toLowerCase() && user.password === password);
  if (!found) return null;
  const session: AccessUser = {
    username: found.username,
    displayName: found.displayName,
    role: found.role,
    team: found.team
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showDemo, setShowDemo] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!authenticate(username, password)) {
      setError("Usuário ou senha inválidos.");
    }
  };

  return <div className="auth-shell">
    <div className="auth-card">
      <div className="brand auth-brand"><div className="brand-mark">ES</div><div><strong>ES INSTALL</strong><span>Operations Platform</span></div></div>
      <span className="gold-label">SECURE ACCESS</span>
      <h1>Sign in</h1>
      <p className="muted">Acesse o ES INSTALL de acordo com o seu perfil.</p>
      <form onSubmit={submit} className="auth-form">
        <label className="field"><span>Usuário</span><input autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Digite seu usuário" /></label>
        <label className="field"><span>Senha</span><input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite sua senha" /></label>
        {error && <div className="auth-error">{error}</div>}
        <button className="primary auth-submit" type="submit">Entrar no ES INSTALL →</button>
      </form>
      <button className="ghost auth-demo" onClick={() => setShowDemo(value => !value)}>{showDemo ? "Ocultar acessos de demonstração" : "Ver acessos de demonstração"}</button>
      {showDemo && <div className="demo-box"><strong>Administrador</strong><span>admin / ESInstall@2026</span><strong>Usuário Team Bravo</strong><span>teambravo / ESInstall@2026</span></div>}
      <small className="auth-note">Piloto V12 · autenticação local do navegador. Para produção, conectar banco central, sessão segura e gestão real de credenciais.</small>
    </div>
  </div>;
}

export function AccessGate({ children }: { children: ReactNode }) {
  const session = useMemo(() => getSession(), []);
  if (!session) return <LoginScreen />;
  return <>{children}<div className="session-badge"><span>{session.displayName} · {session.role}{session.team ? ` · ${session.team}` : ""}</span><button onClick={signOut}>Sair</button></div></>;
}

export function canAccessAdminModules(user: AccessUser) {
  return user.role === "Admin";
}
