import { useMemo, useState } from "react";
import type { Job, ProductionRecord } from "./types";

type Installation = { jobId: string; team: string; date: string; time: string; status: "Scheduled" | "In Progress" | "Completed"; notes: string };
type WarrantyCase = { jobId: string; openedAt: string; issue: string; status: "Open" | "In Review" | "Resolved"; priority: "Low" | "Medium" | "High"; notes: string };

type Props = {
  jobs: Job[];
  installations: Installation[];
  warranties: WarrantyCase[];
  production: ProductionRecord[];
};

const read = <T,>(key: string, fallback: T): T => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
};
const write = <T,>(key: string, value: T) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } };

export function ReportsModule({ jobs, installations, warranties }: Props) {
  const completed = installations.filter(x => x.status === "Completed").length;
  const inProgress = installations.filter(x => x.status === "In Progress").length;
  const scheduled = installations.filter(x => x.status === "Scheduled").length;
  const openWarranty = warranties.filter(x => x.status !== "Resolved").length;
  const completionRate = installations.length ? Math.round(completed / installations.length * 100) : 0;
  const teamRows = useMemo(() => Array.from(new Set(installations.map(x => x.team))).map(team => {
    const all = installations.filter(x => x.team === team);
    const done = all.filter(x => x.status === "Completed").length;
    return { team, total: all.length, done, rate: all.length ? Math.round(done / all.length * 100) : 0 };
  }).sort((a, b) => b.rate - a.rate), [installations]);
  const statusRows = [{ label: "Scheduled", value: scheduled }, { label: "In Progress", value: inProgress }, { label: "Completed", value: completed }];
  const max = Math.max(1, ...statusRows.map(x => x.value));
  return <div className="content">
    <section className="page-tools"><div><span className="gold-label">OPERATIONS INTELLIGENCE</span><h2>Reports</h2><p className="muted">Live operational indicators from the current pilot data.</p></div><span className="status status-completed">LIVE PILOT DATA</span></section>
    <section className="metric-grid">
      <Metric label="Total Jobs" value={jobs.length} note="operational records" />
      <Metric label="Completion Rate" value={`${completionRate}%`} note={`${completed} completed installs`} />
      <Metric label="Field In Progress" value={inProgress} note={`${scheduled} scheduled next`} />
      <Metric label="Open Warranty" value={openWarranty} note={`${warranties.length} total cases`} />
    </section>
    <div className="two-column">
      <section className="panel"><PanelTitle label="INSTALLATION FLOW" title="Production to Completion" />{statusRows.map(x => <div className="report-bar-row" key={x.label}><div className="report-bar-label"><span>{x.label}</span><strong>{x.value}</strong></div><div className="report-track"><div className="report-fill" style={{ width: `${Math.round(x.value / max * 100)}%` }} /></div></div>)}</section>
      <section className="panel"><PanelTitle label="WARRANTY" title="Case Status" />{["Open", "In Review", "Resolved"].map(status => <div className="report-list-row" key={status}><span>{status}</span><strong>{warranties.filter(x => x.status === status).length}</strong></div>)}<div className="report-note">Warranty rate: {jobs.length ? Math.round(warranties.length / jobs.length * 100) : 0}% of current Jobs.</div></section>
    </div>
    <section className="panel" style={{ marginTop: 14 }}><PanelTitle label="TEAM PERFORMANCE" title="Installation Teams" />{teamRows.length ? <div className="report-table"><div className="report-table-head"><span>TEAM</span><span>JOBS</span><span>COMPLETED</span><span>RATE</span></div>{teamRows.map(row => <div className="report-table-row" key={row.team}><strong>{row.team}</strong><span>{row.total}</span><span>{row.done}</span><span className="status status-completed">{row.rate}%</span></div>)}</div> : <div className="upload-zone"><strong>No team activity yet</strong><span>Complete an Installation to populate performance data.</span></div>}</section>
    <section className="panel" style={{ marginTop: 14 }}><PanelTitle label="EXECUTIVE SUMMARY" title="Operational Snapshot" /><div className="summary-grid"><div><span>Jobs</span><strong>{jobs.length}</strong></div><div><span>Installations</span><strong>{installations.length}</strong></div><div><span>Production</span><strong>{jobs.filter(j => j.status === "Production").length}</strong></div><div><span>Warranty Cases</span><strong>{warranties.length}</strong></div></div></section>
  </div>;
}

export function TeamsModule({ jobs }: Props) {
  const [items, setItems] = useState<string[]>(() => read("es-install-teams-v1", ["Team Alpha", "Team Bravo", "Team Charlie"]));
  const [name, setName] = useState("");
  const save = (next: string[]) => { setItems(next); write("es-install-teams-v1", next); };
  const add = () => { const value = name.trim(); if (!value || items.includes(value)) return; save([...items, value]); setName(""); };
  return <DirectoryPage title="Teams" label="FIELD OPERATIONS" description="Installation teams, assignments and field status." items={items} input={name} setInput={setName} onAdd={add} onRemove={item => save(items.filter(x => x !== item))} extra={item => <span className="status status-completed">{jobs.filter(j => j.team === item).length} jobs</span>} />;
}

