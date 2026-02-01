import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { X, Download, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export function PWAPrompt() {
  const { isInstallable, isInstalled, isOnline, needsUpdate, isUpdating, install, update, dismissUpdate } = usePWA();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show install prompt after a delay if installable
  useEffect(() => {
    if (isInstallable && !isInstalled && !dismissed) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000); // Show after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed]);

  // Show offline notice when going offline
  useEffect(() => {
    if (!isOnline) {
      setShowOfflineNotice(true);
      const timer = setTimeout(() => {
        setShowOfflineNotice(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShowInstallPrompt(false);
    }
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    setDismissed(true);
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Check if was dismissed this session
  useEffect(() => {
    if (sessionStorage.getItem('pwa-install-dismissed') === 'true') {
      setDismissed(true);
    }
  }, []);

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up md:left-auto md:right-4 md:w-96">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-amber-500/50 rounded-lg shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-amber-500/20 p-2 rounded-full">
                <Download className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-400 text-lg">Install Paranoid Times</h3>
                <p className="text-slate-300 text-sm mt-1">
                  Add to your home screen for offline play and a better experience.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold px-4 py-2 rounded text-sm transition-all"
                  >
                    Install App
                  </button>
                  <button
                    onClick={handleDismissInstall}
                    className="text-slate-400 hover:text-slate-300 px-3 py-2 text-sm transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismissInstall}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Available */}
      {needsUpdate && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down md:left-auto md:right-4 md:w-96">
          <div className="bg-gradient-to-br from-emerald-900 to-slate-800 border-2 border-emerald-500/50 rounded-lg shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-full">
                <RefreshCw className={`w-6 h-6 text-emerald-400 ${isUpdating ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-emerald-400 text-lg">Update Available</h3>
                <p className="text-slate-300 text-sm mt-1">
                  A new version of Paranoid Times is ready. Refresh to update.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={update}
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 text-slate-900 font-bold px-4 py-2 rounded text-sm transition-all"
                  >
                    {isUpdating ? 'Updating...' : 'Update Now'}
                  </button>
                  <button
                    onClick={dismissUpdate}
                    disabled={isUpdating}
                    className="text-slate-400 hover:text-slate-300 px-3 py-2 text-sm transition-colors disabled:opacity-50"
                  >
                    Later
                  </button>
                </div>
              </div>
              <button
                onClick={dismissUpdate}
                disabled={isUpdating}
                className="text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Notice */}
      {showOfflineNotice && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-gradient-to-r from-red-900 to-slate-800 border border-red-500/50 rounded-full shadow-xl px-4 py-2 flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-red-300 text-sm font-medium">You're offline</span>
          </div>
        </div>
      )}

      {/* Online Restored Notice */}
      {!isOnline === false && showOfflineNotice === false && (
        <div className="hidden">
          {/* Placeholder for online restored animation */}
        </div>
      )}
    </>
  );
}

// Offline Status Indicator for the game UI
export function OfflineIndicator() {
  const { isOnline, isInstalled } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-2 right-2 z-40 flex items-center gap-1.5 bg-slate-800/90 border border-amber-500/30 rounded-full px-3 py-1">
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span className="text-amber-400 text-xs font-medium">Offline</span>
      {isInstalled && (
        <span className="text-slate-400 text-xs">• Playing locally</span>
      )}
    </div>
  );
}
