"use client";

import { useQueryClient } from "@tanstack/react-query";
import CreateScheduleForm from "@/src/components/dasboard/create-schedule-form";
import SchedulesList from "@/src/components/dasboard/list-schedules";
import { ScheduleResponse } from "@/src/types/interfaces";
import { useState } from "react";

export default function SchedulesPage() {
  const queryClient = useQueryClient();

  // ScheduleResponse  edit mode, form prefilled with this station
  const [editTarget, setEditTarget] = useState<ScheduleResponse | null>(null);

  const handleEdit = (schedule: ScheduleResponse) => {
    setEditTarget(schedule);
    // Scroll the form panel into view on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => setEditTarget(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Schedules Manager
        </h1>
        <p className="text-slate-500 text-sm">
          Create and track automated publishing pipelines across multi-channel
          ad delivery pipelines.
        </p>
      </div>

      {/* DUAL PANEL MESH CONTAINER WORKSPACE GRID */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[5fr_6fr]">
        {/* PANEL A: CREATE NEW SCHEDULE FORM SIDE (Takes 5 Fractions Column space) */}
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm h-fit">
          <CreateScheduleForm
            onSuccess={() =>
              queryClient.invalidateQueries({
                queryKey: ["schedules-list"],
              })
            }
            editTarget={editTarget}
            setEditTarget={setEditTarget}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        {/* PANEL B: ACTIVE SCHEDULES SIDE (Takes 6 Fractions Columns space) */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <SchedulesList
            onEdit={handleEdit}
            editTargetId={editTarget?.id ?? null}
            onCancelEdit={handleCancelEdit}
          />
        </div>
      </div>
    </div>
  );
}
