import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Calendar, Users, Award, Send, RefreshCw } from 'lucide-react';
import { getServicesFull, getStaff, getReviews, getSettings, createReview } from '../utils/api';
import { getCachedData, clearCache } from '../utils/cacheManager';
import OfflineBanner from '../components/OfflineBanner';
import { toast } from 'sonner';
import { useWebSocketContext } from '../contexts/WebSocketContext';

const Home = () => {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState({
    parlour_name: 'Lotus Beauty Parlour',
    welcome_text: 'Welcome to Lotus Beauty Parlour',
    years_experience: '5+',
    opening_time: '09:00',
    closing_time: '22:00',
    logo_image: null
  });
  const [fromCache, setFromCache] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isStale, setIsStale] = useState(false);
  
  const { lastUpdate } = useWebSocketContext();

  // Listen for WebSocket updates - use timestamp to detect all changes
  // useEffect(() => {
  //   if (lastUpdate && ['services', 'staff', 'settings'].includes(lastUpdate.entity) && lastUpdate.timestamp) {
  //     console.log(`Home: WebSocket update for ${lastUpdate.entity}, refreshing... (timestamp: ${lastUpdate.timestamp})`);
  //     // Clear cache for updated entity and refetch immediately
  //     clearCache(lastUpdate.entity);
  //     fetchData();
  //   }
  // }, [lastUpdate?.timestamp]);
