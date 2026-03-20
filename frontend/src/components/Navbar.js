// import React, { useState, useEffect, useCallback } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Menu, X, User, Calendar, LogOut, ChevronDown, Instagram, Facebook, Youtube } from 'lucide-react';
// import { getSettings } from '../utils/api';

// const DEFAULT_LOGO = 'https://customer-assets.emergentagent.com/job_241db126-351c-4832-a8fb-845982688c90/artifacts/41r87k77_4B7AC146-0B06-4B1E-A8D9-0A69F86F7A02.jpeg';

// const Navbar = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [profileOpen, setProfileOpen] = useState(false);
//   const [settings, setSettings] = useState({ 
//     parlour_name: 'LOTUS', 
//     logo_image: null,
//     instagram_url: '',
//     facebook_url: '',
//     youtube_url: ''
//   });
//   const navigate = useNavigate();
//   const token = localStorage.getItem('token');
//   const role = localStorage.getItem('role');
//   const userName = localStorage.getItem('userName') || 'User';

//   const fetchSettings = useCallback(async () => {
//     try {
//       const response = await getSettings();
//       setSettings(response.data);
//     } catch (error) {
//       console.log('Failed to load settings');
//     }
//   }, []);

//   useEffect(() => {
//     fetchSettings();
    
//     // Listen for settings update events
//     const handleSettingsUpdate = () => {
//       fetchSettings();
//     };
    
//     window.addEventListener('settings-updated', handleSettingsUpdate);
    
//     return () => {
//       window.removeEventListener('settings-updated', handleSettingsUpdate);
//     };
//   }, [fetchSettings]);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('role');
//     localStorage.removeItem('userName');
//     navigate('/');
//     window.location.reload();
//   };

//   const navLinks = [
//     { name: 'Home', path: '/' },
//     { name: 'About', path: '/about' },
//     { name: 'Services', path: '/services' },
//     { name: 'Gallery', path: '/gallery' },
//     { name: 'Videos', path: '/videos' },
//     { name: 'Staff', path: '/staff' },
//     { name: 'Contact', path: '/contact' },
//   ];

//   // Parse parlour name into title parts
//   const parlourName = settings.parlour_name || 'Lotus Beauty Parlour';
//   const nameParts = parlourName.split(' ');
//   const mainTitle = nameParts[0]?.toUpperCase() || 'LOTUS';
//   const subTitle = nameParts.slice(1).join(' ') || 'Beauty Parlour';

//   return (
//     <nav 
//       className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 navbar-safe-area" 
//       data-testid="navbar"
//     >
//       {/* Safe area spacer for iOS PWA */}
//       <div className="safe-area-spacer"></div>
//       <div className="container-custom">
//         <div className="flex justify-between items-center py-2 md:py-4">
//           {/* Logo */}
//           <div className="flex items-center">
//             <Link to="/" className="flex items-center space-x-2 md:space-x-3" data-testid="nav-logo">
//               <img
//                 src={settings.logo_image || DEFAULT_LOGO}
//                 alt={parlourName}
//                 className="h-12 w-12 md:h-16 md:w-16 object-contain"
//               />
//               <div>
//                 <h1 className="text-lg md:text-2xl font-heading font-bold" style={{ color: 'var(--secondary)' }}>
//                   {mainTitle}
//                 </h1>
//                 <p className="text-[10px] md:text-xs" style={{ color: 'var(--text-muted)' }}>
//                   {subTitle}
//                 </p>
//               </div>
//             </Link>
            
