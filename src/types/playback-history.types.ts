export interface PlaybackHistoryCursor {
  playedAt: string;
  id: string;
}

export interface PlaybackHistoryRecord {
  id: string;
  stationId: string;
  scheduleId: string;
  deviceId: string | null;
  stationName: string;
  category: string;
  playedAt: string;
  completedAt: string;
  scheduledDuration: number;
  actualDuration: number;
  status: string;
  createdAt: string;
}

export interface PlaybackHistoryPagination {
  limit: number;
  hasMore: boolean;
  nextCursor: PlaybackHistoryCursor | null;
}

export interface PlaybackHistoryResponse {
  message: string;
  data: PlaybackHistoryRecord[];
  pagination: PlaybackHistoryPagination;
}

export interface PlaybackHistoryFilters {
  stationId?: string;
  scheduleId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  cursor?: PlaybackHistoryCursor | null;
}
