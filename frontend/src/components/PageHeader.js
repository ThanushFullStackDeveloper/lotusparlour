import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PageHeader = ({ title, subtitle, showBackButton = true, className = '' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <>
      {/* Sticky Back Button - Mobile Only */}
      {showBackButton && (
        <div className="md:hidden sticky top-[60px] z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100/50">
          <div className="w-full px-4 py-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-[var(--secondary)] transition-colors touch-manipulation"
              data-testid="back-button-mobile"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Page Header */}
      <div className={`page-header py-6 md:py-12 bg-[var(--background-alt)] ${className}`} data-testid="page-header">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto">
          {/* Desktop Back Button - Not sticky */}
          {showBackButton && (
            <button
              onClick={handleBack}
              className="hidden md:flex items-center gap-2 mb-4 text-gray-600 hover:text-[var(--secondary)] transition-colors"
              data-testid="back-button-desktop"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}
          
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
