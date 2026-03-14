import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Tag, CheckCircle, CalendarPlus, ArrowLeft } from 'lucide-react';
import { getServices, getStaff, createAppointment, getAvailableSlots, getHolidays, getCurrentUser, validateCoupon } from '../utils/api';
import { toast } from 'sonner';

const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);

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
    checkAuthAndFetchData();
  }, []);

  useEffect(() => {
    if (formData.appointment_date && formData.service_id) {
      fetchAvailableSlots();
    }
  }, [formData.appointment_date, formData.service_id]);

  const checkAuthAndFetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to book an appointment');
      navigate('/login', { state: { from: '/booking' } });
      return;
    }

    try {
      const [servicesRes, staffRes, holidaysRes, userRes] = await Promise.all([
        getServices(),
        getStaff(),
        getHolidays(),
        getCurrentUser(),
      ]);
      setServices(servicesRes.data);
      setStaff(staffRes.data);
      setHolidays(holidaysRes.data);
      setCurrentUser(userRes.data.user);
      
      // Pre-fill customer details from logged-in user
      setFormData(prev => ({
        ...prev,
        customer_name: userRes.data.user.name,
        customer_phone: userRes.data.user.phone,
        customer_email: userRes.data.user.email,
      }));
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


  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const response = await validateCoupon(couponCode.toUpperCase());
      setAppliedCoupon(response.data);
      toast.success(`Coupon applied! ${response.data.discount_percent}% discount`);
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast.error(error.response?.data?.detail || 'Invalid or expired coupon');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    toast.info('Coupon removed');
  };

  const calculatePrice = () => {
    if (!selectedService) return { original: 0, discount: 0, final: 0 };
    
    const originalPrice = selectedService.price;
    let discount = 0;
    
    if (appliedCoupon) {
      discount = (originalPrice * appliedCoupon.discount_percent) / 100;
    }
    
    const finalPrice = originalPrice - discount;
    
    return {
      original: originalPrice,
      discount: discount,
      final: finalPrice
    };
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
      const response = await createAppointment(formData);
      toast.success('Appointment booked successfully!');
      setBookedAppointment(response.data);
      setBookingComplete(true);
    } catch (error) {
      console.error('Error booking appointment:', error);
      // Handle different error formats - ensure we only show string messages
      let errorMessage = 'Failed to book appointment';
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          // Validation errors from FastAPI come as array
          errorMessage = data.detail.map(e => e.msg || e.message || 'Validation error').join(', ');
        } else if (typeof data.detail === 'object' && data.detail.msg) {
          errorMessage = data.detail.msg;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      }
      toast.error(errorMessage);
    }
  };

  const handleAddToCalendar = () => {
    if (!bookedAppointment?.id) return;
    
    const token = localStorage.getItem('token');
    // Create the ICS download URL with auth token
    const icsUrl = `${API_BASE_URL}/appointments/${bookedAppointment.id}/ics`;
    
    // Create a temporary anchor to download with auth header
    const downloadICS = async () => {
      try {
        const response = await fetch(icsUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `appointment_${bookedAppointment.id.slice(0, 8)}.ics`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Calendar file downloaded! Open it to add to your calendar.');
      } catch (error) {
        toast.error('Failed to download calendar file');
      }
    };
    
    downloadICS();
  };

  const selectedService = services.find(s => s.id === formData.service_id);
  const selectedStaff = staff.find(s => s.id === formData.staff_id);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Booking Complete View
  if (bookingComplete && bookedAppointment) {
    return (
      <div className="booking-page section-spacing" data-testid="booking-success">
        <div className="container-custom max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-2xl shadow-lg text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            
            <h1 className="text-3xl font-bold font-heading mb-4" style={{ color: 'var(--secondary)' }}>
              Booking Confirmed!
            </h1>
            
            <p className="text-gray-600 mb-8">
              Your appointment has been successfully booked. We look forward to seeing you!
            </p>
            
            <div className="bg-[var(--background-alt)] p-6 rounded-xl mb-8 text-left">
              <h3 className="font-semibold text-lg mb-4">Appointment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formData.appointment_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{formData.appointment_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{selectedService?.duration} mins</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-medium">{appliedCoupon.discount_percent}% off</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-[var(--secondary)]">
                    ₹{calculatePrice().final.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Add to Calendar Section */}
            <div className="mb-8">
              <button
                onClick={handleAddToCalendar}
                className="btn-primary w-full flex items-center justify-center space-x-2"
                data-testid="add-to-calendar-btn"
              >
                <CalendarPlus size={20} />
                <span>Add to Calendar</span>
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Download .ICS file to add this appointment to Google Calendar, Apple Calendar, or Outlook
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/dashboard" className="flex-1">
                <button className="btn-secondary w-full" data-testid="view-appointments-btn">
                  View My Appointments
                </button>
              </Link>
              <Link to="/" className="flex-1">
                <button className="btn-gold w-full" data-testid="back-to-home-btn">
                  Back to Home
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page section-spacing" data-testid="booking-page">
      <div className="w-full px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto">
        {/* Desktop Back Button Only */}
        <button
          onClick={() => navigate(-1)}
          className="hidden md:flex items-center gap-2 mb-4 text-gray-600 hover:text-[var(--secondary)] transition-colors"
          data-testid="booking-back-btn"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>
        
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-heading mb-4">Book Your Appointment</h1>
          <p className="text-sm md:text-base lg:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Follow the simple steps to schedule your beauty treatment
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12" data-testid="booking-steps">
          {[1, 2].map((num) => (
            <div key={num} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= num ? 'bg-[var(--secondary)] text-white' : 'bg-gray-200 text-gray-500'
                }`}
                data-testid={`step-indicator-${num}`}
              >
                {num}
              </div>
              {num < 2 && <div className={`w-16 h-1 ${step > num ? 'bg-[var(--secondary)]' : 'bg-gray-200'}`}></div>}
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

              {/* Coupon Code Section */}
              {formData.appointment_date && formData.appointment_time && (
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                    <Tag size={16} style={{ color: 'var(--secondary)' }} />
                    <span>Have a Coupon Code? (Optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      disabled={appliedCoupon !== null}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg uppercase disabled:bg-gray-100"
                      data-testid="coupon-input"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        data-testid="remove-coupon-btn"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="px-6 py-3 bg-[var(--secondary)] text-white rounded-lg hover:bg-[var(--secondary-hover)] transition-colors disabled:opacity-50"
                        data-testid="apply-coupon-btn"
                      >
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <p className="text-sm text-green-600 mt-2 flex items-center space-x-1">
                      <span>✓</span>
                      <span>Coupon "{appliedCoupon.code}" applied - {appliedCoupon.discount_percent}% off</span>
                    </p>
                  )}
                </div>
              )}

              {/* Booking Summary */}
              {formData.appointment_date && formData.appointment_time && (
                <div className="mt-6 p-6 bg-[var(--background-alt)] rounded-lg border-2 border-[var(--secondary)]">
                  <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Service:</span> {selectedService?.name}</p>
                    <p className="text-sm"><span className="font-medium">Date:</span> {formData.appointment_date}</p>
                    <p className="text-sm"><span className="font-medium">Time:</span> {formData.appointment_time}</p>
                    {selectedStaff && <p className="text-sm"><span className="font-medium">Staff:</span> {selectedStaff.name}</p>}
                    {currentUser && (
                      <>
                        <p className="text-sm"><span className="font-medium">Customer:</span> {currentUser.name}</p>
                        <p className="text-sm"><span className="font-medium">Phone:</span> {currentUser.phone}</p>
                      </>
                    )}
                    <p className="text-sm"><span className="font-medium">Duration:</span> {selectedService?.duration} mins</p>
                    
                    {/* Price Breakdown */}
                    <div className="border-t border-gray-300 pt-3 mt-3">
                      <p className="text-sm flex justify-between">
                        <span className="font-medium">Original Price:</span>
                        <span>₹{calculatePrice().original}</span>
                      </p>
                      {appliedCoupon && (
                        <>
                          <p className="text-sm flex justify-between text-green-600">
                            <span className="font-medium">Discount ({appliedCoupon.discount_percent}%):</span>
                            <span>- ₹{calculatePrice().discount.toFixed(2)}</span>
                          </p>
                          <p className="text-lg flex justify-between mt-2 font-bold" style={{ color: 'var(--secondary)' }}>
                            <span>Final Price:</span>
                            <span>₹{calculatePrice().final.toFixed(2)}</span>
                          </p>
                        </>
                      )}
                      {!appliedCoupon && (
                        <p className="text-lg flex justify-between mt-2 font-bold" style={{ color: 'var(--secondary)' }}>
                          <span>Total Price:</span>
                          <span>₹{calculatePrice().original}</span>
                        </p>
                      )}
                    </div>
                    
                    <p className="text-xs mt-3 text-yellow-700 bg-yellow-50 p-2 rounded">💰 Payment: Cash at Parlour</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(1)} className="btn-secondary" data-testid="back-to-step-1">
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.appointment_date || !formData.appointment_time}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="confirm-booking-btn"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Booking;
