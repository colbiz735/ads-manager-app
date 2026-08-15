"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { DashboardProvider } from "../app/context/dashboard-state-context";
import { WebSocketProvider } from "../app/context/websocket-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <DashboardProvider>
          <WebSocketProvider>{children}</WebSocketProvider>
        </DashboardProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