export function BuildersModule({ jobs }: Props) {
  const [items, setItems] = useState<string[]>(() => read("es-install-builders-v1", ["Sunrise Builders", "Prime Homes", "Elite Residential"]));
  const [name, setName] = useState("");
  const save = (next: string[]) => { setItems(next); write("es-install-builders-v1", next); };
  const add = () => { const value = name.trim(); if (!value || items.includes(value)) return; save([...items, value]); setName(""); };
  return <DirectoryPage title="Builders" label="PARTNER DIRECTORY" description="Builder directory with active job relationships." items={items} input={name} setInput={setName} onAdd={add} onRemove={item => save(items.filter(x => x !== item))} extra={item => <span className="status status-completed">{jobs.filter(j => j.builder === item).length} jobs</span>} />;
}

export function CommunitiesModule({ jobs }: Props) {
  const [items, setItems] = useState<string[]>(() => read("es-install-communities-v1", ["Lakeview Estates", "Palm Ridge", "Oak Grove", "Cypress Point"]));
  const [name, setName] = useState("");
  const save = (next: string[]) => { setItems(next); write("es-install-communities-v1", next); };
  const add = () => { const value = name.trim(); if (!value || items.includes(value)) return; save([...items, value]); setName(""); };
  return <DirectoryPage title="Communities" label="LOCATION DIRECTORY" description="Community directory with job relationships." items={items} input={name} setInput={setName} onAdd={add} onRemove={item => save(items.filter(x => x !== item))} extra={item => <span className="status status-completed">{jobs.filter(j => j.community === item).length} jobs</span>} />;
}

export function SettingsModule({ production }: Props) {
  const [company, setCompany] = useState(() => read("es-install-company-v1", "ES INSTALL"));
  const [saved, setSaved] = useState(false);
  const save = () => { write("es-install-company-v1", company.trim() || "ES INSTALL"); setSaved(true); window.setTimeout(() => setSaved(false), 1600); };
  const storageKeys = ["es-install-jobs-v1", "es-install-installations-v1", "es-install-warranty-v1", "es-install-production-v1"];
  const storedRecords = storageKeys.filter(key => localStorage.getItem(key)).length;
  return <div className="content">
    <section className="page-tools"><div><span className="gold-label">SYSTEM ADMINISTRATION</span><h2>Settings</h2><p className="muted">System configuration, pilot preferences and operational health.</p></div></section>
    <div className="two-column">
      <section className="panel"><PanelTitle label="ORGANIZATION" title="Company Profile" /><Field label="Company name"><input value={company} onChange={e => setCompany(e.target.value)} /></Field><button className="primary" onClick={save}>{saved ? "Saved ✓" : "Save Settings"}</button></section>
      <section className="panel"><PanelTitle label="SYSTEM HEALTH" title="Pilot Status" /><div className="report-list-row"><span>Core data stores</span><strong>{storedRecords}/4 active</strong></div><div className="report-list-row"><span>Production records</span><strong>{production.length}</strong></div><div className="report-list-row"><span>Access profile</span><strong>Administrator</strong></div><div className="report-note">Current release uses browser-local pilot storage. Central authentication, database and file storage are planned for the production layer.</div></section>
    </div>
    <section className="panel" style={{ marginTop: 14 }}><PanelTitle label="RELEASE" title="ES INSTALL V11" /><div className="summary-grid"><div><span>Interface</span><strong>Ready</strong></div><div><span>Workflow</span><strong>Active</strong></div><div><span>Storage</span><strong>Local Pilot</strong></div><div><span>Next Layer</span><strong>Backend</strong></div></div></section>
  </div>;
}

function DirectoryPage({ title, label, description, items, input, setInput, onAdd, onRemove, extra }: { title: string; label: string; description: string; items: string[]; input: string; setInput: (v: string) => void; onAdd: () => void; onRemove: (item: string) => void; extra: (item: string) => React.ReactNode }) {
  return <div className="content"><section className="page-tools"><div><span className="gold-label">{label}</span><h2>{title}</h2><p className="muted">{description}</p></div></section><section className="panel"><PanelTitle label="DIRECTORY" title={`${items.length} ${title}`} /><div className="button-group" style={{ marginBottom: 14 }}><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && onAdd()} placeholder={`Add ${title.slice(0, -1).toLowerCase()}...`} style={{ ...inputStyle, maxWidth: 420 }} /><button className="primary" onClick={onAdd}>+ Add</button></div><div className="history-list">{items.map(item => <div className="history-row" key={item}><div><strong>{item}</strong><small>Active directory record</small></div><div className="button-group">{extra(item)}<button className="ghost" onClick={() => onRemove(item)}>Remove</button></div></div>)}</div></section></div>;
}
function Metric({ label, value, note }: { label: string; value: string | number; note: string }) { return <div className="metric-card"><span>{label}</span><div className="metric-value">{value}</div><small>{note}</small></div>; }
function PanelTitle({ label, title }: { label: string; title: string }) { return <div className="panel-head"><div><span className="gold-label">{label}</span><h3>{title}</h3></div></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}</label>; }
const inputStyle = { background: "#0c0c0e", color: "#fff", border: "1px solid #27272a", borderRadius: 6, padding: 10, fontSize: 12, width: "100%" };
