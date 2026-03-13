import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  Users,
  Image,
  Star,
  CalendarOff,
  Tag,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Video,
} from 'lucide-react';

// Admin pages
import DashboardOverview from './admin/DashboardOverview';
import AppointmentsManagement from './admin/AppointmentsManagement';
import ServicesManagement from './admin/ServicesManagement';
import StaffManagement from './admin/StaffManagement';
import GalleryManagement from './admin/GalleryManagement';
import ReviewsManagement from './admin/ReviewsManagement';
import HolidaysManagement from './admin/HolidaysManagement';
import CouponsManagement from './admin/CouponsManagement';
import RevenueAnalytics from './admin/RevenueAnalytics';
import StaffCalendar from './admin/StaffCalendar';
import VideosManagement from './admin/VideosManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: Briefcase, label: 'Services', path: '/admin/services' },
    { icon: Users, label: 'Staff', path: '/admin/staff' },
    { icon: Image, label: 'Gallery', path: '/admin/gallery' },
    { icon: Star, label: 'Reviews', path: '/admin/reviews' },
    { icon: CalendarOff, label: 'Holidays', path: '/admin/holidays' },
    { icon: Tag, label: 'Coupons', path: '/admin/coupons' },
    { icon: TrendingUp, label: 'Revenue', path: '/admin/revenue' },
    { icon: Video, label: 'Videos', path: '/admin/videos' },
    { icon: Calendar, label: 'Staff Calendar', path: '/admin/staff-calendar' },
  ];

  return (
    <div className="admin-dashboard flex h-screen bg-gray-50" data-testid="admin-dashboard">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        data-testid="mobile-sidebar-toggle"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 admin-sidebar transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
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
              onClick={() => setSidebarOpen(false)}
              className="admin-nav-item flex items-center space-x-3"
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8">
          <Routes>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/appointments" element={<AppointmentsManagement />} />
            <Route path="/services" element={<ServicesManagement />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/gallery" element={<GalleryManagement />} />
            <Route path="/reviews" element={<ReviewsManagement />} />
            <Route path="/holidays" element={<HolidaysManagement />} />
            <Route path="/coupons" element={<CouponsManagement />} />
            <Route path="/revenue" element={<RevenueAnalytics />} />
            <Route path="/staff-calendar" element={<StaffCalendar />} />
            <Route path="/videos" element={<VideosManagement />} />
            <Route path="/" element={<DashboardOverview />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
