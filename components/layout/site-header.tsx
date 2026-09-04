import Link from "next/link";
import { Activity, ShieldCheck } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="relative z-10 border-b border-white/10 bg-[#0c1118]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="RecoverAI home">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#b8f36b] text-[#0c1118] shadow-[0_0_24px_rgba(184,243,107,0.25)]">
            <Activity size={20} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">Recover<span className="text-[#b8f36b]">AI</span></span>
        </Link>

        <div className="flex items-center gap-3 text-xs font-medium text-slate-400 sm:gap-6">
          <span className="hidden items-center gap-2 sm:flex"><ShieldCheck size={15} className="text-[#b8f36b]" /> Demo environment</span>
          <nav className="hidden items-center gap-5 sm:flex">
            <Link href="/dashboard" className="transition-colors hover:text-[#b8f36b]">Dashboard</Link>
            <Link href="/transactions" className="transition-colors hover:text-[#b8f36b]">Transactions</Link>
            <Link href="/simulator" className="transition-colors hover:text-[#b8f36b]">Simulator</Link>
            <Link href="/analytics" className="transition-colors hover:text-[#b8f36b]">Analytics</Link>
            <Link href="/settings" className="transition-colors hover:text-[#b8f36b]">Settings</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}