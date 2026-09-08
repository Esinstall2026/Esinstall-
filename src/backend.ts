import { dataService } from "./dataService";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import type { Job } from "./types";

type Installation = { jobId: string; team: string; date: string; time: string; status: "Scheduled" | "In Progress" | "Completed"; notes: string };
type Warranty = { jobId: string; openedAt: string; issue: string; status: "Open" | "In Review" | "Resolved"; priority: "Low" | "Medium" | "High"; notes: string };

export type BackendProvider = {
  getJobs(): Promise<Job[]>; saveJobs(jobs: Job[]): Promise<void>;
  getInstallations(): Promise<Installation[]>; saveInstallations(items: Installation[]): Promise<void>;
  getWarranties(): Promise<Warranty[]>; saveWarranties(items: Warranty[]): Promise<void>;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "");

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) throw new Error("VITE_API_BASE_URL is not configured");
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!response.ok) throw new Error(`API ${response.status}: ${response.statusText}`);
  return response.json() as Promise<T>;
}

export const localBackend: BackendProvider = {
  async getJobs() { return dataService.getJobs(); }, async saveJobs(value) { dataService.saveJobs(value); },
  async getInstallations() { return dataService.getInstallations(); }, async saveInstallations(value) { dataService.saveInstallations(value); },
  async getWarranties() { return dataService.getWarranties(); }, async saveWarranties(value) { dataService.saveWarranties(value); },
};

export const supabaseBackend: BackendProvider = {
  async getJobs() { const { data, error } = await supabase.from("jobs").select("id,address,builder,community,team,date,status").order("date"); if (error) throw error; return (data || []) as Job[]; },
  async saveJobs(value) { const { error } = await supabase.from("jobs").upsert(value.map(j => ({ id: j.id, address: j.address, builder: j.builder, community: j.community, team: j.team, date: j.date, status: j.status }))); if (error) throw error; },
  async getInstallations() { const { data, error } = await supabase.from("installations").select("job_id,team,date,time,status,notes"); if (error) throw error; return (data || []).map(x => ({ jobId: x.job_id, team: x.team, date: x.date, time: x.time, status: x.status, notes: x.notes })) as Installation[]; },
  async saveInstallations(value) { const { error } = await supabase.from("installations").upsert(value.map(x => ({ job_id: x.jobId, team: x.team, date: x.date, time: x.time, status: x.status, notes: x.notes })), { onConflict: "job_id" }); if (error) throw error; },
  async getWarranties() { const { data, error } = await supabase.from("warranties").select("job_id,opened_at,issue,status,priority,notes"); if (error) throw error; return (data || []).map(x => ({ jobId: x.job_id, openedAt: x.opened_at, issue: x.issue, status: x.status, priority: x.priority, notes: x.notes })) as Warranty[]; },
  async saveWarranties(value) { const { error } = await supabase.from("warranties").upsert(value.map(x => ({ job_id: x.jobId, opened_at: x.openedAt, issue: x.issue, status: x.status, priority: x.priority, notes: x.notes })), { onConflict: "job_id" }); if (error) throw error; },
};

export const apiBackend: BackendProvider = {
  getJobs: () => api<Job[]>("/jobs"), saveJobs: jobs => api<void>("/jobs", { method: "PUT", body: JSON.stringify(jobs) }),
  getInstallations: () => api<Installation[]>("/installations"), saveInstallations: items => api<void>("/installations", { method: "PUT", body: JSON.stringify(items) }),
  getWarranties: () => api<Warranty[]>("/warranties"), saveWarranties: items => api<void>("/warranties", { method: "PUT", body: JSON.stringify(items) }),
};

export function createBackendProvider(): BackendProvider { return isSupabaseConfigured() ? supabaseBackend : API_BASE_URL ? apiBackend : localBackend; }
