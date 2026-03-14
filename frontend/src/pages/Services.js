import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, IndianRupee, Eye } from 'lucide-react';
import { getServices, getServiceImage } from '../utils/api';
import { compressImage } from '../utils/imageCompressor';
import PageHeader from '../components/PageHeader';
import { toast } from 'sonner';
import useWebSocket from '../hooks/useWebSocket';

const CACHE_KEY = 'services_cache';

// Load everything from cache immediately
const getCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      return {
        services: data.services || [],
        images: data.images || {}
      };
    }
  } catch {}
  return { services: [], images: {} };
};

const initialCache = getCache();

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState(initialCache.services);
  const [imageData, setImageData] = useState(initialCache.images);
  const loadedIds = useRef(new Set(Object.keys(initialCache.images)));
  const hasFetched = useRef(false);

  const saveCache = useCallback((servicesData, imagesData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        services: servicesData,
        images: imagesData,
        timestamp: Date.now()
      }));
    } catch {}
  }, []);

  const fetchServices = useCallback(async (forceRefresh = false) => {
    if (hasFetched.current && !forceRefresh) return;
    hasFetched.current = true;

    try {
      const response = await getServices();
      const newServices = response.data;
      setServices(newServices);
      
      // Load only new images
      const toLoad = newServices.filter(
        service => forceRefresh || !loadedIds.current.has(service.id)
      );
      
      if (toLoad.length === 0) {
        saveCache(newServices, imageData);
        return;
      }

      // Load all images in parallel
      const newImages = { ...imageData };
      await Promise.all(
        toLoad.map(async (service) => {
          try {
            const imgResponse = await getServiceImage(service.id);
            let imageUrl = imgResponse.data.image;
            
            if (imageUrl) {
              imageUrl = await compressImage(imageUrl, 600, 0.7);
              loadedIds.current.add(service.id);
              newImages[service.id] = imageUrl;
            }
          } catch {}
        })
      );

      setImageData(newImages);
      saveCache(newServices, newImages);
    } catch (error) {
      console.error('Error fetching services:', error);
      if (services.length === 0) {
        toast.error('Failed to load services');
      }
    }
  }, [imageData, saveCache, services.length]);

  const handleWebSocketUpdate = useCallback((data) => {
    if (data.entity === 'services') {
      localStorage.removeItem(CACHE_KEY);
      loadedIds.current.clear();
      hasFetched.current = false;
      setImageData({});
      setServices([]);
      fetchServices(true);
    }
  }, [fetchServices]);

  useWebSocket(handleWebSocketUpdate);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenServiceDetail = async (service) => {
    if (imageData[service.id]) {
      setSelectedService({ ...service, image: imageData[service.id] });
    } else {
      try {
        const response = await getServiceImage(service.id);
        const fullImage = response.data.image;
        const newImages = { ...imageData, [service.id]: fullImage };
        setImageData(newImages);
        saveCache(services, newImages);
        setSelectedService({ ...service, image: fullImage });
      } catch {
        setSelectedService(service);
      }
    }
  };

  return (
    <div className="services-page" data-testid="services-page">
      <PageHeader 
        title="Our Services" 
        subtitle="Premium beauty & wellness treatments"
      />

      <section className="py-6 md:py-12" data-testid="services-grid">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto">
          {services.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="service-card-mobile">
                  <div className="aspect-square rounded-xl mb-3 max-h-[180px] lg:max-h-[200px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]" 
                    style={{ animation: 'shimmer 1.5s infinite' }} />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-9 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  whileTap={{ scale: 0.98 }}
                  className="service-card-mobile group"
                  data-testid={`service-card-${index}`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl mb-3 max-h-[180px] lg:max-h-[200px] bg-gray-100">
                    {imageData[service.id] ? (
                      <img
                        src={imageData[service.id]}
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]" 
                        style={{ animation: 'shimmer 1.5s infinite' }} />
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenServiceDetail(service);
                      }}
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                        <Eye size={18} className="text-[var(--secondary)]" />
                      </div>
                    </button>
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <span className="text-sm font-bold text-[var(--secondary)]">₹{service.price}</span>
                    </div>
                  </div>
                  <h3 className="text-sm md:text-base font-semibold mb-1 line-clamp-1">{service.name}</h3>
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <Clock size={12} className="mr-1" />
                    <span>{service.duration} mins</span>
                  </div>
                  <Link to="/booking" state={{ selectedService: { ...service, image: imageData[service.id] } }} className="block">
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

      {selectedService && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50"
          onClick={() => setSelectedService(null)}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto mx-0 md:mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] md:aspect-video overflow-hidden">
              {selectedService.image ? (
                <img
                  src={selectedService.image}
                  alt={selectedService.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"
              >
                <span className="text-gray-600 text-lg font-bold">×</span>
              </button>
            </div>
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-2">{selectedService.name}</h2>
              <p className="text-sm md:text-base text-gray-600 mb-4">{selectedService.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-xl md:text-2xl font-bold text-[var(--secondary)]">
                  <IndianRupee size={20} />
                  <span>{selectedService.price}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock size={16} className="mr-1" />
                  <span>{selectedService.duration} mins</span>
                </div>
              </div>
              <Link to="/booking" state={{ selectedService }} className="block">
                <button className="btn-primary w-full py-3 text-base">Book This Service</button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}

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
