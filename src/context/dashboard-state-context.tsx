import { ClientTracker, StationTrackingRequest, StationTrackingStatus } from "@/src/types/interfaces";
import { createContext, ReactNode, useContext, useState } from "react";

interface DashboardStateContextType {
  clientTracker: ClientTracker;
  setClientTracker: React.Dispatch<React.SetStateAction<ClientTracker>>;
  trackingRequest: StationTrackingRequest | null;
  setTrackingRequest: React.Dispatch<
    React.SetStateAction<StationTrackingRequest | null>
  >;
  pingStatus: StationTrackingStatus | null;
  setPingStatus: React.Dispatch<React.SetStateAction<StationTrackingStatus| null>>;
}

const DashboardStateContext = createContext<
  DashboardStateContextType | undefined
>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [clientTracker, setClientTracker] = useState({ stationId: "" });
  const [trackingRequest, setTrackingRequest] =
    useState<StationTrackingRequest | null>(null);
  const [pingStatus, setPingStatus] = useState<StationTrackingStatus| null>(null);

  return (
    <DashboardStateContext.Provider
      value={{
        clientTracker,
        setClientTracker,
        trackingRequest,
        setTrackingRequest,
        pingStatus,
        setPingStatus,
      }}
    >
      {children}
    </DashboardStateContext.Provider>
  );
};

export const useDashboardState = () => {
  const context = useContext(DashboardStateContext);

  if (context === undefined) {
    throw new Error(
      "useDashboardState must be used within a DashboardProvider",
    );
  }

  return context;
};
