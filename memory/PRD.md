# Lotus Beauty Parlour - Product Requirements Document

## Original Problem Statement
Build a full-stack Beauty Parlour Appointment Booking Web Application for LOTUS BEAUTY PARLOUR with customer website, appointment booking, customer login, and comprehensive admin dashboard. Convert to a high-performance Progressive Web App (PWA) with offline support, smart caching, installability, native mobile app-like UI.

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS, Axios, Framer Motion
- **Backend:** FastAPI, Pydantic, Motor (async MongoDB)
- **Database:** MongoDB (DB Name: `test_database`)
- **Authentication:** JWT-based with role-based access (admin/customer)
- **PWA:** Service Worker, Web App Manifest, IndexedDB Caching, ICS Calendar Integration
- **Timezone:** IST (UTC+5:30)

## Implemented Features

### Customer-Facing Website
- [x] Home page with dynamic content and Open/Closed status
- [x] Services, Gallery, Staff, Videos, Contact pages
- [x] Multi-step booking flow with IST timezone
- [x] Customer login (Email + Phone number)
- [x] Customer dashboard & Account Recovery
- [x] Review submission form
- [x] WhatsApp button with touch-expand behavior

### Authentication (Updated March 14, 2026)
- [x] **Unified Login Page** - Both customers AND admins can log in from /login
- [x] **Role-Based Redirection** - Admin → /admin/dashboard, Customer → /dashboard
- [x] **Email & Phone Login** - Customers can login via email or phone number
- [x] **Admin Note** - "Admins can also log in here" displayed on login page
- [x] JWT tokens contain user role (admin/customer/user)
- [x] Protected admin routes - customers cannot access admin pages

### PWA Features
- [x] manifest.json with Lotus logo icons (72-512px)
- [x] iOS PWA meta tags and splash screens
- [x] Service Worker with smart caching strategies
- [x] Offline fallback page
- [x] PWA Install Prompt (Chrome, Safari, Edge, Samsung)
- [x] iOS instructions modal (Share → Add to Home Screen)

### Add to Calendar Feature (Updated March 14, 2026)
- [x] **ICS File Generation** - `/api/appointments/{id}/ics`
- [x] **Calendar Event Title:** "Lotus Beauty Parlour Appointment"
- [x] **Location:** "3/41, East Street, Main Road, Puthumanai, Tirunelveli, Tamil Nadu 627120"
- [x] **Description:** Service name, Staff name, Parlour contact: 09500673208
- [x] **Duration:** Calculated from service duration
- [x] **Reminders:** 1 day before + 1 hour before
- [x] **"Add to Calendar" Button** on each appointment (pending/confirmed status)
- [x] Compatible with Google Calendar, Apple Calendar, Outlook

### Smart Caching System
- [x] **IndexedDB Cache Manager** with TTL-based expiration
- [x] **Cache-First Strategy** for static data:
  - Services: 24-hour TTL
  - Gallery: 12-hour TTL
  - Videos: 24-hour TTL
  - Staff: 24-hour TTL
  - Settings: 1-hour TTL
  - Reviews: 6-hour TTL
- [x] **Network-First Strategy** for dynamic data (Appointments, Auth, Admin)
- [x] **Background Refresh** when cache is >50% through TTL
- [x] **Offline Support** - Shows cached data when offline
- [x] **OfflineBanner Component** - Displays "You're viewing cached data"
- [x] **Manual Refresh Button** on all cached pages
- [x] **useCachedData Hook** for React components

### Native Mobile App UI
- [x] Mobile Bottom Navigation with elevated Book button
- [x] Services: 2-column card grid with Quick View
- [x] Gallery: Instagram-style 3-column grid
- [x] Videos: Responsive grid cards with play overlay
- [x] Staff: Mobile-optimized 2-column grid
- [x] Admin Dashboard: Mobile header + bottom nav + slide-out menu

### Performance Optimizations
- [x] Service Worker precaches static assets
- [x] Image lazy loading with loading="lazy"
- [x] Cache-first for API responses
- [x] Background data refresh
- [x] Minimal API calls on repeat visits

### Admin Dashboard
- [x] All management features (Appointments, Customers, Services, Staff, Gallery, Videos, Reviews, Coupons, Revenue, Settings)
- [x] Mobile-responsive with touch-friendly controls
- [x] Enquiries and Support request management
- [x] Advanced appointment filtering and sorting

## Key API Endpoints
- POST `/api/auth/unified-login` - Unified login for customers & admins
- GET `/api/services` - Cache-first, 24h TTL
- GET `/api/gallery` - Cache-first, 12h TTL
- GET `/api/videos` - Cache-first, 24h TTL
- GET `/api/staff` - Cache-first, 24h TTL
- GET `/api/settings` - Cache-first, 1h TTL
- GET `/api/reviews` - Cache-first, 6h TTL
- GET/POST `/api/appointments` - Network-first (dynamic)
- GET `/api/appointments/{id}/ics` - ICS calendar file download

## Test Reports
- `/app/test_reports/iteration_8.json` - Unified Login & ICS Calendar (100% pass)
- `/app/test_reports/iteration_7.json` - Dashboard filters (100% pass)
- `/app/test_reports/iteration_6.json` - PWA caching (100% pass)
- `/app/test_reports/iteration_5.json` - Mobile PWA UI (100% pass)

## Test Credentials
- **Admin:** admin@lotus.com / admin123
- **Customer:** test@test.com / test123 (phone: 9876543210)

## Pending Features (P2-P3)

### P2 - Medium Priority
- [ ] Push Notifications (Web Push API)
- [ ] Forgot Password via Email

### P3 - Lower Priority
- [ ] SMS notifications (Twilio)
- [ ] Performance optimization (Lighthouse 90+)
- [ ] Backend refactoring (modularize server.py)

---
*Last updated: March 14, 2026*
