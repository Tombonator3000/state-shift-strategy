import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AudioProvider } from '@/contexts/AudioContext';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EffectSystemDashboard from "./pages/EffectSystemDashboard";
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
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dev/effects" element={<EffectSystemDashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AchievementProvider>
        </AudioProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
