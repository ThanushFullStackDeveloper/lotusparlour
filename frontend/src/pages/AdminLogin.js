import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock } from 'lucide-react';
import { adminLogin } from '../utils/api';
import { toast } from 'sonner';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await adminLogin(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'admin');
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error(error.response?.data?.detail || 'Invalid admin credentials');
    }
  };

  return (
    <div className="admin-login-page min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-alt)' }} data-testid="admin-login-page">
      <div className="container-custom max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-2xl shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'var(--secondary)', opacity: 0.1 }}>
              <Shield size={32} style={{ color: 'var(--secondary)' }} />
            </div>
            <h1 className="text-4xl font-bold font-heading mb-2">Admin Login</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Access the admin dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="admin-login-form">
            <div>
              <label className="block text-sm font-medium mb-2">Admin Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)]"
                  placeholder="admin@lotus.com"
                  data-testid="admin-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)]"
                  placeholder="Enter password"
                  data-testid="admin-password-input"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" data-testid="admin-login-submit">
              Login to Dashboard
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/" className="text-sm hover:underline" style={{ color: 'var(--text-muted)' }} data-testid="back-to-site-link">
              Back to Website
            </Link>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Default Credentials:</p>
            <p className="text-xs font-mono">Email: admin@lotus.com</p>
            <p className="text-xs font-mono">Password: admin123</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
