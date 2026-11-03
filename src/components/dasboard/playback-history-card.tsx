import { PlaybackHistoryRecord } from "@/src/types/playback-history.types";
import { StatusBadge } from "./status-badge";
import { format } from "date-fns";
import { ScheduleResponse } from "@/src/types/interfaces";
import { Film } from "lucide-react";

interface PlaybackHistoryCardProps {
  record: PlaybackHistoryRecord;
  schedule?: ScheduleResponse;
}

export function PlaybackHistoryCard({
  record,
  schedule,
}: PlaybackHistoryCardProps) {
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const deriveMediaName = (url: string): string => {
    try {
      const pathname = new URL(url).pathname;
      const filename = pathname.split("/").pop() ?? "";

      return filename.replace(/\.[^/.]+$/, "").slice(0, 28) || "Untitled";
    } catch {
      return "Untitled";
    }
  };

  return (



    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {schedule?.mediaUrl ? (
            <div className="h-12 w-16 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
              {schedule.mediaType === "video" ? (
                <video
                  src={schedule.mediaUrl}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={schedule.mediaUrl}
                  alt="schedule thumbnail"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ) : (
            <div className="h-12 w-16 rounded-md overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center border border-slate-200">
              <Film size={18} className="text-slate-400" />
            </div>
          )}


          <div className="flex flex-col min-w-0">
            <h4 className="font-semibold text-sm truncate">
              {schedule ? deriveMediaName(schedule.mediaUrl) : "Unknown Ad"}
            </h4>


            <div className="flex items-center gap-2 mt-0.5 min-w-0">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium truncate">
                {record.stationName}
              </span>


              <span className="text-[10px] text-slate-300 shrink-0">•</span>
              <span className="text-[10px] text-muted-foreground capitalize truncate">
                {record.category}
              </span>
            </div>
          </div>
        </div>

        <StatusBadge
          status={record.status}
          type="playback"
          className="shrink-0"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-medium uppercase text-[10px]">
            Played At
          </span>
          <span>{format(new Date(record.playedAt), "MMM d, yyyy h:mm a")}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-medium uppercase text-[10px]">
            Completed At
          </span>
          <span>
            {format(new Date(record.completedAt), "MMM d, yyyy h:mm a")}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-medium uppercase text-[10px]">
            Scheduled Duration
          </span>
          <span>{record.scheduledDuration}s</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-medium uppercase text-[10px]">
            Actual Duration
          </span>
          <span className="font-medium text-blue-600">
            {formatDuration(record.actualDuration)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-3 border-t bg-slate-50/50 -mx-4 -mb-4 p-4 rounded-b-lg">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-[10px]">Device ID</span>
          <span className="truncate font-mono">{record.deviceId || "N/A"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-[10px]">Recorded On</span>
          <span>{format(new Date(record.createdAt), "MMM d, yyyy")}</span>
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <span className="text-muted-foreground text-[10px]">Record ID</span>
          <span className="truncate text-[10px] font-mono text-slate-400">
            {record.id}
          </span>
        </div>
      </div>
    </div>
  );
}
