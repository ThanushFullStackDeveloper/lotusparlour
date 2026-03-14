import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Scissors, Calendar, Image, PlayCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Services', path: '/services', icon: Scissors },
    { name: 'Gallery', path: '/gallery', icon: Image },
    { name: 'Videos', path: '/videos', icon: PlayCircle },
    { name: 'Book', path: '/booking', icon: Calendar, highlight: true },
    { name: 'Profile', path: token && role === 'user' ? '/dashboard' : '/login', icon: User },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      data-testid="bottom-nav"
    >
      <div className="flex justify-around items-center py-1.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className="relative flex flex-col items-center justify-center py-1 px-1 min-w-[48px] touch-manipulation"
              data-testid={`bottom-nav-${item.name.toLowerCase()}`}
            >
              {item.highlight ? (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`w-12 h-12 -mt-6 rounded-full flex items-center justify-center shadow-lg ${
                    active 
                      ? 'bg-[var(--secondary)]' 
                      : 'bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]'
                  }`}
                >
                  <Icon size={22} className="text-white" strokeWidth={2.5} />
                </motion.div>
              ) : (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`p-1.5 rounded-xl transition-colors ${
                    active ? 'bg-[var(--secondary)]/10' : ''
                  }`}
                >
                  <Icon 
                    size={22}
                    strokeWidth={active ? 2.5 : 2}
                    className={active ? 'text-[var(--secondary)]' : 'text-gray-400'}
                  />
                </motion.div>
              )}
              <span className={`text-[10px] mt-0.5 ${
                active 
                  ? 'text-[var(--secondary)] font-semibold' 
                  : 'text-gray-400 font-medium'
              } ${item.highlight ? 'mt-1' : ''}`}>
                {item.name}
              </span>
              {active && !item.highlight && (
                <motion.div 
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--secondary)]" 
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
