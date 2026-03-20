import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Search, Calendar, Filter, ChevronDown, RefreshCw } from 'lucide-react';
import { getAppointments, updateAppointmentStatus, createAdminAppointment } from '../../utils/api';
import { clearCache } from '../../utils/cacheManager';
import { toast } from 'sonner';

const AppointmentsManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('newest');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [creating, setCreating] = useState(false);

const [formData, setFormData] = useState({
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  service_id: '',
  staff_id: '',
  appointment_date: '',
  appointment_time: ''
});

  // useEffect(() => {
  //   fetchAppointments();
  // }, []);
useEffect(() => {
  fetchAppointments();
  fetchMeta();
}, []);

  const fetchMeta = async () => {
  try {
    const [servicesRes, staffRes] = await Promise.all([
      getServices(),
      getStaff()
    ]);
    setServices(servicesRes.data);
    setStaffList(staffRes.data);
  } catch (err) {
    console.error(err);
  }
};
  useEffect(() => {
  if (formData.appointment_date && formData.service_id) {
    loadSlots();
  }
}, [formData.appointment_date, formData.service_id]);

const loadSlots = async () => {
  try {
    const res = await getAvailableSlots(
      formData.appointment_date,
      formData.service_id
    );
    setAvailableSlots(res.data.slots || []);
  } catch {
    toast.error("Failed to load slots");
  }
};

  
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await getAppointments();
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    // Filter by date
    if (filterDate) {
      filtered = filtered.filter(apt => apt.appointment_date === filterDate);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(apt =>
        apt.customer_name?.toLowerCase().includes(search) ||
        apt.customer_phone?.includes(search) ||
        apt.service?.name?.toLowerCase().includes(search)
      );
    }

    // Sort by date/time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`);
      const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [appointments, filterStatus, filterDate, searchTerm, sortOrder]);

  // const handleStatusUpdate = async (appointmentId, newStatus) => {
  //   try {
  //     await updateAppointmentStatus(appointmentId, newStatus);
  //     toast.success(`Appointment ${newStatus}`);
  //     fetchAppointments();
  //   } catch (error) {
  //     console.error('Error updating appointment:', error);
  //     toast.error('Failed to update appointment');
  //   }
  // };
  const handleCreateAppointment = async () => {
  if (!formData.customer_name || !formData.customer_phone || !formData.service_id) {
    return toast.error("Fill all required fields");
  }

  try {
    setCreating(true);
    await createAdminAppointment(formData);
    toast.success("Appointment created");

    setShowCreateModal(false);
    fetchAppointments();

    setFormData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      service_id: '',
      staff_id: '',
      appointment_date: '',
      appointment_time: ''
    });

  } catch {
    toast.error("Failed to create appointment");
  } finally {
    setCreating(false);
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

  // Stats
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterDate('');
  };

  const hasActiveFilters = searchTerm || filterStatus !== 'all' || filterDate;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-[var(--secondary)]/30"></div>
          <p className="mt-3 text-gray-500">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="appointments-management">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-heading mb-1">Appointments</h1>
    
        <button
        onClick={() => setShowCreateModal(true)}
        className="mt-2 px-4 py-2 bg-[var(--secondary)] text-white rounded-lg text-sm" 
        > + New Appointment
       </button>
          
        <p className="text-sm text-gray-600">Manage customer bookings</p>
      </div>

      {/* Stats Cards - Horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {[
          { label: 'Total', count: stats.total, color: 'bg-gray-100 text-gray-800' },
          { label: 'Pending', count: stats.pending, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Confirmed', count: stats.confirmed, color: 'bg-green-100 text-green-800' },
          { label: 'Completed', count: stats.completed, color: 'bg-blue-100 text-blue-800' },
          { label: 'Cancelled', count: stats.cancelled, color: 'bg-red-100 text-red-800' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`flex-shrink-0 px-4 py-2 rounded-lg ${stat.color}`}
          >
            <p className="text-xl font-bold">{stat.count}</p>
            <p className="text-xs font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search name, phone, service"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--secondary)]/20 focus:border-[var(--secondary)]"
              data-testid="search-input"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:ring-2 focus:ring-[var(--secondary)]/20 focus:border-[var(--secondary)]"
              data-testid="status-filter"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--secondary)]/20 focus:border-[var(--secondary)]"
              data-testid="date-filter"
            />
          </div>

          {/* Sort & Actions */}
          <div className="flex gap-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm appearance-none bg-white"
              data-testid="sort-order"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg"
              >
                Clear
              </button>
            )}
            <button
              onClick={fetchAppointments}
              className="p-2.5 text-gray-600 hover:text-[var(--secondary)] border border-gray-200 rounded-lg"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm text-gray-500">
          Showing {filteredAppointments.length} of {appointments.length} appointments
        </span>
      </div>

      {/* Appointments List - Mobile friendly cards */}
      <div className="space-y-3 md:hidden">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Calendar size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          filteredAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02, duration: 0.2 }}
              className="bg-white p-4 rounded-xl shadow-sm"
              data-testid={`appointment-card-${index}`}
            >
              {/* Customer & Status */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{appointment.customer_name}</p>
                  <p className="text-xs text-gray-500">{appointment.customer_phone}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>

              {/* Service */}
              <div className="mb-3">
                <p className="text-sm font-medium">{appointment.service?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500">₹{appointment.service?.price || 0} • {appointment.staff?.name || 'Any staff'}</p>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{appointment.appointment_date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{appointment.appointment_time}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                {appointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                      className="flex-1 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                      className="flex-1 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {appointment.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                    className="flex-1 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Mark Completed
                  </button>
                )}
                {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                  <p className="flex-1 py-2 text-sm text-center text-gray-400">No actions available</p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Appointments Table - Desktop */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="appointments-table">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
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
                    className="hover:bg-gray-50"
                    data-testid={`appointment-row-${index}`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">{appointment.customer_name}</p>
                        <p className="text-xs text-gray-500">{appointment.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm">{appointment.service?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">₹{appointment.service?.price || 0}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm">{appointment.appointment_date}</p>
                      <p className="text-xs text-gray-500">{appointment.appointment_time}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{appointment.staff?.name || 'Any'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Confirm"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                            className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
    {showCreateModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-5 rounded-xl w-full max-w-md space-y-3">

      <h2 className="text-lg font-bold">Create Appointment</h2>

      <input placeholder="Name" className="input"
        value={formData.customer_name}
        onChange={(e)=>setFormData({...formData, customer_name:e.target.value})}
      />

      <input placeholder="Phone" className="input"
        value={formData.customer_phone}
        onChange={(e)=>setFormData({...formData, customer_phone:e.target.value})}
      />

      <input placeholder="Email" className="input"
        value={formData.customer_email}
        onChange={(e)=>setFormData({...formData, customer_email:e.target.value})}
      />

      <select className="input"
        value={formData.service_id}
        onChange={(e)=>setFormData({...formData, service_id:e.target.value})}
      >
        <option value="">Select Service</option>
        {services.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <select className="input"
        value={formData.staff_id}
        onChange={(e)=>setFormData({...formData, staff_id:e.target.value})}
      >
        <option value="">Any Staff</option>
        {staffList.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <input type="date" className="input"
        value={formData.appointment_date}
        onChange={(e)=>setFormData({...formData, appointment_date:e.target.value})}
      />

      {/* SLOT DROPDOWN */}
      <select className="input"
        value={formData.appointment_time}
        onChange={(e)=>setFormData({...formData, appointment_time:e.target.value})}
      >
        <option value="">Select Time</option>
        {availableSlots.map(slot => (
          <option key={slot} value={slot}>{slot}</option>
        ))}
      </select>

      <div className="flex gap-2">
        <button
          onClick={handleCreateAppointment}
          disabled={creating}
          className="bg-green-500 text-white w-full py-2 rounded"
        >
          {creating ? "Creating..." : "Create"}
        </button>

        <button
          onClick={()=>setShowCreateModal(false)}
          className="bg-gray-300 w-full py-2 rounded"
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}
  );
};

export default AppointmentsManagement;
