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

    // Use the browser's native form values. This avoids iOS Safari restoring
    // visible values without updating React state.
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();

    const normalizedId = value("job-create-v3-id").toUpperCase();
    const normalizedAddress = value("job-create-v3-address");
    const selectedBuilder = value("job-create-v3-builder") || builders[0] || "";
    const selectedCommunity = value("job-create-v3-community") || communities[0] || "";
    const selectedTeam = value("job-create-v3-team") || teams[0] || "";
    const selectedDate = value("job-create-v3-date") || todayDate();
    const selectedStatus = (value("job-create-v3-status") || "Scheduled") as JobStatus;

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
    <form className="panel" aria-label="New Job form" onSubmit={createJob} autoComplete="off">
      <div className="form-grid">
        <label className="field"><span>Job ID</span><input id="job-create-v3-id" name="job-create-v3-id" defaultValue="" placeholder="JOB-1006" autoComplete="off" /></label>
        <label className="field"><span>Address</span><input id="job-create-v3-address" name="job-create-v3-address" defaultValue="" placeholder="123 Main St" autoComplete="off" /></label>
        <label className="field"><span>Builder</span><select id="job-create-v3-builder" name="job-create-v3-builder" defaultValue={builders[0] ?? ""}>{builders.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Community</span><select id="job-create-v3-community" name="job-create-v3-community" defaultValue={communities[0] ?? ""}>{communities.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Team</span><select id="job-create-v3-team" name="job-create-v3-team" defaultValue={teams[0] ?? ""}>{teams.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Installation Date</span><input id="job-create-v3-date" name="job-create-v3-date" type="date" defaultValue={todayDate()} /></label>
        <label className="field"><span>Initial Status</span><select id="job-create-v3-status" name="job-create-v3-status" defaultValue="Scheduled">{statuses.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
      </div>
      {error && <p className="muted" style={{ marginTop: 12 }}>{error}</p>}
      <div className="button-group" style={{ marginTop: 16 }}>
        <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary">Create Job</button>
      </div>
    </form>
  </div>;
}
