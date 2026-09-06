import fs from "node:fs";

const auth = fs.readFileSync("src/Auth.tsx", "utf8");
const portal = fs.readFileSync("src/UserPortal.tsx", "utf8");
const main = fs.readFileSync("src/main.tsx", "utf8");

const assert = (condition, message) => {
  if (!condition) throw new Error(`V12 access acceptance failed: ${message}`);
};

assert(auth.includes('role: "Admin"'), "Admin profile exists");
assert(auth.includes('role: "User"'), "User profile exists");
assert(auth.includes('team: "Team Bravo"'), "team-scoped user exists");
assert(auth.includes("es-install-session-v1"), "session storage is defined");
assert(auth.includes("signOut"), "logout is implemented");
assert(main.includes("session?.role === \"User\" ? <UserPortal /> : <EnhancedRoot />"), "role routing is active");
assert(portal.includes('jobs.filter(job => job.team === session.team)'), "user jobs are scoped to the authenticated team");
assert(portal.includes('if (!scopedIds.has(value.jobId) || value.team !== session.team) return;'), "installation updates reject other teams");
assert(portal.includes('if (!scopedIds.has(value.jobId)) return;'), "warranty updates reject other teams");
assert(!portal.includes("Production / Factory"), "user portal does not expose factory production");

console.log("V12 access acceptance passed: Admin/User login, role routing and team-scoped operations are present.");
