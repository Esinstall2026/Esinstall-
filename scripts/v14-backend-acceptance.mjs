import fs from "node:fs";

const source = fs.readFileSync("src/backend.ts", "utf8");
const required = [
  "BackendProvider",
  "getJobs(): Promise<Job[]>",
  "saveJobs(jobs: Job[]): Promise<void>",
  "getInstallations(): Promise<Installation[]>",
  "saveInstallations(items: Installation[]): Promise<void>",
  "getWarranties(): Promise<Warranty[]>",
  "saveWarranties(items: Warranty[]): Promise<void>",
  "createBackendProvider",
  "localBackend",
];
for (const item of required) {
  if (!source.includes(item)) throw new Error(`Missing V14 backend contract: ${item}`);
}
console.log("V14 backend provider acceptance: PASS");
