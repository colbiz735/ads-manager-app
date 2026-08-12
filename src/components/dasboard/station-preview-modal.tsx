"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Monitor,
  Tag,
  Server,
  Activity,
  Shield,
  Copy,
  Check,
  Radio,
  LucideIcon,
} from "lucide-react";
import { StationResponse } from "@/src/types/interfaces";
import { Chip, fmtDate, SectionLabel } from "./preview-shared";
import { StatusBadge } from "./status-badge";
import { getStationStatusStyle } from "@/src/lib/status-styles";

function HealthIndicator({ health }: { health: string }) {
  const isOnline = health === "active" || health === "online";
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative flex h-24 w-24 items-center justify-center rounded-2xl ${
          isOnline
            ? "bg-emerald-500/10 ring-2 ring-emerald-500/30"
            : "bg-slate-800/50 ring-2 ring-slate-600/30"
        }`}
      >
        <Radio
          size={40}
          className={isOnline ? "text-emerald-400" : "text-slate-500"}
        />
        <span
          className={`absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-950 ${
            isOnline ? "bg-emerald-500" : "bg-slate-500"
          }`}
        />
      </div>
      <span
        className={`text-xs font-medium capitalize ${
          isOnline ? "text-emerald-400" : "text-slate-400"
        }`}
      >
        {health || "Unknown"}
      </span>
    </div>
  );
}

interface StationPreviewModalProps {
  stations: StationResponse[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StationPreviewModal({
  stations,
  initialIndex,
  open,
  onOpenChange,
}: StationPreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const station = stations[currentIndex];

  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setIsLoaded(false);
      const timer = setTimeout(() => setIsLoaded(true), 200);
      return () => clearTimeout(timer);
    }
  }, [open, initialIndex]);

  useEffect(() => {
    if (open) {
      setCopied(false);
      setIsLoaded(false);
      const timer = setTimeout(() => setIsLoaded(true), 200);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, open]);

  const goPrev = () =>
    setCurrentIndex((i) => (i - 1 + stations.length) % stations.length);
  const goNext = () => setCurrentIndex((i) => (i + 1) % stations.length);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, stations.length]);

  if (!station) return null;

  const statusStyle = getStationStatusStyle(station.status);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(station.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-5xl p-0 gap-0 overflow-hidden border-slate-200 sm:rounded-2xl">
        <div className="flex flex-col lg:flex-row max-h-[90vh] lg:h-[640px] overflow-y-auto lg:overflow-hidden">
          {/* Visual panel */}
          <div className="relative bg-slate-950 flex flex-col items-center justify-center min-w-0 aspect-video lg:aspect-auto lg:flex-[1.6] lg:h-full p-8">
            {!isLoaded && (
              <Skeleton className="absolute inset-0 bg-slate-800/60" />
            )}

            <HealthIndicator health={station.healthStatus} />

            <div className="mt-8 text-center max-w-sm">
              <h3 className="text-lg font-semibold text-white truncate">
                {station.name}
              </h3>
              {station.address && (
                <p className="text-sm text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                  <MapPin size={13} className="shrink-0" />
                  <span className="truncate">{station.address}</span>
                </p>
              )}
            </div>

            {/* Device badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
              <Monitor size={12} className="text-white" />
              <span className="text-[11px] font-medium text-white font-mono">
                {station.device || "No device"}
              </span>
            </div>

            {/* Index counter */}
            {stations.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
                <span className="text-[11px] font-medium text-white tabular-nums">
                  {currentIndex + 1} / {stations.length}
                </span>
              </div>
            )}

            {/* Prev / Next */}
            {stations.length > 1 && (
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

            {/* Category count */}
            <div className="absolute bottom-3 inset-x-0 flex justify-center">
              <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
                <Tag size={12} className="text-white/70" />
                <span className="text-[11px] font-medium text-white">
                  {station.supportedCategories?.length ?? 0} supported{" "}
                  {station.supportedCategories?.length === 1
                    ? "category"
                    : "categories"}
                </span>
              </div>
            </div>
          </div>

          {/* Details sidebar */}
          <div className="w-full lg:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col lg:h-full">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h2 className="text-sm font-semibold text-slate-800 truncate">
                  {station.name}
                </h2>
                <StatusBadge status={station.status} type="station" />
              </div>
              <button
                onClick={handleCopyId}
                className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors group max-w-full"
              >
                <span className="font-mono truncate">ID: {station.id}</span>
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
                {/* Address + Device */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <SectionLabel icon={MapPin}>Location</SectionLabel>
                    <span className="text-sm font-medium text-slate-700">
                      {station.address || "—"}
                    </span>
                  </div>
                  <div>
                    <SectionLabel icon={Server}>Device</SectionLabel>
                    <span className="text-sm font-medium text-slate-700 font-mono">
                      {station.device || "—"}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Status + Health */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <SectionLabel icon={Shield}>Approval Status</SectionLabel>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${statusStyle.dot}`}
                      />
                      <span
                        className={`text-sm font-medium capitalize ${statusStyle.text}`}
                      >
                        {statusStyle.label}
                      </span>
                    </div>
                  </div>
                  <div>
                    <SectionLabel icon={Activity}>Health</SectionLabel>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-700 capitalize font-semibold"
                      >
                        {station.healthStatus || "—"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Categories */}
                <div>
                  <SectionLabel icon={Tag}>Supported Categories</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {(station.supportedCategories ?? []).length > 0 ? (
                      station.supportedCategories.map((cat) => (
                        <Chip key={cat}>{cat.replace(/_/g, " ")}</Chip>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">
                        No categories assigned
                      </span>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Timestamps */}
                <div className="space-y-1 text-[11px] text-slate-400">
                  <p>Created {fmtDate(station.created_at)}</p>
                  <p>Updated {fmtDate(station.updated_at)}</p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
