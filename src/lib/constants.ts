import { OwnershipType, ScheduleStatus } from "../types/enums";
import { CreateScheduleDto } from "../types/interfaces";

export const defaultCreateSchedule:CreateScheduleDto = {
      duration: 15,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      mediaId: '',
      mediaType: '',
      mediaUrl: '',
      weekdays: [],
      priority: 3,
      targetDevices: ['Raspberry'],
      timeSlots: [{ start: `${new Date().getHours()}:${new Date().getMinutes()}`, end: '00:00' }],
      frequency: { type: 'loop', intervalSeconds: 5 },
      category: '',
      tags: [],
      locationIds: [],
      ownership: OwnershipType.GLOBAL,
      status: ScheduleStatus.ACTIVE
    }