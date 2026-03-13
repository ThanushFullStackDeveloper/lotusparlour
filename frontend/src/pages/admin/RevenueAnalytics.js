import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign } from 'lucide-react';
import { getRevenueData } from '../../utils/api';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const RevenueAnalytics = () => {
  const [revenueData, setRevenueData] = useState({ daily_revenue: [], service_revenue: [] });

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const response = await getRevenueData();
      setRevenueData(response.data);
    } catch (error) {
      toast.error('Failed to load revenue data');
    }
  };

  const COLORS = ['#D4AF37', '#D4A5A5', '#4A7c59', '#EFB054', '#D14D4D'];
  const totalRevenue = revenueData.service_revenue.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div data-testid="revenue-analytics">
      <h1 className="text-4xl font-bold mb-6">Revenue Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Total Revenue</h2>
            <DollarSign size={32} style={{ color: 'var(--secondary)' }} />
          </div>
          <p className="text-4xl font-bold" style={{ color: 'var(--secondary)' }}>₹{totalRevenue.toLocaleString()}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Top Service</h2>
            <TrendingUp size={32} style={{ color: 'var(--secondary)' }} />
          </div>
          {revenueData.service_revenue.length > 0 && (
            <div>
              <p className="text-2xl font-bold">{revenueData.service_revenue[0].name}</p>
              <p className="text-lg" style={{ color: 'var(--secondary)' }}>₹{revenueData.service_revenue[0].revenue}</p>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Daily Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData.daily_revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#D4AF37" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Revenue by Service</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={revenueData.service_revenue} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {revenueData.service_revenue.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
