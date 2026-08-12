import { AdCategory, ScheduleStatus, StationStatus, Weekdays } from "./enums";

export type MediaType = "image" | "video" | "audio" | string;

export type Weekday =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export type ScheduleStatusType = ScheduleStatus | "inactive";

export interface TimeSlot {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface FrequencyConfiguration {
  intervalSeconds?: number;
  type: "loop" | "once" | string;
}

export type OwnershipType = "global" | "local";

export interface CreateStationDto {
  name: string;
  address: string;
  device: string;
  supportedCategories: AdCategory[];
  status?: StationStatus;
}

export interface StationResponse {
  id: string;
  name: string;
  address: string;
  status: StationStatus | string;
  healthStatus: string;
  device: string;
  supportedCategories: AdCategory[];
  created_at: string;
  updated_at: string;
}

export interface CreateScheduleDto {
  mediaType: MediaType;
  mediaUrl: string;
  mediaId: string;
  duration: number;
  startDate: string;
  endDate: string;
  weekdays: Weekday[];
  priority: number;
  targetDevices: string[];
  timeSlots: TimeSlot[];
  frequency: FrequencyConfiguration;
  category: AdCategory | string;
  tags: string[];
  locationIds: string[];
  ownership: OwnershipType;
  status: ScheduleStatusType;
}

export interface ScheduleResponse {
  id: string; // UUID
  mediaUrl: string;
  mediaId: string;
  mediaType: MediaType | string;
  duration: number; // in seconds
  startDate: string; // ISO Date String
  endDate: string; // ISO Date String
  weekdays: Weekday[];
  priority: number;
  targetDevices: string[];
  timeSlots: TimeSlot[];
  frequency: FrequencyConfiguration;
  category: AdCategory;
  tags: string[];
  ownership: OwnershipType;
  status: ScheduleStatusType;
  locationIds: string[];
  created_at: string; // ISO Date String
  updated_at: string; // ISO Date String
}

  export const WEEKDAY_LABELS: { value: Weekday; label: string }[] = [
    { value: Weekdays.MONDAY, label: "Mon" },
    { value: Weekdays.TUESDAY, label: "Tue" },
    { value: Weekdays.WEDNESDAY, label: "Wed" },
    { value: Weekdays.THURSDAY, label: "Thu" },
    { value: Weekdays.FRIDAY, label: "Fri" },
    { value: Weekdays.SATURDAY, label: "Sat" },
    { value: Weekdays.SUNDAY, label: "Sun" },
  ];