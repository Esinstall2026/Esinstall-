export type Page =
  | "Dashboard"
  | "Jobs"
  | "Job Folder"
  | "Installations"
  | "Warranty"
  | "Reports"
  | "Teams"
  | "Builders"
  | "Communities"
  | "Settings";

export type JobStatus =
  | "Scheduled"
  | "Production"
  | "Ready for Installation"
  | "Installation"
  | "Completed"
  | "Warranty";

export interface Job {
  id: string;
  address: string;
  builder: string;
  community: string;
  team: string;
  date: string;
  status: JobStatus;
}