// Listen for WebSocket updates (REAL-TIME HANDLING)
useEffect(() => {
  if (!lastUpdate || !lastUpdate.timestamp) return;

  console.log("Home WebSocket update:", lastUpdate);

  // ================= REVIEWS =================
  if (lastUpdate.entity === "reviews") {

    if (lastUpdate.action === "create") {
      // Only show approved reviews
      if (lastUpdate.data?.approved) {
        setReviews(prev => [lastUpdate.data, ...prev].slice(0, 3));
      }
      return;
    }

    if (lastUpdate.action === "delete") {
      setReviews(prev => prev.filter(r => r.id !== lastUpdate.id));
      return;
    }

    if (["approve", "unapprove"].includes(lastUpdate.action)) {
      clearCache("reviews");
      fetchData();
      return;
    }
  }

  // ================= OTHER ENTITIES =================
  if (['services', 'staff', 'settings'].includes(lastUpdate.entity)) {
    console.log(`Refreshing ${lastUpdate.entity}...`);
    clearCache(lastUpdate.entity);
    fetchData();
  }

}, [lastUpdate?.timestamp]);
  useEffect(() => {
    fetchData();
    
    // Listen for online/offline
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all data with caching
      const [servicesResult, staffResult, reviewsResult, settingsResult] = await Promise.all([
        getCachedData('services', async () => (await getServicesFull()).data),
        getCachedData('staff', async () => (await getStaff()).data),
        getCachedData('reviews', async () => (await getReviews()).data),
        getCachedData('settings', async () => (await getSettings()).data),
      ]);
      
      setServices((servicesResult.data || []).slice(0, 3));
      setStaff((staffResult.data || []).slice(0, 3));
      setReviews((reviewsResult.data || []).slice(0, 3));
      setSettings(settingsResult.data || settings);
      
      // Check if any data is from cache
      const anyFromCache = servicesResult.fromCache || staffResult.fromCache || reviewsResult.fromCache || settingsResult.fromCache;
      const anyStale = servicesResult.stale || staffResult.stale || reviewsResult.stale || settingsResult.stale;
      setFromCache(anyFromCache);
      setIsStale(anyStale);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setFromCache(false);
    setIsStale(false);
    await fetchData();
    toast.success('Content refreshed');
  }, []);

  const getTodayConfig = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const todayName = dayNames[now.getDay()];
    const weeklyHours = settings.weekly_hours || [];
    return weeklyHours.find(d => d.day === todayName) || { 
      day: todayName, 
      start_time: settings.opening_time || '09:00', 
      end_time: settings.closing_time || '22:00', 
      is_open: true 
    };
  };

  const getNextOpenDay = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const weeklyHours = settings.weekly_hours || [];
    
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + i);
      const nextDayName = dayNames[nextDate.getDay()];
      const config = weeklyHours.find(d => d.day === nextDayName);
      if (config && config.is_open) {
        return { day: nextDayName, time: config.start_time, isNextDay: i === 1 };
      }
    }
    return null;
  };

  const isOpen = () => {
    const todayConfig = getTodayConfig();
    if (!todayConfig.is_open) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = (todayConfig.start_time || '09:00').split(':').map(Number);
    const [closeHour, closeMin] = (todayConfig.end_time || '22:00').split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    return currentTime >= openTime && currentTime < closeTime;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hour, min] = timeStr.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`;
  };

  const getStatusText = () => {
    const todayConfig = getTodayConfig();
    
    if (!todayConfig.is_open) {
      const nextOpen = getNextOpenDay();
      if (nextOpen) {
        return `Closed – Opens ${nextOpen.isNextDay ? 'tomorrow' : nextOpen.day} at ${formatTime(nextOpen.time)}`;
      }
      return 'Closed';
    }
    
    if (isOpen()) {
      return `Open Now – Closes at ${formatTime(todayConfig.end_time)}`;
    }
    
    // Shop closed for today but will open later today
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = (todayConfig.start_time || '09:00').split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    
    if (currentTime < openTime) {
      return `Closed – Opens today at ${formatTime(todayConfig.start_time)}`;
    }
    
    // Already past closing time
    const nextOpen = getNextOpenDay();
    if (nextOpen) {
      return `Closed – Opens ${nextOpen.isNextDay ? 'tomorrow' : nextOpen.day} at ${formatTime(nextOpen.time)}`;
    }
    return 'Closed';
  };

  return (
    <div className="home-page" data-testid="home-page">
      {/* Offline/Stale Banner */}
      <OfflineBanner isOffline={isOffline} isStale={isStale} onRefresh={handleRefresh} />
      
      {/* Hero Section */}
      <section className="hero-section" data-testid="hero-section">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold font-heading mb-6" style={{ color: 'var(--text-primary)' }}>
                {settings.welcome_text} <span style={{ color: 'var(--secondary)' }}>{settings.parlour_name.split(' ').pop()}</span>
              </h1>
              <p className="text-base md:text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
                {settings.tagline || "Transform your beauty journey with our premium makeup artistry and salon services in the heart of Tirunelveli."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/booking" data-testid="hero-book-btn">
                  <button className="btn-primary w-full sm:w-auto">Book Appointment</button>
                </Link>
                <Link to="/services" data-testid="hero-services-btn">
                  <button className="btn-secondary w-full sm:w-auto">Our Services</button>
                </Link>
              </div>
              <div className="flex items-center space-x-6 mt-8">
                <div className="flex items-center space-x-2">
                  <Star size={24} fill="var(--secondary)" color="var(--secondary)" />
                  <div>
                    <p className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>{settings.google_rating || "5.0"}</p>
                    <p className="text-xs text-gray-600">Google Rating</p>
                  </div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div>
                  <p className={`text-sm font-semibold ${isOpen() ? 'text-green-600' : 'text-red-600'}`}>
                    {getStatusText()}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative flex justify-center"
            >
              <img
                src={settings.hero_image || "https://images.unsplash.com/photo-1645856049138-bcb23afaeefb?crop=entropy&cs=srgb&fm=jpg&q=85"}
                alt="Elegant Bridal Makeup"
                className="rounded-2xl shadow-2xl w-full max-w-[400px] lg:max-w-[450px]"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <p className="text-3xl font-bold" style={{ color: 'var(--secondary)' }}>{settings.years_experience}</p>
                <p className="text-sm text-gray-600">Years Experience</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="section-spacing" data-testid="featured-services-section">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Our Premium Services</h2>
            <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
              Discover our range of beauty and wellness treatments
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="service-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                data-testid={`service-card-${index}`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={service.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2 truncate">{service.name}</h3>
                  <p className="text-xs md:text-sm mb-2 md:mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{service.description}</p>
                  <div className="flex justify-between items-center">
                    {service.discount_price ? (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-400 line-through">₹{service.price}</p>
                        <p className="text-base md:text-xl font-bold text-green-600">₹{service.discount_price}</p>
                      </div>
                    ) : (
                      <p className="text-base md:text-xl font-bold" style={{ color: 'var(--secondary)' }}>₹{service.price}</p>
                    )}
                    <p className="text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>{service.duration} mins</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/services" data-testid="view-all-services-btn">
              <button className="btn-gold">View All Services</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Staff Preview */}
      <section className="section-spacing bg-[var(--background-alt)]" data-testid="staff-preview-section">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">Meet Our Experts</h2>
            <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
              Skilled professionals dedicated to your beauty
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {staff.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="staff-card"
                data-testid={`staff-card-${index}`}
              >
                <img
                  src={member.photo || 'https://images.unsplash.com/photo-1616723355486-eac8780bfcb9?w=400'}
                  alt={member.name}
                  className="w-full h-64 object-contain bg-gray-50"
                />
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--secondary)' }}>{member.role}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.experience} experience</p>
                  <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>{member.specialization}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/staff" data-testid="view-all-staff-btn">
              <button className="btn-gold">View All Staff</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-spacing" data-testid="testimonials-section">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">What Our Clients Say</h2>
            <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
              Real experiences from our valued customers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="testimonial-card"
                data-testid={`review-card-${index}`}
              >
                <div className="flex items-center mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="var(--secondary)" color="var(--secondary)" />
                  ))}
                </div>
                <p className="text-sm mb-4 italic" style={{ color: 'var(--text-secondary)' }}>
                  "{review.review_text}"
                </p>
                <p className="text-sm font-semibold">- {review.customer_name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Submit Review Section */}
      <ReviewSubmission />

      {/* CTA Section */}
      <section className="section-spacing" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }} data-testid="cta-section">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">Ready to Transform Your Look?</h2>
          <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Book your appointment today and experience the best beauty services in Tirunelveli
          </p>
          <Link to="/booking" data-testid="cta-book-btn">
            <button className="bg-white text-[var(--primary)] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all">
              Book Your Appointment
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

// Review Submission Component
const ReviewSubmission = () => {
  const [reviewForm, setReviewForm] = useState({
    customer_name: '',
    rating: 5,
    review_text: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleReviewChange = (e) => {
    setReviewForm({ ...reviewForm, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (rating) => {
    setReviewForm({ ...reviewForm, rating });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.customer_name || !reviewForm.review_text) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      await createReview(reviewForm);
      toast.success('Thank you! Your review has been submitted for approval.');
      setReviewForm({ customer_name: '', rating: 5, review_text: '' });
    } catch (error) {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-spacing bg-[var(--background-alt)]" data-testid="review-submission-section">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Share Your Experience</h2>
            <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
              We'd love to hear about your visit! Your feedback helps us improve.
            </p>
          </div>
          
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleReviewSubmit}
            className="bg-white p-8 rounded-2xl shadow-lg space-y-6"
            data-testid="review-form"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Your Name *</label>
              <input
                type="text"
                name="customer_name"
                value={reviewForm.customer_name}
                onChange={handleReviewChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                placeholder="Enter your name"
                data-testid="review-name-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Rating *</label>
              <div className="flex space-x-2" data-testid="review-rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                    data-testid={`rating-star-${star}`}
                  >
                    <Star
                      size={32}
                      fill={star <= reviewForm.rating ? 'var(--secondary)' : 'transparent'}
                      color="var(--secondary)"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Review *</label>
              <textarea
                name="review_text"
                value={reviewForm.review_text}
                onChange={handleReviewChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent resize-none"
                placeholder="Share your experience with us..."
                data-testid="review-text-input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center space-x-2"
              data-testid="submit-review-btn"
            >
              <Send size={18} />
              <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
            </button>
            
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Your review will be published after approval by our team.
            </p>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Home;
