import React, { CSSProperties, useState } from "react";
import { jobs as seedJobs } from "./data";
import type { Job, ProductionRecord } from "./types";
import { createBackendProvider } from "./backend";

type Installation = { jobId: string; team: string; date: string; time: string; status: "Scheduled" | "In Progress" | "Completed"; notes: string };
type WarrantyCase = { jobId: string; openedAt: string; issue: string; status: "Open" | "In Review" | "Resolved"; priority: "Low" | "Medium" | "High"; notes: string };

function read<T>(key: string, fallback: T): T { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }
function write<T>(key: string, value: T) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

export default function EnhancedRoot() {
  const [showNewWarranty, setShowNewWarranty] = useState(false);
  const [savingWarranty, setSavingWarranty] = useState(false);
  const [warrantyError, setWarrantyError] = useState("");
  const [warrantyJobId, setWarrantyJobId] = useState("");
  const [warrantyIssue, setWarrantyIssue] = useState("Installation issue");
  const [warrantyPriority, setWarrantyPriority] = useState<WarrantyCase["priority"]>("Medium");
  const [warrantyNotes, setWarrantyNotes] = useState("");

  const installations = read<Installation[]>("es-install-installations-v1", []);
  const warranties = read<WarrantyCase[]>("es-install-warranty-v1", []);
  const jobs = read<Job[]>("es-install-jobs-v1", seedJobs);
  const warrantyJobs = jobs.filter(job => installations.some(item => item.jobId === job.id && item.status === "Completed") || job.status === "Warranty" || warranties.some(item => item.jobId === job.id));

  const openNewWarranty = () => {
    setWarrantyError("");
    setWarrantyJobId(warrantyJobs[0]?.id ?? "");
    setWarrantyIssue("Installation issue");
    setWarrantyPriority("Medium");
    setWarrantyNotes("");
    setShowNewWarranty(true);
  };

  const createWarranty = async () => {
    if (savingWarranty || !warrantyJobId || !warrantyIssue.trim()) return;
    setSavingWarranty(true);
    setWarrantyError("");
    const value: WarrantyCase = { jobId: warrantyJobId, openedAt: new Date().toISOString(), issue: warrantyIssue.trim(), status: "Open", priority: warrantyPriority, notes: warrantyNotes.trim() };
    const currentWarranties = read<WarrantyCase[]>("es-install-warranty-v1", []);
    const nextWarranties = currentWarranties.some(item => item.jobId === value.jobId) ? currentWarranties.map(item => item.jobId === value.jobId ? value : item) : [...currentWarranties, value];
    const currentJobs = read<Job[]>("es-install-jobs-v1", seedJobs);
    const job = currentJobs.find(item => item.id === value.jobId);
    const nextJobs = job && value.status !== "Resolved" && job.status === "Completed" ? currentJobs.map(item => item.id === job.id ? { ...item, status: "Warranty" as const } : item) : currentJobs;

    try {
      const backend = createBackendProvider();
      // Save only the new/updated case. This avoids replacing the whole table and
      // makes the action work reliably with Supabase/API backends and RLS policies.
      await backend.saveWarranties([value]);
      if (nextJobs !== currentJobs) await backend.saveJobs([nextJobs.find(item => item.id === value.jobId)!]);

      write("es-install-warranty-v1", nextWarranties);
      if (nextJobs !== currentJobs) write("es-install-jobs-v1", nextJobs);
      setShowNewWarranty(false);
      window.location.reload();
    } catch (error) {
      console.error("Central warranty save failed", error);
      setWarrantyError(error instanceof Error ? error.message : "Não foi possível salvar a garantia. Tente novamente.");
    } finally {
      setSavingWarranty(false);
    }
  };

  return <>
    <button className="primary" onClick={openNewWarranty}>+ New Warranty</button>
    {showNewWarranty && <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="New Warranty">
      <section style={modalStyle}>
        <button className="ghost" style={closeStyle} onClick={() => !savingWarranty && setShowNewWarranty(false)} disabled={savingWarranty}>×</button>
        <div style={{ padding: 28 }}>
          <span className="gold-label">AFTER-SALES</span>
          <h2 style={{ marginTop: 8 }}>New Warranty</h2>
          <p className="muted">Open a post-installation warranty case and link it to the correct job.</p>
          <div className="form-grid" style={{ marginTop: 20 }}>
            <label className="field"><span>Job</span><select value={warrantyJobId} onChange={e => setWarrantyJobId(e.target.value)} disabled={savingWarranty}>{warrantyJobs.length ? warrantyJobs.map(job => <option key={job.id} value={job.id}>{job.id} — {job.address}</option>) : <option value="">No eligible jobs</option>}</select></label>
            <label className="field"><span>Priority</span><select value={warrantyPriority} onChange={e => setWarrantyPriority(e.target.value as WarrantyCase["priority"])} disabled={savingWarranty}>{["Low", "Medium", "High"].map(v => <option key={v}>{v}</option>)}</select></label>
            <label className="field"><span>Issue</span><input value={warrantyIssue} onChange={e => setWarrantyIssue(e.target.value)} placeholder="Describe the warranty issue" disabled={savingWarranty} /></label>
            <label className="field"><span>Notes</span><textarea value={warrantyNotes} onChange={e => setWarrantyNotes(e.target.value)} placeholder="Add initial notes..." disabled={savingWarranty} /></label>
          </div>
          {warrantyError && <div style={{ marginTop: 14, padding: 12, border: "1px solid #6b2525", borderRadius: 8, color: "#ffb4b4", background: "rgba(120,30,30,.15)" }}>{warrantyError}</div>}
          <div className="button-group" style={{ marginTop: 18 }}>
            <button className="ghost" onClick={() => setShowNewWarranty(false)} disabled={savingWarranty}>Cancel</button>
            <button className="primary" onClick={createWarranty} disabled={savingWarranty || !warrantyJobId || !warrantyIssue.trim()}>{savingWarranty ? "Saving…" : "Create Warranty"}</button>
          </div>
        </div>
      </section>
    </div>}
  </>;
}

const overlayStyle: CSSProperties = { position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.78)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18, overflowY: "auto" };
const modalStyle: CSSProperties = { position: "relative", width: "min(900px, 100%)", maxHeight: "94vh", overflowY: "auto", background: "#0b0b0d", border: "1px solid #3b3321", borderRadius: 16, boxShadow: "0 24px 80px rgba(0,0,0,.55)" };
const closeStyle: CSSProperties = { position: "absolute", right: 18, top: 18, zIndex: 2 };
