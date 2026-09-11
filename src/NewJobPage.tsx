import { useState } from "react";
import { builders, communities, teams } from "./data";
import type { Job, JobStatus } from "./types";

type Props = { onCreate: (job: Job) => void; onCancel: () => void };
const statuses: JobStatus[] = ["Scheduled", "Production", "Ready for Installation", "Installation", "Completed", "Warranty"];
const todayDate = () => new Date().toISOString().slice(0, 10);

export default function NewJobPage({ onCreate, onCancel }: Props) {
  const [error, setError] = useState("");

  const createJob = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Keep the fields uncontrolled. Safari/iPhone can restore or autofill
    // native form values without updating React state; FormData reads the
    // actual values that the browser is displaying.
    const data = new FormData(event.currentTarget);
    const getValue = (name: string, fallback = "") => {
      const value = data.get(name);
      return typeof value === "string" && value.trim() ? value.trim() : fallback;
    };

    const normalizedId = getValue("jobId").toUpperCase();
    const normalizedAddress = getValue("address");
    const selectedBuilder = getValue("builder", builders[0] ?? "");
    const selectedCommunity = getValue("community", communities[0] ?? "");
    const selectedTeam = getValue("team", teams[0] ?? "");
    const selectedDate = getValue("date", todayDate());
    const selectedStatus = getValue("status", "Scheduled") as JobStatus;

    if (!normalizedId || !normalizedAddress) {
      setError("Job ID and address are required.");
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
      status: selectedStatus
    });
  };

  return <div className="content">
    <section className="page-tools">
      <div><span className="gold-label">JOB MANAGEMENT</span><h2>New Job</h2><p className="muted">Create an operational job and start its production, installation and warranty workflow.</p></div>
    </section>
    <form className="panel" aria-label="New Job form" onSubmit={createJob}>
      <div className="form-grid">
        <label className="field"><span>Job ID</span><input name="jobId" defaultValue="" placeholder="JOB-1006" autoFocus autoComplete="off" /></label>
        <label className="field"><span>Address</span><input name="address" defaultValue="" placeholder="123 Main St" autoComplete="street-address" /></label>
        <label className="field"><span>Builder</span><select name="builder" defaultValue={builders[0] ?? ""}>{builders.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Community</span><select name="community" defaultValue={communities[0] ?? ""}>{communities.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Team</span><select name="team" defaultValue={teams[0] ?? ""}>{teams.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Installation Date</span><input name="date" type="date" defaultValue={todayDate()} /></label>
        <label className="field"><span>Initial Status</span><select name="status" defaultValue="Scheduled">{statuses.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
      </div>
      {error && <p className="muted" style={{marginTop:12}}>{error}</p>}
      <div className="button-group" style={{marginTop:16}}>
        <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary">Create Job</button>
      </div>
    </form>
  </div>;
}
