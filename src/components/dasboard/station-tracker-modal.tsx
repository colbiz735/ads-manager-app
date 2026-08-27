"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertCircle,
  Clock,
  Cpu,
  Database,
  Film,
  HardDrive,
  Image as ImageIcon,
  Loader2,
  MemoryStick,
  Monitor,
  RefreshCcw,
  Server,
  Wifi,
  WifiOff,
  History,
} from "lucide-react";
import {
  ClientTracker,
  ParsedClientTracker,
  ScheduleResponse,
  StationResponse,
  StationTrackingRequest,
} from "@/src/types/interfaces";
import {
  deriveMediaName,
  formatBytes,
  formatRelativeTime,
  parseClientTracker,
  trackerAdToSchedule,
} from "@/src/lib/client-tracker-utils";
import { SectionLabel } from "./preview-shared";
import { StatusBadge } from "./status-badge";
import SchedulePreviewModal from "./schedule-preview-modal";
import { useTrackStationHistory } from "@/src/hooks/use-stations";
import { useDashboardState } from "@/src/context/dashboard-state-context";

const TRACK_TIMEOUT_MS = 30_000;

function UsageBar({
  label,
  value,
  detail,
  accent = "bg-slate-800",
}: {
  label: string;
  value: number;
  detail: string;
  accent?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-[11px] text-slate-400 tabular-nums">
          {detail}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${accent}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TrackerSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 space-y-2"
          >
            <div className="h-2.5 w-16 bg-slate-100 rounded" />
            <div className="h-5 w-10 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-slate-100 p-4 space-y-3">
        <div className="h-3 w-28 bg-slate-100 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-slate-50">
              <div className="h-14 w-20 rounded-md bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-slate-100 rounded" />
                <div className="h-2.5 w-16 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-slate-100 p-4 space-y-3">
        <div className="h-3 w-24 bg-slate-100 rounded" />
        <div className="h-2 w-full bg-slate-100 rounded" />
        <div className="h-2 w-full bg-slate-100 rounded" />
      </div>
    </div>
  );
}

