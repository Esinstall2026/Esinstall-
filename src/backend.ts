import { dataService } from "./dataService";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import type { Job, ProductionRecord } from "./types";

type Installation = { jobId: string; team: string; date: string; time: string; status: "Scheduled" | "In Progress" | "Completed"; notes: string };
type Warranty = { jobId: string; openedAt: string; issue: string; status: "Open" | "In Review" | "Resolved"; priority: "Low" | "Medium" | "High"; notes: string };

export type BackendProvider = {
  getJobs(): Promise<Job[]>; saveJobs(jobs: Job[]): Promise<void>;
  getInstallations(): Promise<Installation[]>; saveInstallations(items: Installation[]): Promise<void>;
  getWarranties(): Promise<Warranty[]>; saveWarranties(items: Warranty[]): Promise<void>;
  getProduction(): Promise<ProductionRecord[]>; saveProduction(items: ProductionRecord[]): Promise<void>;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "");

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) throw new Error("VITE_API_BASE_URL is not configured");
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!response.ok) throw new Error(`API ${response.status}: ${response.statusText}`);
  return response.json() as Promise<T>;
}

function mergeById<T extends { id: string }>(current: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of current) map.set(item.id.toUpperCase(), item);
  for (const item of incoming) map.set(item.id.toUpperCase(), item);
  return Array.from(map.values());
}
function mergeByJobId<T extends { jobId: string }>(current: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of current) map.set(item.jobId.toUpperCase(), item);
  for (const item of incoming) map.set(item.jobId.toUpperCase(), item);
  return Array.from(map.values());
}

export const localBackend: BackendProvider = {
  async getJobs() { return dataService.getJobs(); }, async saveJobs(value) { dataService.saveJobs(value); },
  async getInstallations() { return dataService.getInstallations(); }, async saveInstallations(value) { dataService.saveInstallations(value); },
  async getWarranties() { return dataService.getWarranties(); }, async saveWarranties(value) { dataService.saveWarranties(value); },
  async getProduction() { return dataService.getProduction(); }, async saveProduction(value) { dataService.saveProduction(value); },
};

export const supabaseBackend: BackendProvider = {
  async getJobs() { const { data, error } = await supabase.from("jobs").select("id,address,builder,community,team,date,status").order("date"); if (error) throw error; return (data || []) as Job[]; },
  async saveJobs(value) { const { error } = await supabase.from("jobs").upsert(value.map(j => ({ id: j.id, address: j.address, builder: j.builder, community: j.community, team: j.team, date: j.date, status: j.status }))); if (error) throw error; },
  async getInstallations() { const { data, error } = await supabase.from("installations").select("job_id,team,date,time,status,notes"); if (error) throw error; return (data || []).map(x => ({ jobId: x.job_id, team: x.team, date: x.date, time: x.time, status: x.status, notes: x.notes })) as Installation[]; },
  async saveInstallations(value) { const { error } = await supabase.from("installations").upsert(value.map(x => ({ job_id: x.jobId, team: x.team, date: x.date, time: x.time, status: x.status, notes: x.notes })), { onConflict: "job_id" }); if (error) throw error; },
  async getWarranties() { const { data, error } = await supabase.from("warranties").select("job_id,opened_at,issue,status,priority,notes"); if (error) throw error; return (data || []).map(x => ({ jobId: x.job_id, openedAt: x.opened_at, issue: x.issue, status: x.status, priority: x.priority, notes: x.notes })) as Warranty[]; },
  async saveWarranties(value) { const { error } = await supabase.from("warranties").upsert(value.map(x => ({ job_id: x.jobId, opened_at: x.openedAt, issue: x.issue, status: x.status, priority: x.priority, notes: x.notes })), { onConflict: "job_id" }); if (error) throw error; },
  async getProduction() { const { data, error } = await supabase.from("production").select("job_id,material,slab_count,square_feet,sink_type,caulk_tubes,clips,status,updated_at,notes"); if (error) throw error; return (data || []).map(x => ({ jobId: x.job_id, material: x.material, slabCount: Number(x.slab_count), squareFeet: Number(x.square_feet), sinkType: x.sink_type, caulkTubes: Number(x.caulk_tubes), clips: Number(x.clips), status: x.status, updatedAt: x.updated_at, notes: x.notes })) as ProductionRecord[]; },
  async saveProduction(value) { const { error } = await supabase.from("production").upsert(value.map(x => ({ job_id: x.jobId, material: x.material, slab_count: x.slabCount, square_feet: x.squareFeet, sink_type: x.sinkType, caulk_tubes: x.caulkTubes, clips: x.clips, status: x.status, updated_at: x.updatedAt, notes: x.notes })), { onConflict: "job_id" }); if (error) throw error; },
};

export const apiBackend: BackendProvider = {
  async getJobs() { return api<Job[]>("/jobs"); },
  async saveJobs(value) { const current = await api<Job[]>("/jobs"); await api<void>("/jobs", { method: "PUT", body: JSON.stringify(mergeById(current, value)) }); },
  async getInstallations() { return api<Installation[]>("/installations"); },
  async saveInstallations(value) { const current = await api<Installation[]>("/installations"); await api<void>("/installations", { method: "PUT", body: JSON.stringify(mergeByJobId(current, value)) }); },
  async getWarranties() { return api<Warranty[]>("/warranties"); },
  async saveWarranties(value) { const current = await api<Warranty[]>("/warranties"); await api<void>("/warranties", { method: "PUT", body: JSON.stringify(mergeByJobId(current, value)) }); },
  async getProduction() { return api<ProductionRecord[]>("/production"); },
  async saveProduction(value) { const current = await api<ProductionRecord[]>("/production"); await api<void>("/production", { method: "PUT", body: JSON.stringify(mergeByJobId(current, value)) }); },
};

export function createBackendProvider(): BackendProvider { return isSupabaseConfigured() ? supabaseBackend : API_BASE_URL ? apiBackend : localBackend; }
