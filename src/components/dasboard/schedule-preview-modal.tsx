"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Film,
  Image as ImageIcon,
  Calendar,
  Clock,
  Repeat,
  Tag,
  Monitor,
  Layers,
  Copy,
  Check,
  Globe,
} from "lucide-react";
import Image from "next/image";
import { ScheduleResponse, WEEKDAY_LABELS } from "@/src/types/interfaces";
import { Chip, fmtDate, SectionLabel } from "./preview-shared";
import { StatusBadge } from "./status-badge";

function deriveMediaName(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").pop() ?? "";
    return filename.replace(/\.[^/.]+$/, "") || "Untitled";
  } catch {
    return "Untitled";
  }
}

function fmtVideoTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface SchedulePreviewModalProps {
  schedules: ScheduleResponse[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SchedulePreviewModal({
  schedules,
  initialIndex,
  open,
  onOpenChange,
}: SchedulePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const schedule = schedules[currentIndex];

  // Sync index when the modal is opened against a (possibly new) target
  useEffect(() => {
    if (open) {
      const updateIndex = () => {
        setCurrentIndex(initialIndex);
      };
      updateIndex();
    }
  }, [open, initialIndex]);

  // Reset playback + load state whenever the active schedule changes
  useEffect(() => {
    const resetPlayback = () => {
      setIsMediaLoaded(false);
      setIsPlaying(false);
      setCurrentTime(0);
      setVideoDuration(0);
      setCopied(false);
    };

    if (open) {
      resetPlayback();
    }
  }, [currentIndex, open]);

  const goPrev = () =>
    setCurrentIndex((i) => (i - 1 + schedules.length) % schedules.length);
  const goNext = () => setCurrentIndex((i) => (i + 1) % schedules.length);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, schedules.length]);

  if (!schedule) return null;

  const isVideo = schedule.mediaType === "video";
  const weekdays = schedule.weekdays ?? [];
  const allDays = weekdays.length === 0;

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  };

  const stopPlayback = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setCurrentTime(0);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleSeek = (value: number[]) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(schedule.mediaUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable is silently ignore */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-5xl p-0 gap-0 overflow-hidden border-slate-200 sm:rounded-2xl">
        <div className="flex flex-col lg:flex-row max-h-[90vh] lg:h-[640px] overflow-y-auto lg:overflow-hidden">
          {/* Media panel */}
          <div className="relative bg-slate-950 flex items-center justify-center min-w-0 aspect-video lg:aspect-auto lg:flex-[1.6] lg:h-full">
            {!isMediaLoaded && (
              <Skeleton className="absolute inset-0 bg-slate-800/60" />
            )}

            {isVideo ? (
              <video
                ref={videoRef}
                src={schedule.mediaUrl}
                className="w-full h-full object-contain"
                onLoadedMetadata={(e) => {
                  setIsMediaLoaded(true);
                  setVideoDuration(e.currentTarget.duration);
                }}
                onTimeUpdate={(e) =>
                  setCurrentTime(e.currentTarget.currentTime)
                }
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              <Image
                src={schedule.mediaUrl}
                alt={deriveMediaName(schedule.mediaUrl)}
                fill
                sizes="(max-width: 1024px) 100vw, 62vw"
                className="object-contain"
                onLoad={() => setIsMediaLoaded(true)}
                onError={() => setIsMediaLoaded(true)}
              />
            )}

            {/* Top-left: media type badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
              {isVideo ? (
                <Film size={12} className="text-white" />
              ) : (
                <ImageIcon size={12} className="text-white" />
              )}
              <span className="text-[11px] font-medium text-white capitalize">
                {schedule.mediaType}
              </span>
            </div>

            {/* Top-right: index counter */}
            {schedules.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
                <span className="text-[11px] font-medium text-white tabular-nums">
                  {currentIndex + 1} / {schedules.length}
                </span>
              </div>
            )}

            {/* Prev / Next */}
            {schedules.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Video controls */}
            {isVideo && isMediaLoaded && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-8 pb-3">
                <Slider
                  value={[currentTime]}
                  max={videoDuration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="mb-2.5 [&_[data-slot=slider-track]]:bg-white/20 [&_[data-slot=slider-range]]:bg-white"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    onClick={stopPlayback}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
                  >
                    <Square size={12} />
                  </button>
                  <span className="text-[11px] text-white/80 tabular-nums">
                    {fmtVideoTime(currentTime)} / {fmtVideoTime(videoDuration)}
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={toggleMute}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
                  >
                    {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Details sidebar */}
          <div className="w-full lg:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col lg:h-full">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h2 className="text-sm font-semibold text-slate-800 truncate">
                  {deriveMediaName(schedule.mediaUrl)}
                </h2>
                <StatusBadge status={schedule.status} type="schedule" />
              </div>
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors group max-w-full"
              >
                <span className="font-mono truncate">{schedule.mediaUrl}</span>
                {copied ? (
                  <Check size={11} className="text-emerald-500 shrink-0" />
                ) : (
                  <Copy
                    size={11}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </button>
            </div>

            <ScrollArea className="flex-1 lg:overflow-y-auto">
              <div className="p-5 space-y-5">
                {/* Priority + Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <SectionLabel icon={Layers}>Priority</SectionLabel>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-700 tabular-nums font-semibold"
                      >
                        {String(schedule.priority ?? 0).padStart(2, "0")}
                      </Badge>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-800 rounded-full"
                          style={{
                            width: `${((schedule.priority ?? 0) / 10) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <SectionLabel icon={Clock}>Display Duration</SectionLabel>
                    <span className="text-sm font-medium text-slate-700 tabular-nums">
                      {schedule.duration}s
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Schedule window */}
                <div>
                  <SectionLabel icon={Calendar}>Schedule Window</SectionLabel>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <span>{fmtDate(schedule.startDate)}</span>
                    <span className="text-slate-400">→</span>
                    <span>{fmtDate(schedule.endDate)}</span>
                  </div>
                </div>

                {/* Active days */}
                <div>
                  <SectionLabel icon={Calendar}>Active Days</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {allDays ? (
                      <Chip active>All days</Chip>
                    ) : (
                      WEEKDAY_LABELS.map(({ value, label }) => (
                        <Chip key={value} active={weekdays.includes(value)}>
                          {label}
                        </Chip>
                      ))
                    )}
                  </div>
                </div>

                {/* Time slots */}
                <div>
                  <SectionLabel icon={Clock}>Time Slots</SectionLabel>
                  <div className="space-y-1.5">
                    {(schedule.timeSlots ?? []).map((slot, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm font-medium text-slate-700 tabular-nums bg-slate-50 rounded-lg px-3 py-1.5 w-fit"
                      >
                        <span>{slot.start}</span>
                        <span className="text-slate-400">–</span>
                        <span>{slot.end}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <SectionLabel icon={Repeat}>Frequency</SectionLabel>
                  <span className="text-sm font-medium text-slate-700 capitalize">
                    {schedule.frequency?.type === "loop"
                      ? "Loop"
                      : `Interval — every ${schedule.frequency?.intervalSeconds}s`}
                  </span>
                </div>

                <Separator />

                {/* Target devices */}
                <div>
                  <SectionLabel icon={Monitor}>Target Devices</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {(schedule.targetDevices ?? []).map((d) => (
                      <Chip key={d}>{d}</Chip>
                    ))}
                  </div>
                </div>

                {/* Category + ownership */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <SectionLabel icon={Tag}>Category</SectionLabel>
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {schedule.category || "—"}
                    </span>
                  </div>
                  <div>
                    <SectionLabel icon={Globe}>Ownership</SectionLabel>
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {schedule.ownership || "—"}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {schedule.tags && schedule.tags.length > 0 && (
                  <div>
                    <SectionLabel icon={Tag}>Tags</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {schedule.tags.map((tag) => (
                        <Chip key={tag}>{tag}</Chip>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Timestamps */}
                <div className="space-y-1 text-[11px] text-slate-400">
                  <p>Created {fmtDate(schedule.created_at)}</p>
                  <p>Updated {fmtDate(schedule.updated_at)}</p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
