import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, CheckCircle, XCircle, Loader } from 'lucide-react';
import { getAppointments, getCurrentUser } from '../utils/api';
import { toast } from 'sonner';

const CustomerDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, userRes] = await Promise.all([
        getAppointments(),
        getCurrentUser(),
      ]);
      setAppointments(appointmentsRes.data);
      setUser(userRes.data.user);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'cancelled':
        return <XCircle size={20} className="text-red-600" />;
      case 'completed':
        return <CheckCircle size={20} className="text-blue-600" />;
      default:
        return <Loader size={20} className="text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="customer-dashboard section-spacing" data-testid="customer-dashboard">
      <div className="container-custom">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-2">Welcome, {user?.name}!</h1>
          <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Manage your appointments and beauty journey
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" data-testid="stats-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="stat-card"
          >
            <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Total Appointments</h3>
            <p className="text-3xl font-bold" style={{ color: 'var(--secondary)' }}>{appointments.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Confirmed</h3>
            <p className="text-3xl font-bold text-green-600">
              {appointments.filter(a => a.status === 'confirmed').length}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="stat-card"
          >
            <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {appointments.filter(a => a.status === 'pending').length}
            </p>
          </motion.div>
        </div>

        {/* Appointments List */}
        <div data-testid="appointments-list">
          <h2 className="text-3xl font-bold font-heading mb-6">Your Appointments</h2>
          {appointments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Calendar size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>No appointments yet</p>
              <a href="/booking">
                <button className="btn-primary">Book Your First Appointment</button>
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
                  data-testid={`appointment-card-${index}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <h3 className="text-xl font-semibold">{appointment.service?.name || 'Service'}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} />
                          <span>{appointment.appointment_date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock size={16} />
                          <span>{appointment.appointment_time}</span>
                        </div>
                        {appointment.staff && (
                          <div className="flex items-center space-x-2">
                            <User size={16} />
                            <span>{appointment.staff.name}</span>
                          </div>
                        )}
                      </div>
                      {appointment.service && (
                        <p className="mt-2 text-sm">
                          Duration: {appointment.service.duration} mins | Price: <span className="font-bold" style={{ color: 'var(--secondary)' }}>₹{appointment.service.price}</span>
                        </p>
                      )}
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4">
                      {getStatusIcon(appointment.status)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
