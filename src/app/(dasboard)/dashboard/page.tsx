import DashboardOverview from "@/src/components/dasboard/dashboard-overview";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Ads Management Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Central overview of your stations, schedules, and ad deployments.
        </p>
      </div>
      <DashboardOverview />
    </div>
  );
}
