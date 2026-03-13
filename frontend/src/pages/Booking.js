import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';
import { getServices, getStaff, createAppointment, getAvailableSlots, getHolidays } from '../utils/api';
import { toast } from 'sonner';

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const [formData, setFormData] = useState({
    service_id: location.state?.selectedService?.id || '',
    staff_id: '',
    appointment_date: '',
    appointment_time: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.appointment_date && formData.service_id) {
      fetchAvailableSlots();
    }
  }, [formData.appointment_date, formData.service_id]);

  const fetchData = async () => {
    try {
      const [servicesRes, staffRes, holidaysRes] = await Promise.all([
        getServices(),
        getStaff(),
        getHolidays(),
      ]);
      setServices(servicesRes.data);
      setStaff(staffRes.data);
      setHolidays(holidaysRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load booking data');
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await getAvailableSlots(formData.appointment_date, formData.service_id);
      if (!response.data.available) {
        toast.error(response.data.message || 'This date is not available');
        setAvailableSlots([]);
      } else {
        setAvailableSlots(response.data.slots);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load available slots');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceSelect = (serviceId) => {
    setFormData({ ...formData, service_id: serviceId });
    setStep(2);
  };

  const handleDateSelect = (e) => {
    setFormData({ ...formData, appointment_date: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to book an appointment');
      navigate('/login', { state: { from: '/booking', bookingData: formData } });
      return;
    }

    try {
      await createAppointment(formData);
      toast.success('Appointment booked successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.detail || 'Failed to book appointment');
    }
  };

  const selectedService = services.find(s => s.id === formData.service_id);
  const selectedStaff = staff.find(s => s.id === formData.staff_id);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-page section-spacing" data-testid="booking-page">
      <div className="container-custom max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold font-heading mb-4">Book Your Appointment</h1>
          <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Follow the simple steps to schedule your beauty treatment
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12" data-testid="booking-steps">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= num ? 'bg-[var(--secondary)] text-white' : 'bg-gray-200 text-gray-500'
                }`}
                data-testid={`step-indicator-${num}`}
              >
                {num}
              </div>
              {num < 3 && <div className={`w-16 h-1 ${step > num ? 'bg-[var(--secondary)]' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-8 rounded-2xl shadow-lg"
        >
          {/* Step 1: Select Service */}
          {step === 1 && (
            <div data-testid="step-1-service">
              <h2 className="text-3xl font-bold font-heading mb-6 flex items-center">
                <Calendar className="mr-3" style={{ color: 'var(--secondary)' }} />
                Select Service
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.service_id === service.id
                        ? 'border-[var(--secondary)] bg-[var(--background-alt)]'
                        : 'border-gray-200 hover:border-[var(--secondary)]'
                    }`}
                    data-testid={`service-option-${service.id}`}
                  >
                    <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{service.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold" style={{ color: 'var(--secondary)' }}>₹{service.price}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{service.duration} mins</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Date, Time & Staff */}
          {step === 2 && (
            <div data-testid="step-2-datetime">
              <h2 className="text-3xl font-bold font-heading mb-6 flex items-center">
                <Clock className="mr-3" style={{ color: 'var(--secondary)' }} />
                Select Date & Time
              </h2>

              {selectedService && (
                <div className="mb-6 p-4 bg-[var(--background-alt)] rounded-lg">
                  <p className="text-sm font-semibold">Selected Service:</p>
                  <p className="text-lg" style={{ color: 'var(--secondary)' }}>{selectedService.name}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Appointment Date *</label>
                  <input
                    type="date"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleDateSelect}
                    min={today}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    data-testid="date-input"
                  />
                </div>

                {formData.appointment_date && availableSlots.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Time Slot *</label>
                    <div className="grid grid-cols-4 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setFormData({ ...formData, appointment_time: slot })}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            formData.appointment_time === slot
                              ? 'bg-[var(--secondary)] text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          data-testid={`time-slot-${slot}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Staff (Optional)</label>
                  <select
                    name="staff_id"
                    value={formData.staff_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    data-testid="staff-select"
                  >
                    <option value="">Any Available Staff</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} - {member.role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(1)} className="btn-secondary" data-testid="back-to-step-1">
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!formData.appointment_date || !formData.appointment_time) {
                      toast.error('Please select date and time');
                      return;
                    }
                    setStep(3);
                  }}
                  className="btn-primary"
                  data-testid="next-to-step-3"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Customer Details & Confirmation */}
          {step === 3 && (
            <div data-testid="step-3-details">
              <h2 className="text-3xl font-bold font-heading mb-6 flex items-center">
                <User className="mr-3" style={{ color: 'var(--secondary)' }} />
                Your Details
              </h2>

              <div className="mb-6 p-4 bg-[var(--background-alt)] rounded-lg">
                <h3 className="font-semibold mb-2">Booking Summary</h3>
                <p className="text-sm">Service: <span className="font-medium">{selectedService?.name}</span></p>
                <p className="text-sm">Date: <span className="font-medium">{formData.appointment_date}</span></p>
                <p className="text-sm">Time: <span className="font-medium">{formData.appointment_time}</span></p>
                {selectedStaff && <p className="text-sm">Staff: <span className="font-medium">{selectedStaff.name}</span></p>}
                <p className="text-sm mt-2">Price: <span className="font-bold" style={{ color: 'var(--secondary)' }}>₹{selectedService?.price}</span></p>
                <p className="text-xs mt-2 text-yellow-700 bg-yellow-50 p-2 rounded">Payment: Cash at Parlour</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    data-testid="customer-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    data-testid="customer-phone-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    data-testid="customer-email-input"
                  />
                </div>

                <div className="flex justify-between mt-8">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary" data-testid="back-to-step-2">
                    Back
                  </button>
                  <button type="submit" className="btn-primary" data-testid="confirm-booking-btn">
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Booking;
