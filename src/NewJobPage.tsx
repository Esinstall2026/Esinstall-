import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { builders, communities, teams } from "./data";
import type { Job, JobStatus } from "./types";

type Props = { onCreate: (job: Job) => void; onCancel: () => void };
const statuses: JobStatus[] = ["Scheduled", "Production", "Ready for Installation", "Installation", "Completed", "Warranty"];
const todayDate = () => new Date().toISOString().slice(0, 10);

export default function NewJobPage({ onCreate, onCancel }: Props) {
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const userEditedRef = useRef(false);

  useEffect(() => {
    const clearSafariRestore = () => {
      if (userEditedRef.current) return;
      formRef.current?.reset();
    };

    // iOS Safari may restore old form values after React has mounted.
    // Reset a few times during the restoration window, but never erase
    // anything after the user has started editing the form.
    clearSafariRestore();
    const timers = [0, 100, 500, 1500].map(delay => window.setTimeout(clearSafariRestore, delay));
    window.addEventListener("pageshow", clearSafariRestore);
    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener("pageshow", clearSafariRestore);
    };
  }, []);

  const markEdited = () => {
    userEditedRef.current = true;
    setError("");
  };

  const createJob = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();

    const normalizedId = value("job-create-v4-id").toUpperCase();
    const normalizedAddress = value("job-create-v4-address");
    const selectedBuilder = value("job-create-v4-builder") || builders[0] || "";
    const selectedCommunity = value("job-create-v4-community") || communities[0] || "";
    const selectedTeam = value("job-create-v4-team") || teams[0] || "";
    const selectedDate = value("job-create-v4-date") || todayDate();
    const selectedStatus = (value("job-create-v4-status") || "Scheduled") as JobStatus;

    if (!normalizedId || !normalizedAddress) {
      setError("Please enter the Job ID and Address, then tap Create Job.");
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
    <form ref={formRef} className="panel" aria-label="New Job form" onSubmit={createJob} autoComplete="off">
      <div className="form-grid">
        <label className="field"><span>Job ID</span><input id="job-create-v4-id" name="job-create-v4-id" defaultValue="" placeholder="JOB-1006" autoComplete="off" onInput={markEdited} /></label>
        <label className="field"><span>Address</span><input id="job-create-v4-address" name="job-create-v4-address" defaultValue="" placeholder="123 Main St" autoComplete="off" onInput={markEdited} /></label>
        <label className="field"><span>Builder</span><select id="job-create-v4-builder" name="job-create-v4-builder" defaultValue={builders[0] ?? ""} onChange={markEdited}>{builders.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Community</span><select id="job-create-v4-community" name="job-create-v4-community" defaultValue={communities[0] ?? ""} onChange={markEdited}>{communities.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Team</span><select id="job-create-v4-team" name="job-create-v4-team" defaultValue={teams[0] ?? ""} onChange={markEdited}>{teams.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Installation Date</span><input id="job-create-v4-date" name="job-create-v4-date" type="date" defaultValue={todayDate()} onChange={markEdited} /></label>
        <label className="field"><span>Initial Status</span><select id="job-create-v4-status" name="job-create-v4-status" defaultValue="Scheduled" onChange={markEdited}>{statuses.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
      </div>
      {error && <p className="muted" style={{ marginTop: 12 }}>{error}</p>}
      <div className="button-group" style={{ marginTop: 16 }}>
        <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary">Create Job</button>
      </div>
    </form>
  </div>;
}
