"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Wifi,
  WifiOff,
  Server,
} from "lucide-react";
import { StationResponse } from "@/src/types/interfaces";
import { useFetchStations } from "@/src/hooks/use-stations";

const PAGE_SIZE = 20;

function StatusPill({ status, health }: { status: string; health: string }) {
  const isActive = health === "active";
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
          isActive ? "bg-emerald-500" : "bg-slate-300"
        }`}
      />
      <span
        className={`text-[11px] font-medium capitalize ${
          isActive ? "text-emerald-600" : "text-slate-400"
        }`}
      >
        {health}
      </span>
    </div>
  );
}

function CategoryChips({ categories }: { categories: string[] }) {
  const visible = categories.slice(0, 2);
  const overflow = categories.length - 2;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((cat) => (
        <span
          key={cat}
          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize"
        >
          {cat}
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400">
          +{overflow}
        </span>
      )}
    </div>
  );
}

interface StationsListProps {
  onEdit: (station: StationResponse) => void;
  editTargetId: string | null;
}

export default function StationsList({
  onEdit,
  editTargetId,
}: StationsListProps) {
  const { data, isLoading, isError } = useFetchStations();
  const [page, setPage] = useState(0);

  const stations: StationResponse[] = data ?? [];
  const totalPages = Math.ceil(stations.length / PAGE_SIZE);
  const paged = stations.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handlePrev = () => setPage((p) => Math.max(0, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden font-sans flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight">
            Registered Stations
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            <span className="font-medium text-slate-500">
              {stations.length}
            </span>{" "}
            station{stations.length !== 1 ? "s" : ""} registered in the network
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400">
            <Server size={14} />
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[2fr_1.2fr_1.4fr_5rem_2.5rem] gap-x-4 items-center px-5 py-2.5 border-b border-slate-100 bg-slate-50">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Station
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Device
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Categories
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Status
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
          Edit
        </span>
      </div>

      {/* Body */}
      <div className="divide-y divide-slate-100 flex-1">
        {/* Loading skeletons */}
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[2fr_1.2fr_1.4fr_5rem_2.5rem] gap-x-4 items-center px-5 py-3.5 animate-pulse"
            >
              <div className="space-y-1.5">
                <div className="h-3 w-28 bg-slate-100 rounded" />
                <div className="h-2.5 w-20 bg-slate-100 rounded" />
              </div>
              <div className="h-3 w-16 bg-slate-100 rounded" />
              <div className="flex gap-1">
                <div className="h-4 w-14 bg-slate-100 rounded-full" />
                <div className="h-4 w-14 bg-slate-100 rounded-full" />
              </div>
              <div className="h-3 w-12 bg-slate-100 rounded" />
              <div className="h-6 w-6 bg-slate-100 rounded-md mx-auto" />
            </div>
          ))}

        {isError && (
          <div className="flex items-center justify-center py-12 text-sm text-slate-400">
            Failed to load stations.
          </div>
        )}

        {!isLoading && !isError && paged.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <Wifi size={28} className="text-slate-200" />
            <p className="text-sm text-slate-400">
              No stations registered yet.
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          paged.map((station) => {
            const isBeingEdited = editTargetId === station.id;
            return (
              <div
                key={station.id}
                className={`grid grid-cols-[2fr_1.2fr_1.4fr_5rem_2.5rem] gap-x-4 items-center px-5 py-3.5 transition-colors ${
                  isBeingEdited
                    ? "bg-amber-50/60 border-l-2 border-l-amber-400"
                    : "hover:bg-slate-50/70"
                }`}
              >
                {/* Station name + address */}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate leading-tight">
                    {station.name}
                  </p>
                  {station.address && (
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {station.address}
                    </p>
                  )}
                </div>

                {/* Device */}
                <div className="min-w-0">
                  <span className="text-xs text-slate-600 font-mono truncate block">
                    {station.device || (
                      <span className="text-slate-300 not-italic font-sans">
                        —
                      </span>
                    )}
                  </span>
                </div>

                {/* Categories */}
                <CategoryChips categories={station.supportedCategories} />

                {/* Status */}
                <StatusPill
                  status={station.status}
                  health={station.healthStatus}
                />

                {/* Edit button */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => onEdit(station)}
                    title="Edit station"
                    className={`h-7 w-7 flex items-center justify-center rounded-md border transition-colors ${
                      isBeingEdited
                        ? "bg-amber-100 border-amber-300 text-amber-600"
                        : "border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 hover:bg-slate-50"
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
      {!isLoading && stations.length > PAGE_SIZE && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white">
          <p className="text-[11px] text-slate-400">
            Showing{" "}
            <span className="font-medium text-slate-600">
              {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, stations.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-600">
              {stations.length}
            </span>{" "}
            stations
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
    </div>
  );
}
