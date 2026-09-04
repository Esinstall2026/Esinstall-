import { ProductionRecord, ProductionStatus } from "./types";

export const productionStatuses: ProductionStatus[] = ["Pending", "Cutting", "Polishing", "Separated", "Ready"];

export const productionSeed: ProductionRecord[] = [
  { jobId: "JOB-1001", material: "Granite", slabCount: 2, squareFeet: 68, sinkType: "Undermount", caulkTubes: 2, clips: 18, status: "Polishing", updatedAt: new Date().toISOString(), notes: "Final polish before separation." },
  { jobId: "JOB-1002", material: "Porcelain", slabCount: 3, squareFeet: 91, sinkType: "Undermount", caulkTubes: 3, clips: 24, status: "Cutting", updatedAt: new Date().toISOString(), notes: "Cut list released to factory." },
  { jobId: "JOB-1003", material: "Marble", slabCount: 2, squareFeet: 62, sinkType: "Farmhouse", caulkTubes: 2, clips: 16, status: "Pending", updatedAt: new Date().toISOString(), notes: "Awaiting production start." },
  { jobId: "JOB-1004", material: "Granite", slabCount: 2, squareFeet: 74, sinkType: "Topmount", caulkTubes: 2, clips: 20, status: "Ready", updatedAt: new Date().toISOString(), notes: "Separated and ready for installation." },
  { jobId: "JOB-1005", material: "Porcelain", slabCount: 2, squareFeet: 76, sinkType: "Undermount", caulkTubes: 2, clips: 20, status: "Pending", updatedAt: new Date().toISOString(), notes: "V10 acceptance test job." }
];

const KEY = "es-install-production-v1";
export function loadProduction(): ProductionRecord[] {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : productionSeed; } catch { return productionSeed; }
}
export function saveProduction(value: ProductionRecord[]) {
  try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* storage unavailable */ }
}
