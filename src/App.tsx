import { ChangeEvent, useMemo, useState } from "react";
import { builders, communities, jobs as seedJobs, teams } from "./data";
import { loadProduction, saveProduction } from "./production";
import type { Job, JobStatus, Page, ProductionRecord, ProductionStatus } from "./types";

type InstallationStatus = "Scheduled" | "In Progress" | "Completed";
type Installation = { jobId: string; team: string; date: string; time: string; status: InstallationStatus; notes: string };
type WarrantyStatus = "Open" | "In Review" | "Resolved";
type WarrantyPriority = "Low" | "Medium" | "High";
type WarrantyCase = { jobId: string; openedAt: string; issue: string; status: WarrantyStatus; priority: WarrantyPriority; notes: string };
type Evidence = { name: string; type: string; size: number; addedAt: string };

const nav: { label: Page; icon: string }[] = [
  { label: "Dashboard", icon: "▦" }, { label: "Jobs", icon: "▤" }, { label: "Job Folder", icon: "▱" },
  { label: "Production", icon: "▰" }, { label: "Installations", icon: "⌂" }, { label: "Warranty", icon: "◇" },
  { label: "Reports", icon: "▥" }, { label: "Teams", icon: "♙" }, { label: "Builders", icon: "▣" },
  { label: "Communities", icon: "⌘" }, { label: "Settings", icon: "⚙" }
];
const statuses: JobStatus[] = ["Scheduled", "Production", "Ready for Installation", "Installation", "Completed", "Warranty"];
const productionStatuses: ProductionStatus[] = ["Pending", "Cutting", "Polishing", "Separated", "Ready"];
const times = ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"];

function read<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function write<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}
function initialInstallations(): Installation[] {
  return seedJobs.map((j, i) => ({ jobId: j.id, team: j.team, date: j.date, time: i % 2 ? "10:00 AM" : "8:00 AM", status: j.status === "Installation" ? "In Progress" : "Scheduled", notes: "" }));
}

