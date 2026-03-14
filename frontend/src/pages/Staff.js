import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { getStaff } from '../utils/api';
import { useCachedData } from '../hooks/useCachedData';
import OfflineBanner from '../components/OfflineBanner';
import { toast } from 'sonner';

const Staff = () => {
  const { 
    data: staff, 
    loading, 
    fromCache, 
    isStale, 
    isOffline,
    refresh 
  } = useCachedData(
    'staff',
    async () => {
      const response = await getStaff();
      return response.data;
    }
  );

  if (loading && !staff) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[var(--secondary)]/30"></div>
          <p className="mt-4 text-gray-500">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-page" data-testid="staff-page">
      {/* Offline/Stale Banner */}
      <OfflineBanner isOffline={isOffline} isStale={isStale} onRefresh={refresh} />
      
      {/* Hero */}
      <section className="py-6 md:py-12 bg-[var(--background-alt)]" data-testid="staff-hero">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-5xl font-bold font-heading mb-2">Our Expert Team</h1>
          <p className="text-sm md:text-base max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Meet our talented professionals
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

      {/* Staff Grid */}
      <section className="py-6 md:py-12" data-testid="staff-grid">
        <div className="container-custom">
          {(!staff || staff.length === 0) ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No staff members available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {staff.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm"
                  data-testid={`staff-card-${index}`}
                >
                  <div className="relative">
                    <img
                      src={member.photo || 'https://images.unsplash.com/photo-1616723355486-eac8780bfcb9?w=400'}
                      alt={member.name}
                      className="w-full h-40 md:h-56 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <h3 className="text-sm md:text-lg font-semibold text-white">{member.name}</h3>
                      <p className="text-xs" style={{ color: 'var(--secondary)' }}>{member.role}</p>
                    </div>
                  </div>
                  <div className="p-3 md:p-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">{member.experience}</p>
                      <p className="text-xs font-medium text-[var(--secondary)]">{member.specialization}</p>
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
