import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { getGallery } from '../utils/api';
import { toast } from 'sonner';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Bridal Makeup', 'Hair Styling', 'Facial', 'Salon Interior'];

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter(img => img.category === selectedCategory));
    }
  }, [selectedCategory, images]);

  const fetchGallery = async () => {
    try {
      const response = await getGallery();
      setImages(response.data);
      setFilteredImages(response.data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxSlides = filteredImages.map(img => ({ src: img.image }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="gallery-page" data-testid="gallery-page">
      {/* Hero */}
      <section className="section-spacing bg-[var(--background-alt)]" data-testid="gallery-hero">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-bold font-heading mb-6">Our Gallery</h1>
          <p className="text-base md:text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Explore our work and get inspired for your next transformation
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white sticky top-16 z-40 shadow-sm" data-testid="gallery-filter">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-[var(--secondary)] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid={`filter-btn-${category.toLowerCase().replace(' ', '-')}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-spacing" data-testid="gallery-grid">
        <div className="container-custom">
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No images in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((img, index) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="gallery-item aspect-square"
                  onClick={() => openLightbox(index)}
                  data-testid={`gallery-item-${index}`}
                >
                  <img
                    src={img.image}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
      />
    </div>
  );
};

export default Gallery;
