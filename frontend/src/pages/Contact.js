import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
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
    address: '3/41, East Street, Main Road, Puthumanai, Tirunelveli, Tamil Nadu 627120',
    email: 'info@lotusbeauty.com',
    hours: 'Open Daily until 10 PM',
    lat: 8.164900622176761,
    lng: 77.62145042867182,
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
            >
              <h2 className="text-3xl font-bold font-heading mb-6">Visit Us</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4" data-testid="contact-address">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--secondary)', opacity: 0.1 }}>
                    <MapPin style={{ color: 'var(--secondary)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Address</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{businessInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4" data-testid="contact-phone">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--secondary)', opacity: 0.1 }}>
                    <Phone style={{ color: 'var(--secondary)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <a href={`tel:${businessInfo.phone}`} className="text-sm hover:text-[var(--secondary)]" style={{ color: 'var(--text-secondary)' }}>
                      {businessInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4" data-testid="contact-email">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--secondary)', opacity: 0.1 }}>
                    <Mail style={{ color: 'var(--secondary)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href={`mailto:${businessInfo.email}`} className="text-sm hover:text-[var(--secondary)]" style={{ color: 'var(--text-secondary)' }}>
                      {businessInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4" data-testid="contact-hours">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--secondary)', opacity: 0.1 }}>
                    <Clock style={{ color: 'var(--secondary)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Opening Hours</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{businessInfo.hours}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <a href={`tel:${businessInfo.phone}`} data-testid="call-now-btn">
                    <button className="btn-primary mr-3">Call Now</button>
                  </a>
                  <a
                    href={`https://wa.me/91${businessInfo.phone}?text=${encodeURIComponent('Hey, I am interested in your beauty parlour services. I would like to book an appointment.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="whatsapp-btn"
                  >
                    <button className="btn-secondary">WhatsApp</button>
                  </a>
                </div>
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

      {/* Map */}
      <section className="section-spacing bg-[var(--background-alt)]" data-testid="contact-map">
        <div className="container-custom">
          <h2 className="text-3xl font-bold font-heading text-center mb-8">Find Us on Map</h2>
          <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${businessInfo.lng - 0.01},${businessInfo.lat - 0.01},${businessInfo.lng + 0.01},${businessInfo.lat + 0.01}&layer=mapnik&marker=${businessInfo.lat},${businessInfo.lng}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Lotus Beauty Parlour Location"
              data-testid="map-iframe"
            ></iframe>
          </div>
          <div className="text-center mt-4">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Coordinates: {businessInfo.lat}, {businessInfo.lng}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
