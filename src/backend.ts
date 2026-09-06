import { dataService } from "./dataService";
import { Job, Installation, Warranty } from "./types";

export type BackendProvider = {
  getJobs(): Promise<Job[]>;
  saveJobs(jobs: Job[]): Promise<void>;
  getInstallations(): Promise<Installation[]>;
  saveInstallations(items: Installation[]): Promise<void>;
  getWarranties(): Promise<Warranty[]>;
  saveWarranties(items: Warranty[]): Promise<void>;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "");

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) throw new Error("VITE_API_BASE_URL is not configured");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok) throw new Error(`API ${response.status}: ${response.statusText}`);
  return response.json() as Promise<T>;
}

export const localBackend: BackendProvider = {
  async getJobs() { return dataService.getJobs(); },
  async saveJobs(jobs) { dataService.saveJobs(jobs); },
  async getInstallations() { return dataService.getInstallations(); },
  async saveInstallations(items) { dataService.saveInstallations(items); },
  async getWarranties() { return dataService.getWarranties(); },
  async saveWarranties(items) { dataService.saveWarranties(items); },
};

export const apiBackend: BackendProvider = {
  getJobs: () => api<Job[]>("/jobs"),
  saveJobs: (jobs) => api<void>("/jobs", { method: "PUT", body: JSON.stringify(jobs) }),
  getInstallations: () => api<Installation[]>("/installations"),
  saveInstallations: (items) => api<void>("/installations", { method: "PUT", body: JSON.stringify(items) }),
  getWarranties: () => api<Warranty[]>("/warranties"),
  saveWarranties: (items) => api<void>("/warranties", { method: "PUT", body: JSON.stringify(items) }),
};

export function createBackendProvider(): BackendProvider {
  return API_BASE_URL ? apiBackend : localBackend;
}
