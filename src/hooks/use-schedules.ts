// src/hooks/use-schedules.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../lib/api";
import { scheduleToDto } from "../lib/mappers";
import { CreateScheduleDto, ScheduleResponse } from "../types/interfaces";
import { ScheduleStatus } from "../types/enums";

// Centralized cache keys
export const SCHEDULE_KEYS = {
  schedules: ["schedules-list"] as const,
};

/**
 * Hook to fetch active pipeline items
 */
export function useFetchSchedules() {
  return useQuery({
    queryKey: SCHEDULE_KEYS.schedules,
    queryFn: apiService.fetchSchedules,
  });
}

/**
 * Mutation hook to execute file file uploads to the dedicated media pipeline
 */
export function useUploadMedia() {
  return useMutation({
    mutationFn: (file: File) => apiService.uploadMedia(file),
  });
}

/**
 * Mutation hook to create a schedule
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateScheduleDto) => apiService.createSchedule(dto),
    onSuccess: () => {
      // Automatic invalidation tells TanStack Query to refresh the list
      // immediately upon successful schedule creation.
      queryClient.invalidateQueries({ queryKey: SCHEDULE_KEYS.schedules });
    },
  });
}

/**
 * Hook to update a schedule
 */
export function useUpdateSchedule(
  onCancelEdit: () => void,
  editTarget: ScheduleResponse | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateScheduleDto) =>
      apiService.updateSchedule(editTarget, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_KEYS.schedules });
      onCancelEdit();
    },
  });
}

/**
 * Hook to delete a schedule
 */
export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_KEYS.schedules });
    },
  });
}

/**
 * Hook to update schedule status
 */
export function useUpdateScheduleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      schedule,
      status,
    }: {
      schedule: ScheduleResponse;
      status: ScheduleStatus;
    }) =>
      apiService.updateSchedule(schedule, {
        ...scheduleToDto(schedule),
        status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_KEYS.schedules });
    },
  });
}
