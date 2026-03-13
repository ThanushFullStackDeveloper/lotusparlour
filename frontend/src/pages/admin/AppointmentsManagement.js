import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { getAppointments, updateAppointmentStatus } from '../../utils/api';
import { toast } from 'sonner';

const AppointmentsManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    let filtered = appointments;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.customer_phone.includes(searchTerm)
      );
    }
    setFilteredAppointments(filtered);
  }, [searchTerm, filterStatus, appointments]);

  const fetchAppointments = async () => {
    try {
      const response = await getAppointments();
      setAppointments(response.data);
      setFilteredAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      toast.success(`Appointment ${newStatus}`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading appointments...</div>;
  }

  return (
    <div data-testid="appointments-management">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-heading mb-2">Appointments Management</h1>
        <p className="text-gray-600">View and manage all customer appointments</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              data-testid="search-input"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            data-testid="status-filter"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="appointments-table">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No appointments found
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment, index) => (
                  <motion.tr
                    key={appointment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    data-testid={`appointment-row-${index}`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{appointment.customer_name}</p>
                        <p className="text-sm text-gray-500">{appointment.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{appointment.service?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">₹{appointment.service?.price || 0}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{appointment.appointment_date}</p>
                      <p className="text-sm text-gray-500">{appointment.appointment_time}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{appointment.staff?.name || 'Any'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Confirm"
                              data-testid={`confirm-btn-${index}`}
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel"
                              data-testid={`cancel-btn-${index}`}
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                            className="text-sm px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            data-testid={`complete-btn-${index}`}
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsManagement;
