import { useMemo, useState } from "react";
import { teams as seedTeams } from "./data";

type TeamStatus = "Available" | "In Field" | "Completed" | "Off Duty";
type TeamRow = { id: string; name: string; leader: string; members: string[]; status: TeamStatus; jobs: number; installations: number };

const initialTeams: TeamRow[] = seedTeams.map((name, index) => ({
  id: `TEAM-${String(index + 1).padStart(3, "0")}`,
  name,
  leader: ["John Smith", "Sarah Wilson", "David Brown", "Michael Taylor"][index % 4],
  members: index % 2 ? ["Sarah Wilson", "Chris Davis"] : ["John Smith", "Mike Johnson"],
  status: (["In Field", "Available", "Completed", "Off Duty"] as TeamStatus[])[index % 4],
  jobs: index % 3,
  installations: (index + 1) % 3,
}));

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamRow[]>(initialTeams);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => teams.filter(t => `${t.id} ${t.name} ${t.leader} ${t.status}`.toLowerCase().includes(search.toLowerCase())), [teams, search]);
  const updateStatus = (id: string, status: TeamStatus) => setTeams(current => current.map(t => t.id === id ? { ...t, status } : t));

  return <div className="content">
    <section className="page-tools"><div><span className="gold-label">FIELD OPERATIONS</span><h2>Teams</h2><p className="muted">Manage crews, assignments and field availability.</p></div></section>
    <div className="metric-grid">
      <div className="metric-card"><span>Total Teams</span><div className="metric-value">{teams.length}</div><small>registered crews</small></div>
      <div className="metric-card"><span>In Field</span><div className="metric-value">{teams.filter(t => t.status === "In Field").length}</div><small>working today</small></div>
      <div className="metric-card"><span>Available</span><div className="metric-value">{teams.filter(t => t.status === "Available").length}</div><small>ready for assignment</small></div>
      <div className="metric-card"><span>Active Work</span><div className="metric-value">{teams.reduce((n, t) => n + t.jobs + t.installations, 0)}</div><small>jobs + installations</small></div>
    </div>
    <div className="search-box"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search team, leader or status..." /></div>
    <section className="panel table-panel">
      <div className="table-head"><span>TEAM</span><span>LEADER / MEMBERS</span><span>JOBS</span><span>INSTALLATIONS</span><span>STATUS</span><span /></div>
      {filtered.map(team => <div className="table-row" key={team.id}>
        <span><strong>{team.name}</strong><small>{team.id}</small></span>
        <span><strong>{team.leader}</strong><small>{team.members.join(" · ")}</small></span>
        <span>{team.jobs}</span><span>{team.installations}</span>
        <select value={team.status} onChange={e => updateStatus(team.id, e.target.value as TeamStatus)} style={{ minWidth: 130 }}><option>Available</option><option>In Field</option><option>Completed</option><option>Off Duty</option></select>
        <span>→</span>
      </div>)}
    </section>
  </div>;
}