//             {/* Social Media Icons - Filled Brand Colors */}
//             {(settings.instagram_url || settings.facebook_url || settings.youtube_url) && (
//               <div className="ml-3 md:ml-4 flex flex-col items-center mt-1">
//                 <div className="flex items-center gap-2">
//                   {settings.instagram_url && (
//                     <a 
//                       href={settings.instagram_url} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="hover:opacity-80 transition-opacity"
//                       data-testid="nav-instagram"
//                     >
//                       <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <defs>
//                           <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
//                             <stop offset="0%" stopColor="#FEDA75"/>
//                             <stop offset="25%" stopColor="#FA7E1E"/>
//                             <stop offset="50%" stopColor="#D62976"/>
//                             <stop offset="75%" stopColor="#962FBF"/>
//                             <stop offset="100%" stopColor="#4F5BD5"/>
//                           </linearGradient>
//                         </defs>
//                         <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#instagram-gradient)"/>
//                         <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" fill="none"/>
//                         <circle cx="17.5" cy="6.5" r="1.5" fill="white"/>
//                       </svg>
//                     </a>
//                   )}
//                   {settings.facebook_url && (
//                     <a 
//                       href={settings.facebook_url} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="hover:opacity-80 transition-opacity"
//                       data-testid="nav-facebook"
//                     >
//                       <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <rect x="2" y="2" width="20" height="20" rx="5" fill="#1877F2"/>
//                         <path d="M16.5 12.5H14V18H11V12.5H9V10H11V8.5C11 6.5 12.2 5 14.5 5H16.5V7.5H15C14.2 7.5 14 7.8 14 8.5V10H16.5L16.5 12.5Z" fill="white"/>
//                       </svg>
//                     </a>
//                   )}
//                   {settings.youtube_url && (
//                     <a 
//                       href={settings.youtube_url} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="hover:opacity-80 transition-opacity"
//                       data-testid="nav-youtube"
//                     >
//                       <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <rect x="2" y="4" width="20" height="16" rx="4" fill="#FF0000"/>
//                         <path d="M10 8.5V15.5L16 12L10 8.5Z" fill="white"/>
//                       </svg>
//                     </a>
//                   )}
//                 </div>
//                 <span className="text-[8px] md:text-[10px] text-gray-500 mt-0.5">Follow us on</span>
//               </div>
//             )}
//           </div>

//           {/* Desktop Menu */}
//           <div className="hidden md:flex items-center space-x-8">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.path}
//                 to={link.path}
//                 className="text-base font-medium hover:text-[var(--secondary)] transition-colors"
//                 style={{ color: 'var(--text-primary)' }}
//                 data-testid={`nav-link-${link.name.toLowerCase()}`}
//               >
//                 {link.name}
//               </Link>
//             ))}
//             {token && role === 'user' ? (
//               <div className="relative">
//                 <button
//                   onClick={() => setProfileOpen(!profileOpen)}
//                   className="flex items-center space-x-2 text-base font-medium hover:text-[var(--secondary)] transition-colors"
//                   style={{ color: 'var(--text-primary)' }}
//                   data-testid="profile-dropdown-btn"
//                 >
//                   <User size={20} />
//                   <span>{userName}</span>
//                   <ChevronDown size={16} />
//                 </button>
//                 {profileOpen && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50" data-testid="profile-dropdown-menu">
//                     <Link
//                       to="/dashboard"
//                       onClick={() => setProfileOpen(false)}
//                       className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors"
//                       data-testid="profile-menu-appointments"
//                     >
//                       <Calendar size={18} />
//                       <span>My Appointments</span>
//                     </Link>
//                     <button
//                       onClick={handleLogout}
//                       className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors w-full text-left"
//                       data-testid="profile-menu-logout"
//                     >
//                       <LogOut size={18} />
//                       <span>Logout</span>
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               !token && (
//                 <Link to="/login" data-testid="nav-login-btn">
//                   <button className="btn-secondary">Login</button>
//                 </Link>
//               )
//             )}
//             <Link to="/booking" data-testid="nav-book-btn">
//               <button className="btn-primary">Book Now</button>
//             </Link>
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             className="md:hidden p-2 -mr-2 flex items-center justify-center"
//             onClick={() => setIsOpen(!isOpen)}
//             data-testid="nav-mobile-toggle"
//           >
//             {isOpen ? <X size={22} /> : <Menu size={22} />}
//           </button>
//         </div>

//         {/* Mobile Menu */}
//         {isOpen && (
//           <div className="md:hidden py-4 space-y-3" data-testid="nav-mobile-menu">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.path}
//                 to={link.path}
//                 className="block py-2 text-base font-medium hover:text-[var(--secondary)] transition-colors"
//                 style={{ color: 'var(--text-primary)' }}
//                 onClick={() => setIsOpen(false)}
//                 data-testid={`nav-mobile-link-${link.name.toLowerCase()}`}
//               >
//                 {link.name}
//               </Link>
//             ))}
//             {token && role === 'user' && (
//               <Link
//                 to="/dashboard"
//                 className="block py-2 text-base font-medium hover:text-[var(--secondary)] transition-colors"
//                 style={{ color: 'var(--text-primary)' }}
//                 onClick={() => setIsOpen(false)}
//                 data-testid="nav-mobile-link-dashboard"
//               >
//                 Dashboard
//               </Link>
//             )}
//             <div className="flex flex-col space-y-2 pt-2">
//               {token ? (
//                 <button onClick={handleLogout} className="btn-secondary w-full" data-testid="nav-mobile-logout-btn">
//                   Logout
//                 </button>
//               ) : (
//                 <Link to="/login" className="w-full" onClick={() => setIsOpen(false)} data-testid="nav-mobile-login-btn">
//                   <button className="btn-secondary w-full">Login</button>
//                 </Link>
//               )}
//               <Link to="/booking" className="w-full" onClick={() => setIsOpen(false)} data-testid="nav-mobile-book-btn">
//                 <button className="btn-primary w-full">Book Now</button>
//               </Link>
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };





