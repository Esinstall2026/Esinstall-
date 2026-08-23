import { ChangeEvent, type ReactNode, useMemo, useState } from "react";
import { builders, communities, jobs as seedJobs, teams } from "./data";
import { Job, JobStatus, Page } from "./types";

const nav: { label: Page; icon: string }[] = [
  { label: "Dashboard", icon: "▦" },
  { label: "Jobs", icon: "▤" },
  { label: "Job Folder", icon: "▱" },
  { label: "Installations", icon: "⌂" },
  { label: "Warranty", icon: "◇" },
  { label: "Reports", icon: "▥" },
  { label: "Teams", icon: "♙" },
  { label: "Builders", icon: "▣" },
  { label: "Communities", icon: "⌘" },
  { label: "Settings", icon: "⚙" }
];

const statuses: JobStatus[] = ["Scheduled", "Production", "Ready for Installation", "Installation", "Completed", "Warranty"];

function App() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [jobList, setJobList] = useState<Job[]>(() => loadJobs());
  const [selectedJobId, setSelectedJobId] = useState<string>(jobList[0]?.id ?? "");
  const [search, setSearch] = useState("");

  const selectedJob = jobList.find((job) => job.id === selectedJobId) ?? null;
  const filteredJobs = useMemo(
    () => jobList.filter((job) => `${job.id} ${job.address} ${job.builder} ${job.community}`.toLowerCase().includes(search.toLowerCase())),
    [jobList, search]
  );

  const openJob = (job: Job) => {
    setSelectedJobId(job.id);
    setPage("Job Folder");
  };

  const updateJob = (updated: Job) => {
    const next = jobList.map((job) => (job.id === updated.id ? updated : job));
    setJobList(next);
    saveJobs(next);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">ES</div><div><strong>ES INSTALL</strong><span>Operations Platform</span></div></div>
        <div className="nav-title">MAIN MENU</div>
        <nav>{nav.map((item) => <button key={item.label} className={`nav-item ${page === item.label ? "active" : ""}`} onClick={() => setPage(item.label)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}</nav>
        <div className="sidebar-footer"><div className="status-dot" /><div><strong>System Ready</strong><span>ES INSTALL v0.2</span></div></div>
      </aside>

      <main className="main">
        <header className="topbar"><div><div className="eyebrow">ES INSTALL / {page.toUpperCase()}</div><h1>{page}</h1></div><div className="top-actions"><div className="user-chip"><div className="avatar">AD</div><div><strong>Administrator</strong><span>Admin</span></div></div></div></header>

        {page === "Dashboard" && <Dashboard jobs={jobList} onOpenJob={openJob} />}
        {page === "Jobs" && <JobsPage jobs={filteredJobs} search={search} setSearch={setSearch} onOpenJob={openJob} />}
        {page === "Job Folder" && selectedJob && <JobFolder job={selectedJob} onSave={updateJob} />}
        {page !== "Dashboard" && page !== "Jobs" && page !== "Job Folder" && <ModulePlaceholder page={page} />}
      </main>
    </div>
  );
}

function Dashboard({ jobs, onOpenJob }: { jobs: Job[]; onOpenJob: (job: Job) => void }) {
  const metrics = [["Jobs in Progress", "18", "+12%"], ["Installations Today", "7", "+2"], ["Open Warranties", "4", "-18%"], ["Teams in Field", "6", "100%"]];
  return <div className="content">
    <section className="hero"><div><span className="gold-label">OPERATIONS OVERVIEW</span><h2>Good morning, Administrator.</h2><p>Monitor jobs, production, installations and warranties from one place.</p></div><button className="primary" onClick={() => jobs[0] && onOpenJob(jobs[0])}>Open latest Job</button></section>
    <section className="metric-grid">{metrics.map(([label, value, delta]) => <div className="metric-card" key={label}><span>{label}</span><div className="metric-value">{value}</div><small>{delta} this week</small></div>)}</section>
    <div className="two-column">
      <section className="panel"><div className="panel-head"><div><span className="gold-label">OPERATIONS</span><h3>Active Jobs</h3></div><button className="ghost" onClick={() => onOpenJob(jobs[0])}>View all</button></div><div className="job-list">{jobs.slice(0, 4).map((job) => <button className="job-row" key={job.id} onClick={() => onOpenJob(job)}><div className="job-code">{job.id}</div><div className="job-main"><strong>{job.address}</strong><span>{job.builder} · {job.community}</span></div><Status status={job.status} /><span className="arrow">→</span></button>)}</div></section>
      <section className="panel"><div className="panel-head"><div><span className="gold-label">WEEK</span><h3>Installation Agenda</h3></div></div><div className="agenda">{["MON 11", "TUE 12", "WED 13", "THU 14", "FRI 15"].map((day, i) => <div className={`agenda-day ${i === 0 ? "today" : ""}`} key={day}><span>{day}</span><strong>{i === 0 ? "3" : i === 1 ? "4" : i === 2 ? "2" : "5"}</strong><small>installs</small></div>)}</div></section>
    </div>
  </div>;
}

function JobsPage({ jobs, search, setSearch, onOpenJob }: { jobs: Job[]; search: string; setSearch: (value: string) => void; onOpenJob: (job: Job) => void }) {
  return <div className="content"><section className="page-tools"><div><span className="gold-label">JOB MANAGEMENT</span><h2>All Jobs</h2></div><button className="primary">+ New Job</button></section><div className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by job, address, builder or community..." /></div><section className="panel table-panel"><div className="table-head"><span>JOB</span><span>LOCATION</span><span>BUILDER</span><span>TEAM</span><span>STATUS</span><span></span></div>{jobs.map((job) => <button className="table-row" key={job.id} onClick={() => onOpenJob(job)}><strong>{job.id}</strong><span>{job.address}<small>{job.community}</small></span><span>{job.builder}</span><span>{job.team}</span><Status status={job.status} /><span>→</span></button>)}</section></div>;
}

function JobFolder({ job, onSave }: { job: Job; onSave: (job: Job) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(job);
  const [evidence, setEvidence] = useState<Evidence[]>(() => loadEvidence(job.id));

  const beginEdit = () => { setDraft(job); setEditing(true); };
  const save = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(job); setEditing(false); };

  const addEvidence = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const next = [...evidence, ...files.map((file) => ({ name: file.name, type: file.type || "file", size: file.size, addedAt: new Date().toISOString() }))];
    setEvidence(next);
    saveEvidence(job.id, next);
    event.target.value = "";
  };

  const removeEvidence = (name: string, addedAt: string) => {
    const next = evidence.filter((item) => !(item.name === name && item.addedAt === addedAt));
    setEvidence(next);
    saveEvidence(job.id, next);
  };

  return <div className="content">
    <section className="job-folder-head"><div><span className="gold-label">JOB FOLDER</span><h2>{job.id}</h2><p>{job.address} · {job.community}</p></div><Status status={job.status} /></section>
    <div className="folder-grid">
      <section className="panel"><div className="panel-head"><h3>Job Information</h3>{editing ? <div className="button-group"><button className="ghost" onClick={cancel}>Cancel</button><button className="primary small" onClick={save}>Save</button></div> : <button className="ghost" onClick={beginEdit}>Edit</button>}</div>
        {editing ? <EditForm draft={draft} setDraft={setDraft} /> : <><Info label="Builder" value={job.builder} /><Info label="Community" value={job.community} /><Info label="Address" value={job.address} /><Info label="Responsible Team" value={job.team} /><Info label="Scheduled Date" value={job.date} /></>}
      </section>
      <section className="panel"><div className="panel-head"><h3>Operational Timeline</h3></div><Timeline current={job.status} /></section>
      <section className="panel full"><div className="panel-head"><div><h3>Photos & Attachments</h3><span className="muted">Evidence connected to this Job Folder</span></div><label className="primary small upload-button">+ Add Evidence<input type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={addEvidence} /></label></div>
        {evidence.length === 0 ? <div className="upload-zone"><div className="upload-icon">＋</div><strong>Upload photos or documents</strong><span>Production · Installation · Warranty</span></div> : <div className="evidence-list">{evidence.map((item) => <div className="evidence-row" key={`${item.name}-${item.addedAt}`}><div className="evidence-icon">{item.type.startsWith("image/") ? "▧" : "▤"}</div><div><strong>{item.name}</strong><small>{formatBytes(item.size)} · {new Date(item.addedAt).toLocaleString()}</small></div><button className="ghost danger" onClick={() => removeEvidence(item.name, item.addedAt)}>Remove</button></div>)}</div>}
      </section>
      <section className="panel full"><div className="panel-head"><h3>Activity History</h3></div><div className="history"><History time="Today · 09:42" title="Job Folder opened" detail="Operational record viewed" /><History time="Today" title="Evidence area ready" detail={`${evidence.length} file${evidence.length === 1 ? "" : "s"} attached to this folder`} /><History time="System" title="Job folder initialized" detail="ES INSTALL operational record" /></div></section>
    </div>
  </div>;
}

