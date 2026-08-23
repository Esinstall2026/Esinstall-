import { ChangeEvent, useMemo, useState } from "react";
import { builders, communities, jobs, teams } from "./data";
import { Job, Page } from "./types";

const nav: { label: Page; icon: string }[] = [
  { label: "Dashboard", icon: "▦" }, { label: "Jobs", icon: "▤" }, { label: "Job Folder", icon: "▱" },
  { label: "Installations", icon: "⌂" }, { label: "Warranty", icon: "◇" }, { label: "Reports", icon: "▥" },
  { label: "Teams", icon: "♙" }, { label: "Builders", icon: "▣" }, { label: "Communities", icon: "⌘" }, { label: "Settings", icon: "⚙" }
];

function App() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [selectedJob, setSelectedJob] = useState<Job | null>(jobs[0]);
  const [search, setSearch] = useState("");
  const filteredJobs = useMemo(() => jobs.filter((job) => `${job.id} ${job.address} ${job.builder} ${job.community}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const openJob = (job: Job) => { setSelectedJob({ ...job }); setPage("Job Folder"); };
  const updateSelectedJob = (updates: Partial<Job>) => setSelectedJob((current) => current ? { ...current, ...updates } : current);

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">ES</div><div><strong>ES INSTALL</strong><span>Operations Platform</span></div></div>
      <div className="nav-title">MAIN MENU</div>
      <nav>{nav.map((item) => <button key={item.label} className={`nav-item ${page === item.label ? "active" : ""}`} onClick={() => setPage(item.label)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}</nav>
      <div className="sidebar-footer"><div className="status-dot" /><div><strong>System Ready</strong><span>ES INSTALL v0.1</span></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><div className="eyebrow">ES INSTALL / {page.toUpperCase()}</div><h1>{page}</h1></div><div className="user-chip"><div className="avatar">AD</div><div><strong>Administrator</strong><span>Admin</span></div></div></header>
      {page === "Dashboard" && <Dashboard onOpenJob={openJob} />}
      {page === "Jobs" && <JobsPage jobs={filteredJobs} search={search} setSearch={setSearch} onOpenJob={openJob} />}
      {page === "Job Folder" && selectedJob && <JobFolder job={selectedJob} onUpdate={updateSelectedJob} />}
      {page !== "Dashboard" && page !== "Jobs" && page !== "Job Folder" && <ModulePlaceholder page={page} />}
    </main>
  </div>;
}

function Dashboard({ onOpenJob }: { onOpenJob: (job: Job) => void }) {
  const metrics = [["Jobs in Progress", "18", "+12%"], ["Installations Today", "7", "+2"], ["Open Warranties", "4", "-18%"], ["Teams in Field", "6", "100%"]];
  return <div className="content">
    <section className="hero"><div><span className="gold-label">OPERATIONS OVERVIEW</span><h2>Good morning, Administrator.</h2><p>Monitor jobs, production, installations and warranties from one place.</p></div><button className="primary" onClick={() => onOpenJob(jobs[0])}>Open latest Job</button></section>
    <section className="metric-grid">{metrics.map(([label, value, delta]) => <div className="metric-card" key={label}><span>{label}</span><div className="metric-value">{value}</div><small>{delta} this week</small></div>)}</section>
    <div className="two-column">
      <section className="panel"><div className="panel-head"><div><span className="gold-label">OPERATIONS</span><h3>Active Jobs</h3></div><button className="ghost">View all</button></div><div className="job-list">{jobs.map((job) => <button className="job-row" key={job.id} onClick={() => onOpenJob(job)}><div className="job-code">{job.id}</div><div className="job-main"><strong>{job.address}</strong><span>{job.builder} · {job.community}</span></div><Status status={job.status} /><span className="arrow">→</span></button>)}</div></section>
      <section className="panel"><div className="panel-head"><div><span className="gold-label">WEEK</span><h3>Installation Agenda</h3></div></div><div className="agenda">{["MON 11", "TUE 12", "WED 13", "THU 14", "FRI 15"].map((day, i) => <div className={`agenda-day ${i === 0 ? "today" : ""}`} key={day}><span>{day}</span><strong>{i === 0 ? "3" : i === 1 ? "4" : i === 2 ? "2" : "5"}</strong><small>installs</small></div>)}</div></section>
    </div>
  </div>;
}

function JobsPage({ jobs, search, setSearch, onOpenJob }: { jobs: Job[]; search: string; setSearch: (value: string) => void; onOpenJob: (job: Job) => void }) {
  return <div className="content"><section className="page-tools"><div><span className="gold-label">JOB MANAGEMENT</span><h2>All Jobs</h2></div><button className="primary">+ New Job</button></section><div className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by job, address, builder or community..." /></div><section className="panel table-panel"><div className="table-head"><span>JOB</span><span>LOCATION</span><span>BUILDER</span><span>TEAM</span><span>STATUS</span><span /></div>{jobs.map((job) => <button className="table-row" key={job.id} onClick={() => onOpenJob(job)}><strong>{job.id}</strong><span>{job.address}<small>{job.community}</small></span><span>{job.builder}</span><span>{job.team}</span><Status status={job.status} /><span>→</span></button>)}</section></div>;
}

function JobFolder({ job, onUpdate }: { job: Job; onUpdate: (updates: Partial<Job>) => void }) {
  const [editing, setEditing] = useState(false);
  const [evidence, setEvidence] = useState<string[]>([]);
  const handleEvidence = (event: ChangeEvent<HTMLInputElement>) => { const files = Array.from(event.target.files ?? []); if (!files.length) return; setEvidence((current) => [...current, ...files.map((file) => file.name)]); event.target.value = ""; };
  return <div className="content">
    <section className="job-folder-head"><div><span className="gold-label">JOB FOLDER · V1</span><h2>{job.id}</h2><p>{job.address} · {job.community}</p></div><div className="job-head-actions"><span className="folder-ready">JOB FOLDER READY</span><Status status={job.status} /></div></section>
    <div className="folder-grid">
      <section className="panel"><div className="panel-head"><div><span className="gold-label">CORE DATA</span><h3>Job Information</h3></div><button className="ghost" onClick={() => setEditing((value) => !value)}>{editing ? "Cancel" : "Edit"}</button></div>
        {editing ? <div className="edit-form">
          <Field label="Builder" value={job.builder} options={builders} onChange={(value) => onUpdate({ builder: value })} />
          <Field label="Community" value={job.community} options={communities} onChange={(value) => onUpdate({ community: value })} />
          <TextField label="Address" value={job.address} onChange={(value) => onUpdate({ address: value })} />
          <Field label="Responsible Team" value={job.team} options={teams} onChange={(value) => onUpdate({ team: value })} />
          <TextField label="Scheduled Date" type="date" value={job.date} onChange={(value) => onUpdate({ date: value })} />
          <Field label="Status" value={job.status} options={["Scheduled", "Production", "Ready for Installation", "Installation", "Completed", "Warranty"]} onChange={(value) => onUpdate({ status: value as Job["status"] })} />
          <button className="primary" onClick={() => setEditing(false)}>Save Job</button>
        </div> : <><Info label="Builder" value={job.builder} /><Info label="Community" value={job.community} /><Info label="Address" value={job.address} /><Info label="Responsible Team" value={job.team} /><Info label="Scheduled Date" value={job.date} /></>}
      </section>
      <section className="panel"><div className="panel-head"><div><span className="gold-label">WORKFLOW</span><h3>Operational Timeline</h3></div></div><Timeline current={job.status} /></section>
      <section className="panel full"><div className="panel-head"><div><span className="gold-label">EVIDENCE</span><h3>Photos & Attachments</h3><span className="muted">Production · Installation · Warranty</span></div><label className="primary small upload-button">+ Add Evidence<input type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleEvidence} /></label></div>
        {evidence.length === 0 ? <label className="upload-zone"><div className="upload-icon">＋</div><strong>Upload photos or documents</strong><span>Tap here to select files from your device</span><input type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleEvidence} /></label> : <div className="evidence-list">{evidence.map((name, index) => <div className="evidence-item" key={`${name}-${index}`}><span className="evidence-icon">▧</span><div><strong>{name}</strong><small>Attached to {job.id}</small></div><button className="ghost" onClick={() => setEvidence((current) => current.filter((_, i) => i !== index))}>Remove</button></div>)}</div>}
      </section>
      <section className="panel full"><div className="panel-head"><div><span className="gold-label">AUDIT TRAIL</span><h3>Activity History</h3></div></div><div className="history"><History time="Now" title="Job folder opened" detail={`${job.id} is ready for operational updates`} /><History time="Today · 09:42" title="Installation status updated" detail={`Current status: ${job.status}`} /><History time="Yesterday · 16:18" title="Team assigned" detail={`${job.team} assigned to this Job`} /></div></section>
    </div>
  </div>;
}

function Field({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="form-field"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function TextField({ label, value, type = "text", onChange }: { label: string; value: string; type?: string; onChange: (value: string) => void }) { return <label className="form-field"><span>{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} /></label>; }
function ModulePlaceholder({ page }: { page: Page }) { const descriptions: Record<string, string> = { Installations: "Installation scheduling, teams in field and completion tracking.", Warranty: "Open warranty cases, evidence and resolution tracking.", Reports: "Operational reports and performance indicators.", Teams: "Installation teams, assignments and field status.", Builders: "Builder directory and job relationships.", Communities: "Community directory and job relationships.", Settings: "System configuration, roles and future integrations." }; return <div className="content empty-module"><div className="module-card"><div className="large-icon">ES</div><span className="gold-label">MODULE READY</span><h2>{page}</h2><p>{descriptions[page]}</p><span className="muted">UI foundation created · Backend integration is the next development layer.</span></div></div>; }
function Status({ status }: { status: string }) { return <span className={`status status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="info-row"><span>{label}</span><strong>{value}</strong></div>; }
function Timeline({ current }: { current: string }) { const steps = ["Scheduled", "Production", "Ready for Installation", "Installation", "Completed"]; const index = Math.max(0, steps.indexOf(current)); return <div className="timeline">{steps.map((step, i) => <div className={`timeline-item ${i <= index ? "done" : ""}`} key={step}><div className="timeline-dot">{i <= index ? "✓" : ""}</div><span>{step}</span></div>)}</div>; }
function History({ time, title, detail }: { time: string; title: string; detail: string }) { return <div className="history-row"><span>{time}</span><div><strong>{title}</strong><small>{detail}</small></div></div>; }

export default App;
