# Lotus Beauty Parlour - Product Requirements Document

## Original Problem Statement
Build a full-stack Beauty Parlour Appointment Booking Web Application for LOTUS BEAUTY PARLOUR. The platform includes a customer website, an appointment booking system, customer login, an extensive admin dashboard for managing all aspects of the business (services, staff, appointments, gallery, reviews, etc.), and several third-party integrations.

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS, Axios, Framer Motion
- **Backend:** FastAPI, Pydantic, Motor (async MongoDB)
- **Database:** MongoDB
- **Authentication:** JWT-based for both admin and customer roles

## Architecture
```
/app/
├── backend/
│   └── server.py         # FastAPI with all routes and models
├── frontend/
│   └── src/
│       ├── components/   # Navbar, Footer, WhatsAppFloat
│       ├── pages/        # Customer-facing pages
│       │   └── admin/    # Admin dashboard modules
│       └── utils/api.js  # API client
```

## Implemented Features

### Customer-Facing Website
- [x] Home page with dynamic content, open/closed status
- [x] About, Services, Gallery, Staff, Videos, Contact pages
- [x] Multi-step booking flow
- [x] Customer registration/login (Email + Phone number)
- [x] Customer dashboard (view appointments)
- [x] Review submission form (with admin approval)
- [x] Support/Account Recovery request form
- [x] WhatsApp floating button

### Admin Dashboard
- [x] Dashboard overview with stats
- [x] Appointments management
- [x] Services management
- [x] Staff management
- [x] Gallery management
- [x] Reviews management (approve/reject)
- [x] Holidays management
- [x] Coupons management
- [x] Revenue analytics
- [x] Staff calendar
- [x] Videos management
- [x] Settings management (homepage content)
- [x] Customers management (reset password)
- [x] Support requests management

### Key API Endpoints
- `/api/auth/login`, `/api/auth/register`, `/api/auth/login-phone`
- `/api/admin/login`
- `/api/services`, `/api/staff`, `/api/gallery`, `/api/reviews`
- `/api/appointments`, `/api/appointments/available-slots`
- `/api/coupons/validate/{code}`
- `/api/settings`
- `/api/customers`
- `/api/support`

### Admin Credentials
- Email: admin@lotus.com
- Password: admin123

## Pending Features (P2-P3)

### P2 - Medium Priority
- [ ] Forgot Password with email (Resend integration)
- [ ] Staff Calendar date filter
- [ ] Appointment detail modal on calendar
- [ ] Admin password change feature

### P3 - Lower Priority
- [ ] Forced password reset for customers (admin-initiated)
- [ ] SMS notifications (Twilio)

## Known Issues
- None currently - all tests passing (100% backend, 100% frontend)

## Technical Debt
- [ ] Refactor server.py into modular structure (routes/, models/, services/)

---
*Last updated: March 13, 2026*
