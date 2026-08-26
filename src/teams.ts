export type TeamStatus = 'Available' | 'In Field' | 'Completed' | 'Off Duty';

export interface Team {
  id: string;
  name: string;
  leader: string;
  members: string[];
  phone?: string;
  status: TeamStatus;
  activeJobs: string[];
  activeInstallations: string[];
}

/** V7 Teams domain seed/model. Keep IDs stable so Jobs and Installations can reference teams. */
export const teams: Team[] = [
  { id: 'TEAM-001', name: 'Team Alpha', leader: 'John Smith', members: ['John Smith', 'Mike Johnson'], status: 'In Field', activeJobs: [], activeInstallations: [] },
  { id: 'TEAM-002', name: 'Team Bravo', leader: 'Sarah Wilson', members: ['Sarah Wilson', 'Chris Davis'], status: 'Available', activeJobs: [], activeInstallations: [] },
  { id: 'TEAM-003', name: 'Team Charlie', leader: 'David Brown', members: ['David Brown', 'Alex Miller'], status: 'Completed', activeJobs: [], activeInstallations: [] },
];
