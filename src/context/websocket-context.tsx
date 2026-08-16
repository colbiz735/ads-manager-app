import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useDashboardState } from "./dashboard-state-context";
import { ClientTracker } from "@/src/types/interfaces";
import { useQueryClient } from "@tanstack/react-query";
import { STATION_KEYS } from "@/src/hooks/use-stations";

const WebsocketStateContext = createContext<WebSocket | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const { setClientTracker } = useDashboardState();

  useEffect(() => {
    const apiBaseUrl = String(
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, ""),
    );
    const env = process.env.NODE_ENV;

    if (!apiBaseUrl || typeof window === "undefined") {
      return;
    }

    const ws = new WebSocket(apiBaseUrl);

    ws.onopen = () => {
        console.info("Websocket connection established");

      if (ws && ws.readyState)
        ws.send(JSON.stringify({ event: "register-dashboard" }));

      setWebsocket(ws);
    };

    ws.onerror = (err) => {
      if (env === "development") {
        console.error("Error:-", err);
      }
      console.error("Ws error:- Error while connecting to websocket");
    };

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      const { event, data } = message;

      if (event === "track-client-response") {
        setClientTracker(data as ClientTracker);
      }

      if (event === "re-validate-stations") {
        // Revalidate station data
        queryClient.invalidateQueries({ queryKey: STATION_KEYS.stations });
      }
    };

    return () => ws.close();
  }, []);

  return (
    <WebsocketStateContext.Provider value={websocket}>
      {children}
    </WebsocketStateContext.Provider>
  );
};

export const useWebsocketContext = () => {
  const context = useContext(WebsocketStateContext);

  if (context === undefined) {
    throw new Error(
      "useDashboardState must be used within a DashboardProvider",
    );
  }

  return context;
};
