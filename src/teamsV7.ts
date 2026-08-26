import { teams, Team, TeamStatus } from './teams';

export function getTeams(): Team[] {
  return teams;
}

export function getTeamById(id: string): Team | undefined {
  return teams.find((team) => team.id === id);
}

export function getTeamsByStatus(status: TeamStatus): Team[] {
  return teams.filter((team) => team.status === status);
}

export function getTeamWorkload(id: string) {
  const team = getTeamById(id);
  if (!team) return undefined;
  return {
    teamId: team.id,
    jobs: team.activeJobs.length,
    installations: team.activeInstallations.length,
    total: team.activeJobs.length + team.activeInstallations.length,
  };
}
