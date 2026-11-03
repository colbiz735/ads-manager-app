import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaybackHistoryPaginationProps {
  onNext: () => void;
  onPrevious: () => void;
  hasMore: boolean;
  canGoBack: boolean;
  isLoading: boolean;
}

export function PlaybackHistoryPagination({
  onNext,
  onPrevious,
  hasMore,
  canGoBack,
  isLoading,
}: PlaybackHistoryPaginationProps) {
    
  return (
    <div className="flex items-center justify-between mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={!canGoBack || isLoading}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!hasMore || isLoading}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
