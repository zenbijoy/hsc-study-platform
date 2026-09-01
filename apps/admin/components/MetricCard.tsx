import type { LucideIcon } from 'lucide-react';

export function MetricCard({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/10 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-white/[0.06] p-3"><Icon className="h-5 w-5 text-[#57E0B7]" /></div>
        <span className="text-[11px] font-bold uppercase tracking-[.18em] text-white/35">Live</span>
      </div>
      <div className="mt-7 text-3xl font-black tracking-tight">{value}</div>
      <div className="mt-2 text-sm font-semibold text-white/70">{label}</div>
      <div className="mt-1 text-xs text-white/35">{hint}</div>
    </div>
  );
}
