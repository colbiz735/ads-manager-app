import {
  ActivityLevel,
  ConflictSeverity,
  ConflictType,
  RecommendationAction,
  SchedulingAnalysisFrequency,
  SchedulingDecision,
  TimingAssessment,
} from "@/src/types/interfaces";

const WEEKDAY_SHORT: Record<string, string> = {
  sunday: "Sun",
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
};

export function formatNumber(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return "0";
  return value.toLocaleString("en-US");
}

export function formatAnalysisDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatAnalysisDateRange(start?: string, end?: string): string {
  if (!start && !end) return "—";
  return `${formatAnalysisDate(start)} – ${formatAnalysisDate(end)}`;
}

function parseTimeParts(time: string): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!match) return null;
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

export function formatTime(time?: string): string {
  if (!time) return "—";
  const parts = parseTimeParts(time);
  if (!parts) return time;
  const date = new Date();
  date.setHours(parts.hours, parts.minutes, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTimeRange(start?: string, end?: string): string {
  if (!start && !end) return "—";
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function formatDuration(seconds?: number): string {
  if (seconds == null || Number.isNaN(seconds)) return "—";
  if (seconds === 1) return "1 second";
  return `${seconds} seconds`;
}

function formatIntervalSeconds(seconds: number): string {
  if (seconds < 60) {
    return seconds === 1 ? "Every second" : `Every ${seconds} seconds`;
  }
  if (seconds < 3600) {
    const minutes = Math.round(seconds / 60);
    if (minutes === 1) return "Every minute";
    return `Every ${minutes} minutes`;
  }
  if (seconds === 3600) return "Every hour";
  const hours = Math.round(seconds / 3600);
  return hours === 1 ? "Every hour" : `Every ${hours} hours`;
}

export function formatFrequency(freq?: SchedulingAnalysisFrequency): string {
  if (!freq) return "—";
  if (freq.type === "loop") return "Continuous rotation";
  if (freq.intervalSeconds != null) {
    return formatIntervalSeconds(freq.intervalSeconds);
  }
  return "Interval";
}

export function formatWeekdays(weekdays?: string[]): string {
  if (!weekdays?.length) return "All days";
  return weekdays
    .map((day) => WEEKDAY_SHORT[day.toLowerCase()] ?? day)
    .join(", ");
}

export function formatConfidence(confidence?: number): string {
  if (confidence == null || Number.isNaN(confidence)) return "—";
  const pct = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence);
  return `${pct}% confidence`;
}

export function getConfidencePercent(confidence?: number): number {
  if (confidence == null || Number.isNaN(confidence)) return 0;
  return confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence);
}

export const DECISION_LABELS: Record<
  SchedulingDecision,
  { title: string; description: string }
> = {
  recommended: {
    title: "Schedule Recommended",
    description: "Your proposed schedule looks suitable.",
  },
  warning: {
    title: "Schedule Can Proceed With Caution",
    description: "Review the details below before continuing.",
  },
  conflict: {
    title: "Scheduling Conflict Detected",
    description: "Conflicts were found that may affect delivery.",
  },
  not_recommended: {
    title: "Schedule Not Recommended",
    description: "We recommend adjusting your schedule before proceeding.",
  },
};

export const CONFLICT_TYPE_LABELS: Record<ConflictType, string> = {
  hard_conflict: "Scheduling Conflict",
  category_competition: "Category Competition",
  frequency_competition: "Frequency Competition",
  capacity_pressure: "Station Capacity Pressure",
};

export const SEVERITY_LABELS: Record<ConflictSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const TIMING_ASSESSMENT_LABELS: Record<TimingAssessment, string> = {
  favorable: "Favorable",
  moderate: "Moderate",
  unfavorable: "Unfavorable",
};

export const RECOMMENDATION_ACTION_LABELS: Record<RecommendationAction, string> = {
  proceed: "Proceed with this schedule",
  adjust_time: "Consider changing the time",
  adjust_frequency: "Consider changing the frequency",
  adjust_stations: "Consider changing the selected stations",
  adjust_date: "Consider changing the schedule dates",
};

export function getDecisionStyles(decision: SchedulingDecision) {
  switch (decision) {
    case "recommended":
      return {
        icon: "check",
        border: "border-emerald-200",
        bg: "bg-emerald-50/60",
        title: "text-emerald-900",
        text: "text-emerald-800",
        badge: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
        bar: "bg-emerald-500",
      };
    case "warning":
      return {
        icon: "alert",
        border: "border-amber-200",
        bg: "bg-amber-50/60",
        title: "text-amber-900",
        text: "text-amber-800",
        badge: "bg-amber-100 text-amber-800 ring-amber-600/20",
        bar: "bg-amber-500",
      };
    case "conflict":
      return {
        icon: "x",
        border: "border-red-200",
        bg: "bg-red-50/60",
        title: "text-red-900",
        text: "text-red-800",
        badge: "bg-red-100 text-red-800 ring-red-600/20",
        bar: "bg-red-500",
      };
    case "not_recommended":
      return {
        icon: "x",
        border: "border-orange-200",
        bg: "bg-orange-50/60",
        title: "text-orange-900",
        text: "text-orange-800",
        badge: "bg-orange-100 text-orange-800 ring-orange-600/20",
        bar: "bg-orange-500",
      };
  }
}

export function getSeverityStyles(severity: ConflictSeverity) {
  switch (severity) {
    case "high":
      return "bg-red-50 text-red-700 ring-red-600/20";
    case "medium":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    case "low":
      return "bg-slate-50 text-slate-600 ring-slate-600/10";
  }
}

export function getActivityStyles(level: ActivityLevel) {
  switch (level) {
    case "high":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "medium":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    case "low":
      return "bg-slate-50 text-slate-600 ring-slate-600/10";
  }
}

export function getTimingAssessmentStyles(assessment: TimingAssessment) {
  switch (assessment) {
    case "favorable":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "moderate":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    case "unfavorable":
      return "bg-red-50 text-red-700 ring-red-600/20";
  }
}
