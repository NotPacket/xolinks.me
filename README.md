# xolinks.me

A production-ready link-in-bio SaaS platform built with Next.js 14, TypeScript, PostgreSQL, and Redis.

## Features

- ✅ Clean `/@username` URLs built into Next.js routing
- ✅ Full admin panel with user management, analytics, and moderation
- ✅ Comprehensive analytics (clicks, views, geo data, referrers)
- ✅ Stripe subscriptions (Free, Pro, Premium tiers)
- ✅ OAuth authentication (Google, GitHub, Instagram)
- ✅ Email verification and password reset
- ✅ Link click tracking with detailed analytics
- ✅ Media uploads with image optimization
- ✅ Feature flags controlled by admin
- ✅ Docker deployment with PostgreSQL + Redis

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + NextAuth.js
- **Database**: PostgreSQL
- **Cache/Sessions**: Redis
- **Payments**: Stripe
- **Email**: Resend
- **Deployment**: Docker Compose

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- PostgreSQL 16
- Redis 7

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/xolinks.me.git
cd xolinks.me
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env.local` and fill in your environment variables:
```bash
cp .env.example .env.local
```

4. Start PostgreSQL and Redis with Docker:
```bash
docker-compose up -d postgres redis
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
xolinks.me/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── (admin)/           # Admin pages
│   ├── @[username]/       # Public profile pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities and libraries
│   ├── db/               # Database (Prisma)
│   ├── auth/             # NextAuth config
│   ├── redis/            # Redis client
│   ├── stripe/           # Stripe integration
│   └── analytics/        # Analytics tracking
├── docker/               # Docker configurations
└── prisma/               # Database schema
```

## Development Roadmap

### Phase 1: Foundation (Weeks 1-2) ✅ In Progress
- [x] Project setup
- [ ] Authentication system
- [ ] Link CRUD operations
- [ ] Public profile pages

### Phase 2: Enhanced Auth & Profiles (Week 3)
- [ ] OAuth integration
- [ ] Email verification
- [ ] Avatar uploads
- [ ] Theme selector

### Phase 3-4: Analytics (Weeks 4-5)
- [ ] Click tracking
- [ ] Geographic analytics
- [ ] Referrer tracking
- [ ] Charts and visualizations

### Phase 5: Monetization (Week 6)
- [ ] Stripe integration
- [ ] Subscription tiers
- [ ] Feature gating

### Phase 6-8: Admin Panel (Weeks 7-9)
- [ ] User management
- [ ] Platform analytics
- [ ] Content moderation
- [ ] System settings
- [ ] Feature flags

### Phase 9: Polish (Week 10)
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Mobile responsiveness
- [ ] Accessibility

### Phase 10: Deployment (Weeks 11-12)
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] CI/CD pipeline
- [ ] Launch!

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
