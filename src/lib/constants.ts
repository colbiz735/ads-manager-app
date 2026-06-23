import { OwnershipType, ScheduleStatus } from "../types/enums";
import { CreateScheduleDto, ScheduleResponse } from "../types/interfaces";

export const defaultCreateSchedule: CreateScheduleDto = {
  duration: 15,
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  mediaId: "",
  mediaType: "",
  mediaUrl: "",
  weekdays: [],
  priority: 3,
  targetDevices: ["Raspberry"],
  timeSlots: [
    {
      start: `${new Date().getHours()}:${new Date().getMinutes()}`,
      end: "00:00",
    },
  ],
  frequency: { type: "loop" },
  category: "",
  tags: [],
  locationIds: [],
  ownership: OwnershipType.GLOBAL,
  status: ScheduleStatus.ACTIVE,
};

export const fillEditTarget = (editTarget: ScheduleResponse) => {
  return {
    duration: editTarget.duration,
    startDate: new Date(editTarget.startDate).toISOString().split("T")[0],
    endDate: new Date(editTarget.endDate).toISOString().split("T")[0],
    mediaId: editTarget.mediaId,
    mediaType: editTarget.mediaType,
    mediaUrl: editTarget.mediaUrl,
    weekdays: editTarget.weekdays || [],
    priority: editTarget.priority || 3,
    targetDevices: editTarget.targetDevices || ["Raspberry"],
    timeSlots: [
      {
        start: editTarget.timeSlots[0].start || "00:00",
        end: editTarget.timeSlots[0].end || "00:00",
      },
    ],
    frequency: editTarget.frequency || { type: "loop" },
    category: editTarget.category,
    tags: editTarget.tags || [],
    locationIds: editTarget.locationIds || [],
    ownership: editTarget.ownership || OwnershipType.GLOBAL,
    status: editTarget.status || ScheduleStatus.ACTIVE,
  };
};
