import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import usePWAInstall from '../hooks/usePWAInstall';

const InstallPWA = () => {
  const { isInstalled, isIOS, canInstall, promptInstall } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (isInstalled) return;
    
    // Show prompt after delay if can install and hasn't been dismissed this session
    const hasSeenThisSession = sessionStorage.getItem('pwaInstallPromptSeen');
    if (!hasSeenThisSession && canInstall) {
      const timer = setTimeout(() => setShowPrompt(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [isInstalled, canInstall]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    
    const result = await promptInstall();
    if (result.success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwaInstallPromptSeen', 'true');
  };

  const handleCloseIOSInstructions = () => {
    setShowIOSInstructions(false);
    setShowPrompt(false);
    sessionStorage.setItem('pwaInstallPromptSeen', 'true');
  };

  // Don't show anything if installed
  if (isInstalled) return null;
  if (!showPrompt && !showIOSInstructions) return null;

  // iOS Instructions Modal
  if (showIOSInstructions) {
    return (
      <div 
        className="fixed inset-0 bg-black/70 flex items-end justify-center z-[9999]"
        onClick={handleCloseIOSInstructions}
      >
        <div 
          className="bg-white rounded-t-3xl w-full max-w-md animate-slide-up"
          onClick={(e) => e.stopPropagation()}
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <img 
                  src="/icons/icon-72x72.png" 
                  alt="Lotus Beauty" 
                  className="w-12 h-12 rounded-xl shadow-sm"
                />
                <div>
                  <h3 className="text-xl font-bold">Install App</h3>
                  <p className="text-sm text-gray-500">Add to Home Screen</p>
                </div>
              </div>
              <button onClick={handleCloseIOSInstructions} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                  1
                </div>
                <div className="pt-1.5">
                  <p className="font-semibold">Tap the Share button</p>
                  <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                    <Share size={16} />
                    <span>at the bottom of Safari</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                  2
                </div>
                <div className="pt-1.5">
                  <p className="font-semibold">Scroll down and tap</p>
                  <p className="text-sm text-gray-500 mt-1">"Add to Home Screen"</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                  3
                </div>
                <div className="pt-1.5">
                  <p className="font-semibold">Tap "Add" to install</p>
                  <p className="text-sm text-gray-500 mt-1">The app icon will appear on your home screen</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCloseIOSInstructions}
              className="w-full mt-8 btn-primary py-4 text-lg"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Install Banner
  return (
    <div 
      className="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:max-w-sm z-[9999] animate-slide-up"
      data-testid="install-pwa-prompt"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] p-4 relative">
          <button 
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            data-testid="dismiss-install-prompt"
          >
            <X size={18} className="text-white" />
          </button>
          
          <div className="flex items-center gap-4">
            <img 
              src="/icons/icon-72x72.png" 
              alt="Lotus Beauty" 
              className="w-16 h-16 rounded-2xl bg-white shadow-lg"
            />
            <div className="text-white">
              <h3 className="font-bold text-lg">Lotus Beauty</h3>
              <p className="text-white/80 text-sm">Install the app</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <p className="text-gray-600 text-sm mb-4">
            {isIOS 
              ? "Add Lotus Beauty to your home screen for quick access and a better experience!"
              : "Install Lotus Beauty for faster booking, offline access, and a native app experience!"
            }
          </p>
          
          <button
            onClick={handleInstall}
            className="w-full bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors touch-manipulation active:scale-[0.98]"
            data-testid="install-app-btn"
          >
            {isIOS ? (
              <>
                <Share size={20} />
                <span>Add to Home Screen</span>
              </>
            ) : (
              <>
                <Download size={20} />
                <span>Install App</span>
              </>
            )}
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-3">
            Free • No app store needed
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
