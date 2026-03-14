# Lotus Beauty Parlour - Product Requirements Document

## Original Problem Statement
Build a full-stack Beauty Parlour Appointment Booking Web Application for LOTUS BEAUTY PARLOUR with customer website, appointment booking, customer login, and comprehensive admin dashboard. Convert to a high-performance Progressive Web App (PWA) with offline support, smart caching, installability, native mobile app-like UI.

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS, Axios, Framer Motion
- **Backend:** FastAPI, Pydantic, Motor (async MongoDB)
- **Database:** MongoDB
- **Authentication:** JWT-based for admin and customer roles
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

### PWA Features
- [x] manifest.json with Lotus logo icons (72-512px)
- [x] iOS PWA meta tags and splash screens
- [x] Service Worker with smart caching strategies
- [x] Offline fallback page
- [x] PWA Install Prompt (Chrome, Safari, Edge, Samsung)
- [x] iOS instructions modal (Share → Add to Home Screen)
- [x] Add to Calendar feature (.ICS file)

### Smart Caching System (NEW - March 14, 2026)
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

## Key API Endpoints
- GET `/api/services` - Cache-first, 24h TTL
- GET `/api/gallery` - Cache-first, 12h TTL
- GET `/api/videos` - Cache-first, 24h TTL
- GET `/api/staff` - Cache-first, 24h TTL
- GET `/api/settings` - Cache-first, 1h TTL
- GET `/api/reviews` - Cache-first, 6h TTL
- GET/POST `/api/appointments` - Network-first (dynamic)
- GET `/api/appointments/{id}/ics` - ICS calendar file

## Test Reports
- `/app/test_reports/iteration_6.json` - PWA caching (100% pass)
- `/app/test_reports/iteration_5.json` - Mobile PWA UI (100% pass)
- `/app/test_reports/iteration_4.json` - PWA foundation (100% pass)

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
