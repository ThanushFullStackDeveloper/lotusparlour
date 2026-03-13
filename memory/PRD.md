# Lotus Beauty Parlour - Product Requirements Document

## Original Problem Statement
Build a full-stack Beauty Parlour Appointment Booking Web Application for LOTUS BEAUTY PARLOUR with customer website, appointment booking, customer login, and comprehensive admin dashboard.

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS, Axios, Framer Motion
- **Backend:** FastAPI, Pydantic, Motor (async MongoDB)
- **Database:** MongoDB
- **Authentication:** JWT-based for admin and customer roles

## Implemented Features

### Customer-Facing Website
- [x] Home page with dynamic content and Open/Closed status (weekly hours)
- [x] Feature cards without icon overlays (clean images)
- [x] About, Services, Gallery, Staff, Videos, Contact pages
- [x] Contact page (no map, icons, Get Directions button)
- [x] Multi-step booking flow with past-slot filtering
- [x] Customer login (Email + Phone number)
- [x] Account Recovery (phone only)
- [x] Customer dashboard
- [x] Review submission form
- [x] WhatsApp button with "Book Now on WhatsApp" text
- [x] Dynamic navbar logo from settings

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
- `/api/coupons/validate/{code}`
- `/api/settings`
- `/api/customers`, `/api/customers/{id}`, `/api/customers/{id}/reset-password`
- `/api/support`
- `/api/enquiries`

### Admin Credentials
- Email: admin@lotus.com
- Password: admin123

## Recent Updates (March 13, 2026)

### Session 3 Updates
- Feature cards: Removed icon overlays
- Navbar: Dynamic logo and name from settings
- Admin Settings: Added password change section
- Customers: Added search bar, edit modal, delete functionality
- Account Recovery: Phone number only (removed name/email)
- Contact form: Submissions go to Enquiries tab
- New Enquiries admin page with read/delete actions

## Pending Features (P2-P3)

### P2 - Medium Priority
- [ ] Forgot Password via Email (Resend integration)
- [ ] Staff Calendar date filter
- [ ] Appointment detail modal on calendar

### P3 - Lower Priority
- [ ] Forced password reset for customers
- [ ] SMS notifications (Twilio)

## Technical Debt
- [ ] Refactor server.py into modular structure

---
*Last updated: March 13, 2026*
