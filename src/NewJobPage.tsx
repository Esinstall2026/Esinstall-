import { useRef, useState } from "react";
import { builders, communities, teams } from "./data";
import type { Job, JobStatus } from "./types";

type Props = { onCreate: (job: Job) => void; onCancel: () => void };
const statuses: JobStatus[] = ["Scheduled", "Production", "Ready for Installation", "Installation", "Completed", "Warranty"];
const todayDate = () => new Date().toISOString().slice(0, 10);

export default function NewJobPage({ onCreate, onCancel }: Props) {
  const [error, setError] = useState("");
  const jobIdRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const builderRef = useRef<HTMLSelectElement>(null);
  const communityRef = useRef<HTMLSelectElement>(null);
  const teamRef = useRef<HTMLSelectElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  const createJob = () => {
    // Read the actual visible controls through React refs. This avoids Safari
    // restoration/autofill and duplicate-DOM issues that can make form reads empty.
    const normalizedId = (jobIdRef.current?.value ?? "").trim().toUpperCase();
    const normalizedAddress = (addressRef.current?.value ?? "").trim();
    const selectedBuilder = (builderRef.current?.value ?? builders[0] ?? "").trim();
    const selectedCommunity = (communityRef.current?.value ?? communities[0] ?? "").trim();
    const selectedTeam = (teamRef.current?.value ?? teams[0] ?? "").trim();
    const selectedDate = (dateRef.current?.value ?? todayDate()).trim() || todayDate();
    const selectedStatus = ((statusRef.current?.value ?? "Scheduled").trim() || "Scheduled") as JobStatus;

    if (!normalizedId || !normalizedAddress) {
      setError("Please enter the Job ID and Address, then tap Create Job again.");
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
        <label className="field"><span>Job ID</span><input ref={jobIdRef} id="new-job-id" name="jobId" defaultValue="" placeholder="JOB-1006" autoFocus autoComplete="off" /></label>
        <label className="field"><span>Address</span><input ref={addressRef} id="new-job-address" name="address" defaultValue="" placeholder="123 Main St" autoComplete="street-address" /></label>
        <label className="field"><span>Builder</span><select ref={builderRef} id="new-job-builder" name="builder" defaultValue={builders[0] ?? ""}>{builders.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Community</span><select ref={communityRef} id="new-job-community" name="community" defaultValue={communities[0] ?? ""}>{communities.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Team</span><select ref={teamRef} id="new-job-team" name="team" defaultValue={teams[0] ?? ""}>{teams.map(v=><option key={v}>{v}</option>)}</select></label>
        <label className="field"><span>Installation Date</span><input ref={dateRef} id="new-job-date" name="date" type="date" defaultValue={todayDate()} /></label>
        <label className="field"><span>Initial Status</span><select ref={statusRef} id="new-job-status" name="status" defaultValue="Scheduled">{statuses.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
      </div>
      {error && <p className="muted" style={{marginTop:12}}>{error}</p>}
      <div className="button-group" style={{marginTop:16}}>
        <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="primary" onClick={createJob}>Create Job</button>
      </div>
    </div>
  </div>;
}
