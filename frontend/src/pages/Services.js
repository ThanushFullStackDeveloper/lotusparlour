import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, IndianRupee } from 'lucide-react';
import { getServices } from '../utils/api';
import { toast } from 'sonner';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await getServices();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="services-page" data-testid="services-page">
      {/* Hero */}
      <section className="section-spacing bg-[var(--background-alt)]" data-testid="services-hero">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-bold font-heading mb-6">Our Services</h1>
          <p className="text-base md:text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Discover our comprehensive range of beauty and wellness treatments, tailored to enhance your natural elegance.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-spacing" data-testid="services-grid">
        <div className="container-custom">
          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No services available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="service-card group"
                  data-testid={`service-card-${index}`}
                >
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={service.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'}
                      alt={service.name}
                      className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{service.name}</h3>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <IndianRupee size={20} style={{ color: 'var(--secondary)' }} />
                      <span className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>{service.price}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={16} />
                      <span>{service.duration} mins</span>
                    </div>
                  </div>
                  <Link to="/booking" state={{ selectedService: service }} data-testid={`book-service-btn-${index}`}>
                    <button className="btn-primary w-full">Book This Service</button>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-spacing bg-[var(--background-alt)]" data-testid="services-cta">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Not Sure Which Service to Choose?</h2>
          <p className="text-base md:text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
            Contact us for a personalized consultation
          </p>
          <Link to="/contact" data-testid="contact-us-btn">
            <button className="btn-gold">Contact Us</button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Services;
