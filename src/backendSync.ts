import { createBackendProvider } from "./backend";
import { dataService } from "./dataService";

export async function hydratePilotData() {
  const backend = createBackendProvider();
  try {
    const [jobs, installations, warranties] = await Promise.all([backend.getJobs(), backend.getInstallations(), backend.getWarranties()]);
    if (jobs.length) dataService.saveJobs(jobs);
    if (installations.length) dataService.saveInstallations(installations);
    if (warranties.length) dataService.saveWarranties(warranties);
    return { source: "central", jobs: jobs.length, installations: installations.length, warranties: warranties.length };
  } catch (error) {
    console.warn("ES INSTALL central data unavailable; continuing with local pilot cache.", error);
    return { source: "local", jobs: dataService.getJobs().length, installations: dataService.getInstallations().length, warranties: dataService.getWarranties().length };
  }
}
