import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Phone } from 'lucide-react';
import { login, register } from '../utils/api';
import { toast } from 'sonner';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isLogin) {
        response = await login({ email: formData.email, password: formData.password });
        toast.success('Login successful!');
      } else {
        response = await register(formData);
        toast.success('Registration successful!');
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'user');

      // Redirect to original destination or dashboard
      const from = location.state?.from || '/dashboard';
      navigate(from, { state: location.state?.bookingData });
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.detail || 'Authentication failed');
    }
  };

  return (
    <div className="customer-login-page section-spacing" data-testid="customer-login-page">
      <div className="container-custom max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-2xl shadow-lg"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-heading mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isLogin ? 'Login to manage your appointments' : 'Register to book your first appointment'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-form">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Enter your name"
                    data-testid="name-input"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Enter your email"
                  data-testid="email-input"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Enter your phone"
                    data-testid="phone-input"
                  />
                </div>
              </div>
            )}

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
                  minLength="6"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Enter your password"
                  data-testid="password-input"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" data-testid="auth-submit-btn">
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold hover:underline"
                style={{ color: 'var(--secondary)' }}
                data-testid="toggle-auth-mode"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </div>

          <div className="text-center mt-4">
            <Link to="/" className="text-sm hover:underline" style={{ color: 'var(--text-muted)' }} data-testid="back-home-link">
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerLogin;
