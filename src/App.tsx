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
import ArticleCombinerPage from "./pages/ArticleCombinerPage";
import { initializeExtensionsOnStartup } from './data/extensionIntegration';
import { AchievementProvider } from './contexts/AchievementContext';
import UiOverlays from "./ui/UiOverlays";
import { PWAPrompt, OfflineIndicator } from "./components/pwa/PWAPrompt";

const queryClient = new QueryClient();

// Determine basename for React Router based on deployment environment
// GitHub Pages uses /state-shift-strategy/, Lovable uses /
const getBasename = () => {
  // Check if we're on GitHub Pages by looking at hostname
  if (window.location.hostname.includes('github.io')) {
    return '/state-shift-strategy';
  }
  return '/';
};

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
            <BrowserRouter basename={getBasename()}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dev/effects" element={<EffectSystemDashboard />} />
                <Route path="/dev/recovery" element={<DatabaseRecovery />} />
                <Route path="/dev/article-combiner" element={<ArticleCombinerPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <UiOverlays />
            <PWAPrompt />
            <OfflineIndicator />
          </AchievementProvider>
        </AudioProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
