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
    const readInput = (id: string, fallback = "") => {
      const element = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
      const value = element?.value ?? "";
      return value.trim() || fallback;
    };

    const normalizedId = readInput("new-job-id").toUpperCase();
    const normalizedAddress = readInput("new-job-address");
    const selectedBuilder = readInput("new-job-builder", builders[0] ?? "");
    const selectedCommunity = readInput("new-job-community", communities[0] ?? "");
    const selectedTeam = readInput("new-job-team", teams[0] ?? "");
    const selectedDate = readInput("new-job-date", todayDate());
    const selectedStatus = readInput("new-job-status", "Scheduled") as JobStatus;

    if (!normalizedId || !normalizedAddress) {
      setError("Job ID and address are required.");
      return;
    }

    setError("");
    onCreate({ id: normalizedId, address: normalizedAddress, builder: selectedBuilder, community: selectedCommunity, team: selectedTeam, date: selectedDate, status: selectedStatus });
  };

  return <div className="content">
    <section className="page-tools">
      <div><span className="gold-label">JOB MANAGEMENT</span><h2>New Job</h2><p className="muted">Create an operational job and start its production, installation and warranty workflow.</p></div>
    </section>
    <form className="panel" aria-label="New Job form" onSubmit={createJob}>
      <div className="form-grid">
        <label className="field"><span>Job ID</span><input id="new-job-id" name="jobId" defaultValue="" placeholder="JOB-1006" autoFocus autoComplete="off" /></label>
        <label className="field"><span>Address</span><input id="new-job-address" name="address" defaultValue="" placeholder="123 Main St" autoComplete="street-address" /></label>
        <label className="field"><span>Builder</span><select id="new-job-builder" name="builder" defaultValue={builders[0] ?? ""}>{builders.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Community</span><select id="new-job-community" name="community" defaultValue={communities[0] ?? ""}>{communities.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Team</span><select id="new-job-team" name="team" defaultValue={teams[0] ?? ""}>{teams.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Installation Date</span><input id="new-job-date" name="date" type="date" defaultValue={todayDate()} /></label>
        <label className="field"><span>Initial Status</span><select id="new-job-status" name="status" defaultValue="Scheduled">{statuses.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
      </div>
      {error && <p className="muted" style={{marginTop:12}}>{error}</p>}
      <div className="button-group" style={{marginTop:16}}>
        <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary">Create Job</button>
      </div>
    </form>
  </div>;
}
