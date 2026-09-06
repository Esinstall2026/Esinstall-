import fs from "node:fs";

const source = fs.readFileSync("src/backend.ts", "utf8");
for (const item of [
  "BackendProvider",
  "VITE_API_BASE_URL",
  "apiBackend",
  "localBackend",
  "createBackendProvider",
  '"/jobs"',
  '"/installations"',
  '"/warranties"',
]) {
  if (!source.includes(item)) throw new Error(`Missing V14 capability: ${item}`);
}
console.log("V14 backend adapter acceptance: PASS");
