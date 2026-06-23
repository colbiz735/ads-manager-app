import { AdCategory } from "./enums";

export type MediaType = "image" | "video" | "audio" | string;

export type Weekday =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export type ScheduleStatus = "active" | "inactive" | "paused";

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
}

export interface StationResponse {
  id: string;
  name: string;
  address: string;
  status: string;
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
  status: ScheduleStatus;
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
  status: ScheduleStatus;
  locationIds: string[];
  created_at: string; // ISO Date String
  updated_at: string; // ISO Date String
}
