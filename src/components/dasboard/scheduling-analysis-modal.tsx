"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Lightbulb,
  Loader2,
  MapPin,
  Radio,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { SchedulingAnalysisResponse } from "@/src/types/interfaces";
import {
  ACTIVITY_LABELS,
  CONFLICT_TYPE_LABELS,
  DECISION_LABELS,
  formatAnalysisDateRange,
  formatConfidence,
  formatDuration,
  formatFrequency,
  formatNumber,
  formatTimeRange,
  formatWeekdays,
  getActivityStyles,
  getConfidencePercent,
  getDecisionStyles,
  getSeverityStyles,
  getTimingAssessmentStyles,
  RECOMMENDATION_ACTION_LABELS,
  SEVERITY_LABELS,
  TIMING_ASSESSMENT_LABELS,
} from "@/src/lib/scheduling-analysis-formatters";
import { SectionLabel } from "./preview-shared";

const LOADING_STEPS = [
  "Checking existing schedules",
  "Reviewing historical playback",
  "Evaluating timing and station activity",
  "Generating recommendation",
];

type AnalysisPhase = "loading" | "result" | "error";

interface SchedulingAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phase: AnalysisPhase;
  analysis: SchedulingAnalysisResponse | null;
  onProceed: () => void;
  onAdjust: () => void;
  onRetry: () => void;
  isProceeding?: boolean;
}

function AnalysisCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-4 sm:p-5 ${className}`}
    >
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        {title}
      </h3>
      {children}
    </section>
  );
}

function KpiBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
      <p className="text-[11px] font-medium text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800 tabular-nums">{value}</p>
    </div>
  );
}

function LoadingView() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="relative mb-6">
        <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Sparkles className="h-7 w-7 text-slate-600 animate-pulse" />
        </div>
        <Loader2 className="absolute -bottom-1 -right-1 h-6 w-6 text-indigo-600 animate-spin" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">
        Analyzing your schedule…
      </h3>
      <p className="text-sm text-slate-500 mb-8 max-w-sm">
        Our scheduling advisor is reviewing your proposed schedule against
        existing activity and historical playback data.
      </p>
      <div className="w-full max-w-xs space-y-3 text-left">
        {LOADING_STEPS.map((step, i) => {
          const isActive = i === activeStep;
          const isDone = i < activeStep;
          return (
            <div
              key={step}
              className={`flex items-center gap-3 text-sm transition-opacity ${
                isActive ? "opacity-100" : isDone ? "opacity-60" : "opacity-35"
              }`}
            >
              {isDone ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              ) : isActive ? (
                <Loader2
                  size={16}
                  className="text-indigo-600 animate-spin shrink-0"
                />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-slate-200 shrink-0" />
              )}
              <span className="text-slate-600">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ErrorView({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">
        Unable to complete scheduling analysis
      </h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">
        We couldn&apos;t analyze this schedule right now. Please try again.
      </p>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCw size={14} />
        Try again
      </Button>
    </div>
  );
}

function DecisionCard({ analysis }: { analysis: SchedulingAnalysisResponse }) {
  const styles = getDecisionStyles(analysis.decision);
  const label = DECISION_LABELS[analysis.decision];
  const confidencePct = getConfidencePercent(analysis.confidence);

  return (
    <div
      className={`rounded-xl border p-5 sm:p-6 ${styles.border} ${styles.bg}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="shrink-0">
          {analysis.decision === "recommended" ? (
            <CheckCircle2 size={28} className={styles.title} />
          ) : analysis.decision === "warning" ? (
            <AlertTriangle size={28} className={styles.title} />
          ) : (
            <XCircle size={28} className={styles.title} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${styles.title}`}>
            {label.title}
          </h3>
          <p className={`text-sm mt-1.5 leading-relaxed ${styles.text}`}>
            {analysis.summary || label.description}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 max-w-[160px]">
              <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${styles.bar}`}
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-medium text-slate-500 tabular-nums">
              {formatConfidence(analysis.confidence)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleOverviewSection({
  analysis,
}: {
  analysis: SchedulingAnalysisResponse;
}) {
  const schedule = analysis.overview?.proposedSchedule;
  const competition = analysis.overview?.existingCompetition;
  const historical = analysis.overview?.historicalActivity;

  if (!schedule) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AnalysisCard title="Schedule Overview">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-[11px] font-medium text-slate-400 mb-0.5">
              Category
            </p>
            <p className="text-sm font-semibold text-slate-800 capitalize">
              {schedule.category || "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 mb-0.5">
              Stations
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {schedule.stationCount}{" "}
              {schedule.stationCount === 1 ? "station" : "stations"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 mb-0.5">
              Duration
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {formatDuration(schedule.duration)}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <p className="text-[11px] font-medium text-slate-400 mb-0.5">
              Date range
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {formatAnalysisDateRange(schedule.startDate, schedule.endDate)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 mb-0.5">
              Weekdays
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {formatWeekdays(schedule.weekdays)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 mb-0.5">
              Frequency
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {formatFrequency(schedule.frequency)}
            </p>
          </div>
        </div>
        {(schedule.timeSlots?.length ?? 0) > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <SectionLabel icon={Clock}>Time slots</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {schedule.timeSlots.map((slot, i) => (
                <span
                  key={i}
                  className="text-xs font-medium bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg tabular-nums"
                >
                  {formatTimeRange(slot.start, slot.end)}
                </span>
              ))}
            </div>
          </div>
        )}
      </AnalysisCard>

      <div className="space-y-4">
        {competition && (
          <AnalysisCard title="Existing Scheduling Activity">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-slate-800 tabular-nums">
                {formatNumber(competition.scheduleCount)}
              </span>
              <span className="text-sm text-slate-500">
                existing{" "}
                {competition.scheduleCount === 1 ? "schedule" : "schedules"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              across {competition.affectedStationCount}{" "}
              affected{" "}
              {competition.affectedStationCount === 1 ? "station" : "stations"}
            </p>
            {competition.description && (
              <p className="text-sm text-slate-600 leading-relaxed">
                {competition.description}
              </p>
            )}
          </AnalysisCard>
        )}

        {historical && (
          <AnalysisCard title="Historical Category Activity">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <KpiBlock
                label="Last 24 hours"
                value={`${formatNumber(historical.last24Hours)} plays`}
              />
              <KpiBlock
                label="Last 7 days"
                value={`${formatNumber(historical.last7Days)} plays`}
              />
              <KpiBlock
                label="This month"
                value={`${formatNumber(historical.currentMonth)} plays`}
              />
            </div>
            {historical.description ? (
              <p className="text-sm text-slate-600 leading-relaxed">
                {historical.description}
              </p>
            ) : (
              historical.last24Hours === 0 &&
              historical.last7Days === 0 &&
              historical.currentMonth === 0 && (
                <p className="text-sm text-slate-500 italic">
                  No historical playback data available for this period.
                </p>
              )
            )}
          </AnalysisCard>
        )}
      </div>
    </div>
  );
}

function TimingAnalysisSection({
  analysis,
}: {
  analysis: SchedulingAnalysisResponse;
}) {
  const timing = analysis.timingAnalysis;
  if (!timing) return null;

  const assessmentLabel =
    TIMING_ASSESSMENT_LABELS[timing.assessment] ?? timing.assessment;
  const assessmentStyles = getTimingAssessmentStyles(timing.assessment);

  return (
    <AnalysisCard title="Timing Analysis">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge className={`ring-1 ${assessmentStyles}`}>{assessmentLabel}</Badge>
      </div>

      {(timing.proposedPeriods?.length ?? 0) > 0 && (
        <div className="mb-5">
          <SectionLabel icon={Clock}>Your selected time</SectionLabel>
          <div className="space-y-3">
            {timing.proposedPeriods.map((period, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-100 bg-slate-50/50 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-slate-800 tabular-nums">
                    {formatTimeRange(period.start, period.end)}
                  </span>
                  <Badge
                    className={`ring-1 ${getActivityStyles(period.activityLevel)}`}
                  >
                    {ACTIVITY_LABELS[period.activityLevel]} activity
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 tabular-nums mb-1">
                  {formatNumber(period.playbackCount)} historical plays
                </p>
                {period.description && (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {period.description}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center my-2">
            <ArrowDown size={16} className="text-slate-300" />
          </div>
          <p className="text-center text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Historical activity
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(timing.peakPeriods?.length ?? 0) > 0 && (
          <div>
            <SectionLabel icon={TrendingUp}>Peak periods</SectionLabel>
            <div className="space-y-1.5">
              {timing.peakPeriods.map((period, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm bg-emerald-50/50 rounded-lg px-3 py-2"
                >
                  <span className="font-medium text-slate-700 tabular-nums">
                    {formatTimeRange(period.start, period.end)}
                  </span>
                  <span className="text-xs text-slate-500 tabular-nums">
                    {formatNumber(period.playbackCount)} plays
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(timing.lowPeriods?.length ?? 0) > 0 && (
          <div>
            <SectionLabel icon={TrendingDown}>Lower activity periods</SectionLabel>
            <div className="space-y-1.5">
              {timing.lowPeriods.map((period, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2"
                >
                  <span className="font-medium text-slate-700 tabular-nums">
                    {formatTimeRange(period.start, period.end)}
                  </span>
                  <span className="text-xs text-slate-500 tabular-nums">
                    {formatNumber(period.playbackCount)} plays
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {timing.explanation && (
        <p className="text-sm text-slate-600 leading-relaxed mt-4 pt-4 border-t border-slate-100">
          {timing.explanation}
        </p>
      )}
    </AnalysisCard>
  );
}

function ConflictsSection({
  analysis,
}: {
  analysis: SchedulingAnalysisResponse;
}) {
  const conflicts = analysis.conflicts ?? [];

  return (
    <AnalysisCard title="Conflicts & Competition">
      {conflicts.length === 0 ? (
        <div className="flex items-start gap-3 py-2">
          <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-800">
              No scheduling conflicts detected
            </p>
            <p className="text-sm text-slate-500 mt-1">
              We did not find any significant conflicts with the existing
              schedules.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {conflicts.map((conflict, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-100 p-4 space-y-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={`ring-1 ${getSeverityStyles(conflict.severity)}`}
                >
                  {SEVERITY_LABELS[conflict.severity]} severity
                </Badge>
                <span className="text-sm font-semibold text-slate-800">
                  {conflict.title ||
                    CONFLICT_TYPE_LABELS[conflict.type] ||
                    conflict.type}
                </span>
              </div>
              {conflict.description && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {conflict.description}
                </p>
              )}
              {conflict.impact && (
                <div className="rounded-md bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    Impact
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {conflict.impact}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AnalysisCard>
  );
}

function StationAnalysisSection({
  analysis,
}: {
  analysis: SchedulingAnalysisResponse;
}) {
  const stations = analysis.stationAnalysis ?? [];

  return (
    <AnalysisCard title="Station Analysis">
      {stations.length === 0 ? (
        <p className="text-sm text-slate-500 py-2">
          No station-level analysis is available for this schedule.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stations.map((station) => (
            <div
              key={station.stationId}
              className="rounded-lg border border-slate-100 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <h4 className="text-sm font-semibold text-slate-800 truncate">
                    {station.stationName}
                  </h4>
                </div>
                <Badge
                  className={`ring-1 shrink-0 ${getActivityStyles(station.activity)}`}
                >
                  {ACTIVITY_LABELS[station.activity]} activity
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <KpiBlock
                  label="24 hours"
                  value={formatNumber(station.last24Hours)}
                />
                <KpiBlock
                  label="7 days"
                  value={formatNumber(station.last7Days)}
                />
                <KpiBlock
                  label="This month"
                  value={formatNumber(station.currentMonth)}
                />
              </div>
              {station.assessment && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Assessment
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {station.assessment}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AnalysisCard>
  );
}

function RecommendationSection({
  analysis,
}: {
  analysis: SchedulingAnalysisResponse;
}) {
  const rec = analysis.recommendation;
  if (!rec) return null;

  const actionLabel =
    RECOMMENDATION_ACTION_LABELS[rec.action] ?? rec.action;

  return (
    <AnalysisCard title="Recommendation">
      <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-4 mb-4">
        <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1">
          What we recommend
        </p>
        <p className="text-base font-semibold text-indigo-900">{actionLabel}</p>
      </div>

      {rec.reason && (
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Why
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">{rec.reason}</p>
        </div>
      )}

      {(rec.suggestedTimeSlots?.length ?? 0) > 0 && (
        <div className="mb-4 pt-4 border-t border-slate-100">
          <SectionLabel icon={Clock}>Suggested time</SectionLabel>
          <div className="space-y-2">
            {rec.suggestedTimeSlots!.map((slot, i) => (
              <div
                key={i}
                className="rounded-lg bg-slate-50 px-3 py-2.5"
              >
                <p className="text-sm font-semibold text-slate-800 tabular-nums">
                  {formatTimeRange(slot.start, slot.end)}
                </p>
                {slot.reason && (
                  <p className="text-sm text-slate-600 mt-1">{slot.reason}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {rec.suggestedFrequency && (
        <div className="mb-4 pt-4 border-t border-slate-100">
          <SectionLabel icon={Radio}>Suggested frequency</SectionLabel>
          <p className="text-sm font-semibold text-slate-800">
            {formatFrequency(rec.suggestedFrequency)}
          </p>
          {rec.suggestedFrequency.reason && (
            <p className="text-sm text-slate-600 mt-1">
              {rec.suggestedFrequency.reason}
            </p>
          )}
        </div>
      )}

      {(rec.suggestedStations?.length ?? 0) > 0 && (
        <div className="mb-4 pt-4 border-t border-slate-100">
          <SectionLabel icon={MapPin}>Suggested stations</SectionLabel>
          <div className="space-y-2">
            {rec.suggestedStations!.map((station) => (
              <div
                key={station.stationId}
                className="rounded-lg bg-slate-50 px-3 py-2.5"
              >
                <p className="text-sm font-semibold text-slate-800">
                  {station.stationName}
                </p>
                {station.reason && (
                  <p className="text-sm text-slate-600 mt-1">
                    {station.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {rec.suggestedDateRange && (
        <div className="pt-4 border-t border-slate-100">
          <SectionLabel icon={Calendar}>Suggested date range</SectionLabel>
          <p className="text-sm font-semibold text-slate-800">
            {formatAnalysisDateRange(
              rec.suggestedDateRange.startDate,
              rec.suggestedDateRange.endDate,
            )}
          </p>
          {rec.suggestedDateRange.reason && (
            <p className="text-sm text-slate-600 mt-1">
              {rec.suggestedDateRange.reason}
            </p>
          )}
        </div>
      )}
    </AnalysisCard>
  );
}

function InsightsSection({ analysis }: { analysis: SchedulingAnalysisResponse }) {
  const insights = analysis.insights ?? [];
  if (insights.length === 0) return null;

  return (
    <AnalysisCard title="Key Insights">
      <ul className="space-y-2.5">
        {insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Lightbulb
              size={15}
              className="text-amber-500 shrink-0 mt-0.5"
            />
            <span className="text-sm text-slate-700 leading-relaxed">
              {insight}
            </span>
          </li>
        ))}
      </ul>
    </AnalysisCard>
  );
}

function AnalysisResult({ analysis }: { analysis: SchedulingAnalysisResponse }) {
  return (
    <div className="space-y-4">
      <DecisionCard analysis={analysis} />
      <ScheduleOverviewSection analysis={analysis} />
      <TimingAnalysisSection analysis={analysis} />
      <ConflictsSection analysis={analysis} />
      <StationAnalysisSection analysis={analysis} />
      <RecommendationSection analysis={analysis} />
      <InsightsSection analysis={analysis} />
    </div>
  );
}

export default function SchedulingAnalysisModal({
  open,
  onOpenChange,
  phase,
  analysis,
  onProceed,
  onAdjust,
  onRetry,
  isProceeding = false,
}: SchedulingAnalysisModalProps) {
  const showFooter = phase === "result";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] sm:max-w-3xl lg:max-w-4xl p-0 gap-0 overflow-hidden border-slate-200 sm:rounded-2xl max-h-[92vh] flex flex-col"
        showCloseButton={phase !== "loading"}
        onInteractOutside={(e) => {
          if (phase === "loading") e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (phase === "loading") e.preventDefault();
        }}
      >
        <DialogHeader className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <BarChart3 size={16} className="text-slate-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900">
                Scheduling Analysis
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                AI-powered recommendation for your proposed schedule
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-5 sm:px-6 py-5">
            {phase === "loading" && <LoadingView />}
            {phase === "error" && <ErrorView onRetry={onRetry} />}
            {phase === "result" && analysis && (
              <AnalysisResult analysis={analysis} />
            )}
          </div>
        </ScrollArea>

        {showFooter && (
          <>
            <Separator />
            <DialogFooter className="px-5 sm:px-6 py-4 shrink-0 sm:justify-between">
              <Button
                variant="outline"
                onClick={onAdjust}
                disabled={isProceeding}
                className="w-full sm:w-auto"
              >
                Adjust schedule
              </Button>
              <Button
                onClick={onProceed}
                disabled={isProceeding}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white gap-2"
              >
                {isProceeding ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Creating schedule…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Continue & create schedule
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
