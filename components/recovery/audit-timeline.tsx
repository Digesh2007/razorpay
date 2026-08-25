import { AlertCircle, Brain, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuditEvent {
  title: string;
  description: string;
  timestamp: string;
  type: "failure" | "analysis" | "decision" | "attempt" | "success";
}

const eventStyles = {
  failure: { icon: AlertCircle, color: "text-red-400", background: "bg-red-400/10" },
  analysis: { icon: Brain, color: "text-[#b8f36b]", background: "bg-[#b8f36b]/10" },
  decision: { icon: Brain, color: "text-amber-400", background: "bg-amber-400/10" },
  attempt: { icon: PlayCircle, color: "text-sky-400", background: "bg-sky-400/10" },
  success: { icon: CheckCircle2, color: "text-emerald-400", background: "bg-emerald-400/10" },
};

export function AuditTimeline({ events }: { events: AuditEvent[] }) {
  return (
    <div className="space-y-0">
      {events.map((event, index) => {
        const style = eventStyles[event.type];
        const Icon = style.icon;
        return (
          <div key={`${event.title}-${index}`} className="relative flex gap-4 pb-7 last:pb-0">
            {index < events.length - 1 && <span className="absolute left-4 top-9 h-full w-px bg-white/10" />}
            <span className={cn("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full", style.background)}><Icon size={16} className={style.color} /></span>
            <div className="min-w-0 pt-0.5"><div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"><p className="font-medium text-white">{event.title}</p><time className="text-xs text-slate-500">{event.timestamp}</time></div><p className="mt-1 text-sm leading-6 text-slate-400">{event.description}</p></div>
          </div>
        );
      })}
      {events.length === 0 && <div className="flex items-center gap-3 text-sm text-slate-500"><Circle size={14} /> No audit events recorded yet.</div>}
    </div>
  );
}