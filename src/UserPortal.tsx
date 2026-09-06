import { ChangeEvent, useMemo, useState } from "react";
import { jobs as seedJobs } from "./data";
import { getSession, signOut, type AccessUser } from "./Auth";
import type { Job, JobStatus } from "./types";

type InstallationStatus = "Scheduled" | "In Progress" | "Completed";
type Installation = { jobId: string; team: string; date: string; time: string; status: InstallationStatus; notes: string };
type WarrantyStatus = "Open" | "In Review" | "Resolved";
type WarrantyPriority = "Low" | "Medium" | "High";
type WarrantyCase = { jobId: string; openedAt: string; issue: string; status: WarrantyStatus; priority: WarrantyPriority; notes: string };
type Evidence = { name: string; type: string; size: number; addedAt: string };

type UserPage = "Dashboard" | "Jobs" | "Job Folder" | "Installations" | "Warranty";

function read<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function write<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}
function initialInstallations(): Installation[] {
  return seedJobs.map((job, index) => ({ jobId: job.id, team: job.team, date: job.date, time: index % 2 ? "10:00 AM" : "8:00 AM", status: job.status === "Installation" ? "In Progress" : "Scheduled", notes: "" }));
}

export default function UserPortal() {
  const session = getSession() as AccessUser;
  const [page, setPage] = useState<UserPage>("Dashboard");
  const [jobs, setJobs] = useState<Job[]>(() => read("es-install-jobs-v1", seedJobs));
  const [installations, setInstallations] = useState<Installation[]>(() => read("es-install-installations-v1", initialInstallations()));
  const [warranties, setWarranties] = useState<WarrantyCase[]>(() => read("es-install-warranty-v1", []));
  const [selectedJobId, setSelectedJobId] = useState("");
  const [search, setSearch] = useState("");

  const scopedJobs = useMemo(() => jobs.filter(job => job.team === session.team), [jobs, session.team]);
  const scopedIds = useMemo(() => new Set(scopedJobs.map(job => job.id)), [scopedJobs]);
  const scopedInstallations = installations.filter(item => scopedIds.has(item.jobId));
  const scopedWarranties = warranties.filter(item => scopedIds.has(item.jobId));
  const selectedJob = scopedJobs.find(job => job.id === selectedJobId) ?? scopedJobs[0] ?? null;

  const openJob = (job: Job) => { setSelectedJobId(job.id); setPage("Job Folder"); };

  const updateInstallation = (value: Installation) => {
    if (!scopedIds.has(value.jobId) || value.team !== session.team) return;
    const next = installations.some(item => item.jobId === value.jobId) ? installations.map(item => item.jobId === value.jobId ? value : item) : [...installations, value];
    setInstallations(next); write("es-install-installations-v1", next);
    const nextStatus: JobStatus = value.status === "Completed" ? "Completed" : value.status === "In Progress" ? "Installation" : "Ready for Installation";
    const nextJobs = jobs.map(job => job.id === value.jobId ? { ...job, status: nextStatus } : job);
    setJobs(nextJobs); write("es-install-jobs-v1", nextJobs);
  };

  const updateWarranty = (value: WarrantyCase) => {
    if (!scopedIds.has(value.jobId)) return;
    const next = warranties.some(item => item.jobId === value.jobId) ? warranties.map(item => item.jobId === value.jobId ? value : item) : [...warranties, value];
    setWarranties(next); write("es-install-warranty-v1", next);
    if (value.status !== "Resolved") {
      const nextJobs = jobs.map(job => job.id === value.jobId && job.status === "Completed" ? { ...job, status: "Warranty" as JobStatus } : job);
      setJobs(nextJobs); write("es-install-jobs-v1", nextJobs);
    }
  };

  return <div className="app-shell user-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">ES</div><div><strong>ES INSTALL</strong><span>Team Portal</span></div></div>
      <div className="nav-title">MY OPERATIONS</div>
      <nav>
        {(["Dashboard", "Jobs", "Job Folder", "Installations", "Warranty"] as UserPage[]).map(item => <button key={item} className={`nav-item ${page === item ? "active" : ""}`} onClick={() => setPage(item)}><span className="nav-icon">{({ Dashboard: "▦", Jobs: "▤", "Job Folder": "▱", Installations: "⌂", Warranty: "◇" } as Record<UserPage, string>)[item]}</span>{item}</button>)}
      </nav>
      <div className="sidebar-footer"><div className="status-dot"/><div><strong>{session.team}</strong><span>User access · scoped jobs</span></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><div className="eyebrow">ES INSTALL / {page.toUpperCase()}</div><h1>{page}</h1></div><div className="user-chip"><div className="avatar">{session.team?.replace("Team ", "").slice(0, 2).toUpperCase()}</div><div><strong>{session.displayName}</strong><span>User · {session.team}</span></div></div></header>
      {page === "Dashboard" && <UserDashboard jobs={scopedJobs} installations={scopedInstallations} warranties={scopedWarranties} onOpenJob={openJob} />}
      {page === "Jobs" && <UserJobs jobs={scopedJobs} search={search} setSearch={setSearch} onOpenJob={openJob} />}
      {page === "Job Folder" && selectedJob && <UserJobFolder job={selectedJob} onBack={() => setPage("Jobs")} />}
      {page === "Installations" && <UserInstallations jobs={scopedJobs} installations={scopedInstallations} onSave={updateInstallation} onOpenJob={openJob} />}
      {page === "Warranty" && <UserWarranty jobs={scopedJobs} installations={scopedInstallations} warranties={scopedWarranties} onSave={updateWarranty} onOpenJob={openJob} />}
    </main>
  </div>;
}

