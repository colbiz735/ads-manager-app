"use client";

import { PlaybackHistoryFilters } from "@/src/types/playback-history.types";
import { StationResponse, ScheduleResponse } from "@/src/types/interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Film } from "lucide-react";

interface PlaybackHistoryFiltersPanelProps {
  filters: PlaybackHistoryFilters;
  onFilterChange: (filters: PlaybackHistoryFilters) => void;
  stations: StationResponse[];
  schedules: ScheduleResponse[];
  hideStationFilter?: boolean;
  hideScheduleFilter?: boolean;
}

export function PlaybackHistoryFiltersPanel({
  filters,
  onFilterChange,
  stations,
  schedules,
  hideStationFilter = false,
  hideScheduleFilter = false,
}: PlaybackHistoryFiltersPanelProps) {
  const handleReset = () => {
    onFilterChange({
      status: "all",
      startDate: "",
      endDate: "",
      stationId: hideStationFilter ? filters.stationId : undefined,
      scheduleId: hideScheduleFilter ? filters.scheduleId : undefined,
    });
  };

  const deriveMediaName = (url: string): string => {
    try {
      const pathname = new URL(url).pathname;
      return pathname.split("/").pop()?.replace(/\.[^/.]+$/, "") || "Untitled";
    } catch {
      return "Untitled";
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {!hideStationFilter && (
        <Select
          value={filters.stationId || "all"}
          onValueChange={(v) =>
            onFilterChange({ ...filters, stationId: v === "all" ? undefined : v })
          }
        >
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue placeholder="Station" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stations</SelectItem>
            {stations.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!hideScheduleFilter && (
        <Select
          value={filters.scheduleId || "all"}
          onValueChange={(v) =>
            onFilterChange({
              ...filters,
              scheduleId: v === "all" ? undefined : v,
            })
          }
        >
          <SelectTrigger className="w-[220px] h-9 text-xs">
            <SelectValue placeholder="Ad Schedule" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ads</SelectItem>
            {schedules.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                <div className="flex items-center gap-2.5 py-0.5">
                  <div className="h-5 w-8 rounded-sm bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    {s.mediaType === "video" ? (
                      <video
                        src={s.mediaUrl}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={s.mediaUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <span className="truncate max-w-[140px]">
                    {deriveMediaName(s.mediaUrl)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={filters.status || "all"}
        onValueChange={(v) => onFilterChange({ ...filters, status: v })}
      >
        <SelectTrigger className="w-[140px] h-9 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="interrupted">Interrupted</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={filters.startDate || ""}
          onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
          className="w-[140px] h-9 text-xs"
        />
        <span className="text-slate-400 text-xs">to</span>
        <Input
          type="date"
          value={filters.endDate || ""}
          onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
          className="w-[140px] h-9 text-xs"
        />
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="h-9 px-3 text-xs text-slate-500 hover:text-slate-900"
      >
        <X className="h-3.5 w-3.5 mr-1.5" />
        Reset
      </Button>
    </div>
  );
}
