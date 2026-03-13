import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, Calendar, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('userName') || 'User';

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

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50" data-testid="navbar">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3" data-testid="nav-logo">
            <img
              src="https://customer-assets.emergentagent.com/job_241db126-351c-4832-a8fb-845982688c90/artifacts/41r87k77_4B7AC146-0B06-4B1E-A8D9-0A69F86F7A02.jpeg"
              alt="Lotus Beauty Parlour"
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-xl font-heading font-bold" style={{ color: 'var(--secondary)' }}>
                LOTUS
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Beauty Parlour
              </p>
            </div>
          </Link>

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
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="nav-mobile-toggle"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
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
