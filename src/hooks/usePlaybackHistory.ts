import { useQuery } from "@tanstack/react-query";
import { PlaybackHistoryFilters } from "../types/playback-history.types";
import { apiService } from "../lib/api";

export const usePlaybackHistory = (filters: PlaybackHistoryFilters) => {
  return useQuery({
    queryKey: ["playback-history", filters],
    queryFn: () => apiService.fetchPlaybackHistory(filters),
  });
};
