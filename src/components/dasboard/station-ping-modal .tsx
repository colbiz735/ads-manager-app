"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Activity,
  CheckCircle2,
  Loader2,
  Radio,
  RefreshCcw,
  WifiOff,
} from "lucide-react";
import { useDashboardState } from "@/src/context/dashboard-state-context";
import { StationResponse } from "@/src/types/interfaces";

interface StationTrackerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry: (station: StationResponse) => Promise<void>;
  station: StationResponse | null;
}

export default function StationPingModal({
  open,
  onOpenChange,
  onRetry,
  station,
}: StationTrackerModalProps) {
  const { pingStatus } = useDashboardState();
  const showFailure = pingStatus === "error" || pingStatus === "timeout";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 overflow-hidden border-slate-200 sm:rounded-2xl flex flex-col max-w-sm transition-all">
        <DialogHeader className="px-5 py-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                {pingStatus === "loading" ? (
                  <Radio
                    size={16}
                    className="text-blue-600 shrink-0 animate-pulse"
                  />
                ) : (
                  <Activity size={16} className="text-slate-600 shrink-0" />
                )}
                Checking Station Activeness
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-500 mt-1 truncate">
                Station ID: <span className="text-sm text-slate-600">{station?.name}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {showFailure && (
          <div className="flex flex-col items-center py-10 px-6 text-center gap-4 animate-in fade-in-50 duration-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100">
              <WifiOff size={20} className="text-amber-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-800">
                Connection Failed
              </p>
              <p className="text-xs text-slate-500 max-w-[260px] leading-relaxed">
                {pingStatus === "timeout"
                  ? "The station didn't respond in time. It may be offline or experiencing connectivity issues."
                  : "We couldn't initiate the pinging request. Check your connection and try again."}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => onRetry(station as StationResponse)}
              className="bg-slate-900 hover:bg-slate-800 h-9 px-4 gap-2 text-xs font-medium rounded-xl shadow-sm"
            >
              <RefreshCcw size={13} />
              Retry Connection
            </Button>
          </div>
        )}

        {pingStatus === "loading" && !showFailure && (
          <div className="flex flex-col items-center py-12 px-6 text-center gap-4 animate-in fade-in-50 duration-200">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
              <Loader2
                size={22}
                className="text-blue-600 animate-spin absolute opacity-40"
              />
              <Activity size={18} className="text-blue-600 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-800">
                Pinging Station...
              </p>
              <p className="text-xs text-slate-400 max-w-[220px]">
                Establishing handshake with the remote client.
              </p>
            </div>
          </div>
        )}

        {pingStatus === "success" && (
          <div className="flex flex-col items-center py-10 px-6 text-center gap-4 animate-in zoom-in-95 duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 shadow-inner">
              <CheckCircle2 size={22} className="text-emerald-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-800">
                Station Operational
              </p>
              <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed">
                Pinging successful. The system is up, running, and playing ads.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => onOpenChange(false)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-5 text-xs font-medium rounded-xl shadow-sm border border-emerald-700/20"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
