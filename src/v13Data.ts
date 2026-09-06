import { dataService } from "./dataService";
import { Job } from "./types";

export type ImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

export function importJobs(rows: Partial<Job>[]): ImportResult {
  const current = dataService.getJobs();
  const ids = new Set(current.map((job) => job.id));
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  rows.forEach((row, index) => {
    if (!row.id || !row.address || !row.date) {
      errors.push(`Row ${index + 1}: id, address and date are required.`);
      return;
    }
    if (ids.has(row.id)) {
      skipped += 1;
      return;
    }
    current.push({
      id: row.id,
      address: row.address,
      builder: row.builder ?? "",
      community: row.community ?? "",
      team: row.team ?? "",
      date: row.date,
      status: row.status ?? "Scheduled",
    });
    ids.add(row.id);
    imported += 1;
  });

  dataService.saveJobs(current);
  return { imported, skipped, errors };
}

export function exportJobsJson(): string {
  return JSON.stringify(dataService.exportSnapshot(), null, 2);
}
