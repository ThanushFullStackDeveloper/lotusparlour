import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[var(--background-dark)] text-white mt-16" data-testid="footer">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-heading font-bold mb-4" style={{ color: 'var(--secondary)' }}>
              Lotus Beauty Parlour
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Your destination for premium beauty services in Tirunelveli. Experience elegance and transformation.
            </p>
            <div className="flex space-x-3 mt-4">
              <a href="#" className="hover:text-[var(--secondary)] transition-colors" data-testid="footer-facebook-link">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-[var(--secondary)] transition-colors" data-testid="footer-instagram-link">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-[var(--secondary)] transition-colors" data-testid="footer-link-home">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-[var(--secondary)] transition-colors" data-testid="footer-link-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-[var(--secondary)] transition-colors" data-testid="footer-link-services">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-gray-300 hover:text-[var(--secondary)] transition-colors" data-testid="footer-link-gallery">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Popular Services</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Bridal Makeup</li>
              <li>Hair Styling</li>
              <li>Facial Treatment</li>
              <li>Spa & Massage</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start space-x-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span>3/41, East Street, Main Road<br />Puthumanai, Tirunelveli<br />Tamil Nadu 627120</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} />
                <a href="tel:09500673208" className="hover:text-[var(--secondary)] transition-colors" data-testid="footer-phone-link">
                  09500673208
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={16} />
                <span>info@lotusbeauty.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Lotus Beauty Parlour. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
