import { useRef, useState } from "react";
import type { FormEvent } from "react";
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

  const markEdited = () => setError("");

  const createJob = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Safari can restore native form-control values visually without firing
    // React events. Job ID and Address intentionally use contenteditable
    // text boxes, which are not part of Safari's form restoration mechanism.
    const normalizedId = (jobIdRef.current?.innerText ?? "").trim().toUpperCase();
    const normalizedAddress = (addressRef.current?.innerText ?? "").trim();
    const form = event.currentTarget;
    const readSelect = (name: string, fallback: string) => {
      const element = form.elements.namedItem(name) as HTMLSelectElement | null;
      return element?.value?.trim() || fallback;
    };

    const selectedBuilder = readSelect("builder", builders[0] || "");
    const selectedCommunity = readSelect("community", communities[0] || "");
    const selectedTeam = readSelect("team", teams[0] || "");
    const selectedDate = (form.elements.namedItem("date") as HTMLInputElement | null)?.value || todayDate();
    const selectedStatus = (readSelect("status", "Scheduled") || "Scheduled") as JobStatus;

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
    <form className="panel" aria-label="New Job form" onSubmit={createJob} autoComplete="off">
      <div className="form-grid">
        <label className="field"><span>Job ID</span><div ref={jobIdRef} id="job-create-safe-id" role="textbox" aria-label="Job ID" contentEditable suppressContentEditableWarning onInput={markEdited} style={textBoxStyle} data-placeholder="JOB-1006" /></label>
        <label className="field"><span>Address</span><div ref={addressRef} id="job-create-safe-address" role="textbox" aria-label="Address" contentEditable suppressContentEditableWarning onInput={markEdited} style={textBoxStyle} data-placeholder="123 Main St" /></label>
        <label className="field"><span>Builder</span><select name="builder" defaultValue={builders[0] ?? ""}>{builders.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Community</span><select name="community" defaultValue={communities[0] ?? ""}>{communities.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Team</span><select name="team" defaultValue={teams[0] ?? ""}>{teams.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label className="field"><span>Installation Date</span><input name="date" type="date" defaultValue={todayDate()} /></label>
        <label className="field"><span>Initial Status</span><select name="status" defaultValue="Scheduled">{statuses.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
      </div>
      {error && <p className="muted" style={{ marginTop: 12 }}>{error}</p>}
      <div className="button-group" style={{ marginTop: 16 }}>
        <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary">Create Job</button>
      </div>
    </form>
  </div>;
}