export default function App() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [jobs, setJobs] = useState<Job[]>(() => read("es-install-jobs-v1", seedJobs));
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [installations, setInstallations] = useState<Installation[]>(() => read("es-install-installations-v1", initialInstallations()));
  const [warranties, setWarranties] = useState<WarrantyCase[]>(() => read("es-install-warranty-v1", []));
  const [production, setProduction] = useState<ProductionRecord[]>(() => loadProduction());
  const selectedJob = jobs.find(j => j.id === selectedJobId) ?? null;

  const openJob = (job: Job) => { setSelectedJobId(job.id); setPage("Job Folder"); };
  const updateJob = (job: Job) => { const next = jobs.map(j => j.id === job.id ? job : j); setJobs(next); write("es-install-jobs-v1", next); };
  const updateInstallation = (value: Installation) => {
    const next = installations.some(i => i.jobId === value.jobId) ? installations.map(i => i.jobId === value.jobId ? value : i) : [...installations, value];
    setInstallations(next); write("es-install-installations-v1", next);

    const job = jobs.find(j => j.id === value.jobId);
    if (job) {
      const nextStatus: JobStatus =
        value.status === "Completed"
          ? "Completed"
          : value.status === "In Progress"
            ? "Installation"
            : job.status === "Completed" || job.status === "Warranty"
              ? job.status
              : "Ready for Installation";
      if (job.status !== nextStatus) updateJob({ ...job, status: nextStatus });
    }
  };
  const updateWarranty = (value: WarrantyCase) => {
    const next = warranties.some(w => w.jobId === value.jobId) ? warranties.map(w => w.jobId === value.jobId ? value : w) : [...warranties, value];
    setWarranties(next); write("es-install-warranty-v1", next);

    const job = jobs.find(j => j.id === value.jobId);
    if (job && value.status !== "Resolved" && job.status === "Completed") {
      updateJob({ ...job, status: "Warranty" });
    }
  };
  const updateProduction = (value: ProductionRecord) => {
    const next = production.some(p => p.jobId === value.jobId) ? production.map(p => p.jobId === value.jobId ? value : p) : [...production, value];
    setProduction(next); saveProduction(next);
    const job = jobs.find(j => j.id === value.jobId);
    if (job) updateJob({ ...job, status: value.status === "Ready" ? "Ready for Installation" : value.status === "Pending" ? "Scheduled" : "Production" });
  };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">ES</div><div><strong>ES INSTALL</strong><span>Operations Platform</span></div></div>
      <div className="nav-title">MAIN MENU</div>
      <nav>{nav.map(item => <button key={item.label} className={`nav-item ${page === item.label ? "active" : ""}`} onClick={() => setPage(item.label)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}</nav>
      <div className="sidebar-footer"><div className="status-dot"/><div><strong>System Ready</strong><span>ES INSTALL v0.5</span></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><div className="eyebrow">ES INSTALL / {page.toUpperCase()}</div><h1>{page}</h1></div><div className="user-chip"><div className="avatar">AD</div><div><strong>Administrator</strong><span>Admin</span></div></div></header>
      {page === "Dashboard" && <Dashboard jobs={jobs} installations={installations} warranties={warranties} production={production} onOpenJob={openJob} />}
      {page === "Jobs" && <JobsPage jobs={jobs} search={search} setSearch={setSearch} onOpenJob={openJob} />}
      {page === "Job Folder" && selectedJob && <JobFolder job={selectedJob} onSave={updateJob} />}
      {page === "Production" && <ProductionPage jobs={jobs} records={production} onSave={updateProduction} onOpenJob={openJob} />}
      {page === "Installations" && <InstallationsPage jobs={jobs} installations={installations} onSave={updateInstallation} onOpenJob={openJob} />}
      {page === "Warranty" && <WarrantyPage jobs={jobs} installations={installations} warranties={warranties} onSave={updateWarranty} onOpenJob={openJob} />}
      {!(["Dashboard", "Jobs", "Job Folder", "Production", "Installations", "Warranty"] as Page[]).includes(page) && <ModulePlaceholder page={page} />}
    </main>
  </div>;
}

function Dashboard({ jobs, installations, warranties, production, onOpenJob }: { jobs: Job[]; installations: Installation[]; warranties: WarrantyCase[]; production: ProductionRecord[]; onOpenJob: (j: Job) => void }) {
  const inProgress = jobs.filter(j => ["Production", "Installation"].includes(j.status)).length;
  const today = new Date().toISOString().slice(0, 10);
  const installsToday = installations.filter(i => i.date === today).length;
  const teamsInField = new Set(installations.filter(i => i.status === "In Progress").map(i => i.team)).size;
  return <div className="content">
    <section className="hero"><div><span className="gold-label">OPERATIONS OVERVIEW</span><h2>Good morning, Administrator.</h2><p>Monitor jobs, production, installations and warranties from one place.</p></div><button className="primary" onClick={() => jobs[0] && onOpenJob(jobs[0])}>Open latest Job</button></section>
    <section className="metric-grid">
      <Metric label="Jobs in Progress" value={inProgress} note="production + installation" />
      <Metric label="Installations Today" value={installsToday} note="scheduled for today" />
      <Metric label="Open Warranties" value={warranties.filter(w => w.status !== "Resolved").length} note="needs action" />
      <Metric label="Teams in Field" value={teamsInField} note={`${production.length} production records`} />
    </section>
    <div className="two-column"><section className="panel"><PanelTitle label="OPERATIONS" title="Active Jobs"/><div className="job-list">{jobs.slice(0, 5).map(j => <button className="job-row" key={j.id} onClick={() => onOpenJob(j)}><div className="job-code">{j.id}</div><div className="job-main"><strong>{j.address}</strong><span>{j.builder} · {j.community}</span></div><Status status={j.status}/><span className="arrow">→</span></button>)}</div></section><section className="panel"><PanelTitle label="WEEK" title="Installation Agenda"/><div className="agenda">{["MON", "TUE", "WED", "THU", "FRI"].map((d, i) => <div className="agenda-day" key={d}><span>{d}</span><strong>{[3, 4, 2, 5, 3][i]}</strong><small>installs</small></div>)}</div></section></div>
  </div>;
}
function Metric({ label, value, note }: { label: string; value: number; note: string }) { return <div className="metric-card"><span>{label}</span><div className="metric-value">{value}</div><small>{note}</small></div>; }
function PanelTitle({ label, title }: { label: string; title: string }) { return <div className="panel-head"><div><span className="gold-label">{label}</span><h3>{title}</h3></div></div>; }
function Status({ status }: { status: string }) { return <span className={`status status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>; }

function JobsPage({ jobs, search, setSearch, onOpenJob }: { jobs: Job[]; search: string; setSearch: (v: string) => void; onOpenJob: (j: Job) => void }) {
  const rows = jobs.filter(j => `${j.id} ${j.address} ${j.builder} ${j.community} ${j.team}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="content"><section className="page-tools"><div><span className="gold-label">JOB MANAGEMENT</span><h2>All Jobs</h2></div><button className="primary" onClick={() => alert("New Job: use the Job Folder workflow for the pilot.")}>+ New Job</button></section><div className="search-box"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by job, address, builder, community or team..."/></div><section className="panel table-panel"><div className="table-head"><span>JOB</span><span>LOCATION</span><span>BUILDER</span><span>TEAM</span><span>STATUS</span><span/></div>{rows.map(j => <button className="table-row" key={j.id} onClick={() => onOpenJob(j)}><strong>{j.id}</strong><span>{j.address}<small>{j.community}</small></span><span>{j.builder}</span><span>{j.team}</span><Status status={j.status}/><span>→</span></button>)}</section></div>;
}

function JobFolder({ job, onSave }: { job: Job; onSave: (j: Job) => void }) {
  const [editing, setEditing] = useState(false); const [draft, setDraft] = useState(job);
  const [evidence, setEvidence] = useState<Evidence[]>(() => read(`es-install-evidence-${job.id}`, []));
  const add = (e: ChangeEvent<HTMLInputElement>) => { const files = Array.from(e.target.files ?? []); if (!files.length) return; const next = [...evidence, ...files.map(f => ({ name: f.name, type: f.type || "file", size: f.size, addedAt: new Date().toISOString() }))]; setEvidence(next); write(`es-install-evidence-${job.id}`, next); e.target.value = ""; };
  const remove = (item: Evidence) => { const next = evidence.filter(x => x.addedAt !== item.addedAt); setEvidence(next); write(`es-install-evidence-${job.id}`, next); };
  return <div className="content"><section className="job-folder-head"><div><span className="gold-label">JOB FOLDER</span><h2>{job.id}</h2><p>{job.address} · {job.builder} · {job.community}</p></div><div className="button-group"><button className="ghost" onClick={() => setEditing(v => !v)}>{editing ? "Cancel" : "Edit Job"}</button>{editing && <button className="primary" onClick={() => { onSave(draft); setEditing(false); }}>Save Changes</button>}</div></section>
    <section className="two-column"><div className="panel"><PanelTitle label="JOB DETAILS" title="Operational Record"/><div className="form-grid"><Field label="Address"><input disabled={!editing} value={draft.address} onChange={e => setDraft({ ...draft, address: e.target.value })}/></Field><Field label="Builder"><select disabled={!editing} value={draft.builder} onChange={e => setDraft({ ...draft, builder: e.target.value })}>{builders.map(v => <option key={v}>{v}</option>)}</select></Field><Field label="Community"><select disabled={!editing} value={draft.community} onChange={e => setDraft({ ...draft, community: e.target.value })}>{communities.map(v => <option key={v}>{v}</option>)}</select></Field><Field label="Team"><select disabled={!editing} value={draft.team} onChange={e => setDraft({ ...draft, team: e.target.value })}>{teams.map(v => <option key={v}>{v}</option>)}</select></Field><Field label="Date"><input disabled={!editing} type="date" value={draft.date} onChange={e => setDraft({ ...draft, date: e.target.value })}/></Field><Field label="Status"><select disabled={!editing} value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as JobStatus })}>{statuses.map(v => <option key={v}>{v}</option>)}</select></Field></div></div>
      <div className="panel"><PanelTitle label="EVIDENCE" title="Photos & Files"/><input type="file" multiple onChange={add}/><div className="history-list">{evidence.length ? evidence.map(item => <div className="history-row" key={item.addedAt}><div><strong>{item.name}</strong><small>{item.type} · {Math.round(item.size / 1024)} KB</small></div><button className="ghost" onClick={() => remove(item)}>Remove</button></div>) : <p className="muted">No evidence uploaded yet.</p>}</div></div></section>
    <section className="panel" style={{ marginTop: 14 }}><PanelTitle label="WORKFLOW" title="Operational Status"/><div className="workflow-strip">{statuses.map(s => <div key={s} className={s === job.status ? "workflow-step active" : "workflow-step"}><span>{s === job.status ? "●" : "○"}</span>{s}</div>)}</div></section>
  </div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}</label>; }

