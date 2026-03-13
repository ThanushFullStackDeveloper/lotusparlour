import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, User, Mail, Phone, MessageSquare, ArrowLeft } from 'lucide-react';
import { createSupportRequest } from '../utils/api';
import { toast } from 'sonner';

const SupportRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    problem: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createSupportRequest(formData);
      toast.success('Support request submitted successfully! We will contact you soon.');
      setFormData({ name: '', email: '', phone: '', problem: '' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error('Failed to submit support request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-request-page section-spacing" data-testid="support-request-page">
      <div className="container-custom max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-2xl shadow-lg"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[var(--primary-light)] rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle size={32} style={{ color: 'var(--secondary)' }} />
            </div>
            <h1 className="text-3xl font-bold font-heading mb-2">Need Help?</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Having trouble accessing your account? Submit a support request and we'll assist you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="support-form">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  placeholder="Enter your name"
                  data-testid="support-name-input"
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  placeholder="Enter your email"
                  data-testid="support-email-input"
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  placeholder="Enter your phone number"
                  data-testid="support-phone-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Describe Your Problem *</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <textarea
                  name="problem"
                  value={formData.problem}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent resize-none"
                  placeholder="Please describe your issue (e.g., forgot password, can't login, etc.)"
                  data-testid="support-problem-input"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full" 
              disabled={loading}
              data-testid="support-submit-btn"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link 
              to="/login" 
              className="inline-flex items-center space-x-2 text-sm hover:underline" 
              style={{ color: 'var(--secondary)' }}
              data-testid="back-to-login-link"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SupportRequest;