import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, Calendar, LogOut, ChevronDown } from 'lucide-react';
import { getSettings } from '../utils/api';

const DEFAULT_LOGO = 'https://customer-assets.emergentagent.com/job_241db126-351c-4832-a8fb-845982688c90/artifacts/41r87k77_4B7AC146-0B06-4B1E-A8D9-0A69F86F7A02.jpeg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settings, setSettings] = useState({ 
    parlour_name: 'LOTUS', 
    logo_image: null,
    instagram_url: '',
    facebook_url: '',
    youtube_url: ''
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('userName') || 'User';

  const fetchSettings = useCallback(async () => {
    try {
      const response = await getSettings();
      setSettings(response.data);
    } catch (error) {
      console.log('Failed to load settings');
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    const handleSettingsUpdate = () => {
      fetchSettings();
    };

    window.addEventListener('settings-updated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
    };
  }, [fetchSettings]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Videos', path: '/videos' },
    { name: 'Staff', path: '/staff' },
    { name: 'Contact', path: '/contact' },
  ];

  const parlourName = settings.parlour_name || 'Lotus Beauty Parlour';
  const nameParts = parlourName.split(' ');
  const mainTitle = nameParts[0]?.toUpperCase() || 'LOTUS';
  const subTitle = nameParts.slice(1).join(' ') || 'Beauty Parlour';

  return (
    <>
      {/* ✅ NAVBAR */}
      <nav
        className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50"
        style={{ paddingTop: 'env(safe-area-inset-top)' }} // iPhone safe area fix
      >
        <div className="container-custom">
          {/* ✅ FIXED HEIGHT */}
          <div className="flex justify-between items-center h-[70px]">

            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 md:space-x-3">
                <img
                  src={settings.logo_image || DEFAULT_LOGO}
                  alt={parlourName}
                  className="h-12 w-12 md:h-16 md:w-16 object-contain"
                />
                <div>
                  <h1 className="text-lg md:text-2xl font-heading font-bold text-yellow-600">
                    {mainTitle}
                  </h1>
                  <p className="text-[10px] md:text-xs text-gray-500">
                    {subTitle}
                  </p>
                </div>
              </Link>

              {/* Social Icons */}
              {(settings.instagram_url || settings.facebook_url || settings.youtube_url) && (
                <div className="ml-3 md:ml-4 flex flex-col items-center mt-1">
                  <div className="flex items-center gap-2">

                    {settings.instagram_url && (
                      <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"></div>
                      </a>
                    )}

                    {settings.facebook_url && (
                      <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer">
                        <div className="w-6 h-6 rounded-md bg-blue-600"></div>
                      </a>
                    )}

                    {settings.youtube_url && (
                      <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer">
                        <div className="w-6 h-6 rounded-md bg-red-600"></div>
                      </a>
                    )}

                  </div>
                  <span className="text-[8px] md:text-[10px] text-gray-500 mt-0.5">
                    Follow us
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className="text-base font-medium text-gray-700 hover:text-yellow-600">
                  {link.name}
                </Link>
              ))}

              {token && role === 'user' ? (
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center space-x-2">
                    <User size={20} />
                    <span>{userName}</span>
                    <ChevronDown size={16} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                      <Link to="/dashboard" className="flex items-center px-4 py-2 hover:bg-gray-100">
                        <Calendar size={18} />
                        <span className="ml-2">My Appointments</span>
                      </Link>
                      <button onClick={handleLogout} className="flex items-center px-4 py-2 hover:bg-gray-100 w-full">
                        <LogOut size={18} />
                        <span className="ml-2">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                !token && (
                  <Link to="/login">
                    <button className="btn-secondary">Login</button>
                  </Link>
                )
              )}

              <Link to="/booking">
                <button className="btn-primary">Book Now</button>
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden py-4 space-y-3">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}>
                  {link.name}
                </Link>
              ))}

              <div className="flex flex-col space-y-2 pt-2">
                {token ? (
                  <button onClick={handleLogout} className="btn-secondary">Logout</button>
                ) : (
                  <Link to="/login">
                    <button className="btn-secondary">Login</button>
                  </Link>
                )}
                <Link to="/booking">
                  <button className="btn-primary">Book Now</button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ✅ AUTO SPACER (Prevents content hiding) */}
      <div style={{ height: 'calc(70px + env(safe-area-inset-top))' }} />
    </>
  );
};

export default Navbar;

// export default Navbar;