function ProductionPage({ jobs, records, onSave, onOpenJob }: { jobs: Job[]; records: ProductionRecord[]; onSave: (p: ProductionRecord) => void; onOpenJob: (j: Job) => void }) {
  const [filter, setFilter] = useState(""); const rows = records.filter(p => { const j = jobs.find(x => x.id === p.jobId); return j && `${p.jobId} ${j.address} ${j.builder} ${p.material} ${p.status}`.toLowerCase().includes(filter.toLowerCase()); });
  const count = (s: ProductionStatus) => records.filter(p => p.status === s).length;
  return <div className="content"><section className="page-tools"><div><span className="gold-label">FACTORY OPERATIONS</span><h2>Production / Factory</h2><p className="muted">Track slabs, cutting, polishing, separation and readiness for installation.</p></div></section><section className="metric-grid"><Metric label="Pending" value={count("Pending")} note="awaiting production"/><Metric label="Cutting" value={count("Cutting")} note="in fabrication"/><Metric label="Polishing" value={count("Polishing")} note="finishing"/><Metric label="Ready" value={count("Ready")} note="for installation"/></section><div className="search-box"><span>⌕</span><input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search job, address, builder, material or status..."/></div><section className="panel table-panel"><div className="table-head"><span>JOB</span><span>MATERIAL / SLABS</span><span>SQ FT</span><span>SINK / MATERIALS</span><span>STATUS</span><span/></div>{rows.map(p => { const j = jobs.find(x => x.id === p.jobId)!; return <div className="table-row" key={p.jobId}><button style={plainButton} onClick={() => onOpenJob(j)}>{p.jobId}</button><span><select value={p.material} onChange={e => onSave({ ...p, material: e.target.value as ProductionRecord["material"] })} style={selectStyle}>{["Granite", "Marble", "Porcelain"].map(v => <option key={v}>{v}</option>)}</select><input type="number" min={0} value={p.slabCount} onChange={e => onSave({ ...p, slabCount: Number(e.target.value) })} style={inputStyle}/></span><input type="number" min={0} value={p.squareFeet} onChange={e => onSave({ ...p, squareFeet: Number(e.target.value) })} style={inputStyle}/><span><select value={p.sinkType} onChange={e => onSave({ ...p, sinkType: e.target.value as ProductionRecord["sinkType"] })} style={selectStyle}>{["Undermount", "Farmhouse", "Topmount", "None"].map(v => <option key={v}>{v}</option>)}</select><small>{p.caulkTubes} caulk · {p.clips} clips</small></span><select value={p.status} onChange={e => onSave({ ...p, status: e.target.value as ProductionStatus, updatedAt: new Date().toISOString() })} style={selectStyle}>{productionStatuses.map(v => <option key={v}>{v}</option>)}</select><button className="ghost" onClick={() => onOpenJob(j)}>Job →</button></div>; })}</section></div>;
}

