import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { getGallery, getGalleryImage } from '../utils/api';
import { compressImage } from '../utils/imageCompressor';
import PageHeader from '../components/PageHeader';
import { toast } from 'sonner';
import useWebSocket from '../hooks/useWebSocket';

const CACHE_KEY = 'gallery_cache_v2';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [imageData, setImageData] = useState({});
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const categories = ['All', 'Bridal Makeup', 'Hair Styling', 'Facial', 'Salon Interior'];

  // Load from cache on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.images) {
          setImages(data.images);
          setFilteredImages(data.images);
        }
        if (data.imageData) setImageData(data.imageData);
      }
    } catch {}
  }, []);

  const saveCache = useCallback((imagesData, imageDataMap) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        images: imagesData,
        imageData: imageDataMap
      }));
    } catch {}
  }, []);

  const fetchGallery = useCallback(async () => {
    try {
      const response = await getGallery();
      const newImages = response.data;
      setImages(newImages);
      setFilteredImages(newImages);
      
      // Load all images
      const newImageData = {};
      await Promise.all(
        newImages.map(async (img) => {
          try {
            const imgResponse = await getGalleryImage(img.id);
            let imageUrl = imgResponse.data.image;
            if (imageUrl) {
              if (imageUrl.startsWith('data:image')) {
                imageUrl = await compressImage(imageUrl, 600, 0.7);
              }
              newImageData[img.id] = imageUrl;
            }
          } catch (e) {
            console.error('Error loading image for', img.id, e);
          }
        })
      );

      setImageData(prev => {
        const merged = { ...prev, ...newImageData };
        saveCache(newImages, merged);
        return merged;
      });
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast.error('Failed to load gallery');
    }
  }, [saveCache]);

  const handleWebSocketUpdate = useCallback((data) => {
    if (data.entity === 'gallery') {
      localStorage.removeItem(CACHE_KEY);
      setImageData({});
      fetchGallery();
    }
  }, [fetchGallery]);

  useWebSocket(handleWebSocketUpdate);

  useEffect(() => {
    // Check if we need to fetch
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      const hasAllImages = data.images?.length > 0 && 
        Object.keys(data.imageData || {}).length >= data.images.length;
      if (!hasAllImages) {
        fetchGallery();
      }
    } else {
      fetchGallery();
    }
  }, [fetchGallery]);

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

  return (
    <div className="gallery-page" data-testid="gallery-page">
      <PageHeader 
        title="Our Gallery" 
        subtitle="Explore our beautiful transformations"
      />

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

      <section className="py-4 md:py-8" data-testid="gallery-grid">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto">
          {filteredImages.length === 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-0.5 md:gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square max-h-[150px] md:max-h-[180px] skeleton-shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-0.5 md:gap-2">
              {filteredImages.map((img, index) => (
                <motion.div
                  key={img.id}
                  whileTap={{ scale: 0.98 }}
                  className="relative aspect-square overflow-hidden cursor-pointer group max-h-[150px] md:max-h-[180px] bg-gray-100"
                  onClick={() => openLightbox(index)}
                  data-testid={`gallery-item-${index}`}
                >
                  {imageData[img.id] ? (
                    <img
                      src={imageData[img.id]}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full skeleton-shimmer" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Maximize2 size={24} className="text-white" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {lightboxOpen && filteredImages[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
            data-testid="gallery-lightbox"
          >
            <div className="flex items-center justify-between p-4 text-white">
              <span className="text-sm">{lightboxIndex + 1} / {filteredImages.length}</span>
              <button 
                onClick={() => setLightboxOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors touch-manipulation"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 relative">
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={imageData[filteredImages[lightboxIndex].id] || ''}
                alt={`Gallery ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
              
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

            <div className="md:hidden text-center text-white/50 text-sm pb-8">
              Swipe or tap edges to navigate
            </div>

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
