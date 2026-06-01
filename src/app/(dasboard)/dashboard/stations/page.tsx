"use client";

import { useState } from "react";
import { StationResponse } from "@/src/types/interfaces";
import StationsList from "@/src/components/dasboard/stations-list";
import CreateStationForm from "@/src/components/dasboard/create-stations-form";

export default function StationsPage() {

  // StationResponse → edit mode, form prefilled with this station
  const [editTarget, setEditTarget] = useState<StationResponse | null>(null);

  const handleEdit = (station: StationResponse) => {
    setEditTarget(station);
    // Scroll the form panel into view on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => setEditTarget(null);

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Stations Manager
        </h1>
        <p className="text-slate-500 text-sm">
          Create and manage stations for your advert system.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[5fr_6fr]">
        {/* Panel A — Form (create or edit) */}
        <div className="h-fit">
          <CreateStationForm
            editTarget={editTarget}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        {/* Panel B — Stations list */}
        <div>
          <StationsList
            onEdit={handleEdit}
            editTargetId={editTarget?.id ?? null}
          />
        </div>
      </div>
    </div>
  );
}