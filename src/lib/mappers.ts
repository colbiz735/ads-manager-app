import {
  CreateScheduleDto,
  CreateStationDto,
  ScheduleResponse,
  StationResponse,
} from "@/src/types/interfaces";

export function stationToDto(station: StationResponse): CreateStationDto {
  return {
    name: station.name,
    address: station.address ?? "",
    device: station.device ?? "",
    supportedCategories: station.supportedCategories ?? [],
  };
}

export function scheduleToDto(schedule: ScheduleResponse): CreateScheduleDto {
  return {
    mediaType: schedule.mediaType,
    mediaUrl: schedule.mediaUrl,
    mediaId: schedule.mediaId,
    duration: schedule.duration,
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    weekdays: schedule.weekdays ?? [],
    priority: schedule.priority,
    targetDevices: schedule.targetDevices ?? [],
    timeSlots: schedule.timeSlots ?? [],
    frequency: schedule.frequency ?? { type: "loop" },
    category: schedule.category,
    tags: schedule.tags ?? [],
    locationIds: schedule.locationIds ?? [],
    ownership: schedule.ownership,
    status: schedule.status,
  };
}
