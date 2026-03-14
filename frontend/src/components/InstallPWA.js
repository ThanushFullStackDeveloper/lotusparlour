import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // For non-iOS, listen for install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if iOS and show prompt after delay
    if (isIOSDevice) {
      const hasSeenIOSPrompt = localStorage.getItem('iosInstallPromptSeen');
      if (!hasSeenIOSPrompt) {
        setTimeout(() => setShowPrompt(true), 2000);
      }
    }

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem('iosInstallPromptSeen', 'true');
    }
  };

  const handleCloseIOSInstructions = () => {
    setShowIOSInstructions(false);
    setShowPrompt(false);
    localStorage.setItem('iosInstallPromptSeen', 'true');
  };

  if (isInstalled || !showPrompt) return null;

  // iOS Instructions Modal
  if (showIOSInstructions) {
    return (
      <div 
        className="fixed inset-0 bg-black/60 flex items-end justify-center z-[9999] p-4"
        onClick={handleCloseIOSInstructions}
      >
        <div 
          className="bg-white rounded-t-3xl w-full max-w-md p-6 animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">Install on iPhone/iPad</h3>
            <button onClick={handleCloseIOSInstructions} className="p-1">
              <X size={24} className="text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">1</div>
              <div>
                <p className="font-medium">Tap the Share button</p>
                <p className="text-sm text-gray-500">Look for the square with arrow at the bottom of Safari</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">2</div>
              <div>
                <p className="font-medium">Scroll and tap "Add to Home Screen"</p>
                <p className="text-sm text-gray-500">You may need to scroll down in the share menu</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">3</div>
              <div>
                <p className="font-medium">Tap "Add"</p>
                <p className="text-sm text-gray-500">The app will appear on your home screen</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleCloseIOSInstructions}
            className="w-full mt-6 btn-primary"
          >
            Got it!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-white rounded-2xl shadow-2xl p-4 z-[9999] animate-slide-up border border-gray-100"
      data-testid="install-pwa-prompt"
    >
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
        data-testid="dismiss-install-prompt"
      >
        <X size={20} />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shrink-0">
          <Smartphone size={28} className="text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg mb-1">Install Lotus Beauty App</h3>
          <p className="text-sm text-gray-500 mb-3">
            Get faster booking & offline access
          </p>
          
          <button
            onClick={handleInstall}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            data-testid="install-app-btn"
          >
            <Download size={18} />
            <span>Add to Home Screen</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
