import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const adminLogin = (data) => api.post('/admin/login', data);
export const getCurrentUser = () => api.get('/auth/me');
export const unifiedLogin = (data) => api.post('/auth/unified-login', data);

// Services
export const getServices = () => api.get('/services/light');
export const getServicesFull = () => api.get('/services');
export const getServiceImage = (id) => api.get(`/services/${id}/image`);
export const createService = (data) => api.post('/services', data);
export const updateService = (id, data) => api.put(`/services/${id}`, data);
export const deleteService = (id) => api.delete(`/services/${id}`);

// Staff
export const getStaff = () => api.get('/staff');
export const createStaff = (data) => api.post('/staff', data);
export const updateStaff = (id, data) => api.put(`/staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/staff/${id}`);

// Appointments
export const createAppointment = (data) => api.post('/appointments', data);
export const getAppointments = () => api.get('/appointments');
export const getAvailableSlots = (date, serviceId) => api.get(`/appointments/available-slots?date=${date}&service_id=${serviceId}`);
export const updateAppointmentStatus = (id, status) => api.put(`/appointments/${id}/status?status=${status}`);
export const getAppointmentICS = (id) => `${API_BASE_URL}/appointments/${id}/ics`;

// Reviews
export const getReviews = () => api.get('/reviews');
export const getAllReviews = () => api.get('/reviews/all');
export const createReview = (data) => api.post('/reviews', data);
export const createReviewAdmin = (data) => api.post('/reviews/admin', data);
export const approveReview = (id) => api.put(`/reviews/${id}/approve`);
export const unapproveReview = (id) => api.put(`/reviews/${id}/unapprove`);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// Gallery
export const getGallery = () => api.get('/gallery');
export const getGalleryFull = () => api.get('/gallery/full');
export const getGalleryImage = (id) => api.get(`/gallery/${id}/image`);
export const createGalleryImage = (data) => api.post('/gallery', data);
export const deleteGalleryImage = (id) => api.delete(`/gallery/${id}`);

// Holidays
export const getHolidays = () => api.get('/holidays');
export const createHoliday = (data) => api.post('/holidays', data);
export const deleteHoliday = (id) => api.delete(`/holidays/${id}`);

// Coupons
export const getCoupons = () => api.get('/coupons');
export const createCoupon = (data) => api.post('/coupons', data);
export const validateCoupon = (code) => api.get(`/coupons/validate/${code}`);
export const deleteCoupon = (id) => api.delete(`/coupons/${id}`);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getRevenueData = () => api.get('/dashboard/revenue');

// Upload
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Videos
export const getVideos = () => api.get('/videos');
export const getAllVideos = () => api.get('/videos/all');

// Settings
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);

// Support
export const createSupportRequest = (data) => api.post('/support', data);
export const getSupportRequests = () => api.get('/support');
export const updateSupportStatus = (id, status) => api.put(`/support/${id}/status?status=${status}`);
export const deleteSupportRequest = (id) => api.delete(`/support/${id}`);

// Customers
export const getCustomers = () => api.get('/customers');
export const adminResetCustomerPassword = (id) => api.put(`/customers/${id}/reset-password`);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);

// Enquiries
export const getEnquiries = () => api.get('/enquiries');
export const deleteEnquiry = (id) => api.delete(`/enquiries/${id}`);

// Admin
export const changeAdminPassword = (data) => api.put('/admin/change-password', data);

// Auth
export const loginWithPhone = (phone, password) => api.post('/auth/login-phone', null, { params: { phone, password } });
export const resetUserPassword = (newPassword) => api.post('/auth/reset-password', null, { params: { new_password: newPassword } });

export const createVideo = (data) => api.post('/videos', data);
export const updateVideo = (id, data) => api.put(`/videos/${id}`, data);
export const deleteVideo = (id) => api.delete(`/videos/${id}`);


// Seed
export const seedAdmin = () => api.post('/seed/admin');
