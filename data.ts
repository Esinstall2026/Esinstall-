import { Job } from "./types";

export const jobs: Job[] = [
  {
    id: "JOB-1001",
    address: "1248 Lakeview Dr",
    builder: "Sunrise Builders",
    community: "Lakeview Estates",
    team: "Team Alpha",
    date: "2026-08-11",
    status: "Installation"
  },
  {
    id: "JOB-1002",
    address: "728 Palm Ridge Ave",
    builder: "Prime Homes",
    community: "Palm Ridge",
    team: "Team Bravo",
    date: "2026-08-11",
    status: "Production"
  },
  {
    id: "JOB-1003",
    address: "410 Oak Grove Ct",
    builder: "Sunrise Builders",
    community: "Oak Grove",
    team: "Team Charlie",
    date: "2026-08-12",
    status: "Scheduled"
  },
  {
    id: "JOB-1004",
    address: "93 Cypress Way",
    builder: "Elite Residential",
    community: "Cypress Point",
    team: "Team Alpha",
    date: "2026-08-12",
    status: "Warranty"
  }
];

export const builders = ["Sunrise Builders", "Prime Homes", "Elite Residential"];
export const communities = ["Lakeview Estates", "Palm Ridge", "Oak Grove", "Cypress Point"];
export const teams = ["Team Alpha", "Team Bravo", "Team Charlie"];
