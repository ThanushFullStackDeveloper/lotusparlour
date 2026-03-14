import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, RefreshCw } from 'lucide-react';
import { getGallery } from '../utils/api';
import { useCachedData } from '../hooks/useCachedData';
import OfflineBanner from '../components/OfflineBanner';
import PageHeader from '../components/PageHeader';
import { toast } from 'sonner';

const Gallery = () => {
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const categories = ['All', 'Bridal Makeup', 'Hair Styling', 'Facial', 'Salon Interior'];

  // Use cached data hook for gallery
  const { 
    data: images, 
    loading, 
    fromCache, 
    isStale, 
    isOffline,
    refresh 
  } = useCachedData(
    'gallery',
    async () => {
      const response = await getGallery();
      return response.data;
    }
  );

  useEffect(() => {
    if (!images) return;
    
    if (selectedCategory === 'All') {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter(img => img.category === selectedCategory));
    }
  }, [selectedCategory, images]);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  if (loading && !images) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[var(--secondary)]/30"></div>
          <p className="mt-4 text-gray-500">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-page" data-testid="gallery-page">
      {/* Offline/Stale Banner */}
      <OfflineBanner isOffline={isOffline} isStale={isStale} onRefresh={refresh} />
      
      {/* Page Header with Back Button */}
      <PageHeader 
        title="Our Gallery" 
        subtitle="Explore our beautiful transformations"
      />
      
      {fromCache && !isOffline && (
        <div className="container-custom text-center -mt-4 mb-4">
          <button 
            onClick={refresh}
            className="text-xs text-gray-500 flex items-center gap-1 mx-auto hover:text-[var(--secondary)]"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      )}

      {/* Category Filter - Scrollable on mobile, centered on desktop */}
      <section className="py-4 bg-white sticky top-[72px] z-40 shadow-sm" data-testid="gallery-filter">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap touch-manipulation ${
                  selectedCategory === category
                    ? 'bg-[var(--secondary)] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                }`}
                data-testid={`filter-btn-${category.toLowerCase().replace(' ', '-')}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram-Style Gallery Grid */}
      <section className="py-4 md:py-8" data-testid="gallery-grid">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto">
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No images in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-0.5 md:gap-2">
              {filteredImages.map((img, index) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative aspect-square overflow-hidden cursor-pointer group max-h-[150px] md:max-h-[180px]"
                  onClick={() => openLightbox(index)}
                  data-testid={`gallery-item-${index}`}
                >
                  <img
                    src={img.image}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Hover overlay - desktop only */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Maximize2 size={24} className="text-white" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Custom Lightbox */}
      <AnimatePresence>
        {lightboxOpen && filteredImages[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
            data-testid="gallery-lightbox"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 text-white">
              <span className="text-sm">{lightboxIndex + 1} / {filteredImages.length}</span>
              <button 
                onClick={() => setLightboxOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors touch-manipulation"
              >
                <X size={24} />
              </button>
            </div>

            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center px-4 relative">
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={filteredImages[lightboxIndex].image}
                alt={`Gallery ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
              
              {/* Navigation Buttons - Desktop */}
              <button
                onClick={prevImage}
                className="hidden md:flex absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={28} className="text-white" />
              </button>
              <button
                onClick={nextImage}
                className="hidden md:flex absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={28} className="text-white" />
              </button>
            </div>

            {/* Mobile Swipe Instructions */}
            <div className="md:hidden text-center text-white/50 text-sm pb-8">
              Swipe or tap edges to navigate
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex justify-around pb-8">
              <button
                onClick={prevImage}
                className="p-4 rounded-full bg-white/10 touch-manipulation"
              >
                <ChevronLeft size={28} className="text-white" />
              </button>
              <button
                onClick={nextImage}
                className="p-4 rounded-full bg-white/10 touch-manipulation"
              >
                <ChevronRight size={28} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
