import { createBackendProvider } from "./backend";
import { dataService } from "./dataService";

function mergeById<T extends { id: string }>(central: T[], local: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of central) map.set(item.id.toUpperCase(), item);
  for (const item of local) map.set(item.id.toUpperCase(), item);
  return Array.from(map.values());
}

function mergeByJobId<T extends { jobId: string }>(central: T[], local: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of central) map.set(item.jobId.toUpperCase(), item);
  for (const item of local) map.set(item.jobId.toUpperCase(), item);
  return Array.from(map.values());
}

export async function hydratePilotData() {
  const backend = createBackendProvider();
  try {
    const localJobs = dataService.getJobs();
    const localInstallations = dataService.getInstallations();
    const localWarranties = dataService.getWarranties();
    const localProduction = dataService.getProduction();
    const [jobs, installations, warranties, production] = await Promise.all([backend.getJobs(), backend.getInstallations(), backend.getWarranties(), backend.getProduction()]);

    // Never discard a record already created on this device just because the
    // central provider is temporarily behind. Local pilot data wins by id.
    const mergedJobs = mergeById(jobs, localJobs);
    const mergedInstallations = mergeByJobId(installations, localInstallations);
    const mergedWarranties = mergeByJobId(warranties, localWarranties);
    const mergedProduction = mergeByJobId(production, localProduction);

    if (mergedJobs.length) dataService.saveJobs(mergedJobs);
    if (mergedInstallations.length) dataService.saveInstallations(mergedInstallations);
    if (mergedWarranties.length) dataService.saveWarranties(mergedWarranties);
    if (mergedProduction.length) dataService.saveProduction(mergedProduction);

    // Push merged pilot data back to the central provider so a later reload
    // or another device receives the same complete dataset.
    await Promise.all([
      backend.saveJobs(mergedJobs),
      backend.saveInstallations(mergedInstallations),
      backend.saveWarranties(mergedWarranties),
      backend.saveProduction(mergedProduction)
    ]);

    return { source: "central", jobs: mergedJobs.length, installations: mergedInstallations.length, warranties: mergedWarranties.length, production: mergedProduction.length };
  } catch (error) {
    console.warn("ES INSTALL central data unavailable; continuing with local pilot cache.", error);
    return { source: "local", jobs: dataService.getJobs().length, installations: dataService.getInstallations().length, warranties: dataService.getWarranties().length, production: dataService.getProduction().length };
  }
}
