"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  MoreHorizontal,
  Eye,
  Trash2,
  Server,
  Tv,
  Radio,
  RefreshCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Button } from "@/components/ui/button";
import { StationResponse } from "@/src/types/interfaces";
import {
  useDeleteStation,
  useFetchStations,
  useUpdateStationStatus,
  useTrackStation,
  useRefreshStation,
  useCheckStationActiveness,
} from "@/src/hooks/use-stations";
import { ALL_STATION_STATUSES } from "@/src/lib/status-styles";
import { StationStatus } from "@/src/types/enums";
import { StatusBadge } from "./status-badge";
import StationPreviewModal from "./station-preview-modal";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { toast } from "react-toastify";
import { useDashboardState } from "@/src/app/context/dashboard-state-context";

const PAGE_SIZE = 20;

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
          {cat.replace(/_/g, " ")}
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
  onCancelEdit: () => void;
}

export default function StationsList({
  onEdit,
  editTargetId,
  onCancelEdit,
}: StationsListProps) {
  const { data, isLoading, isError } = useFetchStations();
  const { clientTracker: client } = useDashboardState();

  const deleteMutation = useDeleteStation();
  const statusMutation = useUpdateStationStatus();
  const trackStation = useTrackStation();
  const refreshStation = useRefreshStation();
  const checkStationActives = useCheckStationActiveness();

  const [page, setPage] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<StationResponse | null>(
    null,
  );

  const stations: StationResponse[] = data ?? [];

  const filtered = useMemo(() => {
    return stations.filter((s) => {
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.address?.toLowerCase().includes(search.toLowerCase()) ||
        s.device?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || s.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stations, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handlePrev = () => setPage((p) => Math.max(0, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  const handleStatusChange = async (
    station: StationResponse,
    status: StationStatus,
  ) => {
    try {
      await statusMutation.mutateAsync({ station, status });
      toast.success(`Station status updated to ${status.replace(/-/g, " ")}`);
    } catch {
      toast.error("Failed to update station status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" has been deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete station");
    }
  };

  const handleTrackStation = async (id: string) => {
    try {
      await trackStation.mutateAsync(id);
    } catch {
      toast.error("Station tracking request failed please try again");
    }
  };

  const handleRefreshStation = async (id: string) => {
    try {
      await refreshStation.mutateAsync(id);
    } catch {
      toast.error("Station refresh request failed please try again");
    }
  };

  const handleCheckStationActiveness = async (id: string) => {
    try {
      await checkStationActives.mutateAsync(id);
    } catch {
      toast.error("Station activeness check request failed please try again");
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden font-sans flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-3 px-5 py-4 border-b border-slate-100 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight">
            Registered Stations
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            <span className="font-medium text-slate-500">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-500">
              {stations.length}
            </span>{" "}
            station{stations.length !== 1 ? "s" : ""} in the network
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Search stations…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="h-8 w-full sm:w-44 pl-8 text-xs border-slate-200"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(0);
            }}
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-[130px] text-xs border-slate-200"
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ALL_STATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s.replace(/-/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Column headers */}
      <div className="hidden sm:grid grid-cols-[2fr_1.2fr_1.4fr_6rem_5rem_5rem] gap-x-4 items-center px-5 py-2.5 border-b border-slate-100 bg-slate-50">
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
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Health Status
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
          Actions
        </span>
      </div>

      {/* Body */}
      <div className="divide-y divide-slate-100 flex-1">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-3.5 animate-pulse"
            >
              <div className="h-10 w-10 rounded-lg bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 bg-slate-100 rounded" />
                <div className="h-2.5 w-20 bg-slate-100 rounded" />
              </div>
              <div className="h-3 w-16 bg-slate-100 rounded" />
              <div className="h-5 w-20 bg-slate-100 rounded-full" />
            </div>
          ))}

        {isError && (
          <div className="flex items-center justify-center py-12 text-sm text-slate-400">
            Failed to load stations.
          </div>
        )}

        {!isLoading && !isError && paged.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <Server size={28} className="text-slate-200" />
            <p className="text-sm text-slate-400">
              {search || statusFilter !== "all"
                ? "No stations match your filters."
                : "No stations registered yet."}
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          paged.map((station) => {
            const isBeingEdited = editTargetId === station.id;
            const globalIndex = stations.indexOf(station);

            return (
              <div
                key={station.id}
                className={`flex flex-col gap-2 px-5 py-3.5 transition-colors sm:grid sm:grid-cols-[2fr_1.2fr_1.4fr_6rem_5rem_5rem] sm:gap-x-4 sm:items-center ${
                  isBeingEdited
                    ? "bg-amber-50/60 border-l-2 border-l-amber-400"
                    : "hover:bg-slate-50/70"
                }`}
              >
                {/* Station name + address */}
                <div
                  className="min-w-0 cursor-pointer"
                  onClick={() => setPreviewIndex(globalIndex)}
                >
                  <p className="text-xs font-semibold text-slate-700 truncate leading-tight hover:text-slate-900">
                    {station.name}
                  </p>
                  {station.address && (
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {station.address}
                    </p>
                  )}
                </div>

                {/* Device */}
                <div className="min-w-0 hidden sm:block">
                  <span className="text-xs text-slate-600 font-mono truncate block">
                    {station.device || (
                      <span className="text-slate-300 font-sans">—</span>
                    )}
                  </span>
                </div>

                {/* Categories */}
                <div className="hidden sm:block">
                  <CategoryChips categories={station.supportedCategories} />
                </div>

                {/* Status */}
                <div>
                  <StatusBadge status={station.status} type="station" />
                </div>

                {/* Health Status */}
                <div>
                  <StatusBadge status={station.healthStatus} type="station" />
                </div>

                {/* Actions */}
                <div className="flex justify-end sm:justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      isBeingEdited ? onCancelEdit() : onEdit(station)
                    }
                    title="Edit station"
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
                      <DropdownMenuItem
                        onClick={() =>
                          isBeingEdited ? onCancelEdit() : onEdit(station)
                        }
                      >
                        <Pencil size={14} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTrackStation(station.id)}
                      >
                        <Tv size={14} />
                        Track Station
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRefreshStation(station.id)}
                      >
                        <RefreshCcw size={14} />
                        Refresh Station
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleCheckStationActiveness(station.id)}
                      >
                        <Radio size={14} />
                        Ping Station
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          Change status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {ALL_STATION_STATUSES.map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => handleStatusChange(station, s)}
                              className="capitalize"
                            >
                              {s.replace(/-/g, " ")}
                              {station.status === s && (
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
                        onClick={() => setDeleteTarget(station)}
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

      {previewIndex !== null && (
        <StationPreviewModal
          stations={stations}
          initialIndex={previewIndex}
          open={previewIndex !== null}
          onOpenChange={(o) => !o && setPreviewIndex(null)}
        />
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        onConfirm={handleDelete}
        resourceType="station"
        resourceName={deleteTarget?.name ?? ""}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
