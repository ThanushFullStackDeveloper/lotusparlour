# Lotus Beauty Parlour - Product Requirements Document

## Original Problem Statement
Build a full-stack Beauty Parlour Appointment Booking Web Application for LOTUS BEAUTY PARLOUR with customer website, appointment booking, customer login, and comprehensive admin dashboard. Convert to a Progressive Web App (PWA) with offline support, installability, native mobile app-like UI, and enhanced mobile experience.

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS, Axios, Framer Motion
- **Backend:** FastAPI, Pydantic, Motor (async MongoDB)
- **Database:** MongoDB
- **Authentication:** JWT-based for admin and customer roles
- **PWA:** Service Worker, Web App Manifest, ICS Calendar Integration

## Implemented Features

### Customer-Facing Website
- [x] Home page with dynamic content and Open/Closed status (weekly hours)
- [x] About, Services, Gallery, Staff, Videos, Contact pages
- [x] Contact page (no map, icons, Get Directions button)
- [x] Multi-step booking flow with past-slot filtering
- [x] Customer login (Email + Phone number)
- [x] Account Recovery (phone only)
- [x] Customer dashboard
- [x] Review submission form
- [x] WhatsApp button with touch-expand behavior
- [x] Dynamic navbar logo from settings (with reactive updates)

### PWA Features (March 14, 2026)
- [x] manifest.json with app icons (192x192, 512x512)
- [x] iOS PWA meta tags (apple-mobile-web-app-capable, touch-icon)
- [x] Service Worker with cache strategies (cache-first for static, network-first for API)
- [x] Offline fallback page
- [x] **PWA Install Prompt** - Auto-shows on mobile with "Add to Home Screen" button
- [x] **iOS Install Instructions Modal** - Step-by-step guide for Safari users
- [x] Add to Calendar feature (.ICS file download for appointments)

### Native Mobile App UI (March 14, 2026)
- [x] **Mobile Bottom Navigation** (Home, Services, Gallery, Videos, Book, Profile)
- [x] **Elevated "Book" button** in center of bottom nav (highlighted with gradient)
- [x] **WhatsApp Button** - Icon only by default, expands on tap, auto-collapses after 3s
- [x] **Services Page** - 2-column card grid with price badges and Quick View modal
- [x] **Gallery Page** - Instagram-style 3-column grid with scrollable filters
- [x] **Videos Page** - Responsive grid cards with play button overlays
- [x] Full-screen standalone mode when installed
- [x] Touch-friendly buttons with manipulation CSS
- [x] Smooth page transitions with Framer Motion

### Admin Dashboard (Mobile PWA)
- [x] Dashboard overview with stats
- [x] Appointments management
- [x] Customers management (search, edit, reset password, delete)
- [x] Services management
- [x] Staff management
- [x] Gallery management
- [x] Videos management
- [x] Reviews management
- [x] Coupons management
- [x] Revenue analytics
- [x] Staff calendar
- [x] Enquiries (contact form messages)
- [x] Support requests
- [x] Settings (homepage content, weekly hours, admin password)
- [x] **Mobile Header** with current page title
- [x] **Mobile Bottom Navigation** (Home, Bookings, Customers, Gallery, More)
- [x] **Slide-out Menu** from right side with all navigation options

### Key API Endpoints
- `/api/auth/login`, `/api/auth/register`, `/api/auth/login-phone`
- `/api/admin/login`, `/api/admin/change-password`
- `/api/services`, `/api/staff`, `/api/gallery`, `/api/reviews`
- `/api/appointments`, `/api/appointments/available-slots`
- `/api/appointments/{id}/ics` - ICS calendar file generation
- `/api/coupons/validate/{code}`
- `/api/settings`
- `/api/customers`, `/api/customers/{id}`, `/api/customers/{id}/reset-password`
- `/api/support`
- `/api/enquiries`

### Admin Credentials
- Email: admin@lotus.com
- Password: admin123 (may have been changed via admin settings)

## Recent Updates (March 14, 2026)

### PWA Native Mobile Experience
- Created `InstallPWA.js` component with auto-prompt and iOS instructions
- Enhanced `BottomNav.js` with elevated Book button and smooth animations
- Updated `WhatsAppFloat.js` with touch-expand behavior (icon only → tooltip)
- Redesigned `Services.js` with 2-column mobile grid and Quick View modal
- Redesigned `Gallery.js` with Instagram-style 3-col grid and custom lightbox
- Redesigned `Videos.js` with responsive grid cards and full-screen video modal
- Enhanced `AdminDashboard.js` with mobile header, bottom nav, and slide-out menu
- Added PWA-specific CSS (safe areas, touch manipulation, animations)

## Pending Features (P2-P3)

### P2 - Medium Priority
- [ ] Push Notifications (Web Push API) - deferred to later phase
- [ ] Forgot Password via Email (Resend integration)
- [ ] Staff Calendar date filter
- [ ] Appointment detail modal on calendar

### P3 - Lower Priority
- [ ] Forced password reset for customers
- [ ] SMS notifications (Twilio)
- [ ] Performance optimization (Lighthouse 90+)

## Technical Debt
- [ ] Refactor server.py into modular structure (routes/, models/)

## Test Reports
- `/app/test_reports/iteration_1.json` - Initial testing
- `/app/test_reports/iteration_2.json` - Customer management testing
- `/app/test_reports/iteration_3.json` - Settings and enquiries testing
- `/app/test_reports/iteration_4.json` - PWA foundation testing (100% pass)
- `/app/test_reports/iteration_5.json` - Mobile PWA UI testing (100% pass)

---
*Last updated: March 14, 2026*
