import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Phone, HelpCircle, Shield } from 'lucide-react';
import { login, register, loginWithPhone, unifiedLogin } from '../utils/api';
import { toast } from 'sonner';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      let response;
      if (isLogin) {
        // Use unified login for both customer and admin
        const identifier = loginMethod === 'phone' ? formData.phone : formData.email;
        response = await unifiedLogin({ identifier, password: formData.password });
        
        const { token, role, user, force_password_reset } = response.data;
        
        // Store token and role
        localStorage.setItem('token', token);
        localStorage.setItem('role', role === 'admin' ? 'admin' : 'user');
        localStorage.setItem('userName', user?.name || 'User');
        
        if (role === 'admin') {
          toast.success('Admin login successful!');
          navigate('/admin/dashboard');
        } else {
          toast.success('Login successful!');
          // Check for password reset requirement
          if (force_password_reset) {
            toast.info('Please reset your password');
          }
          // Redirect to original destination or dashboard
          const from = location.state?.from || '/dashboard';
          navigate(from, { state: location.state?.bookingData });
        }
      } else {
        // Registration - always for customers
        response = await register(formData);
        toast.success('Registration successful!');
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', 'user');
        localStorage.setItem('userName', response.data.user?.name || formData.name || 'User');
        
        const from = location.state?.from || '/dashboard';
        navigate(from, { state: location.state?.bookingData });
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
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

            {isLogin && (
              <div className="flex space-x-2 mb-2">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 px-3 text-sm rounded-lg transition-all ${
                    loginMethod === 'email' 
                      ? 'bg-[var(--secondary)] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  data-testid="login-email-tab"
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-2 px-3 text-sm rounded-lg transition-all ${
                    loginMethod === 'phone' 
                      ? 'bg-[var(--secondary)] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  data-testid="login-phone-tab"
                >
                  Phone
                </button>
              </div>
            )}

            {isLogin && loginMethod === 'phone' ? (
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Enter your phone number"
                    data-testid="phone-login-input"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required={loginMethod === 'email' || !isLogin}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Enter your email"
                    data-testid="email-input"
                  />
                </div>
              </div>
            )}

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

            <button type="submit" className="btn-primary w-full" data-testid="auth-submit-btn" disabled={loading}>
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>

          {/* Admin login note */}
          {isLogin && (
            <div className="flex items-center justify-center gap-2 mt-4 py-2 px-3 bg-blue-50 rounded-lg">
              <Shield size={14} className="text-blue-600" />
              <p className="text-xs text-blue-700">Admins can also log in here.</p>
            </div>
          )}

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

          {isLogin && (
            <div className="text-center mt-4 pt-4 border-t border-gray-200">
              <Link 
                to="/support" 
                className="inline-flex items-center space-x-2 text-sm hover:underline"
                style={{ color: 'var(--text-muted)' }}
                data-testid="support-link"
              >
                <HelpCircle size={16} />
                <span>Need help? Account recovery</span>
              </Link>
            </div>
          )}

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
