"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_SCHEDULE_STATUSES } from "@/src/lib/status-styles";
import { AdCategory } from "@/src/types/enums";
import { StationResponse } from "@/src/types/interfaces";

export interface ScheduleFilters {
  search: string;
  stationId: string;
  status: string;
  category: string;
  ownership: string;
  priority: string;
  dateFrom: string;
  dateTo: string;
}

export const DEFAULT_SCHEDULE_FILTERS: ScheduleFilters = {
  search: "",
  stationId: "all",
  status: "all",
  category: "all",
  ownership: "all",
  priority: "all",
  dateFrom: "",
  dateTo: "",
};

interface ScheduleFiltersPanelProps {
  filters: ScheduleFilters;
  onChange: (filters: ScheduleFilters) => void;
  stations: StationResponse[];
}

export function ScheduleFiltersPanel({
  filters,
  onChange,
  stations,
}: ScheduleFiltersPanelProps) {
  const [open, setOpen] = useState(false);

  const activeCount = [
    filters.stationId !== "all",
    filters.status !== "all",
    filters.category !== "all",
    filters.ownership !== "all",
    filters.priority !== "all",
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  const update = (patch: Partial<ScheduleFilters>) =>
    onChange({ ...filters, ...patch });

  const clearAll = () => onChange(DEFAULT_SCHEDULE_FILTERS);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="h-8 w-8 border-slate-200 text-slate-500 hover:bg-slate-50 relative"
        >
          <SlidersHorizontal size={14} />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-4 border-slate-200"
        sideOffset={8}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Filter Schedules
          </h3>
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <X size={11} />
              Clear all
            </button>
          )}
        </div>

        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-slate-500 uppercase tracking-wider">
              Station
            </Label>
            <Select
              value={filters.stationId}
              onValueChange={(v) => update({ stationId: v })}
            >
              <SelectTrigger className="h-8 w-full text-xs border-slate-200">
                <SelectValue placeholder="All stations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stations</SelectItem>
                {stations.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] text-slate-500 uppercase tracking-wider">
              Status
            </Label>
            <Select
              value={filters.status}
              onValueChange={(v) => update({ status: v })}
            >
              <SelectTrigger className="h-8 w-full text-xs border-slate-200">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {ALL_SCHEDULE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-500 uppercase tracking-wider">
                Category
              </Label>
              <Select
                value={filters.category}
                onValueChange={(v) => update({ category: v })}
              >
                <SelectTrigger className="h-8 w-full text-xs border-slate-200">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  <SelectItem value="all">All categories</SelectItem>
                  {Object.values(AdCategory).map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-500 uppercase tracking-wider">
                Ownership
              </Label>
              <Select
                value={filters.ownership}
                onValueChange={(v) => update({ ownership: v })}
              >
                <SelectTrigger className="h-8 w-full text-xs border-slate-200">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] text-slate-500 uppercase tracking-wider">
              Priority
            </Label>
            <Select
              value={filters.priority}
              onValueChange={(v) => update({ priority: v })}
            >
              <SelectTrigger className="h-8 w-full text-xs border-slate-200">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((p) => (
                  <SelectItem key={p} value={String(p)}>
                    Priority {String(p).padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-500 uppercase tracking-wider">
                From
              </Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => update({ dateFrom: e.target.value })}
                className="h-8 text-xs border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-500 uppercase tracking-wider">
                To
              </Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => update({ dateTo: e.target.value })}
                className="h-8 text-xs border-slate-200"
              />
            </div>
          </div>
        </div>

        <Button
          size="sm"
          className="w-full mt-4 bg-slate-900 hover:bg-slate-800"
          onClick={() => setOpen(false)}
        >
          Apply Filters
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export function applyScheduleFilters<T extends {
  mediaUrl: string;
  status: string;
  category: string;
  ownership: string;
  priority: number;
  startDate: string;
  endDate: string;
  locationIds: string[];
}>(
  schedules: T[],
  filters: ScheduleFilters,
): T[] {
  return schedules.filter((s) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const mediaName = (() => {
        try {
          const pathname = new URL(s.mediaUrl).pathname;
          return pathname.split("/").pop()?.toLowerCase() ?? "";
        } catch {
          return "";
        }
      })();
      if (!mediaName.includes(q) && !s.category?.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (
      filters.stationId !== "all" &&
      !s.locationIds?.includes(filters.stationId)
    ) {
      return false;
    }

    if (filters.status !== "all" && s.status !== filters.status) {
      return false;
    }

    if (filters.category !== "all" && s.category !== filters.category) {
      return false;
    }

    if (filters.ownership !== "all" && s.ownership !== filters.ownership) {
      return false;
    }

    if (
      filters.priority !== "all" &&
      s.priority !== Number(filters.priority)
    ) {
      return false;
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      const end = s.endDate ? new Date(s.endDate) : new Date("2099-12-31");
      if (end < from) return false;
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      const start = new Date(s.startDate);
      if (start > to) return false;
    }

    return true;
  });
}
