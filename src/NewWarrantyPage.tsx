import { useState } from "react";
import type { Job } from "./types";

type WarrantyStatus = "Open" | "In Review" | "Resolved";
type WarrantyPriority = "Low" | "Medium" | "High";
export type WarrantyCase = { jobId: string; openedAt: string; issue: string; status: WarrantyStatus; priority: WarrantyPriority; notes: string };

type Props = { jobs: Job[]; initialJobId?: string; onCreate: (value: WarrantyCase) => void; onCancel: () => void };

export default function NewWarrantyPage({ jobs, initialJobId, onCreate, onCancel }: Props) {
  const [jobId, setJobId] = useState(initialJobId ?? jobs[0]?.id ?? "");
  const [issue, setIssue] = useState("Installation issue");
  const [priority, setPriority] = useState<WarrantyPriority>("Medium");
  const [notes, setNotes] = useState("");

  const submit = () => {
    if (!jobId || !issue.trim()) return;
    onCreate({ jobId, openedAt: new Date().toISOString(), issue: issue.trim(), status: "Open", priority, notes: notes.trim() });
  };

  return <div className="content">
    <section className="page-tools">
      <div><span className="gold-label">AFTER-SALES</span><h2>New Warranty</h2><p className="muted">Open a post-installation warranty case and link it to the correct job.</p></div>
    </section>
    <section className="panel">
      <div className="form-grid">
        <label className="field"><span>Job</span><select value={jobId} onChange={e => setJobId(e.target.value)}>{jobs.map(job => <option key={job.id} value={job.id}>{job.id} — {job.address}</option>)}</select></label>
        <label className="field"><span>Priority</span><select value={priority} onChange={e => setPriority(e.target.value as WarrantyPriority)}>{["Low","Medium","High"].map(value => <option key={value}>{value}</option>)}</select></label>
        <label className="field"><span>Issue</span><input value={issue} onChange={e => setIssue(e.target.value)} placeholder="Describe the warranty issue" /></label>
        <label className="field"><span>Notes</span><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add initial notes..." /></label>
      </div>
      <div className="button-group" style={{marginTop:14}}><button className="ghost" onClick={onCancel}>Cancel</button><button className="primary" disabled={!jobId || !issue.trim()} onClick={submit}>Create Warranty</button></div>
    </section>
  </div>;
}
