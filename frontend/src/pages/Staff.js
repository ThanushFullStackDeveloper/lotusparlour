import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getStaff } from '../utils/api';
import { toast } from 'sonner';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await getStaff();
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading staff...</p>
      </div>
    );
  }

  return (
    <div className="staff-page" data-testid="staff-page">
      {/* Hero */}
      <section className="section-spacing bg-[var(--background-alt)]" data-testid="staff-hero">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-bold font-heading mb-6">Our Expert Team</h1>
          <p className="text-base md:text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Meet our talented professionals who bring years of experience and passion to every service
          </p>
        </div>
      </section>

      {/* Staff Grid */}
      <section className="section-spacing" data-testid="staff-grid">
        <div className="container-custom">
          {staff.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No staff members available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {staff.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="staff-card"
                  data-testid={`staff-card-${index}`}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={member.photo || 'https://images.unsplash.com/photo-1616723355486-eac8780bfcb9?w=400'}
                      alt={member.name}
                      className="w-full h-72 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                      <p className="text-sm" style={{ color: 'var(--secondary)' }}>{member.role}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Experience</p>
                        <p className="text-sm font-medium">{member.experience}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Specialization</p>
                        <p className="text-sm font-medium">{member.specialization}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Staff;
