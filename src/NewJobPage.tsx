import { FormEvent, useState } from "react";
import { builders, communities, teams } from "./data";
import type { Job, JobStatus } from "./types";

type Props = { onCreate: (job: Job) => void; onCancel: () => void };
const statuses: JobStatus[] = ["Scheduled", "Production", "Ready for Installation", "Installation", "Completed", "Warranty"];

export default function NewJobPage({ onCreate, onCancel }: Props) {
  const [id, setId] = useState("");
  const [address, setAddress] = useState("");
  const [builder, setBuilder] = useState(builders[0] ?? "");
  const [community, setCommunity] = useState(communities[0] ?? "");
  const [team, setTeam] = useState(teams[0] ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<JobStatus>("Scheduled");
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const normalizedId = id.trim().toUpperCase();
    if (!normalizedId || !address.trim() || !date) {
      setError("Job ID, address and date are required.");
      return;
    }
    onCreate({ id: normalizedId, address: address.trim(), builder, community, team, date, status });
  };

  return <div className="content">
    <section className="page-tools">
      <div><span className="gold-label">JOB MANAGEMENT</span><h2>New Job</h2><p className="muted">Create an operational job and start its production, installation and warranty workflow.</p></div>
    </section>
    <form className="panel" onSubmit={submit}>
      <div className="form-grid">
        <label className="field"><span>Job ID</span><input value={id} onChange={e=>setId(e.target.value)} placeholder="JOB-1006" autoFocus /></label>
        <label className="field"><span>Address</span><input value={address} onChange={e=>setAddress(e.target.value)} placeholder="123 Main St" /></label>
        <label className="field"><span>Builder</span><select value={builder} onChange={e=>setBuilder(e.target.value)}>{builders.map(v=><option key={v}>{v}</option>)}</select></label>
        <label className="field"><span>Community</span><select value={community} onChange={e=>setCommunity(e.target.value)}>{communities.map(v=><option key={v}>{v}</option>)}</select></label>
        <label className="field"><span>Team</span><select value={team} onChange={e=>setTeam(e.target.value)}>{teams.map(v=><option key={v}>{v}</option>)}</select></label>
        <label className="field"><span>Installation Date</span><input type="date" value={date} onChange={e=>setDate(e.target.value)} /></label>
        <label className="field"><span>Initial Status</span><select value={status} onChange={e=>setStatus(e.target.value as JobStatus)}>{statuses.map(v=><option key={v}>{v}</option>)}</select></label>
      </div>
      {error && <p className="muted" style={{marginTop:12}}>{error}</p>}
      <div className="button-group" style={{marginTop:16}}><button type="button" className="ghost" onClick={onCancel}>Cancel</button><button type="submit" className="primary">Create Job</button></div>
    </form>
  </div>;
}
