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

### Discount Price Feature (Added March 15, 2026)
- [x] **Service Discount Price** - Optional discount price field for services
- [x] **Admin Form** - Price and Discount Price fields side by side
- [x] **Validation** - Discount must be less than original price, cannot be negative
- [x] **Display Format** - Original price strikethrough + green discount price
- [x] **Pages Updated** - Services page, Home page (Premium Services), Service detail modal
- [x] **Database** - `discount_price` field (nullable) in services collection

### Admin Settings (Added March 15, 2026)
- [x] **Editable Tagline** - Customize hero section tagline
- [x] **Editable Google Rating** - Set displayed Google rating value

### Navigation & UI (Updated March 14, 2026)
- [x] **Back Arrow Navigation** on all internal pages:
  - Services, Gallery, Videos, Staff, About, Contact, Booking
  - Customer Dashboard, Admin Dashboard (mobile)
- [x] **PageHeader Component** - Reusable header with back button
- [x] **Home Page Scroll Fix** - Smooth scrolling without jumps
- [x] **Desktop Layout Optimization** - Proper spacing for 1366px, 1440px screens
- [x] **Admin Customers Mobile Cards** - Table converts to cards on mobile for accessible action buttons

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
- [x] **Cache-First Strategy** for static data
- [x] **Network-First Strategy** for dynamic data
- [x] **Background Refresh** when cache is >50% through TTL
- [x] **Offline Support** - Shows cached data when offline
- [x] **OfflineBanner Component** - Displays "You're viewing cached data"

### Native Mobile App UI
- [x] Mobile Bottom Navigation with elevated Book button
- [x] Services: 2-column card grid with Quick View
- [x] Gallery: Instagram-style 3-column grid
- [x] Videos: Responsive grid cards with play overlay
- [x] Staff: Mobile-optimized 2-column grid
- [x] Admin Dashboard: Mobile header + bottom nav + slide-out menu

### Admin Dashboard
- [x] All management features (Appointments, Customers, Services, Staff, Gallery, Videos, Reviews, Coupons, Revenue, Settings)
- [x] Mobile-responsive with touch-friendly controls
- [x] Enquiries and Support request management
- [x] Advanced appointment filtering and sorting
- [x] **Mobile Card Layout for Customers** - Easy access to Edit, Reset, Delete buttons

## Key Components
- `/app/frontend/src/components/PageHeader.js` - Reusable page header with back button
- `/app/frontend/src/components/BottomNav.js` - Mobile bottom navigation
- `/app/frontend/src/components/InstallPWA.js` - PWA install prompt
- `/app/frontend/src/utils/cacheManager.js` - IndexedDB cache management

## Key API Endpoints
- POST `/api/auth/unified-login` - Unified login for customers & admins
- GET `/api/appointments/{id}/ics` - ICS calendar file download
- GET `/api/services`, `/api/gallery`, `/api/videos`, `/api/staff` - Cache-first endpoints

## Test Reports
- `/app/test_reports/iteration_9.json` - Navigation & UI improvements (100% pass)
- `/app/test_reports/iteration_8.json` - Unified Login & ICS Calendar (100% pass)

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