function InstallationsPage({ jobs, installations, onSave, onOpenJob }: { jobs: Job[]; installations: Installation[]; onSave: (i: Installation) => void; onOpenJob: (j: Job) => void }) {
  const [filter, setFilter] = useState(""); const rows = installations.filter(i => { const j = jobs.find(x => x.id === i.jobId); return j && `${i.jobId} ${j.address} ${j.builder} ${j.community} ${i.team} ${i.date}`.toLowerCase().includes(filter.toLowerCase()); });
  return <div className="content"><section className="page-tools"><div><span className="gold-label">FIELD OPERATIONS</span><h2>Installations</h2><p className="muted">Schedule jobs, assign teams and track completion.</p></div><div className="button-group"><button className="ghost" onClick={() => setFilter("")}>All Jobs</button></div></section><section className="metric-grid"><Metric label="Scheduled" value={rows.filter(i => i.status === "Scheduled").length} note="ready for field"/><Metric label="In Progress" value={rows.filter(i => i.status === "In Progress").length} note="teams working"/><Metric label="Completed" value={rows.filter(i => i.status === "Completed").length} note="closed installs"/><Metric label="Teams" value={new Set(rows.map(i => i.team)).size} note="assigned"/></section><div className="search-box"><span>⌕</span><input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search job, address, builder, community or team..."/></div><section className="panel table-panel"><div className="table-head"><span>JOB</span><span>LOCATION</span><span>TEAM</span><span>DATE / TIME</span><span>STATUS</span><span/></div>{rows.map(i => { const j = jobs.find(x => x.id === i.jobId)!; return <div className="table-row" key={i.jobId}><button style={plainButton} onClick={() => onOpenJob(j)}>{i.jobId}</button><span>{j.address}<small>{j.builder} · {j.community}</small></span><select value={i.team} onChange={e => onSave({ ...i, team: e.target.value })} style={selectStyle}>{teams.map(t => <option key={t}>{t}</option>)}</select><span><input type="date" value={i.date} onChange={e => onSave({ ...i, date: e.target.value })} style={inputStyle}/><select value={i.time} onChange={e => onSave({ ...i, time: e.target.value })} style={inputStyle}>{times.map(t => <option key={t}>{t}</option>)}</select></span><select value={i.status} onChange={e => onSave({ ...i, status: e.target.value as InstallationStatus })} style={selectStyle}>{["Scheduled", "In Progress", "Completed"].map(v => <option key={v}>{v}</option>)}</select><button className="ghost" onClick={() => onOpenJob(j)}>Job →</button></div>; })}</section></div>;
}

