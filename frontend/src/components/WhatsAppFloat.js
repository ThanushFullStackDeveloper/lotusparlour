import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppFloat = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const phoneNumber = '919500673208';
  const message = 'Hey, I am interested in your beauty parlour services. I would like to book an appointment.';

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleTouch = () => {
    setIsExpanded(true);
    // Auto collapse after 3 seconds
    setTimeout(() => setIsExpanded(false), 3000);
  };

  return (
    <div 
      className={`whatsapp-float-container ${isExpanded ? 'expanded' : ''}`}
      onClick={handleClick}
      onTouchStart={handleTouch}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      data-testid="whatsapp-float-btn"
    >
      <span className={`whatsapp-text ${isExpanded ? 'visible' : ''}`}>
        Book on WhatsApp
      </span>
      <div className="whatsapp-icon">
        <MessageCircle size={28} color="white" />
      </div>
    </div>
  );
};

export default WhatsAppFloat;
