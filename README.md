# IronLedger MedMap

A comprehensive South African healthcare platform that connects patients with verified medical professionals across all 9 provinces. Built with real-time functionality for competitive booking and appointment management.

![Platform Preview](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=IronLedger+MedMap)

## 🚀 Features

### For Patients
- **Smart Doctor Search**: Advanced filtering by specialty, location, price, availability, and ratings
- **Real-time Booking**: Interactive appointment booking with live time slot updates
- **Payment Integration**: Secure PayFast payment processing for South African market
- **Mobile Optimized**: Fully responsive design for all devices
- **Emergency Services**: Quick access to emergency medical services

### For Doctors
- **Enhanced Practice Portal**: Complete practice management with real-time updates
- **Schedule Management**: Interactive schedule control with instant synchronization
- **Patient Communication**: Real-time chat and notification system
- **Revenue Analytics**: Live payment tracking and financial reporting
- **Professional Verification**: Comprehensive credential verification system

### For Administrators
- **Real-time Dashboard**: Live monitoring with auto-refreshing statistics
- **Doctor Approvals**: Instant notification and approval workflow
- **Payment Analytics**: Complete transaction monitoring and reporting
- **User Management**: Comprehensive user analytics and management tools

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Query** for state management
- **Wouter** for routing

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** with Drizzle ORM
- **WebSocket** for real-time features
- **JWT** authentication with refresh tokens
- **bcrypt** for password security

### Integrations
- **PayFast** - South African payment gateway
- **Supabase** - Authentication and user management
- **SendGrid** - Email services
- **Google Cloud Storage** - File storage

## ⚡ Real-time Features

The platform emphasizes real-time functionality for competitive advantage:

- **Live Booking Updates**: Instant slot availability across all users
- **Real-time Schedule Sync**: Doctor portal changes reflect immediately in booking system
- **Live Notifications**: Instant alerts for appointments, approvals, and payments
- **WebSocket Infrastructure**: Robust real-time communication system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- PayFast merchant account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ironledger-medmap.git
   cd ironledger-medmap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Required environment variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   VITE_PAYFAST_MERCHANT_ID=your_merchant_id
   VITE_PAYFAST_MERCHANT_KEY=your_merchant_key
   VITE_PAYFAST_PASSPHRASE=your_passphrase
   SESSION_SECRET=your_session_secret
   SENDGRID_API_KEY=your_sendgrid_key
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:5000` to see the application.

## 📱 Demo Credentials

### Doctor Portal Demo
- **Email**: `dr.johnson@example.com`
- **Password**: `TempPass123!`
- **Status**: Pre-approved Cardiologist in Johannesburg

### Admin Panel Demo
- **Secret Phrase**: `medmap2025admin!`
- **Access URL**: `/admin`

## 🏗 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Express.js backend
│   ├── routes/           # API route handlers
│   ├── middleware/       # Express middleware
│   └── services/         # Business logic services
├── shared/               # Shared types and schemas
└── migrations/           # Database migrations
```

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Password Hashing** with bcrypt (12 salt rounds)
- **Email Verification** required for all accounts
- **Two-Factor Authentication** (TOTP) support
- **Rate Limiting** and account lockout protection
- **Input Validation** with Zod schemas

## 💳 Payment System

### Membership Plans
- **Basic**: Free with R10 booking fees
- **Premium Quarterly**: R39 with free bookings
- **Premium Annual**: R149 (24% savings)

### Payment Features
- PayFast integration for South African market
- Secure payment processing and webhooks
- Transaction tracking and reporting
- Refund management system

## 📊 Monitoring & Health

- **Health Endpoints**: `/health`, `/health/ready`, `/health/live`
- **Real-time Metrics**: Live platform statistics
- **Error Tracking**: Comprehensive error monitoring
- **Performance Metrics**: Database and API performance tracking

## 🚢 Deployment

The application is configured for Replit Autoscale deployment:

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy to Replit**
   - Click "Deploy" in Replit workspace
   - Choose "Autoscale Deployment"
   - Configure machine resources
   - Deploy with one click

### Production Requirements
- PostgreSQL database with connection pooling
- SSL/TLS certificates for WebSocket connections
- Environment variables configured
- Health monitoring enabled

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@ironledger-medmap.com or join our Slack channel.

## 🙏 Acknowledgments

- Built with [Replit](https://replit.com) infrastructure
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)
- Payment processing by [PayFast](https://www.payfast.co.za)

---

**IronLedger MedMap** - Connecting South African healthcare, one appointment at a time.