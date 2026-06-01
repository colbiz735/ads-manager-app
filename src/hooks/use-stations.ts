import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../lib/api";
import { CreateStationDto, StationResponse } from "../types/interfaces";

export const STATION_KEYS = {
  stations: ["stations"] as const,
};

/**
 * Hook to retrieve remote asset station coordinates
 */
export function useFetchStations() {
  return useQuery({
    queryKey: STATION_KEYS.stations,
    queryFn: apiService.getStations,
    staleTime: 5 * 60 * 1000, // Station locations stay fresh for 5 minutes
  });
}

/**
 * Hook to create a station
 */
export function useCreateStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStationDto) =>
      apiService.createStation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STATION_KEYS.stations });
    },
  });
}

/**
 * Hook to update a station
 */
export function useUpdateStation(
  onCancelEdit: () => void,
  targetStation: StationResponse | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStationDto) =>
      apiService.updateStation(targetStation, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STATION_KEYS.stations });
      onCancelEdit();
    },
  });
}