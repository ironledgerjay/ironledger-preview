# Overview

IronLedger MedMap is a healthcare platform that connects South African patients with verified medical professionals across all 9 provinces. The application features a comprehensive doctor directory, appointment booking system with real-time time slot management, and membership tiers with integrated PayFast payment processing. Built as a full-stack web application with React frontend and Express.js backend, it emphasizes trust and accessibility in healthcare delivery with complete booking workflow automation and instant notifications.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend uses a modern React stack with TypeScript and Vite for development. The UI is built with shadcn/ui components based on Radix UI primitives, styled with Tailwind CSS using a custom design system. Navigation is handled by Wouter for client-side routing, and React Query manages server state and caching. The application follows a component-based architecture with shared hooks for authentication (Supabase) and payment processing (PayFast).

## Backend Architecture
The backend is an Express.js server with TypeScript that provides a REST API. It uses a layered architecture with route handlers in `/server/routes.ts` and a storage abstraction layer defined in `/server/storage.ts`. The server includes middleware for request logging, JSON parsing, and error handling. Development setup uses Vite middleware for hot reloading and asset serving.

## Data Storage
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema defines separate tables for users, patients, doctors, bookings, and payments, using UUIDs as primary keys. Database migrations are managed through Drizzle Kit, and the connection is configured for Neon Database hosting.

## Authentication & Authorization
Authentication is handled through Supabase Auth, providing secure user registration and login flows. The system supports role-based access with separate user types (patient, doctor, admin) and maintains session state through React context. User profiles are created in the local database after successful authentication.

## Payment Processing
PayFast integration handles secure payment processing for membership upgrades and booking fees. The system generates payment URLs with proper signatures and handles payment notifications. Membership tiers include Basic (free with R10 booking fees) and Premium (R39 quarterly with free bookings), with payment status tracking in the database.

# External Dependencies

- **Supabase**: Authentication service and user management
- **PayFast**: Primary payment gateway for South African transactions with full webhook integration and admin tracking
- **Neon Database**: PostgreSQL hosting and database management
- **Radix UI**: Headless UI component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Server state management and caching
- **Drizzle ORM**: Type-safe database operations
- **Vite**: Development server and build tooling
- **shadcn/ui**: Pre-built component library

# Doctor Authentication System

## Complete Doctor Workflow
- **Doctor Registration**: Full signup form at `/doctor-signup` with medical credentials
- **Admin Approval Process**: Doctors require admin approval before accessing portal
- **Doctor Login**: Secure login at `/login` (Doctor tab) with verified account access
- **Doctor Portal**: Full practice management with real-time booking system

## Demo Doctor Credentials
- **Email**: `dr.johnson@example.com`
- **Password**: `TempPass123!`
- **Status**: Pre-approved Cardiologist in Johannesburg
- **Portal Access**: Complete scheduling, booking management, and patient communication

## Authentication Features
- Real-time approval notifications sent to admin when doctors register
- Email validation and duplicate account prevention
- Session management with localStorage (production-ready authentication pending)
- Role-based access control (doctor vs patient vs admin)
- Automatic redirect to doctor portal after successful login

# Production Features

## Security & Middleware
- **Helmet**: Security headers and CSP configuration
- **CORS**: Cross-origin resource sharing with domain restrictions
- **Rate Limiting**: API rate limiting (100 requests per 15 minutes)
- **Input Validation**: Zod schema validation for all API endpoints
- **Error Handling**: Comprehensive error boundaries and middleware
- **Request Logging**: Detailed request/response logging with performance metrics

## Monitoring & Health Checks
- **Health Endpoints**: /health, /health/ready, /health/live endpoints
- **System Monitoring**: Memory usage, database connectivity, API performance
- **Real-time Statistics**: Live platform statistics and metrics
- **Comprehensive Admin Panel**: Real-time administrative interface at /admin with 5 key sections:
  - Pending Doctor Approvals (3-second polling)
  - User Management & Analytics (5-second polling) 
  - Payment Analytics & Tracking (15-second polling)
  - Enhanced Platform Statistics (10-second polling)
  - Manual Doctor Enrollment System
- **Cross-System Communication**: Live data sharing via API endpoints for activity logs, notifications, and statistics
- **Activity Tracking**: Comprehensive logging of user actions and system events for CRM monitoring
- **Universal Back Navigation**: Smart back button component with browser history integration and fallback paths
- **Real-time User Tracking**: Automatic page view logging and user action tracking across all major pages
- **Comprehensive Admin Dashboard**: Complete real-time management system with:
  - Doctor approval workflow with instant notifications
  - User analytics showing total, premium, and active users
  - Payment tracking with transaction history and status monitoring  
  - Manual doctor enrollment with full form validation
  - Live statistics with automatic polling for real-time updates
- **Enhanced CRM Integration**: Multiple API endpoints supporting:
  - /api/crm/users - All user management data
  - /api/crm/payments - Payment analytics and transaction history
  - /api/crm/stats - Enhanced statistics including premium members and active users

## Database & Migrations
- **Automated Migrations**: Database schema migrations with Drizzle
- **Connection Pooling**: Optimized database connections
- **Health Monitoring**: Continuous database connectivity checks
- **Data Seeding**: Initial data setup for production deployment

## Error Management
- **Error Boundaries**: React error boundaries with fallback UI
- **Production Logging**: Error reporting and logging infrastructure
- **User Feedback**: Toast notifications and error messaging

## Deployment & Configuration
- **Environment Validation**: Strict environment variable validation
- **Production Scripts**: Automated deployment and build scripts
- **Feature Flags**: Configurable feature toggles