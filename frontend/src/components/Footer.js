import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Download, Share, X } from 'lucide-react';
import usePWAInstall from '../hooks/usePWAInstall';

const Footer = () => {
  const { isInstalled, isIOS, canInstall, promptInstall } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      await promptInstall();
    }
  };

  return (
    <footer className="bg-[var(--background-dark)] text-white mt-16 pb-20 md:pb-0" data-testid="footer">
      {/* iOS Install Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-[9999]" onClick={() => setShowIOSModal(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <img src="/icons/icon-72x72.png" alt="Lotus Beauty" className="w-12 h-12 rounded-xl" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Install App</h3>
                  <p className="text-sm text-gray-500">Add to Home Screen</p>
                </div>
              </div>
              <button onClick={() => setShowIOSModal(false)} className="p-2"><X size={24} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4 text-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">1</div>
                <p>Tap <Share size={16} className="inline mx-1" /> Share button</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">2</div>
                <p>Select "Add to Home Screen"</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">3</div>
                <p>Tap "Add" to install</p>
              </div>
            </div>
            <button onClick={() => setShowIOSModal(false)} className="w-full mt-6 btn-primary">Got it!</button>
          </div>
        </div>
      )}

      <div className="container-custom py-12">
        {/* Install App Banner - Mobile Only */}
        {canInstall && !isInstalled && (
          <div className="md:hidden bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-2xl p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/icons/icon-72x72.png" alt="Lotus Beauty" className="w-12 h-12 rounded-xl bg-white" />
              <div className="text-white">
                <p className="font-semibold">Install Lotus Beauty App</p>
                <p className="text-sm text-white/80">Faster booking & offline access</p>
              </div>
            </div>
            <button 
              onClick={handleInstallClick}
              className="bg-white text-[var(--secondary)] px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-1"
              data-testid="footer-install-btn"
            >
              {isIOS ? <Share size={16} /> : <Download size={16} />}
              Install
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-heading font-bold mb-4" style={{ color: 'var(--secondary)' }}>
              Lotus Beauty Parlour
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Your destination for premium beauty services in Tirunelveli. Experience elegance and transformation.
            </p>
            <div className="flex space-x-3 mt-4">
              <a href="#" className="hover:text-[var(--secondary)] transition-colors" data-testid="footer-facebook-link">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-[var(--secondary)] transition-colors" data-testid="footer-instagram-link">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-[var(--secondary)] transition-colors" data-testid="footer-link-home">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-[var(--secondary)] transition-colors" data-testid="footer-link-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-[var(--secondary)] transition-colors" data-testid="footer-link-services">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-gray-300 hover:text-[var(--secondary)] transition-colors" data-testid="footer-link-gallery">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Popular Services</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Bridal Makeup</li>
              <li>Hair Styling</li>
              <li>Facial Treatment</li>
              <li>Spa & Massage</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start space-x-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span>3/41, East Street, Main Road<br />Puthumanai, Tirunelveli<br />Tamil Nadu 627120</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} />
                <a href="tel:09500673208" className="hover:text-[var(--secondary)] transition-colors" data-testid="footer-phone-link">
                  09500673208
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={16} />
                <span>info@lotusbeauty.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Lotus Beauty Parlour. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
