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

/**
 * Local adapter used by the GitHub Pages pilot.
 * A real API/DB adapter can implement the same contract without changing UI modules.
 */
export const localBackend: BackendProvider = {
  async getJobs() { return dataService.getJobs(); },
  async saveJobs(jobs) { dataService.saveJobs(jobs); },
  async getInstallations() { return dataService.getInstallations(); },
  async saveInstallations(items) { dataService.saveInstallations(items); },
  async getWarranties() { return dataService.getWarranties(); },
  async saveWarranties(items) { dataService.saveWarranties(items); },
};

export function createBackendProvider(): BackendProvider {
  return localBackend;
}
