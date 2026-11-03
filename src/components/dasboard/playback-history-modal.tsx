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
import { PlaybackHistoryCursor } from "@/src/types/playback-history.types";
import { usePlaybackHistory } from "@/src/hooks/usePlaybackHistory";

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
  const [cursorStack, setCursorStack] = useState<(PlaybackHistoryCursor | null)[]>([null]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const limit = 5;

  const currentCursor = cursorStack[currentPageIndex];

  const { data, isLoading, isError, error } = usePlaybackHistory({
    stationId,
    scheduleId,
    limit,
    cursor: currentCursor,
  });

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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Playback History: {title}</DialogTitle>
        </DialogHeader>

        {isError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
            Failed to load playback history: {(error as Error).message}
          </div>
        )}

        <PlaybackHistoryList 
          records={data?.data || []} 
          isLoading={isLoading} 
        />

        {!isLoading && !isError && (data?.data.length || 0) > 0 && (
          <PlaybackHistoryPagination
            onNext={handleNext}
            onPrevious={handlePrevious}
            hasMore={data?.pagination.hasMore ?? false}
            canGoBack={currentPageIndex > 0}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
