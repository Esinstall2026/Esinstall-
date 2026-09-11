import { useState } from "react";
import { builders, communities, teams } from "./data";
import type { Job, JobStatus } from "./types";

type Props = { onCreate: (job: Job) => void; onCancel: () => void };
const statuses: JobStatus[] = ["Scheduled", "Production", "Ready for Installation", "Installation", "Completed", "Warranty"];
const todayDate = () => new Date().toISOString().slice(0, 10);

export default function NewJobPage({ onCreate, onCancel }: Props) {
  const [jobId, setJobId] = useState("");
  const [address, setAddress] = useState("");
  const [builder, setBuilder] = useState(builders[0] ?? "");
  const [community, setCommunity] = useState(communities[0] ?? "");
  const [team, setTeam] = useState(teams[0] ?? "");
  const [date, setDate] = useState(todayDate());
  const [status, setStatus] = useState<JobStatus>("Scheduled");
  const [error, setError] = useState("");

  const createJob = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Use the browser's native FormData as the source of truth. This avoids
    // React controlled-state timing/autofill issues on iPhone/Safari.
    const form = event.currentTarget;
    const data = new FormData(form);
    const getValue = (name: string, fallback: string) => {
      const value = data.get(name);
      return typeof value === "string" && value.trim() ? value.trim() : fallback;
    };

    const normalizedId = getValue("jobId", jobId).toUpperCase();
    const normalizedAddress = getValue("address", address);
    const selectedBuilder = getValue("builder", builder);
    const selectedCommunity = getValue("community", community);
    const selectedTeam = getValue("team", team);
    const selectedDate = getValue("date", date || todayDate());
    const selectedStatus = getValue("status", status) as JobStatus;

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
        <label className="field"><span>Job ID</span><input name="jobId" value={jobId} onChange={e=>setJobId(e.target.value)} placeholder="JOB-1006" autoFocus autoComplete="off" /></label>
        <label className="field"><span>Address</span><input name="address" value={address} onChange={e=>setAddress(e.target.value)} placeholder="123 Main St" autoComplete="street-address" /></label>
        <label className="field"><span>Builder</span><select name="builder" value={builder} onChange={e=>setBuilder(e.target.value)}>{builders.map(v=><option key={v}>{v}</option>)}</select></label>
        <label className="field"><span>Community</span><select name="community" value={community} onChange={e=>setCommunity(e.target.value)}>{communities.map(v=><option key={v}>{v}</option>)}</select></label>
        <label className="field"><span>Team</span><select name="team" value={team} onChange={e=>setTeam(e.target.value)}>{teams.map(v=><option key={v}>{v}</option>)}</select></label>
        <label className="field"><span>Installation Date</span><input name="date" type="date" value={date} onChange={e=>setDate(e.target.value)} /></label>
        <label className="field"><span>Initial Status</span><select name="status" value={status} onChange={e=>setStatus(e.target.value as JobStatus)}>{statuses.map(v=><option key={v}>{v}</option>)}</select></label>
      </div>
      {error && <p className="muted" style={{marginTop:12}}>{error}</p>}
      <div className="button-group" style={{marginTop:16}}>
        <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary">Create Job</button>
      </div>
    </form>
  </div>;
}