function StatusBanner({
  request,
  trackingHistoryLoaded,
}: {
  request: StationTrackingRequest;
  trackingHistoryLoaded: boolean;
}) {
  if (request.status === "loading") {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-blue-100 bg-blue-50/60 px-3.5 py-2.5">
        <Loader2 size={15} className="text-blue-600 animate-spin shrink-0" />
        <div>
          <p className="text-xs font-medium text-blue-800">Querying station…</p>
          <p className="text-[11px] text-blue-600/80">
            Waiting for the station to respond
          </p>
        </div>
      </div>
    );
  }

  if (request.status === "success") {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3.5 py-2.5">
        <Wifi size={15} className="text-emerald-600 shrink-0" />
        <div>
          <p className="text-xs font-medium text-emerald-800">
            Metadata received
          </p>
          {request.receivedAt && (
            <p className="text-[11px] text-emerald-600/80">
              Updated{" "}
              {formatRelativeTime(new Date(request.receivedAt).toISOString())}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (request.status === "timeout" || !trackingHistoryLoaded) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-amber-100 bg-amber-50/60 px-3.5 py-2.5">
        <Clock size={15} className="text-amber-600 shrink-0" />
        <div>
          <p className="text-xs font-medium text-amber-800">
            Response timed out
          </p>
          <p className="text-[11px] text-amber-600/80">
            The station did not respond within {TRACK_TIMEOUT_MS / 1000}s. It
            may be offline or unreachable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-red-100 bg-red-50/60 px-3.5 py-2.5">
      <AlertCircle size={15} className="text-red-600 shrink-0" />
      <div>
        <p className="text-xs font-medium text-red-800">
          Tracking request failed
        </p>
        <p className="text-[11px] text-red-600/80">
          {request.errorMessage ??
            "Unable to reach the station. Please try again."}
        </p>
      </div>
    </div>
  );
}

function AdCard({
  schedule,
  lastPlayedAt,
  onClick,
}: {
  schedule: ScheduleResponse;
  lastPlayedAt?: string;
  onClick: () => void;
}) {
  const isVideo = schedule.mediaType === "video";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-colors text-left w-full group"
    >
      <div className="h-14 w-20 rounded-md overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
        {isVideo ? (
          <video
            src={schedule.mediaUrl}
            preload="metadata"
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : schedule.mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={schedule.mediaUrl}
            alt={deriveMediaName(schedule.mediaUrl)}
            className="h-full w-full object-cover"
          />
        ) : (
          <Film size={18} className="text-slate-300" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-slate-900">
          {deriveMediaName(schedule.mediaUrl)}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <StatusBadge status={schedule.status} type="schedule" />
          <span className="text-[10px] text-slate-400 capitalize">
            {schedule.category?.replace(/_/g, " ")}
          </span>
          <span className="text-[10px] text-slate-400 tabular-nums">
            · {schedule.duration}s
          </span>
        </div>
        {lastPlayedAt && (
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <Clock size={10} />
            Last played {formatRelativeTime(lastPlayedAt)}
          </p>
        )}
      </div>
      <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
        {isVideo ? (
          <Film size={14} className="text-slate-400" />
        ) : (
          <ImageIcon size={14} className="text-slate-400" />
        )}
      </div>
    </button>
  );
}

function TrackerContent({ data }: { data: ParsedClientTracker }) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const schedules = useMemo(
    () => data.ads.map(trackerAdToSchedule),
    [data.ads],
  );

  const playbackMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of data.playBackTracking) {
      map.set(entry.scheduleId, entry.lastPlayedAt);
    }
    return map;
  }, [data.playBackTracking]);

  const memoryUsedPct = data.deviceMeta
    ? Math.round(
        (data.deviceMeta.memory.usedGB / data.deviceMeta.memory.totalGB) * 100,
      )
    : 0;

  return (
    <>
      {/* Sync overview */}
      <div>
        <SectionLabel icon={Activity}>Sync Status</SectionLabel>
        {data.syncSession ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Status
              </p>
              <StatusBadge status={data.syncSession.status} type="schedule" />
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Last Sync
              </p>
              <p className="text-xs font-medium text-slate-700">
                {data.syncSession.lastSyncAt || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Items
              </p>
              <p className="text-xs font-medium text-slate-700 tabular-nums">
                {data.syncSession.totalItems} total
                {data.syncSession.failedItems > 0 && (
                  <span className="text-red-500 ml-1">
                    · {data.syncSession.failedItems} failed
                  </span>
                )}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Duration
              </p>
              <p className="text-xs font-medium text-slate-700 tabular-nums">
                {data.syncSession.lastSyncDurationMs}ms
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-2">
            Sync session data unavailable.
          </p>
        )}
        {data.syncSession?.lastError && (
          <p className="text-[11px] text-red-500 mt-2">
            Last error: {data.syncSession.lastError}
          </p>
        )}
      </div>

      <Separator />

      {/* Active ads */}
      <div>
        <SectionLabel icon={Film}>
          Currently Playing ({schedules.length})
        </SectionLabel>
        {schedules.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {schedules.map((schedule, index) => (
              <AdCard
                key={schedule.id}
                schedule={schedule}
                lastPlayedAt={playbackMap.get(schedule.id)}
                onClick={() => setPreviewIndex(index)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/30">
            <Film size={22} className="text-slate-200" />
            <p className="text-xs text-slate-400">
              No ads currently loaded on this station.
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Device info */}
      <div>
        <SectionLabel icon={Monitor}>Device</SectionLabel>
        {data.deviceMeta ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Server size={12} className="text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    System
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700">
                  {data.deviceMeta.os.distro}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {data.deviceMeta.os.hostname} · {data.deviceMeta.os.arch}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Cpu size={12} className="text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Processor
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700">
                  {data.deviceMeta.cpu.brand}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {data.deviceMeta.cpu.cores} cores ·{" "}
                  {data.deviceMeta.cpu.manufacturer}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <MemoryStick size={12} className="text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Memory
                  </span>
                </div>
                <UsageBar
                  label="RAM usage"
                  value={memoryUsedPct}
                  detail={`${data.deviceMeta.memory.usedGB.toFixed(1)} / ${data.deviceMeta.memory.totalGB.toFixed(1)} GB`}
                  accent={
                    memoryUsedPct > 85
                      ? "bg-red-500"
                      : memoryUsedPct > 70
                        ? "bg-amber-500"
                        : "bg-slate-800"
                  }
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <HardDrive size={12} className="text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Storage ({data.deviceMeta.storage.mount})
                  </span>
                </div>
                <UsageBar
                  label="Disk usage"
                  value={data.deviceMeta.storage.usePercent}
                  detail={`${formatBytes(data.deviceMeta.storage.available)} free`}
                  accent={
                    data.deviceMeta.storage.usePercent > 90
                      ? "bg-red-500"
                      : data.deviceMeta.storage.usePercent > 75
                        ? "bg-amber-500"
                        : "bg-slate-800"
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-2">
            Device metadata unavailable.
          </p>
        )}
      </div>

      {/* Database meta */}
      {data.databaseMeta && (
        <>
          <Separator />
          <div>
            <SectionLabel icon={Database}>Local Database</SectionLabel>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <pre className="text-[11px] text-slate-600 font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(data.databaseMeta, null, 2)}
              </pre>
            </div>
          </div>
        </>
      )}

      {/* Playback history (when no ads match but history exists) */}
      {data.playBackTracking.length > 0 && schedules.length === 0 && (
        <>
          <Separator />
          <div>
            <SectionLabel icon={Clock}>Recent Playback</SectionLabel>
            <div className="space-y-1.5">
              {data.playBackTracking.map((entry) => (
                <div
                  key={entry.scheduleId}
                  className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-50"
                >
                  <span className="font-mono text-slate-500 truncate max-w-[60%]">
                    {entry.scheduleId.slice(0, 8)}…
                  </span>
                  <span className="text-slate-400 tabular-nums">
                    {formatRelativeTime(entry.lastPlayedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {previewIndex !== null && (
        <SchedulePreviewModal
          schedules={schedules}
          initialIndex={previewIndex}
          open={previewIndex !== null}
          onOpenChange={(open) => !open && setPreviewIndex(null)}
        />
      )}
    </>
  );
}

interface StationTrackerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientTracker: ClientTracker;
  onRetry: () => void;
  isRetrying: boolean;
  station: StationResponse | null
}

export default function StationTrackerModal({
  open,
  onOpenChange,
  clientTracker,
  onRetry,
  isRetrying,
  station,
}: StationTrackerModalProps) {
  const trackingHistory = useTrackStationHistory();

  const { setClientTracker, trackingRequest, setTrackingRequest } = useDashboardState();

  const parsed = useMemo(
    () =>
      trackingRequest?.status === "success" || trackingHistory.isSuccess
        ? parseClientTracker(clientTracker)
        : null,
    [clientTracker, trackingRequest?.status, trackingHistory.isSuccess],
  );

  const showContent =
    (trackingRequest?.status === "success" && parsed) ||
    (trackingHistory.isSuccess && parsed);
  const showSkeleton = trackingRequest?.status === "loading";
  const showFailure =
    trackingRequest?.status === "error" ||
    trackingRequest?.status === "timeout";

  const handleTrackingHistory = async () => {
    if (!trackingRequest) return;

    if (!station) return;

    trackingHistory.mutateAsync(station.id).then((history) => {
      if (!history) return;
      setTrackingRequest(null)
      setClientTracker(history);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-3xl p-0 gap-0 overflow-hidden border-slate-200 sm:rounded-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Activity size={16} className="text-blue-600 shrink-0" />
                Station Tracking
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1 truncate">
                {trackingRequest?.stationName ?? "Unknown station"}
              </DialogDescription>
            </div>
            {trackingRequest && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                disabled={isRetrying || trackingRequest.status === "loading"}
                className="h-7 text-xs shrink-0"
              >
                <RefreshCcw
                  size={12}
                  className={isRetrying ? "animate-spin" : ""}
                />
                Refresh
              </Button>
            )}
          </div>
          {trackingRequest && (
            <div className="mt-3">
              <StatusBanner
                request={trackingRequest}
                trackingHistoryLoaded={trackingHistory.isSuccess}
              />
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            {showSkeleton && <TrackerSkeleton />}

            {showFailure && (
                <div className="flex flex-col items-center py-12 gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <WifiOff size={24} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 text-center max-w-xs">
                    {trackingRequest?.status === "timeout"
                      ? "The station didn't respond in time. It may be offline or experiencing connectivity issues."
                      : "We couldn't initiate the tracking request. Check your connection and try again."}
                  </p>
                  <Button
                    size="sm"
                    onClick={handleTrackingHistory}
                    disabled={isRetrying}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    {trackingHistory.isPending ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Loading tracking history...
                      </>
                    ) : (
                      <>
                        <History size={14} />
                        Fetch tracking history
                      </>
                    )}
                  </Button>
                </div>
              )}

            {showContent && <TrackerContent data={parsed} />}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export { TRACK_TIMEOUT_MS };
