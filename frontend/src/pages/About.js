import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Heart, Users, Star, ArrowLeft } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page" data-testid="about-page">
      {/* Hero */}
      <section className="section-spacing bg-[var(--background-alt)]" data-testid="about-hero">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto">
          {/* Desktop Back Button Only */}
          <button
            onClick={() => navigate(-1)}
            className="hidden md:flex items-center gap-2 mb-6 text-gray-600 hover:text-[var(--secondary)] transition-colors"
            data-testid="about-back-btn"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold font-heading mb-6">Our Story</h1>
              <p className="text-base md:text-lg leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                Lotus Beauty Parlour was established with a vision to bring world-class beauty services to Tirunelveli. 
                Our journey began over 15 years ago with a simple mission: to help every woman feel confident and beautiful.
              </p>
              <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Today, we are proud to be the most trusted name in beauty services, serving thousands of satisfied clients 
                with our expertise in bridal makeup, hair styling, facials, and comprehensive salon services.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src="https://images.unsplash.com/photo-1533008093099-e2681382639a?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Lotus Beauty Parlour Interior"
                className="rounded-2xl shadow-2xl w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-spacing" data-testid="values-section">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">Why Choose Us</h2>
            <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
              What makes Lotus Beauty Parlour special
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Award, title: 'Expert Team', desc: 'Certified and experienced beauty professionals' },
              { icon: Heart, title: 'Premium Products', desc: 'Only the finest beauty products and cosmetics' },
              { icon: Users, title: 'Customer Focus', desc: 'Personalized attention to every client' },
              { icon: Star, title: 'Proven Results', desc: '5-star rated service excellence' },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="text-center bg-white p-8 rounded-xl shadow-sm"
                data-testid={`value-card-${index}`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'var(--secondary)', opacity: 0.1 }}>
                  <value.icon size={32} style={{ color: 'var(--secondary)' }} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="section-spacing bg-[var(--background-alt)]" data-testid="experience-section">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">Our Expertise</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Bridal Makeup Artistry',
                desc: 'Specializing in traditional and contemporary bridal looks that make your special day unforgettable.',
                image: 'https://images.unsplash.com/photo-1714381108306-a36169f0d3fb?crop=entropy&cs=srgb&fm=jpg&q=85',
              },
              {
                title: 'Hair Styling Excellence',
                desc: 'From elegant updos to trendy cuts, our stylists create looks that complement your personality.',
                image: 'https://images.unsplash.com/photo-1711454867327-4990937f8f18?crop=entropy&cs=srgb&fm=jpg&q=85',
              },
              {
                title: 'Skincare & Facials',
                desc: 'Professional facial treatments using premium products to reveal your natural radiance.',
                image: 'https://images.unsplash.com/photo-1722350766824-f8520e9676ac?crop=entropy&cs=srgb&fm=jpg&q=85',
              },
            ].map((expertise, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
                data-testid={`expertise-card-${index}`}
              >
                <img src={expertise.image} alt={expertise.title} className="w-full h-56 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3">{expertise.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{expertise.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
