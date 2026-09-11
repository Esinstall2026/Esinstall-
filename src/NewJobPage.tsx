import { useState } from "react";
import { builders, communities, teams } from "./data";
import type { Job, JobStatus } from "./types";

type Props = { onCreate: (job: Job) => void; onCancel: () => void };
const statuses: JobStatus[] = ["Scheduled", "Production", "Ready for Installation", "Installation", "Completed", "Warranty"];
const todayDate = () => new Date().toISOString().slice(0, 10);

export default function NewJobPage({ onCreate, onCancel }: Props) {
  const [error, setError] = useState("");
  const [jobId, setJobId] = useState("");
  const [address, setAddress] = useState("");
  const [builder, setBuilder] = useState(builders[0] ?? "");
  const [community, setCommunity] = useState(communities[0] ?? "");
  const [team, setTeam] = useState(teams[0] ?? "");
  const [date, setDate] = useState(todayDate());
  const [status, setStatus] = useState<JobStatus>("Scheduled");

  const createJob = () => {
    const normalizedId = jobId.trim().toUpperCase();
    const normalizedAddress = address.trim();

    if (!normalizedId || !normalizedAddress) {
      setError("Please enter the Job ID and Address, then tap Create Job again.");
      return;
    }

    setError("");
    onCreate({
      id: normalizedId,
      address: normalizedAddress,
      builder,
      community,
      team,
      date: date || todayDate(),
      status,
    });
  };

  return <div className="content">
    <section className="page-tools">
      <div><span className="gold-label">JOB MANAGEMENT</span><h2>New Job</h2><p className="muted">Create an operational job and start its production, installation and warranty workflow.</p></div>
    </section>
    <div className="panel" aria-label="New Job form" key="new-job-form-v2">
      <div className="form-grid">
        <label className="field"><span>Job ID</span><input id="job-create-v2-id" name="job-create-v2-id" value={jobId} onChange={e => setJobId(e.target.value)} placeholder="JOB-1006" autoFocus autoComplete="new-password" /></label>
        <label className="field"><span>Address</span><input id="job-create-v2-address" name="job-create-v2-address" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St" autoComplete="new-password" /></label>
        <label className="field"><span>Builder</span><select id="job-create-v2-builder" name="job-create-v2-builder" value={builder} onChange={e => setBuilder(e.target.value)}>{builders.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Community</span><select id="job-create-v2-community" name="job-create-v2-community" value={community} onChange={e => setCommunity(e.target.value)}>{communities.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Team</span><select id="job-create-v2-team" name="job-create-v2-team" value={team} onChange={e => setTeam(e.target.value)}>{teams.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Installation Date</span><input id="job-create-v2-date" name="job-create-v2-date" type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
        <label className="field"><span>Initial Status</span><select id="job-create-v2-status" name="job-create-v2-status" value={status} onChange={e => setStatus(e.target.value as JobStatus)}>{statuses.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
      </div>
      {error && <p className="muted" style={{ marginTop: 12 }}>{error}</p>}
      <div className="button-group" style={{ marginTop: 16 }}>
        <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="primary" onClick={createJob}>Create Job</button>
      </div>
    </div>
  </div>;
}
