export type Page =
  | "Dashboard"
  | "Jobs"
  | "Job Folder"
  | "Production"
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

export type ProductionStatus = "Pending" | "Cutting" | "Polishing" | "Separated" | "Ready";

export interface ProductionRecord {
  jobId: string;
  material: "Granite" | "Marble" | "Porcelain";
  slabCount: number;
  squareFeet: number;
  sinkType: "Undermount" | "Farmhouse" | "Topmount" | "None";
  caulkTubes: number;
  clips: number;
  status: ProductionStatus;
  updatedAt: string;
  notes: string;
}
