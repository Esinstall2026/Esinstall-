import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import App from "./App";
import NewJobPage from "./NewJobPage";
import NewWarrantyPage, { type WarrantyCase } from "./NewWarrantyPage";
import { loadProduction, saveProduction } from "./production";
import { jobs as seedJobs } from "./data";
import type { Job, ProductionRecord } from "./types";
import { createBackendProvider } from "./backend";
import { hydratePilotData } from "./backendSync";

type Installation = { jobId: string; team: string; date: string; time: string; status: "Scheduled" | "In Progress" | "Completed"; notes: string };
function read<T>(key: string, fallback: T): T { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }
function write<T>(key: string, value: T) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } }

export default function EnhancedRoot() {
  const [booted, setBooted] = useState(false); const [showNewJob, setShowNewJob] = useState(false); const [showNewWarranty, setShowNewWarranty] = useState(false); const [warrantyJobId, setWarrantyJobId] = useState("");

  useEffect(() => { hydratePilotData().finally(() => setBooted(true)); }, []);

  useEffect(() => {
    if (!booted) return;
    const backend = createBackendProvider();
    const originalSetItem = localStorage.setItem.bind(localStorage);
    const sync = (key: string, raw: string) => {
      try {
        const value = JSON.parse(raw);
        if (key === "es-install-jobs-v1") void backend.saveJobs(value as Job[]).catch(error => console.warn("Central jobs sync failed", error));
        if (key === "es-install-installations-v1") void backend.saveInstallations(value as Installation[]).catch(error => console.warn("Central installations sync failed", error));
        if (key === "es-install-warranty-v1") void backend.saveWarranties(value as WarrantyCase[]).catch(error => console.warn("Central warranty sync failed", error));
        if (key === "es-install-production-v1") void backend.saveProduction(value as ProductionRecord[]).catch(error => console.warn("Central production sync failed", error));
      } catch { /* ignore non-JSON values */ }
    };
    localStorage.setItem = ((key: string, value: string) => { originalSetItem(key, value); sync(key, value); }) as typeof localStorage.setItem;
    return () => { localStorage.setItem = originalSetItem as typeof localStorage.setItem; };
  }, [booted]);

  useEffect(() => {
    if (!booted) return;
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null; const button = target?.closest("button"); if (!button) return; const label = button.textContent?.trim();
      if (label === "+ New Job") { event.preventDefault(); event.stopPropagation(); setShowNewJob(true); return; }
      if (label === "+ New Warranty") {
        event.preventDefault(); event.stopPropagation();
        const jobs = read<Job[]>("es-install-jobs-v1", seedJobs);
        const installations = read<Installation[]>("es-install-installations-v1", []);
        const warranties = read<WarrantyCase[]>("es-install-warranty-v1", []);
        const eligible = jobs.filter(job => installations.some(item => item.jobId === job.id && item.status === "Completed") || job.status === "Warranty" || warranties.some(item => item.jobId === job.id));
        // If there is no completed installation yet, still allow opening a warranty
        // during the pilot so the user can test the complete workflow.
        const selectable = eligible.length ? eligible : jobs;
        setWarrantyJobId(selectable[0]?.id ?? "");
        setShowNewWarranty(true);
      }
    };
    document.addEventListener("click", handleGlobalClick, true); return () => document.removeEventListener("click", handleGlobalClick, true);
  }, [booted]);

  const createJob = (job: Job) => {
    const jobs = read<Job[]>("es-install-jobs-v1", seedJobs); if (jobs.some(item => item.id.toUpperCase() === job.id.toUpperCase())) return; write("es-install-jobs-v1", [...jobs, job]);
    const installations = read<Installation[]>("es-install-installations-v1", seedJobs.map((item, index) => ({ jobId: item.id, team: item.team, date: item.date, time: index % 2 ? "10:00 AM" : "8:00 AM", status: item.status === "Installation" ? "In Progress" : "Scheduled", notes: "" })));
    if (!installations.some(item => item.jobId === job.id)) write("es-install-installations-v1", [...installations, { jobId: job.id, team: job.team, date: job.date, time: "8:00 AM", status: "Scheduled", notes: "" }]);
    const production = loadProduction(); if (!production.some(item => item.jobId === job.id)) { const record: ProductionRecord = { jobId: job.id, material: "Granite", slabCount: 0, squareFeet: 0, sinkType: "None", caulkTubes: 0, clips: 0, status: "Pending", updatedAt: new Date().toISOString(), notes: "New job created from Jobs." }; saveProduction([...production, record]); }
    setShowNewJob(false); window.location.reload();
  };

  const createWarranty = async (value: WarrantyCase) => {
    const backend = createBackendProvider();
    const warranties = read<WarrantyCase[]>("es-install-warranty-v1", []);
    const nextWarranties = warranties.some(item => item.jobId === value.jobId) ? warranties.map(item => item.jobId === value.jobId ? value : item) : [...warranties, value];
    const jobs = read<Job[]>("es-install-jobs-v1", seedJobs);
    const job = jobs.find(item => item.id === value.jobId);
    const nextJob = job && value.status !== "Resolved" && job.status === "Completed" ? { ...job, status: "Warranty" as const } : null;
    try {
      // Await the central save before closing/reloading the modal.
      await backend.saveWarranties([value]);
      if (nextJob) await backend.saveJobs([nextJob]);
      write("es-install-warranty-v1", nextWarranties);
      if (nextJob) write("es-install-jobs-v1", jobs.map(item => item.id === nextJob.id ? nextJob : item));
      setShowNewWarranty(false); window.location.reload();
    } catch (error) {
      console.error("Central warranty save failed", error);
      window.alert(`Não foi possível salvar a garantia no servidor central. ${error instanceof Error ? error.message : "Tente novamente."}`);
    }
  };

  // Keep the same jobs available to the modal as the button selector, with a pilot fallback.
  const warrantyJobs = (() => { const jobs = read<Job[]>("es-install-jobs-v1", seedJobs); const installations = read<Installation[]>("es-install-installations-v1", []); const warranties = read<WarrantyCase[]>("es-install-warranty-v1", []); const eligible = jobs.filter(job => installations.some(item => item.jobId === job.id && item.status === "Completed") || job.status === "Warranty" || warranties.some(item => item.jobId === job.id)); return eligible.length ? eligible : jobs; })();

  if (!booted) return <div className="auth-shell"><div className="auth-card"><span className="gold-label">ES INSTALL</span><h1>Conectando…</h1><p className="muted">Sincronizando os dados centrais com o dispositivo.</p></div></div>;
  return <>
    <App />
    {showNewJob && <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="Create new job"><div style={modalStyle}><button className="ghost" style={closeStyle} onClick={() => setShowNewJob(false)}>Close</button><NewJobPage onCreate={createJob} onCancel={() => setShowNewJob(false)} /></div></div>}
    {showNewWarranty && <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="Create new warranty"><div style={modalStyle}><button className="ghost" style={closeStyle} onClick={() => setShowNewWarranty(false)}>Close</button><NewWarrantyPage jobs={warrantyJobs} initialJobId={warrantyJobId} onCreate={createWarranty} onCancel={() => setShowNewWarranty(false)} /></div></div>}
  </>;
}
const overlayStyle: CSSProperties = { position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.78)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18, overflowY: "auto" };
const modalStyle: CSSProperties = { position: "relative", width: "min(900px, 100%)", maxHeight: "94vh", overflowY: "auto", background: "#0b0b0d", border: "1px solid #3b3321", borderRadius: 16, boxShadow: "0 24px 80px rgba(0,0,0,.55)" };
const closeStyle: CSSProperties = { position: "absolute", right: 18, top: 18, zIndex: 2 };
