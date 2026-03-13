import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, Navigation } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const businessInfo = {
    phone: '09500673208',
    address: '3/41, East Street, Main Road,\nPuthumanai, Tirunelveli,\nTamil Nadu 627120',
    email: 'info@lotusbeauty.com',
    hours: 'Open Daily until 10 PM',
    lat: 8.164900622176761,
    lng: 77.62145042867182,
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${businessInfo.lat},${businessInfo.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="contact-page" data-testid="contact-page">
      {/* Hero */}
      <section className="section-spacing bg-[var(--background-alt)]" data-testid="contact-hero">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-bold font-heading mb-6">Get In Touch</h1>
          <p className="text-base md:text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            We'd love to hear from you. Reach out for appointments, inquiries, or just to say hello!
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="section-spacing" data-testid="contact-content">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Visit Us */}
              <div className="bg-white p-6 rounded-2xl shadow-sm" data-testid="contact-address">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center bg-[var(--primary-light)]">
                    <MapPin size={28} style={{ color: 'var(--secondary)' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Visit Us</h3>
                    <p className="text-sm whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                      {businessInfo.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-white p-6 rounded-2xl shadow-sm" data-testid="contact-phone">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center bg-[var(--primary-light)]">
                    <Phone size={28} style={{ color: 'var(--secondary)' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Phone</h3>
                    <a 
                      href={`tel:${businessInfo.phone}`} 
                      className="text-base font-medium hover:text-[var(--secondary)] transition-colors" 
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {businessInfo.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white p-6 rounded-2xl shadow-sm" data-testid="contact-email">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center bg-[var(--primary-light)]">
                    <Mail size={28} style={{ color: 'var(--secondary)' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Email</h3>
                    <a 
                      href={`mailto:${businessInfo.email}`} 
                      className="text-base font-medium hover:text-[var(--secondary)] transition-colors" 
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {businessInfo.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="bg-white p-6 rounded-2xl shadow-sm" data-testid="contact-hours">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center bg-[var(--primary-light)]">
                    <Clock size={28} style={{ color: 'var(--secondary)' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Opening Hours</h3>
                    <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {businessInfo.hours}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleGetDirections}
                  className="btn-primary flex items-center justify-center space-x-2"
                  data-testid="get-directions-btn"
                >
                  <Navigation size={18} />
                  <span>Get Directions</span>
                </button>
                <a href={`tel:${businessInfo.phone}`} className="flex-1" data-testid="call-now-btn">
                  <button className="btn-secondary w-full flex items-center justify-center space-x-2">
                    <Phone size={18} />
                    <span>Call Now</span>
                  </button>
                </a>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <h2 className="text-3xl font-bold font-heading mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="contact-form">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                    data-testid="contact-form-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                    data-testid="contact-form-email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                    data-testid="contact-form-phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                    data-testid="contact-form-message"
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary w-full flex items-center justify-center space-x-2" data-testid="contact-form-submit">
                  <Send size={18} />
                  <span>Send Message</span>
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
