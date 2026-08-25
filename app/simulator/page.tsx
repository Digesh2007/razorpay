"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BrainCircuit, CheckCircle2, LoaderCircle, Play, RotateCcw, ShieldCheck, TriangleAlert } from "lucide-react";
import { formatINR } from "@/lib/utils";

type Stage = "idle" | "generating" | "analyzing" | "executing" | "complete" | "error";
interface Result { total: number; recovered: number; failed: number; revenueRecovered: number }

export default function SimulatorPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Ready to run a 100-transaction demo");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function runSimulation() {
    setStage("generating"); setProgress(8); setResult(null); setError(""); setMessage("Generating 100 failed transactions...");
    const timer = window.setInterval(() => setProgress((value) => Math.min(value + 2, 90)), 600);
    window.setTimeout(() => { setStage("analyzing"); setMessage("AI analyzing transaction #45..."); }, 4000);
    window.setTimeout(() => { setStage("executing"); setMessage("Executing recovery actions..."); }, 16000);
    try {
      const response = await fetch("/api/simulator", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Simulation failed.");
      window.clearInterval(timer); setProgress(100); setResult(data); setStage("complete"); setMessage(`Complete! ${data.recovered}/${data.total} recovered`);
    } catch (simulationError) {
      window.clearInterval(timer); setStage("error"); setError(simulationError instanceof Error ? simulationError.message : "Simulation failed."); setMessage("Simulation stopped");
    }
  }

  const running = ["generating", "analyzing", "executing"].includes(stage);
  return <div className="min-h-screen bg-[#0c1118] text-white"><header className="border-b border-white/10"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10"><Link href="/dashboard" className="text-lg font-semibold tracking-tight">Recover<span className="text-[#b8f36b]">AI</span></Link><span className="flex items-center gap-2 text-xs text-slate-400"><ShieldCheck size={15} className="text-[#b8f36b]" /> DEMO / TEST ONLY</span></div></header><main className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-24"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8f36b]">Autonomous agent lab</p><h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">Recovery simulator</h1><p className="mt-5 text-lg leading-8 text-slate-400">Watch the agent classify failures, choose a strategy, and simulate revenue recovery across a fresh batch of transactions.</p></div><div className="mt-12 rounded-2xl border border-white/10 bg-[#111a23] p-6 sm:p-10"><div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center"><div><p className="text-sm text-slate-500">Simulation status</p><p className="mt-2 text-xl font-medium text-white">{message}</p></div><button type="button" onClick={runSimulation} disabled={running} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#b8f36b] px-5 text-sm font-semibold text-[#0c1118] disabled:cursor-not-allowed disabled:opacity-50">{running ? <LoaderCircle className="animate-spin" size={17} /> : stage === "complete" ? <RotateCcw size={17} /> : <Play size={17} fill="currentColor" />} {running ? "Simulation running" : stage === "complete" ? "Run again" : "Run AI recovery simulation"}</button></div><div className="mt-10"><div className="flex justify-between text-xs text-slate-500"><span>{stage === "idle" ? "Awaiting launch" : stage === "error" ? "Action required" : stage === "complete" ? "All workflows complete" : "Agent activity in progress"}</span><span>{progress}%</span></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#b8f36b] transition-all duration-500" style={{ width: `${progress}%` }} /></div></div>{error && <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"><TriangleAlert size={18} className="shrink-0" /> <span>{error}</span></div>}<div className="mt-10 grid gap-3 sm:grid-cols-3"><Status icon={BrainCircuit} label="Analyze" active={stage === "analyzing" || stage === "executing" || stage === "complete"} /><Status icon={ArrowRight} label="Choose action" active={stage === "executing" || stage === "complete"} /><Status icon={CheckCircle2} label="Recover" active={stage === "complete"} /></div></div>{result && <div className="mt-6 rounded-2xl border border-[#b8f36b]/25 bg-[#16211a] p-8 sm:p-10"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8f36b]">Simulation complete</p><h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{formatINR(result.revenueRecovered)} recovered</h2><p className="mt-3 text-slate-400">from {result.recovered} of {result.total} simulated transactions.</p><div className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-3"><Metric label="Success rate" value={`${Math.round((result.recovered / result.total) * 100)}%`} /><Metric label="Recovered" value={result.recovered.toString()} /><Metric label="Needs review" value={result.failed.toString()} /></div><Link href="/transactions" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#b8f36b] hover:underline">View results in transactions <ArrowRight size={16} /></Link></div>}</main></div>;
}

function Status({ icon: Icon, label, active }: { icon: typeof BrainCircuit; label: string; active: boolean }) { return <div className={`flex items-center gap-3 rounded-lg border p-4 text-sm ${active ? "border-[#b8f36b]/20 bg-[#b8f36b]/10 text-[#b8f36b]" : "border-white/10 text-slate-600"}`}><Icon size={17} /><span>{label}</span></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div><p className="text-xs uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold text-white">{value}</p></div>; }