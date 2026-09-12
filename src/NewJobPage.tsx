import { useRef, useState } from "react";
import { builders, communities, teams } from "./data";
import type { Job, JobStatus } from "./types";

type Props = { onCreate: (job: Job) => void; onCancel: () => void };
const statuses: JobStatus[] = ["Scheduled", "Production", "Ready for Installation", "Installation", "Completed", "Warranty"];
const todayDate = () => new Date().toISOString().slice(0, 10);

const textBoxStyle: React.CSSProperties = {
  minHeight: 48,
  padding: "14px 16px",
  border: "1px solid #29292e",
  borderRadius: 12,
  background: "#0b0b0d",
  color: "#f5f5f5",
  fontSize: 16,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export default function NewJobPage({ onCreate, onCancel }: Props) {
  const [error, setError] = useState("");
  const jobIdRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const builderRef = useRef<HTMLSelectElement>(null);
  const communityRef = useRef<HTMLSelectElement>(null);
  const teamRef = useRef<HTMLSelectElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  const markEdited = () => setError("");

  // Intentionally use a normal button + direct DOM reads instead of a native
  // form submit. This avoids iPhone/Safari restoring a stale form state and
  // bypassing the values the user can currently see on screen.
  const createJob = () => {
    const normalizedId = (jobIdRef.current?.textContent ?? "").trim().toUpperCase();
    const normalizedAddress = (addressRef.current?.textContent ?? "").trim();
    const selectedBuilder = builderRef.current?.value?.trim() || builders[0] || "";
    const selectedCommunity = communityRef.current?.value?.trim() || communities[0] || "";
    const selectedTeam = teamRef.current?.value?.trim() || teams[0] || "";
    const selectedDate = dateRef.current?.value || todayDate();
    const selectedStatus = (statusRef.current?.value || "Scheduled") as JobStatus;

    if (!normalizedId && !normalizedAddress) {
      setError("Please enter the Job ID and Address, then tap Create Job.");
      jobIdRef.current?.focus();
      return;
    }
    if (!normalizedId) {
      setError("Please enter the Job ID.");
      jobIdRef.current?.focus();
      return;
    }
    if (!normalizedAddress) {
      setError("Please enter the Address.");
      addressRef.current?.focus();
      return;
    }

    setError("");
    onCreate({
      id: normalizedId,
      address: normalizedAddress,
      builder: selectedBuilder,
      community: selectedCommunity,
      team: selectedTeam,
      date: selectedDate,
      status: selectedStatus,
    });
  };

  return <div className="content">
    <section className="page-tools">
      <div><span className="gold-label">JOB MANAGEMENT</span><h2>New Job</h2><p className="muted">Create an operational job and start its production, installation and warranty workflow.</p></div>
    </section>
    <div className="panel" aria-label="New Job form">
      <div className="form-grid">
        <label className="field"><span>Job ID</span><div ref={jobIdRef} id="job-create-safe-id" role="textbox" aria-label="Job ID" contentEditable suppressContentEditableWarning onInput={markEdited} style={textBoxStyle} data-placeholder="JOB-1006" /></label>
        <label className="field"><span>Address</span><div ref={addressRef} id="job-create-safe-address" role="textbox" aria-label="Address" contentEditable suppressContentEditableWarning onInput={markEdited} style={textBoxStyle} data-placeholder="123 Main St" /></label>
        <label className="field"><span>Builder</span><select ref={builderRef} defaultValue={builders[0] ?? ""}>{builders.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Community</span><select ref={communityRef} defaultValue={communities[0] ?? ""}>{communities.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Team</span><select ref={teamRef} defaultValue={teams[0] ?? ""}>{teams.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Installation Date</span><input ref={dateRef} type="date" defaultValue={todayDate()} /></label>
        <label className="field"><span>Initial Status</span><select ref={statusRef} defaultValue="Scheduled">{statuses.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
      </div>
      {error && <p className="muted" style={{ marginTop: 12 }}>{error}</p>}
      <div className="button-group" style={{ marginTop: 16 }}>
        <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="primary" onClick={createJob}>Create Job</button>
      </div>
    </div>
  </div>;
}
