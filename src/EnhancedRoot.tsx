import { useEffect, useState } from "react";
import App from "./App";
import NewJobPage from "./NewJobPage";
import { loadProduction, saveProduction } from "./production";
import { jobs as seedJobs } from "./data";
import type { Job, ProductionRecord } from "./types";

type Installation = { jobId: string; team: string; date: string; time: string; status: "Scheduled" | "In Progress" | "Completed"; notes: string };

function read<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function write<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

export default function EnhancedRoot() {
  const [showNewJob, setShowNewJob] = useState(false);

  useEffect(() => {
    const patchNewJobButton = () => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const button = buttons.find(item => item.textContent?.trim() === "+ New Job") as HTMLButtonElement | undefined;
      if (!button || button.dataset.esInstallPatched === "true") return;
      button.dataset.esInstallPatched = "true";
      const handler = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        setShowNewJob(true);
      };
      button.addEventListener("click", handler, true);
      (button as HTMLButtonElement & { __esInstallHandler?: EventListener }).__esInstallHandler = handler;
    };

    patchNewJobButton();
    const observer = new MutationObserver(patchNewJobButton);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const createJob = (job: Job) => {
    const jobs = read<Job[]>("es-install-jobs-v1", seedJobs);
    if (jobs.some(item => item.id.toUpperCase() === job.id.toUpperCase())) return;
    write("es-install-jobs-v1", [...jobs, job]);

    const installations = read<Installation[]>("es-install-installations-v1", seedJobs.map((item, index) => ({ jobId: item.id, team: item.team, date: item.date, time: index % 2 ? "10:00 AM" : "8:00 AM", status: item.status === "Installation" ? "In Progress" : "Scheduled", notes: "" })));
    if (!installations.some(item => item.jobId === job.id)) {
      write("es-install-installations-v1", [...installations, { jobId: job.id, team: job.team, date: job.date, time: "8:00 AM", status: "Scheduled", notes: "" }]);
    }

    const production = loadProduction();
    if (!production.some(item => item.jobId === job.id)) {
      const record: ProductionRecord = { jobId: job.id, material: "Granite", slabCount: 0, squareFeet: 0, sinkType: "None", caulkTubes: 0, clips: 0, status: "Pending", updatedAt: new Date().toISOString(), notes: "New job created from Jobs." };
      saveProduction([...production, record]);
    }
    setShowNewJob(false);
    window.location.reload();
  };

  return <>
    <App />
    {showNewJob && <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="Create new job">
      <div style={modalStyle}>
        <button className="ghost" style={{position:"absolute",right:18,top:18}} onClick={() => setShowNewJob(false)}>Close</button>
        <NewJobPage onCreate={createJob} onCancel={() => setShowNewJob(false)} />
      </div>
    </div>}
  </>;
}

const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.78)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18, overflowY: "auto" };
const modalStyle: React.CSSProperties = { position: "relative", width: "min(900px, 100%)", maxHeight: "94vh", overflowY: "auto", background: "#0b0b0d", border: "1px solid #3b3321", borderRadius: 16, boxShadow: "0 24px 80px rgba(0,0,0,.55)" };
