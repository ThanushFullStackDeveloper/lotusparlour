import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, CheckCircle, XCircle, Loader, CalendarPlus, ArrowLeft } from 'lucide-react';
import { getAppointments, getCurrentUser, getAppointmentICS } from '../utils/api';
import { toast } from 'sonner';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [activeFilter, appointments]);

  const fetchData = async () => {
    try {
      const [appointmentsRes, userRes] = await Promise.all([
        getAppointments(),
        getCurrentUser(),
      ]);
      // Sort by date descending (newest first)
      const sortedAppointments = appointmentsRes.data.sort((a, b) => {
        const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`);
        const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`);
        return dateB - dateA;
      });
      setAppointments(sortedAppointments);
      setUser(userRes.data.user);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    if (activeFilter === 'all') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter(apt => apt.status === activeFilter));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'cancelled':
        return <XCircle size={18} className="text-red-600" />;
      case 'completed':
        return <CheckCircle size={18} className="text-blue-600" />;
      default:
        return <Loader size={18} className="text-yellow-600" />;
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

  const handleAddToCalendar = (appointmentId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add to calendar');
      return;
    }
    
    // Create a link to download the ICS file
    const icsUrl = `${getAppointmentICS(appointmentId)}`;
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = icsUrl;
    link.setAttribute('download', `appointment.ics`);
    
    // Add authorization header via fetch and blob
    fetch(icsUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to download calendar file');
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lotus_appointment.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Calendar file downloaded! Open it to add to your calendar.');
    })
    .catch(error => {
      console.error('Calendar download error:', error);
      toast.error('Failed to download calendar file');
    });
  };

  const filterTabs = [
    { key: 'all', label: 'All', count: appointments.length },
    { key: 'pending', label: 'Pending', count: appointments.filter(a => a.status === 'pending').length },
    { key: 'confirmed', label: 'Confirmed', count: appointments.filter(a => a.status === 'confirmed').length },
    { key: 'completed', label: 'Completed', count: appointments.filter(a => a.status === 'completed').length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[var(--secondary)]/30"></div>
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard" data-testid="customer-dashboard">
      {/* Fixed Back Button */}
      <div className="fixed left-0 right-0 top-[60px] md:top-[72px] z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100/50 shadow-sm">
        <div className="container-custom px-4 py-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-[var(--secondary)] transition-colors touch-manipulation"
            data-testid="dashboard-back-btn"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Home</span>
          </button>
        </div>
      </div>
      
      {/* Spacer for fixed back button */}
      <div className="h-[44px]"></div>
      
      <div className="py-4 md:py-8">
        <div className="container-custom px-4">
          {/* Welcome Section - Compact for mobile */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <h1 className="text-2xl md:text-4xl font-bold font-heading mb-1">
              Hi, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
              Manage your beauty appointments
            </p>
          </motion.div>

        {/* Stats Cards - Horizontal scroll on mobile */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6 scrollbar-hide" data-testid="stats-section">
          {filterTabs.map((tab, index) => (
            <motion.button
              key={tab.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl transition-all touch-manipulation ${
                activeFilter === tab.key
                  ? 'bg-[var(--secondary)] text-white shadow-lg'
                  : 'bg-white text-gray-700 shadow-sm'
              }`}
              data-testid={`filter-${tab.key}`}
            >
              <p className="text-2xl font-bold">{tab.count}</p>
              <p className="text-xs font-medium whitespace-nowrap">{tab.label}</p>
            </motion.button>
          ))}
        </div>

        {/* Appointments List */}
        <div data-testid="appointments-list">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold font-heading">
              {activeFilter === 'all' ? 'All Appointments' : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Appointments`}
            </h2>
            <span className="text-sm text-gray-500">{filteredAppointments.length} found</span>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Calendar size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
                {activeFilter === 'all' ? 'No appointments yet' : `No ${activeFilter} appointments`}
              </p>
              {activeFilter === 'all' && (
                <a href="/booking">
                  <button className="btn-primary">Book Appointment</button>
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  className="bg-white p-4 rounded-xl shadow-sm"
                  data-testid={`appointment-card-${index}`}
                >
                  {/* Header with service name and status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold truncate">
                        {appointment.service?.name || 'Service'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {appointment.service?.duration} mins • ₹{appointment.service?.price}
                      </p>
                    </div>
                    <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span className="hidden sm:inline">{appointment.status}</span>
                    </span>
                  </div>

                  {/* Date, Time, Staff */}
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>{appointment.appointment_date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>{appointment.appointment_time}</span>
                    </div>
                    {appointment.staff && (
                      <div className="flex items-center gap-1.5">
                        <User size={14} />
                        <span>{appointment.staff.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Add to Calendar Button */}
                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                    <button
                      onClick={() => handleAddToCalendar(appointment.id)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[var(--secondary)]/10 text-[var(--secondary)] rounded-lg hover:bg-[var(--secondary)]/20 transition-colors text-sm font-medium"
                      data-testid={`add-to-calendar-${index}`}
                    >
                      <CalendarPlus size={16} />
                      Add to Calendar
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Book More Button - Fixed at bottom on mobile */}
        <div className="mt-6 pb-4">
          <a href="/booking" className="block">
            <button className="btn-primary w-full py-3 text-base">
              Book New Appointment
            </button>
          </a>
        </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
