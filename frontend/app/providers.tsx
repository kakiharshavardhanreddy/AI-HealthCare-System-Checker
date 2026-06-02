"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";
import { GlobalBackgroundFallback } from "@/components/three/fallback-scenes";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { EmergencyOverlay } from "@/components/layout/emergency-overlay";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { ToastStack } from "@/components/notifications/toast-stack";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <GlobalBackgroundFallback />
        <ScrollProgress />
        <CustomCursor />
        {children}
        <EmergencyOverlay />
        <ToastStack />
        <ChatbotWidget />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
