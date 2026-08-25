import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  accent?: boolean;
}

export function StatsCard({ label, value, description, icon: Icon, accent = false }: StatsCardProps) {
  return (
    <Card className={accent ? "border-[#b8f36b]/20" : undefined}>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-slate-400">{label}</p>
          <Icon size={18} className={accent ? "text-[#b8f36b]" : "text-slate-500"} />
        </div>
        <p className="mt-5 text-2xl font-semibold tracking-tight text-white">{value}</p>
        <p className="mt-2 text-xs text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}