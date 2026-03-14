import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, RefreshCw } from 'lucide-react';
import { getVideos } from '../utils/api';
import { useCachedData } from '../hooks/useCachedData';
import OfflineBanner from '../components/OfflineBanner';
import { toast } from 'sonner';

const Videos = () => {
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState(null);

  const categories = ['All', 'Bridal', 'Hair', 'Facial', 'Makeup'];

  // Use cached data hook for videos
  const { 
    data: videos, 
    loading, 
    fromCache, 
    isStale, 
    isOffline,
    refresh 
  } = useCachedData(
    'videos',
    async () => {
      const response = await getVideos();
      return response.data;
    }
  );

  useEffect(() => {
    if (!videos) return;
    
    if (selectedCategory === 'All') {
      setFilteredVideos(videos);
    } else {
      setFilteredVideos(videos.filter(video => video.category === selectedCategory));
    }
  }, [selectedCategory, videos]);

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getThumbnail = (url) => {
    const videoId = getYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://via.placeholder.com/480x360';
  };

  const openVideo = (video) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  if (loading && !videos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[var(--secondary)]/30"></div>
          <p className="mt-4 text-gray-500">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="videos-page" data-testid="videos-page">
      {/* Offline/Stale Banner */}
      <OfflineBanner isOffline={isOffline} isStale={isStale} onRefresh={refresh} />
      
      {/* Compact Hero */}
      <section className="py-6 md:py-12 bg-[var(--background-alt)]" data-testid="videos-hero">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-5xl font-bold font-heading mb-2">Service Videos</h1>
          <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
            Watch our beauty tutorials
          </p>
          {fromCache && !isOffline && (
            <button 
              onClick={refresh}
              className="mt-2 text-xs text-gray-500 flex items-center gap-1 mx-auto hover:text-[var(--secondary)]"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          )}
        </div>
      </section>

      {/* Category Filter - Scrollable */}
      <section className="py-4 bg-white sticky top-14 md:top-16 z-40 shadow-sm" data-testid="videos-filter">
        <div className="container-custom">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap touch-manipulation ${
                  selectedCategory === category
                    ? 'bg-[var(--secondary)] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                }`}
                data-testid={`filter-btn-${category.toLowerCase()}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Videos Grid - Responsive Cards */}
      <section className="py-4 md:py-8" data-testid="videos-grid">
        <div className="container-custom">
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No videos in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => openVideo(video)}
                  data-testid={`video-card-${index}`}
                >
                  <div className="relative aspect-video">
                    <img
                      src={getThumbnail(video.youtube_url)}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--secondary)] flex items-center justify-center shadow-lg"
                      >
                        <Play size={20} className="text-white ml-1" fill="white" />
                      </motion.div>
                    </div>
                    {/* Category Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium bg-black/60 text-white">
                      {video.category}
                    </div>
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="text-sm md:text-base font-semibold line-clamp-2 mb-1">{video.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1 hidden md:block">{video.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
            onClick={closeVideo}
            data-testid="video-modal"
          >
            {/* Header */}
            <div className="flex items-center justify-end p-4">
              <button
                onClick={closeVideo}
                className="p-2 rounded-full hover:bg-white/10 transition-colors touch-manipulation"
                data-testid="close-video-btn"
              >
                <X size={28} className="text-white" />
              </button>
            </div>

            {/* Video Player */}
            <div className="flex-1 flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
              <div className="w-full max-w-4xl">
                <div className="relative pt-[56.25%] rounded-xl overflow-hidden">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.youtube_url)}?autoplay=1`}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    data-testid="youtube-player"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{selectedVideo.title}</h2>
                <p className="text-sm text-gray-300 line-clamp-2">{selectedVideo.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Videos;
