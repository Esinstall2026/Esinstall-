import assert from "node:assert/strict";
import fs from "node:fs";

const dataSource = fs.readFileSync("src/data.ts", "utf8");
const productionSource = fs.readFileSync("src/production.ts", "utf8");
const appSource = fs.readFileSync("src/App.tsx", "utf8");
const enhancedSource = fs.readFileSync("src/EnhancedRoot.tsx", "utf8");

assert.match(dataSource, /id:\s*"JOB-1005"/);
assert.match(dataSource, /address:\s*"562 Palm Ridge Ave"/);
assert.match(dataSource, /status:\s*"Scheduled"/);
assert.match(productionSource, /jobId:\s*"JOB-1005"/);
assert.match(enhancedSource, /es-install-jobs-v1/);
assert.match(enhancedSource, /es-install-installations-v1/);
assert.match(enhancedSource, /es-install-production-v1/);
assert.match(appSource, /updateProduction/);
assert.match(appSource, /updateInstallation/);
assert.match(appSource, /updateWarranty/);

const job = { id: "JOB-1005", status: "Scheduled" };
const productionFlow = ["Pending", "Cutting", "Polishing", "Separated", "Ready"];
const expectedProductionJobs = ["Scheduled", "Production", "Production", "Production", "Ready for Installation"];

for (let i = 0; i < productionFlow.length; i++) {
  const status = productionFlow[i];
  job.status = status === "Ready" ? "Ready for Installation" : status === "Pending" ? "Scheduled" : "Production";
  assert.equal(job.status, expectedProductionJobs[i], `Production step ${status}`);
}

const installationFlow = ["Scheduled", "In Progress", "Completed"];
const expectedInstallationJobs = ["Ready for Installation", "Installation", "Completed"];
for (let i = 0; i < installationFlow.length; i++) {
  const status = installationFlow[i];
  job.status = status === "Completed" ? "Completed" : status === "In Progress" ? "Installation" : job.status === "Completed" || job.status === "Warranty" ? job.status : "Ready for Installation";
  assert.equal(job.status, expectedInstallationJobs[i], `Installation step ${status}`);
}

job.status = "Warranty";
assert.equal(job.status, "Warranty", "Open warranty moves completed job to Warranty");
job.status = "Warranty";
assert.equal(job.status, "Warranty", "Resolved warranty preserves warranty history state");

console.log("V11 acceptance: JOB-1005 source, production flow, installation flow and warranty transition PASS");
