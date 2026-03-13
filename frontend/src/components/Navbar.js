import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
    window.location.reload();
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Gallery', path: '/gallery' },
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
            {token && role === 'user' && (
              <Link
                to="/dashboard"
                className="text-base font-medium hover:text-[var(--secondary)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
                data-testid="nav-link-dashboard"
              >
                Dashboard
              </Link>
            )}
            {token ? (
              <button onClick={handleLogout} className="btn-secondary" data-testid="nav-logout-btn">
                Logout
              </button>
            ) : (
              <Link to="/login" data-testid="nav-login-btn">
                <button className="btn-secondary">Login</button>
              </Link>
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
