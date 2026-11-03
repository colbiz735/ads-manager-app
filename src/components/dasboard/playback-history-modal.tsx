"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlaybackHistoryList } from "./playback-history-list";
import { PlaybackHistoryPagination } from "./playback-history-pagination";
import { PlaybackHistoryFilters, PlaybackHistoryCursor } from "@/src/types/playback-history.types";
import { usePlaybackHistory } from "@/src/hooks/usePlaybackHistory";
import { PlaybackHistoryFiltersPanel } from "./playback-history-filters";
import { useFetchStations } from "@/src/hooks/use-stations";
import { useFetchSchedules } from "@/src/hooks/use-schedules";

interface PlaybackHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationId?: string;
  scheduleId?: string;
  title: string;
}

export function PlaybackHistoryModal({
  isOpen,
  onClose,
  stationId,
  scheduleId,
  title,
}: PlaybackHistoryModalProps) {
  const [filters, setFilters] = useState<PlaybackHistoryFilters>({
    stationId,
    scheduleId,
    status: "all",
    startDate: "",
    endDate: "",
    limit: 5,
    cursor: null,
  });

  const [cursorStack, setCursorStack] = useState<(PlaybackHistoryCursor | null)[]>(
    [null],
  );
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const { data: stations } = useFetchStations();
  const { data: schedules } = useFetchSchedules();

  const { data, isLoading, isError, error } = usePlaybackHistory({
    ...filters,
    cursor: cursorStack[currentPageIndex],
  });

  const handleFilterChange = (newFilters: PlaybackHistoryFilters) => {
    setFilters({ ...newFilters, limit: 5 });
    setCursorStack([null]);
    setCurrentPageIndex(0);
  };

  const handleNext = () => {
    if (data?.pagination.hasMore && data.pagination.nextCursor) {
      const nextCursor = data.pagination.nextCursor;
      if (currentPageIndex + 1 === cursorStack.length) {
        setCursorStack((prev) => [...prev, nextCursor]);
      }
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Playback History: <span className="text-primary">{title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 py-4">
          <PlaybackHistoryFiltersPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            stations={stations || []}
            schedules={schedules || []}
            hideStationFilter={!!stationId}
            hideScheduleFilter={!!scheduleId}
          />

          {isError && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm mb-4">
              Failed to load playback history: {(error as Error).message}
            </div>
          )}

          <PlaybackHistoryList records={data?.data || []} isLoading={isLoading} />

          {!isLoading && !isError && (data?.data.length || 0) > 0 && (
            <PlaybackHistoryPagination
              onNext={handleNext}
              onPrevious={handlePrevious}
              hasMore={data?.pagination.hasMore ?? false}
              canGoBack={currentPageIndex > 0}
              isLoading={isLoading}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
