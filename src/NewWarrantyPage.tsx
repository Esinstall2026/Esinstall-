import { useState } from "react";
import type { Job } from "./types";

type WarrantyStatus = "Open" | "In Review" | "Resolved";
type WarrantyPriority = "Low" | "Medium" | "High";
export type WarrantyCase = { jobId: string; openedAt: string; issue: string; status: WarrantyStatus; priority: WarrantyPriority; notes: string };

type Props = { jobs: Job[]; initialJobId?: string; onCreate: (value: WarrantyCase) => void | Promise<void>; onCancel: () => void };

export default function NewWarrantyPage({ jobs, initialJobId, onCreate, onCancel }: Props) {
  const [jobId, setJobId] = useState(initialJobId ?? jobs[0]?.id ?? "");
  const [issue, setIssue] = useState("Installation issue");
  const [priority, setPriority] = useState<WarrantyPriority>("Medium");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!jobId || !issue.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      await onCreate({ jobId, openedAt: new Date().toISOString(), issue: issue.trim(), status: "Open", priority, notes: notes.trim() });
      setSuccess(true);
      window.setTimeout(() => onCancel(), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create warranty. Please try again.");
      setSaving(false);
    }
  };

  return <div className="content">
    <section className="page-tools">
      <div><span className="gold-label">AFTER-SALES</span><h2>New Warranty</h2><p className="muted">Open a post-installation warranty case and link it to the correct job.</p></div>
    </section>
    <section className="panel">
      {success && <div style={successStyle}>✓ Warranty created successfully. Returning to Warranty cases…</div>}
      {error && <div style={errorStyle}>{error}</div>}
      <div className="form-grid">
        <label className="field"><span>Job</span><select value={jobId} disabled={saving} onChange={e => setJobId(e.target.value)}>{jobs.map(job => <option key={job.id} value={job.id}>{job.id} — {job.address}</option>)}</select></label>
        <label className="field"><span>Priority</span><select value={priority} disabled={saving} onChange={e => setPriority(e.target.value as WarrantyPriority)}>{["Low","Medium","High"].map(value => <option key={value}>{value}</option>)}</select></label>
        <label className="field"><span>Issue</span><input value={issue} disabled={saving} onChange={e => setIssue(e.target.value)} placeholder="Describe the warranty issue" /></label>
        <label className="field"><span>Notes</span><textarea value={notes} disabled={saving} onChange={e => setNotes(e.target.value)} placeholder="Add initial notes..." /></label>
      </div>
      <div className="button-group" style={{marginTop:14}}><button className="ghost" disabled={saving} onClick={onCancel}>Cancel</button><button className="primary" disabled={!jobId || !issue.trim() || saving || success} onClick={submit}>{saving ? "Saving…" : "Create Warranty"}</button></div>
    </section>
  </div>;
}

const successStyle = { marginBottom: 14, padding: "12px 14px", borderRadius: 10, border: "1px solid #6f5a24", background: "rgba(212,170,75,.12)", color: "#e4c36f", fontWeight: 700 };
const errorStyle = { marginBottom: 14, padding: "12px 14px", borderRadius: 10, border: "1px solid #6b3030", background: "rgba(180,50,50,.12)", color: "#ff9d9d", fontWeight: 600 };
