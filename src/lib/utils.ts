export const createDashboardId = () => {
  const dashboardId = `dashboard-${crypto.randomUUID()}`;
  if (localStorage.getItem("dashboardId"))
    localStorage.removeItem("dashboardId");

  localStorage.setItem("dashboardId", dashboardId);

  return dashboardId;
};
