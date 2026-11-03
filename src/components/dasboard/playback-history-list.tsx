import { PlaybackHistoryRecord } from "@/src/types/playback-history.types";
import { PlaybackHistoryCard } from "./playback-history-card";
import { Skeleton } from "@/components/ui/skeleton";

interface PlaybackHistoryListProps {
  records: PlaybackHistoryRecord[];
  isLoading: boolean;
}

export function PlaybackHistoryList({ records, isLoading }: PlaybackHistoryListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground font-medium">No playback records found</p>
        <p className="text-sm text-muted-foreground">Playback history will appear here once ads are played.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {records.map((record) => (
        <PlaybackHistoryCard key={record.id} record={record} />
      ))}
    </div>
  );
}
