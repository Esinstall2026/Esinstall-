import { useMemo } from "react";

type Job = { id:string; address:string; builder:string; community:string; team:string; status:string };
type Installation = { jobId:string; team:string; date:string; time:string; status:"Scheduled"|"In Progress"|"Completed"; notes:string };
type Warranty = { jobId:string; openedAt:string; issue:string; status:"Open"|"In Review"|"Resolved"; priority:"Low"|"Medium"|"High"; notes:string };

const jobsKey="es-install-jobs-v2", installKey="es-install-installations-v3", warrantyKey="es-install-warranty-v4";
function read<T>(key:string,fallback:T):T{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}}

export default function ReportsPage(){
  const jobs=read<Job[]>(jobsKey,[]), installations=read<Installation[]>(installKey,[]), warranties=read<Warranty[]>(warrantyKey,[]);
  const completed=installations.filter(x=>x.status==="Completed").length;
  const inProgress=installations.filter(x=>x.status==="In Progress").length;
  const scheduled=installations.filter(x=>x.status==="Scheduled").length;
  const openWarranty=warranties.filter(x=>x.status!=="Resolved").length;
  const completionRate=installations.length?Math.round(completed/installations.length*100):0;
  const teamRows=useMemo(()=>Array.from(new Set(installations.map(x=>x.team))).map(team=>{const all=installations.filter(x=>x.team===team);const done=all.filter(x=>x.status==="Completed").length;return {team,total:all.length,done,rate:all.length?Math.round(done/all.length*100):0}}).sort((a,b)=>b.rate-a.rate),[installations]);
  const statusRows=[{label:"Scheduled",value:scheduled},{label:"In Progress",value:inProgress},{label:"Completed",value:completed}];
  const max=Math.max(1,...statusRows.map(x=>x.value));
  return <div className="content">
    <section className="page-tools"><div><span className="gold-label">OPERATIONS INTELLIGENCE</span><h2>Reports</h2><p className="muted">Live operational indicators from Jobs, Installations and Warranty.</p></div><span className="status status-completed">LIVE PILOT DATA</span></section>
    <section className="metric-grid">
      <div className="metric-card"><span>Total Jobs</span><div className="metric-value">{jobs.length}</div><small>operational records</small></div>
      <div className="metric-card"><span>Completion Rate</span><div className="metric-value">{completionRate}%</div><small>{completed} completed installs</small></div>
      <div className="metric-card"><span>Field In Progress</span><div className="metric-value">{inProgress}</div><small>{scheduled} scheduled next</small></div>
      <div className="metric-card"><span>Open Warranty</span><div className="metric-value">{openWarranty}</div><small>{warranties.length} total cases</small></div>
    </section>
    <div className="two-column">
      <section className="panel"><div className="panel-head"><div><span className="gold-label">INSTALLATION FLOW</span><h3>Production to Completion</h3></div></div><div className="report-bars">{statusRows.map(x=><div className="report-bar-row" key={x.label}><div className="report-bar-label"><span>{x.label}</span><strong>{x.value}</strong></div><div className="report-track"><div className="report-fill" style={{width:`${Math.round(x.value/max*100)}%`}}/></div></div>)}</div></section>
      <section className="panel"><div className="panel-head"><div><span className="gold-label">WARRANTY</span><h3>Case Status</h3></div></div><div className="report-list">{["Open","In Review","Resolved"].map(status=><div className="report-list-row" key={status}><span>{status}</span><strong>{warranties.filter(x=>x.status===status).length}</strong></div>)}</div><div className="report-note">Warranty rate: {jobs.length?Math.round(warranties.length/jobs.length*100):0}% of current Jobs have a case.</div></section>
    </div>
    <section className="panel" style={{marginTop:14}}><div className="panel-head"><div><span className="gold-label">TEAM PERFORMANCE</span><h3>Installation Teams</h3></div></div>{teamRows.length?<div className="report-table"><div className="report-table-head"><span>TEAM</span><span>JOBS</span><span>COMPLETED</span><span>RATE</span></div>{teamRows.map(row=><div className="report-table-row" key={row.team}><strong>{row.team}</strong><span>{row.total}</span><span>{row.done}</span><span className="status status-completed">{row.rate}%</span></div>)}</div>:<div className="upload-zone"><strong>No team activity yet</strong><span>Complete an Installation to populate performance data.</span></div>}</section>
    <section className="panel" style={{marginTop:14}}><div className="panel-head"><div><span className="gold-label">EXECUTIVE SUMMARY</span><h3>Operational Snapshot</h3></div></div><div className="summary-grid"><div><span>Jobs</span><strong>{jobs.length}</strong></div><div><span>Installations</span><strong>{installations.length}</strong></div><div><span>Completed</span><strong>{completed}</strong></div><div><span>Warranty Cases</span><strong>{warranties.length}</strong></div></div></section>
  </div>;
}
