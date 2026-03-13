import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Calendar, Users, Award } from 'lucide-react';
import { getServices, getStaff, getReviews } from '../utils/api';

const Home = () => {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, staffRes, reviewsRes] = await Promise.all([
        getServices(),
        getStaff(),
        getReviews(),
      ]);
      setServices(servicesRes.data.slice(0, 3));
      setStaff(staffRes.data.slice(0, 3));
      setReviews(reviewsRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
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
                Welcome to <span style={{ color: 'var(--secondary)' }}>Lotus</span> Beauty Parlour
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
                  <p className="text-sm text-gray-600">Open Daily</p>
                  <p className="text-sm font-semibold">Until 10 PM</p>
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
                src="https://images.unsplash.com/photo-1645856049138-bcb23afaeefb?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Elegant Bridal Makeup"
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <p className="text-3xl font-bold" style={{ color: 'var(--secondary)' }}>15+</p>
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
              { icon: Award, title: 'Expert Artists', desc: 'Certified professionals' },
              { icon: Star, title: '5.0 Rating', desc: 'Top-rated on Google' },
              { icon: Calendar, title: 'Easy Booking', desc: 'Book online anytime' },
              { icon: Users, title: 'Happy Clients', desc: '1000+ satisfied customers' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
                data-testid={`feature-${index}`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'var(--secondary)', opacity: 0.1 }}>
                  <feature.icon size={32} style={{ color: 'var(--secondary)' }} />
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

export default Home;
