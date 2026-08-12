import {
  ScheduleStatus,
  StationHealthStatus,
  StationStatus,
} from "@/src/types/enums";

export type StatusVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

interface StatusStyle {
  dot: string;
  text: string;
  badge: string;
  label: string;
}

const SCHEDULE_STATUS_STYLES: Record<ScheduleStatus, StatusStyle> = {
  [ScheduleStatus.ACTIVE]: {
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    label: "Active",
  },
  [ScheduleStatus.PAUSED]: {
    dot: "bg-amber-500",
    text: "text-amber-600",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    label: "Paused",
  },
  [ScheduleStatus.SUSPENDED]: {
    dot: "bg-orange-500",
    text: "text-orange-600",
    badge: "bg-orange-50 text-orange-700 ring-orange-600/20",
    label: "Suspended",
  },
  // [ScheduleStatus.CANCELLED]: {
  //   dot: "bg-red-500",
  //   text: "text-red-600",
  //   badge: "bg-red-50 text-red-700 ring-red-600/20",
  //   label: "Cancelled",
  // },
};

const STATION_STATUS_STYLES: Record<StationStatus, StatusStyle> = {
  [StationStatus.APPROVED]: {
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    label: "Approved",
  },
  [StationStatus.UNDER_REVIEW]: {
    dot: "bg-blue-500",
    text: "text-blue-600",
    badge: "bg-blue-50 text-blue-700 ring-blue-600/20",
    label: "Under Review",
  },
  [StationStatus.SUSPENDED]: {
    dot: "bg-amber-500",
    text: "text-amber-600",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    label: "Suspended",
  },
  [StationStatus.BLOCKED]: {
    dot: "bg-red-500",
    text: "text-red-600",
    badge: "bg-red-50 text-red-700 ring-red-600/20",
    label: "Blocked",
  },
};

const FALLBACK_STYLE: StatusStyle = {
  dot: "bg-slate-300",
  text: "text-slate-400",
  badge: "bg-slate-50 text-slate-600 ring-slate-600/10",
  label: "Unknown",
};

const STATION_HEALTH_STATUS_STYLE: Record<StationHealthStatus, StatusStyle> = {
  [StationHealthStatus.ACTIVE]: {
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    label: "Active",
  },
  [StationHealthStatus.IN_ACTIVE]: {
    dot: "bg-red-500",
    text: "text-red-600",
    badge: "bg-red-50 text-red-700 ring-red-600/20",
    label: "In Active",
  },
};

export function getScheduleStatusStyle(status: string): StatusStyle {
  return (
    SCHEDULE_STATUS_STYLES[status as ScheduleStatus] ?? {
      ...FALLBACK_STYLE,
      label: status.replace(/-/g, " "),
    }
  );
}

export function getStationStatusStyle(status: string): StatusStyle {
  return (
    STATION_STATUS_STYLES[status as StationStatus] ?? {
      ...FALLBACK_STYLE,
      label: status.replace(/-/g, " "),
    }
  );
}

export function getStationHealthStatusStyle(status: string): StatusStyle {
  return (
    STATION_HEALTH_STATUS_STYLE[status as StationHealthStatus] ?? {
      ...FALLBACK_STYLE,
      label: status.replace(/-/g, " "),
    }
  );
}

export const ALL_SCHEDULE_STATUSES = Object.values(ScheduleStatus);
export const ALL_STATION_STATUSES = Object.values(StationStatus);
export const ALL_STATION_HEALTH_STATUSES = Object.values(StationHealthStatus);
