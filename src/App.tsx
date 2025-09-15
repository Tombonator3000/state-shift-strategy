import React from 'react';
import { useEffect } from 'react';
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

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize extensions on app startup
    initializeExtensionsOnStartup();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AudioProvider>
          <AchievementProvider>
            <Toaster />
            <Sonner />
            {/* layout-fix no-cut v21E */}
            <div className="grid min-h-[100svh] grid-rows-[auto,1fr,auto] w-full">
              <header className="shrink-0 h-[var(--masthead-h)]" />
              <main className="min-h-0 min-w-0 overflow-y-auto">
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dev/effects" element={<EffectSystemDashboard />} />
                    <Route path="/dev/recovery" element={<DatabaseRecovery />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </main>
              <footer className="shrink-0 h-[var(--tray-h)]" />
            </div>
          </AchievementProvider>
        </AudioProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
