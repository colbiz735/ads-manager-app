import {
  ClientTracker,
  ParsedClientTracker,
  ScheduleResponse,
  TrackerAd,
  TrackerDeviceMeta,
  TrackerPlaybackEntry,
  TrackerSyncSession,
} from "@/src/types/interfaces";

function safeParseJson<T>(value: string | undefined | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function parseClientTracker(raw: ClientTracker): ParsedClientTracker {
  return {
    stationId: raw.stationId,
    ads: safeParseJson<TrackerAd[]>(raw.ads, []),
    syncSession: safeParseJson<TrackerSyncSession | null>(raw.syncSession, null),
    playBackTracking: safeParseJson<TrackerPlaybackEntry[]>(
      raw.playBackTracking,
      [],
    ),
    deviceMeta: safeParseJson<TrackerDeviceMeta | null>(raw.deviceMeta, null),
    databaseMeta: safeParseJson<Record<string, unknown> | null>(
      raw.databaseMeta,
      null,
    ),
  };
}

export function trackerAdToSchedule(ad: TrackerAd): ScheduleResponse {
  if (ad.payload) {
    try {
      const payload = JSON.parse(ad.payload) as Record<string, unknown>;
      return {
        id: String(payload.id ?? ad.id),
        mediaUrl: String(payload.mediaUrl ?? ad.mediaUrl),
        mediaId: String(payload.mediaId ?? ""),
        mediaType: String(payload.mediaType ?? ad.mediaType),
        duration: Number(payload.duration ?? ad.duration),
        startDate: String(payload.startDate ?? ad.startDate),
        endDate: String(payload.endDate ?? ad.endDate),
        weekdays: (payload.weekdays as ScheduleResponse["weekdays"]) ?? [],
        priority: Number(payload.priority ?? ad.priority),
        targetDevices: (payload.targetDevices as string[]) ?? [],
        timeSlots:
          (payload.timeSlots as ScheduleResponse["timeSlots"]) ??
          safeParseJson(ad.timeSlots, []),
        frequency:
          (payload.frequency as ScheduleResponse["frequency"]) ??
          safeParseJson(ad.frequency, { type: "loop" }),
        category: String(payload.category ?? ad.category) as ScheduleResponse["category"],
        tags: (payload.tags as string[]) ?? [],
        ownership: (payload.ownership as ScheduleResponse["ownership"]) ?? "global",
        status: String(payload.status ?? ad.status) as ScheduleResponse["status"],
        locationIds:
          (payload.locationIds as string[]) ??
          (payload.locations as string[]) ??
          [],
        created_at: String(payload.created_at ?? ad.createdAt ?? ""),
        updated_at: String(payload.updated_at ?? ad.updatedAt ?? ""),
      };
    } catch {
      /* fall through to field mapping */
    }
  }

  return {
    id: ad.id,
    mediaUrl: ad.mediaUrl,
    mediaId: "",
    mediaType: ad.mediaType,
    duration: ad.duration,
    startDate: ad.startDate,
    endDate: ad.endDate,
    weekdays: safeParseJson(ad.weekdays, []),
    priority: ad.priority,
    targetDevices: [],
    timeSlots: safeParseJson(ad.timeSlots, []),
    frequency: safeParseJson(ad.frequency, { type: "loop" }),
    category: ad.category as ScheduleResponse["category"],
    tags: [],
    ownership: "global",
    status: ad.status as ScheduleResponse["status"],
    locationIds: [],
    created_at: ad.createdAt ?? "",
    updated_at: ad.updatedAt ?? "",
  };
}

export function deriveMediaName(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").pop() ?? "";
    return filename.replace(/\.[^/.]+$/, "") || "Untitled";
  } catch {
    return "Untitled";
  }
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "—";
  const gb = bytes / (1024 ** 3);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 ** 2);
  return `${mb.toFixed(0)} MB`;
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function hasTrackerResponse(raw: ClientTracker): boolean {
  return Boolean(
    raw.ads !== undefined ||
      raw.syncSession !== undefined ||
      raw.playBackTracking !== undefined ||
      raw.deviceMeta !== undefined ||
      raw.databaseMeta !== undefined,
  );
}
