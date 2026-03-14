# Lotus Beauty Parlour - Product Requirements Document

## Original Problem Statement
Build a full-stack Beauty Parlour Appointment Booking Web Application for LOTUS BEAUTY PARLOUR with customer website, appointment booking, customer login, and comprehensive admin dashboard. Convert to a Progressive Web App (PWA) with offline support, installability, and mobile-friendly bottom navigation.

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
- [x] WhatsApp button with "Book Now on WhatsApp" text
- [x] Dynamic navbar logo from settings (with reactive updates)

### PWA Features (NEW - March 14, 2026)
- [x] manifest.json with app icons (192x192, 512x512)
- [x] iOS PWA meta tags (apple-mobile-web-app-capable, touch-icon)
- [x] Service Worker with cache strategies (cache-first for static, network-first for API)
- [x] Offline fallback page
- [x] Mobile bottom navigation (Home, Services, Book, Gallery, Videos, Profile)
- [x] Add to Calendar feature (.ICS file download for appointments)
- [x] 1-hour and 1-day appointment reminders in ICS

### Admin Dashboard
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

### Key API Endpoints
- `/api/auth/login`, `/api/auth/register`, `/api/auth/login-phone`
- `/api/admin/login`, `/api/admin/change-password`
- `/api/services`, `/api/staff`, `/api/gallery`, `/api/reviews`
- `/api/appointments`, `/api/appointments/available-slots`
- `/api/appointments/{id}/ics` (NEW - ICS calendar file)
- `/api/coupons/validate/{code}`
- `/api/settings`
- `/api/customers`, `/api/customers/{id}`, `/api/customers/{id}/reset-password`
- `/api/support`
- `/api/enquiries`

### Admin Credentials
- Email: admin@lotus.com
- Password: admin123

## Recent Updates (March 14, 2026)

### PWA Implementation
- Created `/public/manifest.json` with app name, icons, theme color, display:standalone
- Created `/public/service-worker.js` with caching strategies
- Created `/public/offline.html` for offline fallback
- Generated PWA icons (192x192, 512x512, apple-touch-icon)
- Added iOS PWA meta tags in `index.html`
- Registered service worker in `index.js`
- Created `BottomNav.js` component for mobile navigation
- Added ICS endpoint in backend for Add to Calendar feature
- Fixed navbar logo reactivity (settings-updated event)

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
- `/app/test_reports/iteration_4.json` - PWA features testing (100% pass)

---
*Last updated: March 14, 2026*
