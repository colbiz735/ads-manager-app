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
import { createDashboardId } from "../lib/utils";

const WebsocketStateContext = createContext<WebSocket | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const { setClientTracker, setPingStatus } = useDashboardState();

useEffect(() => {
  const apiBaseUrl = String(
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, ""),
  );
  const env = process.env.NODE_ENV;

  if (!apiBaseUrl || typeof window === "undefined") {
    return;
  }

  let ws: WebSocket | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let isUnmounted = false;
  let reconnectDelay = 1000;
  const maxReconnectDelay = 30_000;

  const connect = () => {
    if (isUnmounted) return;

    ws = new WebSocket(apiBaseUrl);

    ws.onopen = () => {
      console.info("Websocket connection established");
      reconnectDelay = 1000; // reset backoff on successful connect

      if (ws && ws.readyState === WebSocket.OPEN) {
        const dashboardId = createDashboardId();

        ws.send(
          JSON.stringify({
            event: "register-dashboard",
            data: {
              dashboardId,
            },
          }),
        );
      }
      setWebsocket(ws);
    };

    ws.onerror = (err) => {
      if (env === "development") {
        console.error("Error:-", err);
      }
      if (localStorage.getItem("dashboardId")) {
        localStorage.removeItem("dashboardId");
      }
      console.error("Ws error:- Error while connecting to websocket");
    };

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      const { event, data } = message;

      if (event === "track-client-response") {
        setClientTracker(data as ClientTracker);
      }

      if (event === "ping-station-response") {
        setPingStatus("success");
        // Revalidate station data
        queryClient.invalidateQueries({ queryKey: STATION_KEYS.stations });
      }

      if (event === "re-validate-stations") {
        // Revalidate station data
        queryClient.invalidateQueries({ queryKey: STATION_KEYS.stations });
      }
    };

    ws.onclose = () => {
      // Don't reconnect if the component unmounted
      if (isUnmounted) return;

      console.info(
        `Websocket closed. Reconnecting in ${reconnectDelay / 1000}s...`,
      );

      reconnectTimeout = setTimeout(() => {
        connect();
      }, reconnectDelay);

      // Exponential backoff
      reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
    };
  };

  connect();

  return () => {
    isUnmounted = true;
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    if (ws) {
      // Prevent the onclose handler from scheduling another reconnect
      ws.onclose = null;
      ws.close();
    }
  };
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
