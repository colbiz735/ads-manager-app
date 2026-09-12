import {
  ScheduleResponse,
  CreateScheduleDto,
  MediaType,
  StationResponse,
  CreateStationDto,
  ClientTracker,
  SchedulingAnalysisResponse,
} from "../types/interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiService = {
  /**
   * Fetches all registered stations
   */
  async getStations(): Promise<StationResponse[]> {
    const response = await fetch(`${API_BASE_URL}/v1/ads/stations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stations: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Dispatches the structured DTO payload to create a station
   */
  async createStation(dto: CreateStationDto): Promise<StationResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/ads/station/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create station: ${response.statusText}`,
      );
    }

    const result = await response.json();
    return result?.data;
  },

  /**
   * Update a station
   */
  async updateStation(
    station: StationResponse | null,
    dto: CreateStationDto,
  ): Promise<StationResponse | void> {
    if (!station) {
      return;
    }
    const response = await fetch(
      `${API_BASE_URL}/v1/ads/station/update/?id=${station.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dto),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update station: ${response.statusText}`,
      );
    }

    const result = await response.json();
    return result?.data;
  },

  /**
   * Uploads raw media files
   */
  async uploadMedia(
    file: File,
  ): Promise<{ mediaUrl: string; mediaId: string; mediaType: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/v1/ads/media/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Media upload failed: ${response.statusText}`);
    }
    const result = await response.json();
    return result?.data as Promise<{
      mediaUrl: string;
      mediaId: string;
      mediaType: MediaType;
    }>;
  },

  /**
   * Delete uploaded media
   */
  async deleteMedia(mediaId: string, mediaUrl: string): Promise<boolean> {
    const response = await fetch(
      `${API_BASE_URL}/v1/ads/media/delete/?mediaId=${mediaId}&mediaUrl=${mediaUrl}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error(`Media deletion failed: ${response.statusText}`);
    }
    return true;
  },

  /**
   * Dispatches the structured DTO payload to register a brand-new broadcast pipeline
   */
  async createSchedule(dto: CreateScheduleDto): Promise<ScheduleResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/ads/create-schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to create schedule: ${response.statusText}`,
      );
    }

    const result = await response.json();
    return result?.data;
  },

  /**
   * Dispatches the structured DTO payload to register a brand-new broadcast pipeline
   */
  async updateSchedule(
    editTarget: ScheduleResponse | null,
    dto: CreateScheduleDto,
  ): Promise<ScheduleResponse> {
    const response = await fetch(
      `${API_BASE_URL}/v1/ads/update-schedule?id=${editTarget?.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dto),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to update schedule: ${response.statusText}`,
      );
    }

    const result = await response.json();
    return result?.data;
  },

  /**
   * Fetches current active pipeline schedules
   */
  async fetchSchedules(): Promise<ScheduleResponse[]> {
    const response = await fetch(`${API_BASE_URL}/v1/ads/schedules`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch schedules: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Delete a station by ID
   */
  async deleteStation(id: string): Promise<boolean> {
    const response = await fetch(
      `${API_BASE_URL}/v1/ads/station/delete/?id=${id}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete station: ${response.statusText}`,
      );
    }
    return true;
  },

  /**
   * Delete a schedule by ID
   */
  async deleteSchedule(id: string): Promise<boolean> {
    const response = await fetch(
      `${API_BASE_URL}/v1/ads/delete-schedule/?id=${id}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to delete schedule: ${response.statusText}`,
      );
    }
    return true;
  },

  /**
   * Track a station
   */
  async trackStation(id: string): Promise<void> {
    const dashboardId = localStorage.getItem("dashboardId");

    const response = await fetch(`${API_BASE_URL}/v1/ads/station/tracking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stationId: id, dashboardId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to track station: ${response.statusText}`,
      );
    }
  },

  /**
   * Get station tracking history
   */
  async fetchStationTrackingHistory(id: string): Promise<ClientTracker> {
    const response = await fetch(
      `${API_BASE_URL}/v1/ads/station/tracking-history/?stationId=${id}`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to track station: ${response.statusText}`,
      );
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Refresh a station
   */
  async refreshStation(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/v1/ads/station/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stationId: id }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to refresh station: ${response.statusText}`,
      );
    }
  },

  /**
   * Check station activeness
   */
  async checkStationActiveness(id: string): Promise<void> {
    const dashboardId = localStorage.getItem("dashboardId");

    const response = await fetch(
      `${API_BASE_URL}/v1/ads/station/check-activeness`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stationId: id, dashboardId }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to check station activeness: ${response.statusText}`,
      );
    }
  },

  /**
   * Run AI analysis before creating ads schedule
   */
  async runSchedulingAIanalysis(
    schedule: CreateScheduleDto,
    stationIds: string[],
  ): Promise<SchedulingAnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/ai/schedule/analysis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stationIds, schedule }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to run scheduling AI analysis: ${response.statusText}`,
      );
    }

    const result = await response.json();
    return result.data;
  },
};
