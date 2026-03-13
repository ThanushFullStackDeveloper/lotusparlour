import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Calendar, Users, Award, Send } from 'lucide-react';
import { getServices, getStaff, getReviews, getSettings, createReview } from '../utils/api';
import { toast } from 'sonner';

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, staffRes, reviewsRes, settingsRes] = await Promise.all([
        getServices(),
        getStaff(),
        getReviews(),
        getSettings(),
      ]);
      setServices(servicesRes.data.slice(0, 3));
      setStaff(staffRes.data.slice(0, 3));
      setReviews(reviewsRes.data.slice(0, 3));
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const isOpen = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = settings.opening_time.split(':').map(Number);
    const [closeHour, closeMin] = settings.closing_time.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    return currentTime >= openTime && currentTime < closeTime;
  };

  const getStatusText = () => {
    if (isOpen()) {
      return `Open Now - Closes at ${settings.closing_time}`;
    }
    return `Closed - Opens at ${settings.opening_time}`;
  };

  return (
    <div className="home-page" data-testid="home-page">
      {/* Hero Section */}
      <section className="hero-section" data-testid="hero-section">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold font-heading mb-6" style={{ color: 'var(--text-primary)' }}>
                {settings.welcome_text} <span style={{ color: 'var(--secondary)' }}>{settings.parlour_name.split(' ').pop()}</span>
              </h1>
              <p className="text-base md:text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
                Transform your beauty journey with our premium makeup artistry and salon services in the heart of Tirunelveli.
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
                    <p className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>5.0</p>
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
              className="relative"
            >
              <img
                src={settings.hero_image || "https://images.unsplash.com/photo-1645856049138-bcb23afaeefb?crop=entropy&cs=srgb&fm=jpg&q=85"}
                alt="Elegant Bridal Makeup"
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <p className="text-3xl font-bold" style={{ color: 'var(--secondary)' }}>{settings.years_experience}</p>
                <p className="text-sm text-gray-600">Years Experience</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-spacing bg-[var(--background-alt)]" data-testid="features-section">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { 
                icon: Award, 
                title: 'Expert Artists', 
                desc: 'Certified professionals',
                image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop'
              },
              { 
                icon: Star, 
                title: '5.0 Rating', 
                desc: 'Top-rated on Google',
                image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=300&fit=crop'
              },
              { 
                icon: Calendar, 
                title: 'Easy Booking', 
                desc: 'Book online anytime',
                image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop'
              },
              { 
                icon: Users, 
                title: 'Happy Clients', 
                desc: '1000+ satisfied customers',
                image: 'https://images.unsplash.com/photo-1554139967-ae0fce5d57b7?w=400&h=300&fit=crop'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
                data-testid={`feature-${index}`}
              >
                <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center">
                    <feature.icon size={40} className="text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="section-spacing" data-testid="featured-services-section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">Our Premium Services</h2>
            <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
              Discover our range of beauty and wellness treatments
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="service-card"
                data-testid={`service-card-${index}`}
              >
                <img
                  src={service.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'}
                  alt={service.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{service.description}</p>
                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>₹{service.price}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{service.duration} mins</p>
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
        <div className="container-custom">
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
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="staff-card"
                data-testid={`staff-card-${index}`}
              >
                <img
                  src={member.photo || 'https://images.unsplash.com/photo-1616723355486-eac8780bfcb9?w=400'}
                  alt={member.name}
                  className="w-full h-64 object-cover"
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
        <div className="container-custom">
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
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
        <div className="container-custom text-center text-white">
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
            whileInView={{ opacity: 1, y: 0 }}
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
