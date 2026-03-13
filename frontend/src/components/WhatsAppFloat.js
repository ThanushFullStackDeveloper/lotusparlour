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
    <div className="whatsapp-float" onClick={handleClick} data-testid="whatsapp-float-btn">
      <MessageCircle size={28} color="white" />
    </div>
  );
};

export default WhatsAppFloat;
