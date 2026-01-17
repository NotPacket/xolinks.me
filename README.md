# xolinks.me

A production-ready link-in-bio SaaS platform built with Next.js 16, TypeScript, PostgreSQL, and Prisma.

## Features

### Core
- Clean `/@username` URLs with middleware routing
- Full authentication system (email/password, OAuth)
- Link management with drag-and-drop reordering
- Beautiful public profile pages with 13+ themes

### Pro Features
- A/B testing for links
- Custom fonts (Google Fonts)
- Animated theme backgrounds (Aurora, Matrix, Neon, Galaxy, Plasma)
- Analytics pixels (Facebook, Google Analytics, TikTok)
- Pro-only platforms (OnlyFans, Fansly)

### Analytics
- Click tracking with detailed metrics
- Geographic analytics (country, city)
- Referrer tracking
- Device and browser breakdowns
- Daily/weekly/monthly views

### Monetization
- Stripe subscriptions (Free, Pro, Business tiers)
- Feature gating based on subscription
- Billing portal integration

### Admin Panel (`/xo-backstage`)
- User management and search
- Platform-wide analytics
- Content moderation and reports
- Support ticket system
- Featured users management

### Gamification
- Achievement system with badges
- Global leaderboard
- Profile view milestones

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Inline styles
- **Database**: PostgreSQL + Prisma ORM
- **Payments**: Stripe
- **Email**: Resend
- **Deployment**: Docker / PM2

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/NotPacket/xolinks.me.git
cd xolinks.me
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Required environment variables:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/xolinks"
SESSION_SECRET="your-session-secret"
RESEND_API_KEY="your-resend-api-key"
STRIPE_SECRET_KEY="your-stripe-secret"
STRIPE_WEBHOOK_SECRET="your-webhook-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Run database migrations:
```bash
npx prisma db push
npx prisma generate
```

5. Seed achievements (optional):
```bash
curl -X POST http://localhost:3000/api/achievements/seed
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment.

### Workflows

- **CI** (`ci.yml`): Runs on all PRs and pushes to main
  - Linting (ESLint)
  - TypeScript type checking
  - Build verification

- **Deploy** (`deploy.yml`): Runs on pushes to main
  - Builds the application
  - Deploys to production server via SSH
  - Automatic rollback on failure

### Setting Up GitHub Secrets

Go to your repository Settings → Secrets and variables → Actions, and add:

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | PostgreSQL connection string for builds |
| `SERVER_HOST` | Production server IP/hostname |
| `SERVER_USER` | SSH username (e.g., `root`) |
| `SERVER_SSH_KEY` | Private SSH key for deployment |
| `SERVER_PORT` | SSH port (optional, defaults to 22) |

### Manual Deployment

You can also trigger a deployment manually from the Actions tab using "workflow_dispatch".

## Project Structure

```
xolinks.me/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register, verify)
│   ├── (dashboard)/       # User dashboard pages
│   ├── (xo-control)/      # Admin panel (/xo-backstage)
│   ├── profile/[username] # Public profile pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities and libraries
│   ├── auth/             # Session management
│   ├── db.ts             # Prisma client
│   ├── email.ts          # Email service
│   ├── stripe.ts         # Stripe client
│   ├── themes/           # Theme configuration
│   ├── fonts/            # Font configuration
│   └── platforms/        # Platform OAuth config
├── prisma/               # Database schema
└── .github/workflows/    # CI/CD pipelines
```

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Project setup
- [x] Authentication system
- [x] Link CRUD operations
- [x] Public profile pages

### Phase 2: Enhanced Auth & Profiles ✅
- [x] OAuth integration (9 platforms)
- [x] Email verification
- [x] Avatar uploads
- [x] Theme selector (13+ themes)

### Phase 3-4: Analytics ✅
- [x] Click tracking
- [x] Geographic analytics
- [x] Referrer tracking
- [x] Charts and visualizations

### Phase 5: Monetization ✅
- [x] Stripe integration
- [x] Subscription tiers
- [x] Feature gating

### Phase 6-8: Admin Panel ✅
- [x] User management
- [x] Platform analytics
- [x] Content moderation
- [x] System settings
- [x] Feature flags

### Phase 9: Polish ✅
- [x] Performance optimization
- [x] SEO optimization
- [x] Mobile responsiveness
- [x] Accessibility

### Phase 10: Deployment ✅
- [x] Production deployment
- [x] Monitoring setup
- [x] CI/CD pipeline
- [x] Launch!

## API Documentation

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

### Links
- `GET /api/user/links` - Get user's links
- `POST /api/user/links` - Create link
- `PUT /api/user/links/[id]` - Update link
- `DELETE /api/user/links/[id]` - Delete link

### Profile
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/avatar` - Upload avatar

### Analytics
- `GET /api/user/analytics` - Get analytics data
- `POST /api/track/click` - Track link click

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
