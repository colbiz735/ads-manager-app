import { ClientTracker } from "@/src/types/interfaces";
import { createContext, ReactNode, useContext, useState } from "react";

interface DashboardStateContextType {
  clientTracker: ClientTracker;
  setClientTracker: React.Dispatch<React.SetStateAction<ClientTracker>>;
}

const DashboardStateContext = createContext<
  DashboardStateContextType | undefined
>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [clientTracker, setClientTracker] = useState({ stationId: "" });

  return (
    <DashboardStateContext.Provider
      value={{
        clientTracker,
        setClientTracker,
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
