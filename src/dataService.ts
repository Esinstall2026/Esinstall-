import { Job, Installation, Warranty } from "./types";
import { jobs as seedJobs } from "./data";

export const STORAGE_KEYS = {
  jobs: "es-install-jobs-v1",
  installations: "es-install-installations-v1",
  warranties: "es-install-warranties-v1",
  production: "es-install-production-v1",
  teams: "es-install-teams-v1",
  builders: "es-install-builders-v1",
  communities: "es-install-communities-v1",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const dataService = {
  getJobs(): Job[] {
    return read<Job[]>(STORAGE_KEYS.jobs, seedJobs);
  },
  saveJobs(value: Job[]) {
    write(STORAGE_KEYS.jobs, value);
  },
  getInstallations(): Installation[] {
    return read<Installation[]>(STORAGE_KEYS.installations, []);
  },
  saveInstallations(value: Installation[]) {
    write(STORAGE_KEYS.installations, value);
  },
  getWarranties(): Warranty[] {
    return read<Warranty[]>(STORAGE_KEYS.warranties, []);
  },
  saveWarranties(value: Warranty[]) {
    write(STORAGE_KEYS.warranties, value);
  },
  exportSnapshot() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      jobs: this.getJobs(),
      installations: this.getInstallations(),
      warranties: this.getWarranties(),
    };
  },
  importSnapshot(snapshot: { jobs?: Job[]; installations?: Installation[]; warranties?: Warranty[] }) {
    if (snapshot.jobs) this.saveJobs(snapshot.jobs);
    if (snapshot.installations) this.saveInstallations(snapshot.installations);
    if (snapshot.warranties) this.saveWarranties(snapshot.warranties);
  },
};
