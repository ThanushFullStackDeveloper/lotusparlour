import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  Users,
  Image,
  Star,
  Tag,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Video,
  Settings,
  HelpCircle,
  UserCheck,
  MessageSquare,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Admin pages
import DashboardOverview from './admin/DashboardOverview';
import AppointmentsManagement from './admin/AppointmentsManagement';
import ServicesManagement from './admin/ServicesManagement';
import StaffManagement from './admin/StaffManagement';
import GalleryManagement from './admin/GalleryManagement';
import ReviewsManagement from './admin/ReviewsManagement';
import CouponsManagement from './admin/CouponsManagement';
import RevenueAnalytics from './admin/RevenueAnalytics';
import StaffCalendar from './admin/StaffCalendar';
import VideosManagement from './admin/VideosManagement';
import SettingsManagement from './admin/SettingsManagement';
import CustomersManagement from './admin/CustomersManagement';
import SupportManagement from './admin/SupportManagement';
import EnquiriesManagement from './admin/EnquiriesManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: UserCheck, label: 'Customers', path: '/admin/customers' },
    { icon: Briefcase, label: 'Services', path: '/admin/services' },
    { icon: Users, label: 'Staff', path: '/admin/staff' },
    { icon: Image, label: 'Gallery', path: '/admin/gallery' },
    { icon: Video, label: 'Videos', path: '/admin/videos' },
    { icon: Star, label: 'Reviews', path: '/admin/reviews' },
    { icon: Tag, label: 'Coupons', path: '/admin/coupons' },
    { icon: TrendingUp, label: 'Revenue', path: '/admin/revenue' },
    { icon: Calendar, label: 'Staff Calendar', path: '/admin/staff-calendar' },
    { icon: MessageSquare, label: 'Enquiries', path: '/admin/enquiries' },
    { icon: HelpCircle, label: 'Support', path: '/admin/support' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  // Bottom nav items for mobile admin (most used features)
  const mobileNavItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/admin/dashboard' },
    { icon: Calendar, label: 'Bookings', path: '/admin/appointments' },
    { icon: UserCheck, label: 'Customers', path: '/admin/customers' },
    { icon: Image, label: 'Gallery', path: '/admin/gallery' },
    { icon: Menu, label: 'More', action: 'menu' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getCurrentPageTitle = () => {
    const current = menuItems.find(item => isActive(item.path));
    return current?.label || 'Dashboard';
  };

  const handleBack = () => {
    // If on main dashboard, go to home page
    if (location.pathname === '/admin/dashboard' || location.pathname === '/admin') {
      navigate('/');
    } else {
      // Otherwise go to dashboard
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="admin-dashboard flex flex-col md:flex-row min-h-screen bg-gray-50" data-testid="admin-dashboard">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1 -ml-1 text-gray-600 hover:text-[var(--secondary)] transition-colors touch-manipulation"
            data-testid="admin-back-btn"
          >
            <ArrowLeft size={22} />
          </button>
          <img
            src="https://customer-assets.emergentagent.com/job_241db126-351c-4832-a8fb-845982688c90/artifacts/41r87k77_4B7AC146-0B06-4B1E-A8D9-0A69F86F7A02.jpeg"
            alt="Logo"
            className="h-8 w-8 object-contain"
          />
          <span className="font-bold text-lg" style={{ color: 'var(--secondary)' }}>Admin</span>
        </div>
        <span className="text-sm font-medium text-gray-600">{getCurrentPageTitle()}</span>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className="hidden md:block w-64 admin-sidebar shrink-0"
        data-testid="admin-sidebar"
      >
        <div className="flex items-center space-x-3 mb-8 px-4">
          <img
            src="https://customer-assets.emergentagent.com/job_241db126-351c-4832-a8fb-845982688c90/artifacts/41r87k77_4B7AC146-0B06-4B1E-A8D9-0A69F86F7A02.jpeg"
            alt="Logo"
            className="h-10 w-10 object-contain"
          />
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--secondary)' }}>
              LOTUS ADMIN
            </h2>
            <p className="text-xs text-gray-400">Management Panel</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item flex items-center space-x-3 ${isActive(item.path) ? 'active' : ''}`}
              data-testid={`nav-item-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="admin-nav-item flex items-center space-x-3 mt-8 w-full"
          data-testid="admin-logout-btn"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Mobile Slide-Out Menu */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="md:hidden fixed right-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl overflow-y-auto"
              data-testid="mobile-menu"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-lg">Menu</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                      isActive(item.path)
                        ? 'bg-[var(--secondary)]/10 text-[var(--secondary)]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-14 pb-20 md:pt-0 md:pb-0">
        <div className="p-4 md:p-8">
          <Routes>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/appointments" element={<AppointmentsManagement />} />
            <Route path="/customers" element={<CustomersManagement />} />
            <Route path="/services" element={<ServicesManagement />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/gallery" element={<GalleryManagement />} />
            <Route path="/videos" element={<VideosManagement />} />
            <Route path="/reviews" element={<ReviewsManagement />} />
            <Route path="/coupons" element={<CouponsManagement />} />
            <Route path="/revenue" element={<RevenueAnalytics />} />
            <Route path="/staff-calendar" element={<StaffCalendar />} />
            <Route path="/enquiries" element={<EnquiriesManagement />} />
            <Route path="/support" element={<SupportManagement />} />
            <Route path="/settings" element={<SettingsManagement />} />
            <Route path="/" element={<DashboardOverview />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Bottom Navigation for Admin */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
        data-testid="admin-bottom-nav"
      >
        <div className="flex justify-around items-center py-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = item.action !== 'menu' && isActive(item.path);
            
            if (item.action === 'menu') {
              return (
                <button
                  key="menu"
                  onClick={() => setSidebarOpen(true)}
                  className="flex flex-col items-center justify-center py-1 px-3 text-gray-500"
                  data-testid="admin-mobile-menu-btn"
                >
                  <Icon size={22} />
                  <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
                </button>
              );
            }
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1 px-3 ${
                  active ? 'text-[var(--secondary)]' : 'text-gray-500'
                }`}
                data-testid={`admin-nav-${item.label.toLowerCase()}`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className={`text-[10px] mt-0.5 ${active ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AdminDashboard;
