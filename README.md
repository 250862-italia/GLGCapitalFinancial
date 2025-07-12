# GLG Capital Group Dashboard

A comprehensive financial dashboard and investment management platform for GLG Capital Group LLC.

## 🚀 Features

### Client Features
- **User Registration & Authentication** - Secure client registration and login
- **Profile Management** - Complete profile setup with personal information

- **Investment Dashboard** - View and manage investment portfolios
- **Document Requests** - Request official documentation from GLG
- **Banking Details** - Manage banking information securely

### Admin Features
- **Analytics Dashboard** - Real-time financial metrics and insights
- **Client Management** - Complete client database management

- **Investment Management** - Track and manage all investments
- **Content Management** - Manage news, markets, and partnerships
- **Team Management** - Admin team and role management
- **Settings & Configuration** - System configuration and backup

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Custom auth system with role-based access
- **Storage**: Supabase Storage for documents and files
- **Email**: SMTP integration for notifications
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- SMTP email service (Gmail, SendGrid, etc.)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/glg-dashboard.git
   cd glg-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   - Supabase URL and keys
   - SMTP email settings
   - Application secrets

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database setup scripts in Supabase SQL Editor
   - Configure storage buckets for document uploads
   - Set up Row Level Security (RLS) policies

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

The application requires the following database tables:

- `users` - User authentication and profiles
- `clients` - Client information and profiles

- `investments` - Investment tracking
- `analytics` - Dashboard metrics
- `informational_requests` - Document requests
- `team_members` - Admin team management
- `content` - News and market content
- `partnerships` - Partnership management
- `settings` - System configuration

Run the provided SQL scripts in your Supabase SQL Editor to create all necessary tables and policies.

## 🔐 Authentication

The system uses a custom authentication system with role-based access:

- **Clients**: Regular users with access to their dashboard
- **Admins**: Administrative users with full system access
- **Superadmins**: Full system control and configuration access

## 📧 Email Configuration

Configure SMTP settings in `.env.local` for:
- User registration confirmations
- Password reset emails

- Document request confirmations
- Investment updates

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set environment variables** in Vercel dashboard

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🔒 Security Features

- **Row Level Security (RLS)** - Database-level security
- **CSRF Protection** - Cross-site request forgery prevention
- **Input Validation** - Comprehensive data validation
- **Rate Limiting** - API request rate limiting
- **Secure File Uploads** - Document upload security
- **Encrypted Storage** - Sensitive data encryption

## 📊 Monitoring & Analytics

- **Error Tracking** - Comprehensive error logging
- **Performance Monitoring** - Application performance metrics
- **User Analytics** - User behavior tracking
- **Database Monitoring** - Database performance and health

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for GLG Capital Group LLC.

## 🆘 Support

For support and questions:
- Email: support@glgcapital.com
- Documentation: [Internal Wiki]
- Issues: [GitHub Issues]

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added document management and uploads
- **v1.2.0** - Enhanced analytics and reporting
- **v1.3.0** - Complete CRUD operations and admin panel
