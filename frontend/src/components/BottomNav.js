import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Scissors, Calendar, Image, PlayCircle, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Services', path: '/services', icon: Scissors },
    { name: 'Book', path: '/booking', icon: Calendar },
    { name: 'Gallery', path: '/gallery', icon: Image },
    { name: 'Videos', path: '/videos', icon: PlayCircle },
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
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom"
      data-testid="bottom-nav"
    >
      <div className="flex justify-around items-center py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center px-2 py-1 min-w-[50px] transition-colors ${
                active 
                  ? 'text-[var(--secondary)]' 
                  : 'text-gray-500 hover:text-[var(--secondary)]'
              }`}
              data-testid={`bottom-nav-${item.name.toLowerCase()}`}
            >
              <Icon 
                size={22} 
                strokeWidth={active ? 2.5 : 2}
                className={active ? 'mb-0.5' : ''}
              />
              <span className={`text-[10px] mt-0.5 ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.name}
              </span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-[var(--secondary)] mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
