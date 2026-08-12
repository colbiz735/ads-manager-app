"use client";

import Link from "next/link";
import {
  Server,
  Calendar,
  Pause,
  Film,
  ArrowRight,
  Activity,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useFetchStations } from "@/src/hooks/use-stations";
import { useFetchSchedules } from "@/src/hooks/use-schedules";
import { ScheduleStatus } from "@/src/types/enums";
import { StatusBadge } from "./status-badge";

function deriveMediaName(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").pop() ?? "";
    return filename.replace(/\.[^/.]+$/, "").slice(0, 24) || "Untitled";
  } catch {
    return "Untitled";
  }
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  isLoading?: boolean;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent,
  isLoading,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
              {value}
            </p>
          )}
          <p className="text-[11px] text-slate-400">{subtitle}</p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const {
    data: stations,
    isLoading: stationsLoading,
    isError: stationsError,
  } = useFetchStations();
  const {
    data: schedules,
    isLoading: schedulesLoading,
    isError: schedulesError,
  } = useFetchSchedules();

  const stationList = stations ?? [];
  const scheduleList = schedules ?? [];

  const activeSchedules = scheduleList.filter(
    (s) => s.status === ScheduleStatus.ACTIVE,
  ).length;
  const pausedSchedules = scheduleList.filter(
    (s) => s.status === ScheduleStatus.PAUSED,
  ).length;

  const recentStations = stationList.slice(0, 5);
  const recentSchedules = scheduleList.slice(0, 5);

  const isLoading = stationsLoading || schedulesLoading;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Stations"
          value={stationList.length}
          subtitle="Registered in network"
          icon={<Server size={18} className="text-blue-600" />}
          accent="bg-blue-50"
          isLoading={stationsLoading}
        />
        <StatCard
          title="Active Schedules"
          value={activeSchedules}
          subtitle="Currently broadcasting"
          icon={<Activity size={18} className="text-emerald-600" />}
          accent="bg-emerald-50"
          isLoading={schedulesLoading}
        />
        <StatCard
          title="Paused Schedules"
          value={pausedSchedules}
          subtitle="Temporarily halted"
          icon={<Pause size={18} className="text-amber-600" />}
          accent="bg-amber-50"
          isLoading={schedulesLoading}
        />
        <StatCard
          title="Total Ads"
          value={scheduleList.length}
          subtitle="Across all schedules"
          icon={<Film size={18} className="text-violet-600" />}
          accent="bg-violet-50"
          isLoading={schedulesLoading}
        />
      </div>

      {/* Quick navigation */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/stations"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Server size={18} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Manage Stations
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Create, preview, and configure stations
                </p>
              </div>
            </div>
            <ArrowRight
              size={16}
              className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all"
            />
          </div>
        </Link>

        <Link
          href="/dashboard/schedules"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <Calendar size={18} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Manage Schedules
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Deploy and monitor ad pipelines
                </p>
              </div>
            </div>
            <ArrowRight
              size={16}
              className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all"
            />
          </div>
        </Link>
      </div>

      {/* Overview panels */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Stations */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Recent Stations
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Latest registered stations
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-xs text-slate-500"
            >
              <Link href="/dashboard/stations">
                View all
                <ChevronRight size={14} />
              </Link>
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            {stationsLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}

            {stationsError && (
              <div className="py-10 text-center text-sm text-slate-400">
                Failed to load stations.
              </div>
            )}

            {!stationsLoading && !stationsError && recentStations.length === 0 && (
              <div className="flex flex-col items-center py-10 gap-2">
                <Server size={24} className="text-slate-200" />
                <p className="text-sm text-slate-400">No stations yet.</p>
                <Button size="sm" asChild className="mt-1 bg-slate-900 hover:bg-slate-800">
                  <Link href="/dashboard/stations">Add station</Link>
                </Button>
              </div>
            )}

            {!stationsLoading &&
              !stationsError &&
              recentStations.map((station) => (
                <div
                  key={station.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 shrink-0">
                    <Server size={14} className="text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {station.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {station.address || station.device || "—"}
                    </p>
                  </div>
                  <StatusBadge status={station.status} type="station" />
                </div>
              ))}
          </div>
        </div>

        {/* Recent Schedules */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Recent Schedules
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Latest ad deployments
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-xs text-slate-500"
            >
              <Link href="/dashboard/schedules">
                View all
                <ChevronRight size={14} />
              </Link>
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            {schedulesLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <Skeleton className="h-8 w-10 rounded-md" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}

            {schedulesError && (
              <div className="py-10 text-center text-sm text-slate-400">
                Failed to load schedules.
              </div>
            )}

            {!schedulesLoading &&
              !schedulesError &&
              recentSchedules.length === 0 && (
                <div className="flex flex-col items-center py-10 gap-2">
                  <Film size={24} className="text-slate-200" />
                  <p className="text-sm text-slate-400">No schedules yet.</p>
                  <Button
                    size="sm"
                    asChild
                    className="mt-1 bg-slate-900 hover:bg-slate-800"
                  >
                    <Link href="/dashboard/schedules">Create schedule</Link>
                  </Button>
                </div>
              )}

            {!schedulesLoading &&
              !schedulesError &&
              recentSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex h-8 w-10 items-center justify-center rounded-md bg-slate-100 shrink-0">
                    <Film size={14} className="text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {deriveMediaName(schedule.mediaUrl)}
                    </p>
                    <p className="text-[11px] text-slate-400 capitalize">
                      {schedule.category?.replace(/_/g, " ")} · Priority{" "}
                      {String(schedule.priority).padStart(2, "0")}
                    </p>
                  </div>
                  <StatusBadge status={schedule.status} type="schedule" />
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      {!isLoading && scheduleList.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">
            Schedule Status Breakdown
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                ScheduleStatus.ACTIVE,
                ScheduleStatus.PAUSED,
                ScheduleStatus.SUSPENDED,
                // ScheduleStatus.CANCELLED,
              ] as const
            ).map((status) => {
              const count = scheduleList.filter(
                (s) => s.status === status,
              ).length;
              const pct =
                scheduleList.length > 0
                  ? Math.round((count / scheduleList.length) * 100)
                  : 0;
              return (
                <div
                  key={status}
                  className="rounded-lg border border-slate-100 bg-slate-50/50 p-3"
                >
                  <StatusBadge status={status} type="schedule" />
                  <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
                    {count}
                  </p>
                  <p className="text-[11px] text-slate-400">{pct}% of total</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
