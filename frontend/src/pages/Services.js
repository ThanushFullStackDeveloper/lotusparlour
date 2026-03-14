import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, IndianRupee, Eye } from 'lucide-react';
import { getServices } from '../utils/api';
import { toast } from 'sonner';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

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
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[var(--secondary)]/30"></div>
          <p className="mt-4 text-gray-500">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page" data-testid="services-page">
      {/* Compact Hero for Mobile */}
      <section className="py-6 md:py-12 bg-[var(--background-alt)]" data-testid="services-hero">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-5xl font-bold font-heading mb-2 md:mb-4">Our Services</h1>
          <p className="text-sm md:text-base max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Premium beauty & wellness treatments
          </p>
        </div>
      </section>

      {/* Services Grid - Card Layout */}
      <section className="py-6 md:py-12" data-testid="services-grid">
        <div className="container-custom">
          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No services available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="service-card-mobile group"
                  data-testid={`service-card-${index}`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl mb-3">
                    <img
                      src={service.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* Quick View Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedService(service);
                      }}
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                        <Eye size={18} className="text-[var(--secondary)]" />
                      </div>
                    </button>
                    {/* Price Badge */}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <span className="text-sm font-bold text-[var(--secondary)]">₹{service.price}</span>
                    </div>
                  </div>
                  <h3 className="text-sm md:text-lg font-semibold mb-1 line-clamp-1">{service.name}</h3>
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <Clock size={12} className="mr-1" />
                    <span>{service.duration} mins</span>
                  </div>
                  <Link to="/booking" state={{ selectedService: service }} className="block">
                    <button className="w-full py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors touch-manipulation">
                      Book Now
                    </button>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick View Modal */}
      {selectedService && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 p-4"
          onClick={() => setSelectedService(null)}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video rounded-xl overflow-hidden mb-4">
              <img
                src={selectedService.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'}
                alt={selectedService.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold mb-2">{selectedService.name}</h2>
            <p className="text-gray-600 mb-4">{selectedService.description}</p>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center text-2xl font-bold text-[var(--secondary)]">
                <IndianRupee size={24} />
                <span>{selectedService.price}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Clock size={18} className="mr-1" />
                <span>{selectedService.duration} mins</span>
              </div>
            </div>
            <Link to="/booking" state={{ selectedService }} className="block">
              <button className="btn-primary w-full py-4 text-lg">Book This Service</button>
            </Link>
          </motion.div>
        </motion.div>
      )}

      {/* CTA */}
      <section className="py-8 md:py-12 bg-[var(--background-alt)]" data-testid="services-cta">
        <div className="container-custom text-center">
          <h2 className="text-xl md:text-3xl font-bold font-heading mb-3">Need Help Choosing?</h2>
          <p className="text-sm md:text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
            Contact us for a personalized consultation
          </p>
          <Link to="/contact">
            <button className="btn-gold">Contact Us</button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Services;
