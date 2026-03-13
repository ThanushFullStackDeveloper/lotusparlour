import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { getDashboardStats } from '../../utils/api';
import { toast } from 'sonner';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    total_appointments: 0,
    today_bookings: 0,
    pending_appointments: 0,
    total_revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: Calendar,
      label: 'Total Appointments',
      value: stats.total_appointments,
      color: 'bg-blue-500',
    },
    {
      icon: Clock,
      label: "Today's Bookings",
      value: stats.today_bookings,
      color: 'bg-green-500',
    },
    {
      icon: Users,
      label: 'Pending Appointments',
      value: stats.pending_appointments,
      color: 'bg-yellow-500',
    },
    {
      icon: TrendingUp,
      label: 'Total Revenue',
      value: `₹${stats.total_revenue.toLocaleString()}`,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div data-testid="dashboard-overview">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-heading mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to Lotus Beauty Parlour admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
            data-testid={`stat-card-${index}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                <card.icon size={24} className={`${card.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{card.value}</h3>
            <p className="text-sm text-gray-600">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/appointments" className="p-4 border-2 border-gray-200 rounded-lg hover:border-[var(--secondary)] transition-all text-center" data-testid="quick-action-appointments">
            <Calendar size={32} className="mx-auto mb-2" style={{ color: 'var(--secondary)' }} />
            <p className="font-semibold">Manage Appointments</p>
          </a>
          <a href="/admin/services" className="p-4 border-2 border-gray-200 rounded-lg hover:border-[var(--secondary)] transition-all text-center" data-testid="quick-action-services">
            <TrendingUp size={32} className="mx-auto mb-2" style={{ color: 'var(--secondary)' }} />
            <p className="font-semibold">Manage Services</p>
          </a>
          <a href="/admin/revenue" className="p-4 border-2 border-gray-200 rounded-lg hover:border-[var(--secondary)] transition-all text-center" data-testid="quick-action-revenue">
            <TrendingUp size={32} className="mx-auto mb-2" style={{ color: 'var(--secondary)' }} />
            <p className="font-semibold">View Revenue</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