function UserDashboard({ jobs, installations, warranties, onOpenJob }: { jobs: Job[]; installations: Installation[]; warranties: WarrantyCase[]; onOpenJob: (job: Job) => void }) {
  return <div className="content">
    <section className="hero"><div><span className="gold-label">FIELD TEAM PORTAL</span><h2>Good morning, Team.</h2><p>Veja somente os trabalhos atribuídos à sua equipe e atualize a operação em campo.</p></div><button className="primary" onClick={() => jobs[0] && onOpenJob(jobs[0])}>Open my latest Job</button></section>
    <section className="metric-grid"><Metric label="My Jobs" value={jobs.length} note="assigned to this team"/><Metric label="Scheduled" value={installations.filter(item => item.status === "Scheduled").length} note="ready for field"/><Metric label="In Progress" value={installations.filter(item => item.status === "In Progress").length} note="currently working"/><Metric label="Open Warranty" value={warranties.filter(item => item.status !== "Resolved").length} note="needs attention"/></section>
    <section className="panel"><PanelTitle label="MY WORK" title="Assigned Jobs"/><div className="job-list">{jobs.map(job => <button className="job-row" key={job.id} onClick={() => onOpenJob(job)}><div className="job-code">{job.id}</div><div className="job-main"><strong>{job.address}</strong><span>{job.builder} · {job.community}</span></div><Status status={job.status}/><span className="arrow">→</span></button>)}</div></section>
  </div>;
}

