import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppFloat = () => {
  const phoneNumber = '919500673208';
  const message = 'Hey, I am interested in your beauty parlour services. I would like to book an appointment.';

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      className="whatsapp-float-container" 
      onClick={handleClick} 
      data-testid="whatsapp-float-btn"
    >
      <span className="whatsapp-text">Book Now on WhatsApp</span>
      <div className="whatsapp-icon">
        <MessageCircle size={28} color="white" />
      </div>
    </div>
  );
};

export default WhatsAppFloat;
