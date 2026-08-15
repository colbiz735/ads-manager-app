"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Film,
  Image as ImageIcon,
  Pencil,
  MoreHorizontal,
  Eye,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useDeleteSchedule,
  useFetchSchedules,
  useUpdateScheduleStatus,
} from "@/src/hooks/use-schedules";
import { useFetchStations } from "@/src/hooks/use-stations";
import { ScheduleResponse } from "@/src/types/interfaces";
import { ScheduleStatus } from "@/src/types/enums";
import { ALL_SCHEDULE_STATUSES } from "@/src/lib/status-styles";
import SchedulePreviewModal from "./schedule-preview-modal";
import { StatusBadge } from "./status-badge";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import {
  ScheduleFiltersPanel,
  DEFAULT_SCHEDULE_FILTERS,
  applyScheduleFilters,
  type ScheduleFilters,
} from "./schedule-filters";
import { toast } from "react-toastify";

const PAGE_SIZE = 20;

function MediaThumbnail({ url, type }: { url: string; type: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onLoaded = () => {
      vid.currentTime = 0.1;
    };
    vid.addEventListener("loadedmetadata", onLoaded);
    return () => vid.removeEventListener("loadedmetadata", onLoaded);
  }, []);

  const containerCls =
    "h-10 w-14 rounded-md overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center";

  if (type === "video") {
    return (
      <div className={containerCls}>
        <video
          ref={videoRef}
          src={url}
          preload="metadata"
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (type === "image") {
    return (
      <div className={containerCls}>
        <img
          src={url}
          alt="schedule thumbnail"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={containerCls}>
      <Film size={16} className="text-slate-400" />
    </div>
  );
}

function TimingCell({ schedule }: { schedule: ScheduleResponse }) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const firstSlot = schedule.timeSlots?.[0];
  const isLoop = schedule.frequency?.type === "loop";
  const intervalSec = schedule.frequency?.intervalSeconds;
  const isOngoing = !schedule.endDate;

  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      {isOngoing ? (
        <span className="text-xs font-medium text-slate-700">Ongoing</span>
      ) : (
        <div className="flex items-center gap-1 text-xs font-medium text-slate-700 tabular-nums">
          <span>{fmt(schedule.startDate)}</span>
          <span className="text-slate-400">→</span>
          <span>{fmt(schedule.endDate)}</span>
        </div>
      )}
      {firstSlot && (
        <span className="text-[11px] text-slate-400 tabular-nums">
          {firstSlot.start} – {firstSlot.end}
        </span>
      )}
      <span className="text-[11px] text-slate-400">
        {isLoop
          ? "Loop"
          : intervalSec
            ? `Every ${intervalSec >= 60 ? `${Math.round(intervalSec / 60)}m` : `${intervalSec}s`}`
            : "Interval"}
      </span>
    </div>
  );
}

function PriorityBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold tabular-nums shrink-0">
      {String(value).padStart(2, "0")}
    </span>
  );
}

function deriveMediaName(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").pop() ?? "";
    return filename.replace(/\.[^/.]+$/, "").slice(0, 28) || "Untitled";
  } catch {
    return "Untitled";
  }
}