function EditForm({ draft, setDraft }: { draft: Job; setDraft: (job: Job) => void }) {
  const update = (key: keyof Job, value: string) => setDraft({ ...draft, [key]: value } as Job);
  return <div className="edit-form">
    <Field label="Builder"><select value={draft.builder} onChange={(e) => update("builder", e.target.value)}>{builders.map((item) => <option key={item}>{item}</option>)}</select></Field>
    <Field label="Community"><select value={draft.community} onChange={(e) => update("community", e.target.value)}>{communities.map((item) => <option key={item}>{item}</option>)}</select></Field>
    <Field label="Address"><input value={draft.address} onChange={(e) => update("address", e.target.value)} /></Field>
    <Field label="Responsible Team"><select value={draft.team} onChange={(e) => update("team", e.target.value)}>{teams.map((item) => <option key={item}>{item}</option>)}</select></Field>
    <Field label="Scheduled Date"><input type="date" value={draft.date} onChange={(e) => update("date", e.target.value)} /></Field>
    <Field label="Status"><select value={draft.status} onChange={(e) => update("status", e.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></Field>
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="field"><span>{label}</span>{children}</label>; }

function ModulePlaceholder({ page }: { page: Page }) { const descriptions: Record<string, string> = { Installations: "Installation scheduling, teams in field and completion tracking.", Warranty: "Open warranty cases, evidence and resolution tracking.", Reports: "Operational reports and performance indicators.", Teams: "Installation teams, assignments and field status.", Builders: "Builder directory and job relationships.", Communities: "Community directory and job relationships.", Settings: "System configuration, roles and future integrations." }; return <div className="content empty-module"><div className="module-card"><div className="large-icon">ES</div><span className="gold-label">MODULE READY</span><h2>{page}</h2><p>{descriptions[page]}</p><span className="muted">UI foundation created · Backend integration is the next development layer.</span></div></div>; }
function Status({ status }: { status: string }) { return <span className={`status status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="info-row"><span>{label}</span><strong>{value}</strong></div>; }
function Timeline({ current }: { current: string }) { const steps = ["Scheduled", "Production", "Ready for Installation", "Installation", "Completed"]; const index = Math.max(0, steps.indexOf(current)); return <div className="timeline">{steps.map((step, i) => <div className={`timeline-item ${i <= index ? "done" : ""}`} key={step}><div className="timeline-dot">{i <= index ? "✓" : ""}</div><span>{step}</span></div>)}</div>; }
function History({ time, title, detail }: { time: string; title: string; detail: string }) { return <div className="history-row"><span>{time}</span><div><strong>{title}</strong><small>{detail}</small></div></div>; }

interface Evidence { name: string; type: string; size: number; addedAt: string; }
const JOBS_KEY = "es-install-jobs-v2";
const evidenceKey = (id: string) => `es-install-evidence-${id}`;
function loadJobs(): Job[] { try { const raw = localStorage.getItem(JOBS_KEY); return raw ? JSON.parse(raw) : seedJobs; } catch { return seedJobs; } }
function saveJobs(value: Job[]) { try { localStorage.setItem(JOBS_KEY, JSON.stringify(value)); } catch { /* storage unavailable */ } }
function loadEvidence(id: string): Evidence[] { try { const raw = localStorage.getItem(evidenceKey(id)); return raw ? JSON.parse(raw) : []; } catch { return []; } }
function saveEvidence(id: string, value: Evidence[]) { try { localStorage.setItem(evidenceKey(id), JSON.stringify(value)); } catch { /* storage unavailable */ } }
function formatBytes(bytes: number) { if (!bytes) return "0 KB"; const units = ["B", "KB", "MB", "GB"]; const i = Math.floor(Math.log(bytes) / Math.log(1024)); return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`; }

export default App;
