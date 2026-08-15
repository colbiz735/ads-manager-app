import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../lib/api";
import { stationToDto } from "../lib/mappers";
import { CreateStationDto, StationResponse } from "../types/interfaces";
import { StationStatus } from "../types/enums";

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

/**
 * Hook to delete a station
 */
export function useDeleteStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteStation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STATION_KEYS.stations });
    },
  });
}

/**
 * Hook to update station status
 */
export function useUpdateStationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      station,
      status,
    }: {
      station: StationResponse;
      status: StationStatus;
    }) =>
      apiService.updateStation(station, {
        ...stationToDto(station),
        status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STATION_KEYS.stations });
    },
  });
}

/**
 * Hook to track a station
 */
export function useTrackStation() {
  return useMutation({
    mutationFn: (id: string) => apiService.trackStation(id),
  });
}

/**
 * Hook to refresh a station
 */
export function useRefreshStation() {
  return useMutation({
    mutationFn: (id: string) => apiService.refreshStation(id),
  });
}

/**
 * Hook to check a station activeness
 */
export function useCheckStationActiveness() {
  return useMutation({
    mutationFn: (id: string) => apiService.checkStationActiveness(id),
  });
}