function deriveCdnShort(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}/${u.pathname.split("/").slice(1, 3).join("/")}/...`;
  } catch {
    return url.slice(0, 30);
  }
}

interface ScheduleListProps {
  onEdit: (schedule: ScheduleResponse) => void;
  editTargetId: string | null;
  onCancelEdit: () => void;
}

export default function SchedulesList({
  onEdit,
  editTargetId,
  onCancelEdit,
}: ScheduleListProps) {
  const { data, isLoading, isError } = useFetchSchedules();
  const { data: stationsData } = useFetchStations();
  const deleteMutation = useDeleteSchedule();
  const statusMutation = useUpdateScheduleStatus();

  const [page, setPage] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [filters, setFilters] = useState<ScheduleFilters>(
    DEFAULT_SCHEDULE_FILTERS,
  );
  const [deleteTarget, setDeleteTarget] = useState<ScheduleResponse | null>(
    null,
  );

  const schedules: ScheduleResponse[] = data ?? [];
  const stations = stationsData ?? [];

  const filtered = useMemo(
    () => applyScheduleFilters(schedules, filters),
    [schedules, filters],
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handlePrev = () => setPage((p) => Math.max(0, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  const handleFilterChange = (next: ScheduleFilters) => {
    setFilters(next);
    setPage(0);
  };

  const handleStatusChange = async (
    schedule: ScheduleResponse,
    status: ScheduleStatus,
  ) => {
    try {
      await statusMutation.mutateAsync({ schedule, status });
      toast.success(`Schedule status updated to ${status}`);
    } catch {
      toast.error("Failed to update schedule status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(
        `"${deriveMediaName(deleteTarget.mediaUrl)}" has been deleted`,
      );
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete schedule");
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden font-sans flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-3 px-5 py-4 border-b border-slate-100 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight">
            Active Schedules
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            <span className="font-medium text-slate-500">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-500">
              {schedules.length}
            </span>{" "}
            schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Search schedules…"
              value={filters.search}
              onChange={(e) =>
                handleFilterChange({ ...filters, search: e.target.value })
              }
              className="h-8 w-full sm:w-44 pl-8 text-xs border-slate-200"
            />
          </div>
          <ScheduleFiltersPanel
            filters={filters}
            onChange={handleFilterChange}
            stations={stations}
          />
        </div>
      </div>

      {/* Column headers */}
      <div className="hidden sm:grid grid-cols-[2fr_1.4fr_3rem_5rem_6rem_5rem] gap-x-4 items-center px-5 py-2.5 border-b border-slate-100 bg-slate-50">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Media
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Timing
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
          Priority
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Category
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Status
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
          Actions
        </span>
      </div>

      {/* Body */}
      <div className="divide-y divide-slate-100 flex-1">
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-3.5 animate-pulse"
            >
              <div className="h-10 w-14 rounded-md bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-slate-100 rounded" />
                <div className="h-2.5 w-20 bg-slate-100 rounded" />
              </div>
              <div className="h-7 w-7 bg-slate-100 rounded-md" />
              <div className="h-3 w-16 bg-slate-100 rounded" />
              <div className="h-5 w-20 bg-slate-100 rounded-full" />
            </div>
          ))}

        {isError && (
          <div className="flex items-center justify-center py-12 text-sm text-slate-400">
            Failed to load schedules.
          </div>
        )}

        {!isLoading && !isError && paged.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <Film size={28} className="text-slate-200" />
            <p className="text-sm text-slate-400">
              {filters.search ||
              filters.stationId !== "all" ||
              filters.status !== "all"
                ? "No schedules match your filters."
                : "No active schedules found."}
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          paged.map((schedule) => {
            const isBeingEdited = editTargetId === schedule.id;
            const globalIndex = schedules.indexOf(schedule);

            return (
              <div
                key={schedule.id}
                className={`flex flex-col gap-2 px-5 py-3.5 transition-colors sm:grid sm:grid-cols-[2fr_1.4fr_3rem_5rem_6rem_5rem] sm:gap-x-4 sm:items-center ${
                  isBeingEdited
                    ? "bg-amber-50/60 border-l-2 border-l-amber-400"
                    : "hover:bg-slate-50/70"
                }`}
              >
                {/* Media */}
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                  onClick={() => setPreviewIndex(globalIndex)}
                >
                  <MediaThumbnail
                    url={schedule.mediaUrl}
                    type={schedule.mediaType}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate leading-tight hover:text-slate-900">
                      {deriveMediaName(schedule.mediaUrl)}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                      {deriveCdnShort(schedule.mediaUrl)}
                    </p>
                  </div>
                </div>

                {/* Timing */}
                <TimingCell schedule={schedule} />

                {/* Priority */}
                <div className="hidden sm:flex justify-center">
                  <PriorityBadge value={schedule.priority} />
                </div>

                {/* Category */}
                <div className="hidden sm:block">
                  <span className="text-xs text-slate-600 capitalize">
                    {schedule.category?.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <StatusBadge status={schedule.status} type="schedule" />
                </div>

                {/* Actions */}
                <div className="flex justify-end sm:justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      isBeingEdited ? onCancelEdit() : onEdit(schedule)
                    }
                    title="Edit schedule"
                    className={`h-7 w-7 ${
                      isBeingEdited
                        ? "bg-amber-100 text-amber-600"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <Pencil size={12} />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 text-slate-400 hover:text-slate-600"
                      >
                        <MoreHorizontal size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() => setPreviewIndex(globalIndex)}
                      >
                        <Eye size={14} />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(schedule)}>
                        <Pencil size={14} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          Change status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {ALL_SCHEDULE_STATUSES.map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => handleStatusChange(schedule, s)}
                              className="capitalize"
                            >
                              {s}
                              {schedule.status === s && (
                                <span className="ml-auto text-emerald-500">
                                  ✓
                                </span>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteTarget(schedule)}
                        disabled={isBeingEdited}
                        className={`${isBeingEdited ? "pointer-events-none" : ""}`}
                      >
                        <Trash2 size={14} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
      </div>

      {/* Footer / Pagination */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white">
          <p className="text-[11px] text-slate-400">
            Showing{" "}
            <span className="font-medium text-slate-600">
              {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-600">
              {filtered.length}
            </span>{" "}
            schedules
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={page === 0}
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={handleNext}
              disabled={page >= totalPages - 1}
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {previewIndex !== null && (
        <SchedulePreviewModal
          schedules={schedules}
          initialIndex={previewIndex}
          open={previewIndex !== null}
          onOpenChange={(o) => !o && setPreviewIndex(null)}
        />
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        onConfirm={handleDelete}
        resourceType="schedule"
        resourceName={
          deleteTarget ? deriveMediaName(deleteTarget.mediaUrl) : ""
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