function WarrantyPage({ jobs, installations, warranties, onSave, onOpenJob }: { jobs: Job[]; installations: Installation[]; warranties: WarrantyCase[]; onSave: (w: WarrantyCase) => void; onOpenJob: (j: Job) => void }) {
  const eligible = jobs.filter(j => installations.some(i => i.jobId === j.id && i.status === "Completed") || j.status === "Warranty" || warranties.some(w => w.jobId === j.id));
  const create = (jobId: string) => onSave({ jobId, openedAt: new Date().toISOString(), issue: "Installation issue", status: "Open", priority: "Medium", notes: "" });
  return <div className="content"><section className="page-tools"><div><span className="gold-label">AFTER-SALES</span><h2>Warranty</h2><p className="muted">Track post-installation issues, evidence and resolution.</p></div><button className="primary" onClick={() => eligible[0] && create(eligible[0].id)}>+ New Warranty</button></section><section className="metric-grid"><Metric label="Open" value={warranties.filter(w => w.status === "Open").length} note="needs action"/><Metric label="In Review" value={warranties.filter(w => w.status === "In Review").length} note="being assessed"/><Metric label="Resolved" value={warranties.filter(w => w.status === "Resolved").length} note="closed cases"/><Metric label="Eligible Jobs" value={eligible.length} note="post-installation"/></section><section className="panel table-panel"><div className="table-head"><span>JOB</span><span>LOCATION</span><span>CASE</span><span>PRIORITY</span><span>STATUS</span><span/></div>{eligible.map(j => { const w = warranties.find(x => x.jobId === j.id); return <div className="table-row" key={j.id}><button style={plainButton} onClick={() => onOpenJob(j)}>{j.id}</button><span>{j.address}<small>{j.builder} · {j.community}</small></span>{w ? <input value={w.issue} onChange={e => onSave({ ...w, issue: e.target.value })} style={inputStyle}/> : <button className="ghost" onClick={() => create(j.id)}>Open Case</button>}{w ? <select value={w.priority} onChange={e => onSave({ ...w, priority: e.target.value as WarrantyPriority })} style={selectStyle}>{["Low", "Medium", "High"].map(v => <option key={v}>{v}</option>)}</select> : <span className="muted">—</span>}{w ? <select value={w.status} onChange={e => onSave({ ...w, status: e.target.value as WarrantyStatus })} style={selectStyle}>{["Open", "In Review", "Resolved"].map(v => <option key={v}>{v}</option>)}</select> : <span className="muted">Not opened</span>}<button className="ghost" onClick={() => onOpenJob(j)}>Job →</button></div>; })}</section>{warranties.length > 0 && <section className="panel" style={{ marginTop: 14 }}><PanelTitle label="CASE DETAILS" title="Warranty Notes"/>{warranties.map(w => <div className="history-row" key={w.jobId}><span>{w.jobId}</span><div><strong>{w.issue}</strong><small>{w.status} · {w.priority} · opened {new Date(w.openedAt).toLocaleDateString()}</small><textarea value={w.notes} onChange={e => onSave({ ...w, notes: e.target.value })} placeholder="Add resolution notes..." /></div></div>)}</section>}</div>;
}

function ModulePlaceholder({ page }: { page: Page }) { return <div className="content"><section className="hero"><div><span className="gold-label">ES INSTALL</span><h2>{page}</h2><p>This module is ready for the next operational release. Core Jobs, Production, Installations and Warranty workflows are available for the pilot.</p></div></section></div>; }

const plainButton = { background: "none", border: 0, color: "inherit", textAlign: "left" as const, fontWeight: 800, cursor: "pointer", padding: 0 };
const selectStyle = { background: "#0c0c0e", color: "#fff", border: "1px solid #27272a", borderRadius: 6, padding: 7, fontSize: 10, width: "100%" };
const inputStyle = { background: "#0c0c0e", color: "#fff", border: "1px solid #27272a", borderRadius: 6, padding: 7, fontSize: 10, width: "100%", marginBottom: 4 };
