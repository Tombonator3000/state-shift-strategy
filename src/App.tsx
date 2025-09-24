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
import { GameSettingsProvider } from './contexts/GameSettingsContext';
import UiOverlays from "./ui/UiOverlays";

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
          <GameSettingsProvider>
            <AchievementProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dev/effects" element={<EffectSystemDashboard />} />
                  <Route path="/dev/recovery" element={<DatabaseRecovery />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              <UiOverlays />
            </AchievementProvider>
          </GameSettingsProvider>
        </AudioProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
