import { PlaybackHistoryRecord } from "@/src/types/playback-history.types";
import { StatusBadge } from "./status-badge";
import { format } from "date-fns";

interface PlaybackHistoryCardProps {
  record: PlaybackHistoryRecord;
}

export function PlaybackHistoryCard({ record }: PlaybackHistoryCardProps) {
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h4 className="font-semibold text-sm">{record.stationName}</h4>
          <span className="text-xs text-muted-foreground capitalize">
            {record.category}
          </span>
        </div>
        <StatusBadge status={record.status} type="playback" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">Played At</span>
          <span>
            {format(new Date(record.playedAt), 'MMM d, yyyy h:mm a')}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">Completed At</span>
          <span>
            {format(new Date(record.completedAt), 'MMM d, yyyy h:mm a')}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">Scheduled Duration</span>
          <span>{record.scheduledDuration}s</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">Actual Duration</span>
          <span>{formatDuration(record.actualDuration)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2 border-t">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">Device ID</span>
          <span className="truncate">{record.deviceId || "N/A"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">Created At</span>
          <span>
            {format(new Date(record.createdAt), 'MMM d, yyyy h:mm a')}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">Record ID</span>
          <span className="truncate text-[10px] font-mono">{record.id}</span>
        </div>
      </div>
    </div>
  );
}
