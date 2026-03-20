import axios from "axios";

// ✅ SAFE BASE URL (prevents blank screen if env fails)
const BASE_URL =
  process.env.REACT_APP_BACKEND_URL
    ? `${process.env.REACT_APP_BACKEND_URL}/api`
    : "https://lotusparlour.onrender.com/api";

// ✅ Axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================= AUTH =================
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const adminLogin = (data) => api.post("/admin/login", data);
export const unifiedLogin = (data) => api.post("/auth/unified-login", data);
export const getCurrentUser = () => api.get("/auth/me");

// ================= SERVICES =================
export const getServices = () => api.get("/services/light");
export const getServicesFull = () => api.get("/services");
export const getServiceImage = (id) =>
  api.get(`/services/${id}/image`);
export const createService = (data) =>
  api.post("/services", data);
export const updateService = (id, data) =>
  api.put(`/services/${id}`, data);
export const deleteService = (id) =>
  api.delete(`/services/${id}`);

// ================= STAFF =================
export const getStaff = () => api.get("/staff");
export const createStaff = (data) => api.post("/staff", data);
export const updateStaff = (id, data) =>
  api.put(`/staff/${id}`, data);
export const deleteStaff = (id) =>
  api.delete(`/staff/${id}`);

// ================= APPOINTMENTS =================
export const createAppointment = (data) =>
  api.post("/appointments", data);
export const getAppointments = () =>
  api.get("/appointments");
export const getAvailableSlots = (date, serviceId) =>
  api.get(
    `/appointments/available-slots?date=${date}&service_id=${serviceId}`
  );
export const updateAppointmentStatus = (id, status) =>
  api.put(`/appointments/${id}/status?status=${status}`);

// ✅ FIXED ICS URL (safe)
export const getAppointmentICS = (id) =>
  `${BASE_URL}/appointments/${id}/ics`;

// ================= REVIEWS =================
export const getReviews = () => api.get("/reviews");
export const getAllReviews = () => api.get("/reviews/all");
export const createReview = (data) =>
  api.post("/reviews", data);
export const createReviewAdmin = (data) =>
  api.post("/reviews/admin", data);
export const approveReview = (id) =>
  api.put(`/reviews/${id}/approve`);
export const unapproveReview = (id) =>
  api.put(`/reviews/${id}/unapprove`);
export const deleteReview = (id) =>
  api.delete(`/reviews/${id}`);

// ================= GALLERY =================
export const getGallery = () => api.get("/gallery");
export const getGalleryFull = () =>
  api.get("/gallery/full");
export const getGalleryImage = (id) =>
  api.get(`/gallery/${id}/image`);
export const createGalleryImage = (data) =>
  api.post("/gallery", data);
export const deleteGalleryImage = (id) =>
  api.delete(`/gallery/${id}`);

// ================= HOLIDAYS =================
export const getHolidays = () => api.get("/holidays");
export const createHoliday = (data) =>
  api.post("/holidays", data);
export const deleteHoliday = (id) =>
  api.delete(`/holidays/${id}`);

// ================= COUPONS =================
export const getCoupons = () => api.get("/coupons");
export const createCoupon = (data) =>
  api.post("/coupons", data);
export const validateCoupon = (code) =>
  api.get(`/coupons/validate/${code}`);
export const deleteCoupon = (id) =>
  api.delete(`/coupons/${id}`);

// ================= DASHBOARD =================
export const getDashboardStats = () =>
  api.get("/dashboard/stats");
export const getRevenueData = () =>
  api.get("/dashboard/revenue");

// ================= UPLOAD =================
const compressImageForUpload = (
  file,
  maxWidth = 1200,
  quality = 0.7
) => {
  return new Promise((resolve) => {
    if (file.size < 200 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(
                new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                })
              );
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const uploadImage = async (file) => {
  const compressedFile = await compressImageForUpload(file);

  const formData = new FormData();
  formData.append("file", compressedFile);

  return api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ================= VIDEOS =================
export const getVideos = () => api.get("/videos");
export const getAllVideos = () =>
  api.get("/videos/all");
export const createVideo = (data) =>
  api.post("/videos", data);
export const updateVideo = (id, data) =>
  api.put(`/videos/${id}`, data);
export const deleteVideo = (id) =>
  api.delete(`/videos/${id}`);

// ================= SETTINGS =================
export const getSettings = () => api.get("/settings");
export const updateSettings = (data) =>
  api.put("/settings", data);

// ================= SUPPORT =================
export const createSupportRequest = (data) =>
  api.post("/support", data);
export const getSupportRequests = () =>
  api.get("/support");
export const updateSupportStatus = (id, status) =>
  api.put(`/support/${id}/status?status=${status}`);
export const deleteSupportRequest = (id) =>
  api.delete(`/support/${id}`);

// ================= CUSTOMERS =================
export const getCustomers = () => api.get("/customers");
export const adminResetCustomerPassword = (id) =>
  api.put(`/customers/${id}/reset-password`);
export const updateCustomer = (id, data) =>
  api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) =>
  api.delete(`/customers/${id}`);

// ================= ENQUIRIES =================
export const getEnquiries = () =>
  api.get("/enquiries");
export const deleteEnquiry = (id) =>
  api.delete(`/enquiries/${id}`);

// ================= ADMIN =================
export const changeAdminPassword = (data) =>
  api.put("/admin/change-password", data);

// ================= EXTRA AUTH =================
export const loginWithPhone = (phone, password) =>
  api.post("/auth/login-phone", null, {
    params: { phone, password },
  });

export const resetUserPassword = (newPassword) =>
  api.post("/auth/reset-password", null, {
    params: { new_password: newPassword },
  });

// ================= SEED =================
export const seedAdmin = () =>
  api.post("/seed/admin");
