import { cn } from "@/lib/utils";
import {
  getScheduleStatusStyle,
  getStationHealthStatusStyle,
  getStationStatusStyle,
} from "@/src/lib/status-styles";

interface StatusBadgeProps {
  status: string;
  type: "schedule" | "station";
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const style =
    type === "schedule"
      ? getScheduleStatusStyle(status)
      : ["active", "inactive"].includes(status)
        ? getStationHealthStatusStyle(status)
        : getStationStatusStyle(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset",
        style.badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", style.dot)} />
      {style.label}
    </span>
  );
}
