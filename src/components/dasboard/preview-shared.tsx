import { LucideIcon } from "lucide-react";

export function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <Icon size={12} className="text-slate-400" />
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        {children}
      </span>
    </div>
  );
}

export function Chip({
  active,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${
        active ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"
      }`}
    >
      {children}
    </span>
  );
}
