import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppFloat = () => {
  const [showPopup, setShowPopup] = useState(false);
  const phoneNumber = '919500673208';
  const message = 'Hey, I am interested in your beauty parlour services. I would like to book an appointment.';

  const handleClick = () => {
    if (!showPopup) {
      setShowPopup(true);
    }
  };

  const handleWhatsAppRedirect = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setShowPopup(false);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setShowPopup(false);
  };

  return (
    <>
      {/* WhatsApp Popup */}
      {showPopup && (
        <div className="fixed bottom-[180px] right-4 z-[9999] animate-fade-in" data-testid="whatsapp-popup">
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-64 border border-gray-100">
            <button 
              onClick={handleClose}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
            >
              <X size={14} className="text-gray-600" />
            </button>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle size={24} color="white" />
              </div>
              <p className="text-sm text-gray-700 mb-3">Click here to book appointment on WhatsApp</p>
              <button 
                onClick={handleWhatsAppRedirect}
                className="w-full py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Open WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Float Button */}
      <div 
        className="whatsapp-float-container"
        onClick={handleClick}
        data-testid="whatsapp-float-btn"
      >
        <div className="whatsapp-icon">
          <MessageCircle size={28} color="white" />
        </div>
      </div>
    </>
  );
};

export default WhatsAppFloat;
