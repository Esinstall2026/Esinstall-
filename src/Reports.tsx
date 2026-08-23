import { useMemo, useState } from "react";
import { Job } from "./types";

type InstallationLike = { jobId: string; status: "Scheduled" | "In Progress" | "Completed"; team: string; date: string };
type WarrantyLike = { jobId: string; status: "Open" | "In Review" | "Resolved"; priority: "Low" | "Medium" | "High" };

export default function Reports({ jobs, installations, warranties }: { jobs: Job[]; installations: InstallationLike[]; warranties: WarrantyLike[] }) {
  const [period, setPeriod] = useState("All time");
  const completed = installations.filter(i => i.status === "Completed").length;
  const inProgress = installations.filter(i => i.status === "In Progress").length;
  const scheduled = installations.filter(i => i.status === "Scheduled").length;
  const resolved = warranties.filter(w => w.status === "Resolved").length;
  const openWarranty = warranties.filter(w => w.status !== "Resolved").length;
  const completionRate = installations.length ? Math.round((completed / installations.length) * 100) : 0;

  const teamStats = useMemo(() => {
    const map = new Map<string, { total: number; completed: number; inProgress: number }>();
    installations.forEach(i => {
      const current = map.get(i.team) ?? { total: 0, completed: 0, inProgress: 0 };
      current.total += 1;
      if (i.status === "Completed") current.completed += 1;
      if (i.status === "In Progress") current.inProgress += 1;
      map.set(i.team, current);
    });
    return [...map.entries()].map(([team, value]) => ({ team, ...value })).sort((a, b) => b.completed - a.completed);
  }, [installations]);

  return <div className="content">
    <section className="page-tools">
      <div><span className="gold-label">OPERATIONS INTELLIGENCE</span><h2>Reports</h2><p className="muted">Performance overview from Jobs, Installations and Warranty.</p></div>
      <select value={period} onChange={e => setPeriod(e.target.value)} className="report-period"><option>All time</option><option>This week</option><option>This month</option></select>
    </section>

    <section className="metric-grid">
      <Metric label="Total Jobs" value={jobs.length} detail="registered jobs" />
      <Metric label="Completed Installs" value={completed} detail={`${completionRate}% completion rate`} />
      <Metric label="In Progress" value={inProgress} detail={`${scheduled} scheduled`} />
      <Metric label="Open Warranty" value={openWarranty} detail={`${resolved} resolved`} />
    </section>

    <div className="two-column">
      <section className="panel"><div className="panel-head"><div><span className="gold-label">FIELD PERFORMANCE</span><h3>Team Performance</h3></div></div>
        {teamStats.length === 0 ? <p className="muted">No installation data yet.</p> : <div className="report-list">{teamStats.map(t => <div className="report-row" key={t.team}><div><strong>{t.team}</strong><small>{t.total} assigned · {t.inProgress} in progress</small></div><div className="report-number">{t.completed}<span> completed</span></div></div>)}</div>}
      </section>
      <section className="panel"><div className="panel-head"><div><span className="gold-label">QUALITY</span><h3>Warranty Health</h3></div></div>
        <div className="quality-card"><div className="quality-ring">{warranties.length ? Math.round((resolved / warranties.length) * 100) : 100}%</div><div><strong>Resolution rate</strong><p>{resolved} of {warranties.length} warranty cases resolved.</p><small>Open: {warranties.filter(w => w.status === "Open").length} · In Review: {warranties.filter(w => w.status === "In Review").length}</small></div></div>
      </section>
    </div>

    <section className="panel report-summary"><div className="panel-head"><div><span className="gold-label">EXECUTIVE SUMMARY</span><h3>Operational Snapshot</h3></div></div><div className="summary-grid"><Summary label="Jobs" value={`${jobs.length}`} /><Summary label="Installations" value={`${installations.length}`} /><Summary label="Completion" value={`${completionRate}%`} /><Summary label="Warranty cases" value={`${warranties.length}`} /></div></section>
  </div>;
}

function Metric({ label, value, detail }: { label: string; value: number; detail: string }) { return <div className="metric-card"><span>{label}</span><div className="metric-value">{value}</div><small>{detail}</small></div>; }
function Summary({ label, value }: { label: string; value: string }) { return <div className="summary-item"><span>{label}</span><strong>{value}</strong></div>; }
