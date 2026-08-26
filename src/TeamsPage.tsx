import { teams, type Team } from './teams';
import { jobs as seedJobs } from './data';

export default function TeamsPage() {
  return (
    <div className="content">
      <section className="page-tools">
        <div>
          <span className="gold-label">FIELD OPERATIONS</span>
          <h2>Teams</h2>
          <p className="muted">Manage crews, leaders, workload and field status.</p>
        </div>
      </section>
      <div className="metric-grid">
        <div className="metric-card"><span>Total Teams</span><div className="metric-value">{teams.length}</div><small>active roster</small></div>
        <div className="metric-card"><span>In Field</span><div className="metric-value">{teams.filter(t => t.status === 'In Field').length}</div><small>working today</small></div>
        <div className="metric-card"><span>Available</span><div className="metric-value">{teams.filter(t => t.status === 'Available').length}</div><small>ready for assignment</small></div>
        <div className="metric-card"><span>Jobs Assigned</span><div className="metric-value">{seedJobs.filter(j => j.team).length}</div><small>from current jobs</small></div>
      </div>
      <section className="panel table-panel">
        <div className="table-head"><span>TEAM</span><span>LEADER</span><span>MEMBERS</span><span>STATUS</span><span>JOBS</span><span>INSTALLATIONS</span></div>
        {teams.map((team: Team) => {
          const jobs = seedJobs.filter(j => j.team === team.name).length;
          return <div className="table-row" key={team.id}>
            <span><strong>{team.name}</strong><small>{team.id}</small></span>
            <span>{team.leader}</span>
            <span>{team.members.join(' · ')}</span>
            <span>{team.status}</span>
            <span>{jobs}</span>
            <span>{team.activeInstallations.length}</span>
          </div>;
        })}
      </section>
    </div>
  );
}
