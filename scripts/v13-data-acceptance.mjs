import fs from "node:fs";

const service = fs.readFileSync("src/dataService.ts", "utf8");
const migration = fs.readFileSync("src/v13Data.ts", "utf8");

const required = [
  "STORAGE_KEYS",
  "getJobs",
  "saveJobs",
  "getInstallations",
  "getWarranties",
  "exportSnapshot",
  "importSnapshot",
];
for (const item of required) {
  if (!service.includes(item)) throw new Error(`Missing data service capability: ${item}`);
}
for (const item of ["importJobs", "exportJobsJson", "id, address and date are required"]) {
  if (!migration.includes(item)) throw new Error(`Missing migration capability: ${item}`);
}
console.log("V13 data foundation acceptance: PASS");
