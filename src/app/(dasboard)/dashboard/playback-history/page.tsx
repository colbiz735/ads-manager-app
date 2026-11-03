"use client";

import { useState } from "react";
import { History } from "lucide-react";
import {
  PlaybackHistoryCursor,
  PlaybackHistoryFilters,
} from "@/src/types/playback-history.types";
import { usePlaybackHistory } from "@/src/hooks/usePlaybackHistory";
import { PlaybackHistoryList } from "@/src/components/dasboard/playback-history-list";
import { PlaybackHistoryPagination } from "@/src/components/dasboard/playback-history-pagination";
import { PlaybackHistoryFiltersPanel } from "@/src/components/dasboard/playback-history-filters";
import { useFetchStations } from "@/src/hooks/use-stations";
import { useFetchSchedules } from "@/src/hooks/use-schedules";

export default function PlaybackHistoryPage() {
  const [filters, setFilters] = useState<PlaybackHistoryFilters>({
    status: "all",
    startDate: "",
    endDate: "",
    limit: 10,
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
    setFilters({ ...newFilters, limit: 10 });
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
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <History className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Playback History
          </h1>
          <p className="text-slate-500">
            View and track all ad playback activities across your network.
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <PlaybackHistoryFiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          stations={stations || []}
          schedules={schedules || []}
        />

        {isError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm mb-6">
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
    </div>
  );
}
