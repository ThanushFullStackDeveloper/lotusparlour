import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PageHeader = ({ title, subtitle, showBackButton = true, className = '' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <>
      {/* Fixed Back Button - positioned below navbar */}
      {showBackButton && (
        <div className="fixed left-0 right-0 top-[60px] md:top-[72px] z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100/50 shadow-sm">
          <div className="container-custom py-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-[var(--secondary)] transition-colors touch-manipulation"
              data-testid="back-button"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Spacer for fixed back button */}
      {showBackButton && <div className="h-[44px]"></div>}
      
      {/* Page Header */}
      <div className={`page-header py-6 md:py-12 bg-[var(--background-alt)] ${className}`} data-testid="page-header">
        <div className="container-custom">
          {/* Title section */}
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold font-heading mb-2 md:mb-4">{title}</h1>
            {subtitle && (
              <p className="text-sm md:text-base max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PageHeader;
