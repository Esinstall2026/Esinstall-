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
    // Safari can restore an input's visible DOM value without firing React's
    // change event. Read the live controls first, then fall back to React state.
    const readDom = (id: string) => {
      const element = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
      return element?.value?.trim() ?? "";
    };

    const normalizedId = (readDom("new-job-id") || jobId).trim().toUpperCase();
    const normalizedAddress = (readDom("new-job-address") || address).trim();
    const selectedBuilder = readDom("new-job-builder") || builder;
    const selectedCommunity = readDom("new-job-community") || community;
    const selectedTeam = readDom("new-job-team") || team;
    const selectedDate = readDom("new-job-date") || date || todayDate();
    const selectedStatus = (readDom("new-job-status") || status || "Scheduled") as JobStatus;

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
        <label className="field"><span>Job ID</span><input id="new-job-id" name="jobId" value={jobId} onChange={e => setJobId(e.target.value)} placeholder="JOB-1006" autoFocus autoComplete="off" /></label>
        <label className="field"><span>Address</span><input id="new-job-address" name="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St" autoComplete="off" /></label>
        <label className="field"><span>Builder</span><select id="new-job-builder" name="builder" value={builder} onChange={e => setBuilder(e.target.value)}>{builders.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Community</span><select id="new-job-community" name="community" value={community} onChange={e => setCommunity(e.target.value)}>{communities.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Team</span><select id="new-job-team" name="team" value={team} onChange={e => setTeam(e.target.value)}>{teams.map(v => <option key={v}>{v}</option>)}</select></label>
        <label className="field"><span>Installation Date</span><input id="new-job-date" name="date" type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
        <label className="field"><span>Initial Status</span><select id="new-job-status" name="status" value={status} onChange={e => setStatus(e.target.value as JobStatus)}>{statuses.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
      </div>
      {error && <p className="muted" style={{ marginTop: 12 }}>{error}</p>}
      <div className="button-group" style={{ marginTop: 16 }}>
        <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="primary" onClick={createJob}>Create Job</button>
      </div>
    </div>
  </div>;
}