function UserJobs({ jobs, search, setSearch, onOpenJob }: { jobs: Job[]; search: string; setSearch: (value: string) => void; onOpenJob: (job: Job) => void }) {
  const rows = jobs.filter(job => `${job.id} ${job.address} ${job.builder} ${job.community}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="content"><section className="page-tools"><div><span className="gold-label">MY WORK</span><h2>Assigned Jobs</h2><p className="muted">Somente Jobs atribuídos à sua equipe.</p></div></section><div className="search-box"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search my jobs..." /></div><section className="panel table-panel"><div className="table-head"><span>JOB</span><span>LOCATION</span><span>BUILDER</span><span>TEAM</span><span>STATUS</span><span /></div>{rows.map(job => <button className="table-row" key={job.id} onClick={() => onOpenJob(job)}><strong>{job.id}</strong><span>{job.address}<small>{job.community}</small></span><span>{job.builder}</span><span>{job.team}</span><Status status={job.status}/><span>→</span></button>)}</section></div>;
}

function UserJobFolder({ job, onBack }: { job: Job; onBack: () => void }) {
  const [evidence, setEvidence] = useState<Evidence[]>(() => read(`es-install-evidence-${job.id}`, []));
  const add = (event: ChangeEvent<HTMLInputElement>) => { const files = Array.from(event.target.files ?? []); if (!files.length) return; const next = [...evidence, ...files.map(file => ({ name: file.name, type: file.type || "file", size: file.size, addedAt: new Date().toISOString() }))]; setEvidence(next); write(`es-install-evidence-${job.id}`, next); event.target.value = ""; };
  return <div className="content"><section className="job-folder-head"><div><span className="gold-label">JOB FOLDER</span><h2>{job.id}</h2><p>{job.address} · {job.builder} · {job.community}</p></div><button className="ghost" onClick={onBack}>← My Jobs</button></section><section className="two-column"><div className="panel"><PanelTitle label="JOB DETAILS" title="Operational Record"/><div className="form-grid"><ReadField label="Address" value={job.address}/><ReadField label="Builder" value={job.builder}/><ReadField label="Community" value={job.community}/><ReadField label="Team" value={job.team}/><ReadField label="Date" value={new Date(`${job.date}T12:00:00`).toLocaleDateString()}/><ReadField label="Status" value={job.status}/></div></div><div className="panel"><PanelTitle label="EVIDENCE" title="Photos & Files"/><input type="file" multiple accept="image/*,.pdf" onChange={add}/><p className="muted">Fotos e arquivos ficam associados a este Job no piloto.</p><div className="history-list">{evidence.map(item => <div className="history-row" key={item.addedAt}><div><strong>{item.name}</strong><small>{item.type} · {Math.max(1, Math.round(item.size / 1024))} KB</small></div></div>)}</div></div></section><section className="panel" style={{marginTop:14}}><PanelTitle label="WORKFLOW" title="Current Status"/><div className="workflow-strip"><div className="workflow-step active"><span>●</span>{job.status}</div></div></section></div>;
}

function UserInstallations({ jobs, installations, onSave, onOpenJob }: { jobs: Job[]; installations: Installation[]; onSave: (value: Installation) => void; onOpenJob: (job: Job) => void }) {
  return <div className="content"><section className="page-tools"><div><span className="gold-label">FIELD OPERATIONS</span><h2>My Installations</h2><p className="muted">Atualize somente as instalações da sua equipe.</p></div></section><section className="metric-grid"><Metric label="Scheduled" value={installations.filter(item => item.status === "Scheduled").length} note="ready for field"/><Metric label="In Progress" value={installations.filter(item => item.status === "In Progress").length} note="teams working"/><Metric label="Completed" value={installations.filter(item => item.status === "Completed").length} note="closed installs"/><Metric label="Jobs" value={jobs.length} note="assigned"/></section><section className="panel table-panel"><div className="table-head"><span>JOB</span><span>LOCATION</span><span>DATE / TIME</span><span>STATUS</span><span /></div>{installations.map(item => { const job = jobs.find(value => value.id === item.jobId); if (!job) return null; return <div className="table-row" key={item.jobId}><button style={plainButton} onClick={() => onOpenJob(job)}>{item.jobId}</button><span>{job.address}<small>{job.builder} · {job.community}</small></span><span><input type="date" value={item.date} onChange={e => onSave({...item, date: e.target.value})} style={inputStyle}/><select value={item.time} onChange={e => onSave({...item, time: e.target.value})} style={selectStyle}>{["8:00 AM","10:00 AM","12:00 PM","2:00 PM","4:00 PM"].map(value => <option key={value}>{value}</option>)}</select></span><select value={item.status} onChange={e => onSave({...item, status: e.target.value as InstallationStatus})} style={selectStyle}>{["Scheduled","In Progress","Completed"].map(value => <option key={value}>{value}</option>)}</select><button className="ghost" onClick={() => onOpenJob(job)}>Job →</button></div>; })}</section></div>;
}

function UserWarranty({ jobs, installations, warranties, onSave, onOpenJob }: { jobs: Job[]; installations: Installation[]; warranties: WarrantyCase[]; onSave: (value: WarrantyCase) => void; onOpenJob: (job: Job) => void }) {
  const eligible = jobs.filter(job => installations.some(item => item.jobId === job.id && item.status === "Completed") || job.status === "Warranty" || warranties.some(item => item.jobId === job.id));
  const create = (jobId: string) => onSave({ jobId, openedAt: new Date().toISOString(), issue: "Installation issue", status: "Open", priority: "Medium", notes: "" });
  return <div className="content"><section className="page-tools"><div><span className="gold-label">AFTER-SALES</span><h2>My Warranty</h2><p className="muted">Reporte problemas dos Jobs da sua equipe.</p></div></section><section className="metric-grid"><Metric label="Open" value={warranties.filter(item => item.status === "Open").length} note="needs action"/><Metric label="In Review" value={warranties.filter(item => item.status === "In Review").length} note="being assessed"/><Metric label="Resolved" value={warranties.filter(item => item.status === "Resolved").length} note="closed cases"/><Metric label="Eligible Jobs" value={eligible.length} note="post-installation"/></section><section className="panel table-panel"><div className="table-head"><span>JOB</span><span>LOCATION</span><span>CASE</span><span>PRIORITY</span><span>STATUS</span><span /></div>{eligible.map(job => { const warranty = warranties.find(item => item.jobId === job.id); return <div className="table-row" key={job.id}><button style={plainButton} onClick={() => onOpenJob(job)}>{job.id}</button><span>{job.address}<small>{job.builder} · {job.community}</small></span>{warranty ? <input value={warranty.issue} onChange={e => onSave({...warranty, issue: e.target.value})} style={inputStyle}/> : <button className="ghost" onClick={() => create(job.id)}>Open Case</button>}{warranty ? <select value={warranty.priority} onChange={e => onSave({...warranty, priority: e.target.value as WarrantyPriority})} style={selectStyle}>{["Low","Medium","High"].map(value => <option key={value}>{value}</option>)}</select> : <span className="muted">—</span>}{warranty ? <select value={warranty.status} onChange={e => onSave({...warranty, status: e.target.value as WarrantyStatus})} style={selectStyle}>{["Open","In Review","Resolved"].map(value => <option key={value}>{value}</option>)}</select> : <span className="muted">Not opened</span>}<button className="ghost" onClick={() => onOpenJob(job)}>Job →</button></div>; })}</section>{warranties.length > 0 && <section className="panel" style={{marginTop:14}}><PanelTitle label="CASE DETAILS" title="Warranty Notes"/>{warranties.map(item => <div className="history-row" key={item.jobId}><span>{item.jobId}</span><div><strong>{item.issue}</strong><small>{item.status} · {item.priority} · opened {new Date(item.openedAt).toLocaleDateString()}</small><textarea value={item.notes} onChange={e => onSave({...item, notes: e.target.value})} placeholder="Add resolution notes..."/></div></div>)}</section>}</div>;
}

function ReadField({ label, value }: { label: string; value: string }) { return <label className="field"><span>{label}</span><input value={value} readOnly /></label>; }
function Metric({ label, value, note }: { label: string; value: number; note: string }) { return <div className="metric-card"><span>{label}</span><div className="metric-value">{value}</div><small>{note}</small></div>; }
function PanelTitle({ label, title }: { label: string; title: string }) { return <div className="panel-head"><div><span className="gold-label">{label}</span><h3>{title}</h3></div></div>; }
function Status({ status }: { status: string }) { return <span className={`status status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>; }
const plainButton = { background: "none", border: 0, color: "inherit", textAlign: "left" as const, fontWeight: 800, cursor: "pointer", padding: 0 };
const selectStyle = { background: "#0c0c0e", color: "#fff", border: "1px solid #27272a", borderRadius: 6, padding: 7, fontSize: 10, width: "100%" };
const inputStyle = { background: "#0c0c0e", color: "#fff", border: "1px solid #27272a", borderRadius: 6, padding: 7, fontSize: 10, width: "100%", marginBottom: 4 };
