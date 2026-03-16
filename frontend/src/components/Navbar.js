import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, Calendar, LogOut, ChevronDown, Instagram, Facebook, Youtube } from 'lucide-react';
import { getSettings } from '../utils/api';

const DEFAULT_LOGO = 'https://customer-assets.emergentagent.com/job_241db126-351c-4832-a8fb-845982688c90/artifacts/41r87k77_4B7AC146-0B06-4B1E-A8D9-0A69F86F7A02.jpeg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settings, setSettings] = useState({ 
    parlour_name: 'LOTUS', 
    logo_image: null,
    instagram_url: '',
    facebook_url: '',
    youtube_url: ''
  });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('userName') || 'User';

  const fetchSettings = useCallback(async () => {
    try {
      const response = await getSettings();
      setSettings(response.data);
    } catch (error) {
      console.log('Failed to load settings');
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    
    // Listen for settings update events
    const handleSettingsUpdate = () => {
      fetchSettings();
    };
    
    window.addEventListener('settings-updated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
    };
  }, [fetchSettings]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    navigate('/');
    window.location.reload();
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Videos', path: '/videos' },
    { name: 'Staff', path: '/staff' },
    { name: 'Contact', path: '/contact' },
  ];

  // Parse parlour name into title parts
  const parlourName = settings.parlour_name || 'Lotus Beauty Parlour';
  const nameParts = parlourName.split(' ');
  const mainTitle = nameParts[0]?.toUpperCase() || 'LOTUS';
  const subTitle = nameParts.slice(1).join(' ') || 'Beauty Parlour';

  return (
    <nav 
      className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 navbar-safe-area" 
      data-testid="navbar"
    >
      {/* Safe area spacer for iOS PWA */}
      <div className="safe-area-spacer"></div>
      <div className="container-custom">
        <div className="flex justify-between items-center py-2 md:py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 md:space-x-3" data-testid="nav-logo">
              <img
                src={settings.logo_image || DEFAULT_LOGO}
                alt={parlourName}
                className="h-12 w-12 md:h-16 md:w-16 object-contain"
              />
              <div>
                <h1 className="text-lg md:text-2xl font-heading font-bold" style={{ color: 'var(--secondary)' }}>
                  {mainTitle}
                </h1>
                <p className="text-[10px] md:text-xs" style={{ color: 'var(--text-muted)' }}>
                  {subTitle}
                </p>
              </div>
            </Link>
            
            {/* Social Media Icons - Compact & Aligned */}
            {(settings.instagram_url || settings.facebook_url || settings.youtube_url) && (
              <div className="ml-3 md:ml-5 flex items-center gap-1">
                <span className="text-[7px] md:text-[9px] text-gray-400 mr-1 hidden sm:block whitespace-nowrap">Follow us</span>
                {settings.instagram_url && (
                  <a 
                    href={settings.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white hover:scale-110 transition-transform"
                    data-testid="nav-instagram"
                  >
                    <Instagram size={10} className="md:w-3 md:h-3" />
                  </a>
                )}
                {settings.facebook_url && (
                  <a 
                    href={settings.facebook_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full bg-blue-600 text-white hover:scale-110 transition-transform"
                    data-testid="nav-facebook"
                  >
                    <Facebook size={10} className="md:w-3 md:h-3" />
                  </a>
                )}
                {settings.youtube_url && (
                  <a 
                    href={settings.youtube_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full bg-red-600 text-white hover:scale-110 transition-transform"
                    data-testid="nav-youtube"
                  >
                    <Youtube size={10} className="md:w-3 md:h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-base font-medium hover:text-[var(--secondary)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
                data-testid={`nav-link-${link.name.toLowerCase()}`}
              >
                {link.name}
              </Link>
            ))}
            {token && role === 'user' ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 text-base font-medium hover:text-[var(--secondary)] transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  data-testid="profile-dropdown-btn"
                >
                  <User size={20} />
                  <span>{userName}</span>
                  <ChevronDown size={16} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50" data-testid="profile-dropdown-menu">
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                      data-testid="profile-menu-appointments"
                    >
                      <Calendar size={18} />
                      <span>My Appointments</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors w-full text-left"
                      data-testid="profile-menu-logout"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              !token && (
                <Link to="/login" data-testid="nav-login-btn">
                  <button className="btn-secondary">Login</button>
                </Link>
              )
            )}
            <Link to="/booking" data-testid="nav-book-btn">
              <button className="btn-primary">Book Now</button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -mr-2 flex items-center justify-center"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="nav-mobile-toggle"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3" data-testid="nav-mobile-menu">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 text-base font-medium hover:text-[var(--secondary)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => setIsOpen(false)}
                data-testid={`nav-mobile-link-${link.name.toLowerCase()}`}
              >
                {link.name}
              </Link>
            ))}
            {token && role === 'user' && (
              <Link
                to="/dashboard"
                className="block py-2 text-base font-medium hover:text-[var(--secondary)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => setIsOpen(false)}
                data-testid="nav-mobile-link-dashboard"
              >
                Dashboard
              </Link>
            )}
            <div className="flex flex-col space-y-2 pt-2">
              {token ? (
                <button onClick={handleLogout} className="btn-secondary w-full" data-testid="nav-mobile-logout-btn">
                  Logout
                </button>
              ) : (
                <Link to="/login" className="w-full" onClick={() => setIsOpen(false)} data-testid="nav-mobile-login-btn">
                  <button className="btn-secondary w-full">Login</button>
                </Link>
              )}
              <Link to="/booking" className="w-full" onClick={() => setIsOpen(false)} data-testid="nav-mobile-book-btn">
                <button className="btn-primary w-full">Book Now</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
