"use client";

import { useState, useRef, useEffect } from "react";
import {
  SlidersHorizontal,
  Download,
  ChevronLeft,
  ChevronRight,
  Film,
  Image as ImageIcon,
  Pencil,
} from "lucide-react";
import { useFetchSchedules } from "@/src/hooks/use-schedules";
import { ScheduleResponse } from "@/src/types/interfaces";
import SchedulePreviewModal from "./schedule-preview-modal";

const PAGE_SIZE = 20;

function MediaThumbnail({ url, type }: { url: string; type: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    // Seek to 0.1 s once metadata is loaded so the browser renders a frame
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
          onError={(e) => {
            // Fallback to icon if image fails to load
            e.currentTarget.style.display = "none";
            e.currentTarget.nextElementSibling?.classList.remove("hidden");
          }}
        />
        <ImageIcon size={16} className="text-slate-400 hidden absolute" />
      </div>
    );
  }

  // Fallback for unknown types
  return (
    <div className={containerCls}>
      <Film size={16} className="text-slate-400" />
    </div>
  );
}

// Timing cell
function TimingCell({ schedule }: { schedule: ScheduleResponse }) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const firstSlot = schedule.timeSlots?.[0];
  const isLoop = schedule.frequency?.type === "loop";
  const intervalSec = schedule.frequency?.intervalSeconds;

  // Ongoing = no endDate or very far future
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

//  Priority badge
function PriorityBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold tabular-nums shrink-0">
      {String(value).padStart(2, "0")}
    </span>
  );
}

// Media name derived from URL
function deriveMediaName(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split("/");
    const filename = parts[parts.length - 1] ?? "";
    // Strip extension and truncate
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

// Main component
interface ScheduleListProps {
  onEdit: (schedule: ScheduleResponse) => void;
  editTargetId: string | null;
}
export default function SchedulesList({
  onEdit,
  editTargetId,
}: ScheduleListProps) {
  const { data, isLoading, isError } = useFetchSchedules();
  const [page, setPage] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const schedules: ScheduleResponse[] = data ?? [];
  const totalPages = Math.ceil(schedules.length / PAGE_SIZE);
  const paged = schedules.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handlePrev = () => setPage((p) => Math.max(0, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden font-sans flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight">
            Active Schedules
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Currently running deployments across{" "}
            <span className="font-medium text-slate-500">
              {schedules.length}
            </span>{" "}
            schedules
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            <SlidersHorizontal size={14} />
          </button>
          <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[2fr_1.4fr_3rem_5rem_3rem_2rem] gap-x-4 items-center px-5 py-2.5 border-b border-slate-100 bg-slate-50">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Media
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Timing
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-12 text-center">
          Priority
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-20">
          Category
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-20">
          Status
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-20">
          Edit
        </span>
      </div>

      {/* Body */}
      <div className="divide-y divide-slate-100 flex-1">
        {isLoading &&
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-3.5 animate-pulse"
            >
              <div className="h-10 w-14 rounded-md bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-slate-100 rounded" />
                <div className="h-2.5 w-20 bg-slate-100 rounded" />
              </div>
              <div className="h-3 w-20 bg-slate-100 rounded" />
              <div className="h-7 w-7 bg-slate-100 rounded-md" />
              <div className="h-3 w-16 bg-slate-100 rounded" />
              <div className="h-3 w-16 bg-slate-100 rounded" />
            </div>
          ))}

        {isError && (
          <div className="flex items-center justify-center py-12 text-sm text-slate-400">
            Failed to load schedules.
          </div>
        )}

        {!isLoading && !isError && paged.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-slate-400">
            No active schedules found.
          </div>
        )}

        {!isLoading &&
          !isError &&
          paged.map((schedule) => {
            const isBeingEdited = editTargetId === schedule.id;

            return (
              <div
                key={schedule.id}
                className={`grid grid-cols-[2fr_1.4fr_3rem_5rem_3rem_2rem] gap-x-4 items-center px-5 py-3.5 transition-colors  ${
                  isBeingEdited
                    ? "bg-amber-50/60 border-l-2 border-l-amber-400"
                    : "hover:bg-slate-50/70"
                }`}
              >
                {/* Media */}
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                  onClick={() => setPreviewIndex(schedules.indexOf(schedule))}
                >
                  <MediaThumbnail
                    url={schedule.mediaUrl}
                    type={schedule.mediaType}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate leading-tight">
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
                <div className="w-12 flex justify-center">
                  <PriorityBadge value={schedule.priority} />
                </div>

                {/* Category */}
                <div className="w-20">
                  <span className="text-xs text-slate-600 capitalize">
                    {schedule.category}
                  </span>
                </div>

                {/* Status */}
                <div className="w-20">
                  <span className="text-xs text-green-500 capitalize">
                    {schedule.status}
                  </span>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => onEdit(schedule)}
                    title="Edit station"
                    className={`h-7 w-7 flex items-center justify-center rounded-md border transition-colors cursor-pointer ${
                      isBeingEdited
                        ? "bg-amber-100 border-amber-200 text-amber-600"
                        : "border-slate-400 text-slate-400 hover:border-slate-600 hover:text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Pencil size={12} className="cursor-pointer" />
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Footer / Pagination */}
      {!isLoading && schedules.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white">
          <p className="text-[11px] text-slate-400">
            Showing{" "}
            <span className="font-medium text-slate-600">
              {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, schedules.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-600">
              {schedules.length}
            </span>{" "}
            active schedules
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

      {/* Preview Modal */}
      {previewIndex !== null && (
        <SchedulePreviewModal
          schedules={schedules}
          initialIndex={previewIndex}
          open={previewIndex !== null}
          onOpenChange={(o) => !o && setPreviewIndex(null)}
        />
      )}
    </div>
  );
}
