import React, { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AudioProvider } from '@/contexts/AudioContext';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EffectSystemDashboard from "./pages/EffectSystemDashboard";
import DatabaseRecovery from "./pages/DatabaseRecovery";
import { initializeExtensionsOnStartup } from './data/extensionIntegration';
import { AchievementProvider } from './contexts/AchievementContext';
import UiOverlays from "./ui/UiOverlays";
import { areUiNotificationsEnabled } from './state/settings';
import { applyUiScale, getStoredUiScale, normalizeUiScale } from './state/uiScale';

const queryClient = new QueryClient();

const App = () => {
  const [uiNotificationsEnabled, setUiNotificationsEnabled] = useState(() => areUiNotificationsEnabled());

  useEffect(() => {
    // Initialize extensions on app startup
    initializeExtensionsOnStartup();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleToggle = (event: Event) => {
      const detail = (event as CustomEvent<{ enabled?: boolean }>).detail;
      if (detail && typeof detail.enabled === 'boolean') {
        setUiNotificationsEnabled(detail.enabled);
      } else {
        setUiNotificationsEnabled(areUiNotificationsEnabled());
      }
    };

    const handleUiScaleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ value?: unknown }>).detail;
      if (detail && typeof detail.value !== 'undefined') {
        applyUiScale(normalizeUiScale(detail.value, getStoredUiScale()));
      } else {
        applyUiScale(getStoredUiScale());
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'gameSettings') {
        setUiNotificationsEnabled(areUiNotificationsEnabled());
        applyUiScale(getStoredUiScale());
      }
    };

    window.addEventListener('shadowgov:ui-notifications-toggled', handleToggle);
    window.addEventListener('shadowgov:ui-scale-changed', handleUiScaleChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('shadowgov:ui-notifications-toggled', handleToggle);
      window.removeEventListener('shadowgov:ui-scale-changed', handleUiScaleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AudioProvider>
          <AchievementProvider>
            {uiNotificationsEnabled && <Toaster />}
            {uiNotificationsEnabled && <Sonner />}
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dev/effects" element={<EffectSystemDashboard />} />
                <Route path="/dev/recovery" element={<DatabaseRecovery />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            {uiNotificationsEnabled && <UiOverlays />}
          </AchievementProvider>
        </AudioProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
