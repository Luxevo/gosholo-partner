# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gosholo Partner Dashboard is a mobile-first responsive PWA built with Next.js 15 for French merchants to manage their businesses, offers, and events. The application features a comprehensive dashboard with commerce management, offer creation flows, event management, boost system, and subscription-based monetization.

## Development Commands

```bash
# Development
npm run dev        # Start development server
npm install        # Install dependencies

# Production
npm run build      # Build for production
npm start          # Start production server

# Code Quality
npm run lint       # Run Next.js linting
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with React 19
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with shadcn/ui components
- **UI Library**: Radix UI primitives via shadcn/ui
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Context + hooks pattern
- **Payment Processing**: Stripe for boost purchases and subscriptions
- **Maps**: Mapbox GL for location services
- **TypeScript**: Full type safety with generated Supabase types

### Database Schema
Core entities managed via Supabase:
- `profiles` - User account information with subscription status
- `commerces` - Business/store information with categories
- `offers` - Business offers with boost capabilities and expiration
- `events` - Business events with boost capabilities
- `user_boost_credits` - Available boost credits per user
- `boost_transactions` - Purchase history for boost credits
- `subscriptions` - User subscription plans (free/pro)

### Project Structure
```
app/                     # Next.js 15+ app directory
├── (auth)/             # Auth pages group (login, register, forgot password)
├── api/                # API routes
│   └── stripe/         # Stripe webhook and payment intent handlers
├── dashboard/          # Protected dashboard routes
│   ├── boosts/         # Boost management page
│   ├── evenements/     # Event management
│   ├── offres/         # Offer management
│   ├── profil/         # User profile
│   └── support/        # Support page
├── layout.tsx          # Root layout with PWA configuration
└── globals.css         # Global styles with responsive utilities

components/             # React components
├── ui/                 # shadcn/ui component library
├── *-flow.tsx         # Multi-step workflow components
├── dashboard-layout.tsx # Responsive layout with sidebar
├── sidebar.tsx         # Navigation with mobile drawer
├── header.tsx          # Adaptive header component
├── boost-purchase-form.tsx # Stripe payment integration
└── image-upload.tsx    # File upload functionality

contexts/               # React context providers
└── dashboard-context.tsx # Global state for dashboard data

hooks/                  # Custom React hooks
├── use-mobile.tsx      # Mobile breakpoint detection
├── use-offer-expiration.ts # Offer expiry logic with auto-cleanup
├── use-boost-expiry.ts # Boost expiry logic
└── use-toast.ts        # Toast notifications

lib/                    # Utilities and configurations
├── supabase/           # Database client setup (client, server, service)
├── stripe.ts           # Stripe configuration
├── offer-utils.ts      # Business logic for offers
├── boost-utils.ts      # Boost-related utilities
├── mapbox-geocoding.ts # Location services
├── social-media-utils.ts # Social media integrations
└── utils.ts            # Tailwind utilities and helpers

types/                  # TypeScript definitions
└── supabase.ts         # Generated database types

sql/                    # Database functions and procedures
└── monthly-boost-allocation.sql # Monthly boost credit allocation
```

### Key Patterns

#### Subscription & Monetization System
- **Free Plan**: 1 total content (offer OR event), 0 boost credits
- **Pro Plan**: 5 total content (mix of offers/events), 1 boost credit monthly
- **Boost System**: En Vedette (featured) and Visibilité (map visibility) boosts
- **Payment Processing**: Stripe integration for boost purchases (5€ each) and subscriptions (8€/month)
- **Boost Expiry**: 72-hour automatic expiration with cleanup functions

#### State Management
- `DashboardContext` provides global state for user profile, commerces, offers, events, and boost credits
- Custom hooks encapsulate reusable logic (mobile detection, offer/boost expiration)
- Context refreshes data after mutations
- Real-time boost credit tracking and usage

#### Component Architecture
- Flow components (`*-creation-flow.tsx`) handle multi-step workflows
- Responsive layout system with mobile-first approach
- shadcn/ui provides consistent, accessible components
- Components follow composition pattern with proper TypeScript interfaces
- Stripe Elements integration in `boost-purchase-form.tsx`

#### Database Integration
- Supabase client with SSR support via `@supabase/ssr`
- Generated types in `types/supabase.ts` ensure type safety
- Row-level security policies enforce data access controls
- Business logic functions for content limits and boost management
- Automatic expiry cleanup for offers and boosts

#### Content Management
- **Offers**: Automatic 30-day expiration with status indicators
- **Events**: Location-based with Mapbox integration
- **Boost System**: Apply En Vedette or Visibilité boosts to offers, events, or commerce
- **Content Limits**: Enforced based on subscription plan

#### Responsive Design
- Mobile-first approach with Tailwind breakpoints
- Sidebar transforms to drawer on mobile using shadcn/ui Sheet
- PWA-ready with manifest.json and mobile optimizations
- Touch-friendly interfaces with optimized tap targets

#### Form Handling
- React Hook Form for form state management
- Zod schemas for validation
- Consistent error handling and user feedback
- Multi-step forms with progress indication
- Image upload with preview functionality

## Development Guidelines

### Database Operations
- Always use the `createClient()` function from `lib/supabase/client.ts`
- Check authentication status before database operations
- Handle errors gracefully with user-friendly messages
- Use generated TypeScript types from `types/supabase.ts`
- Respect content limits based on user subscription plan

### Component Development
- Follow mobile-first responsive design principles
- Use shadcn/ui components for consistency
- Implement proper loading states and error boundaries
- Ensure accessibility with proper ARIA labels
- Handle boost credit state changes appropriately

### Styling
- Use Tailwind CSS utility classes
- Follow the design system colors defined in `tailwind.config.ts`
- Brand colors: `brand-primary` (#016167), `brand-accent` (#FF6233)
- Use CSS variables for theme consistency
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)

### Authentication
- Protected routes require authentication check
- User profiles are managed in the `profiles` table
- Handle auth state changes appropriately
- Redirect unauthenticated users to login

### Payment Integration
- Use Stripe Elements for secure payment processing
- Handle webhook events in `/api/stripe/webhooks/route.ts`
- Update boost credits immediately after successful payment
- Provide clear user feedback for payment status

### Performance Considerations
- Optimize for mobile devices and slow networks
- Use Next.js built-in optimizations (Image, fonts, etc.)
- Implement proper caching strategies
- Consider PWA offline capabilities
- Cleanup expired content automatically

## Environment Variables

Required environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

## Important Files

- `contexts/dashboard-context.tsx` - Central state management with boost credits
- `types/supabase.ts` - Database type definitions (auto-generated)
- `components/dashboard-layout.tsx` - Main responsive layout
- `components/boost-purchase-form.tsx` - Stripe payment integration
- `lib/supabase/client.ts` - Database client configuration
- `lib/stripe.ts` - Stripe configuration
- `hooks/use-offer-expiration.ts` - Automatic offer expiry cleanup
- `hooks/use-boost-expiry.ts` - Automatic boost expiry cleanup
- `app/api/stripe/webhooks/route.ts` - Payment webhook handler
- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - Styling configuration with brand colors
- `SUBSCRIPTION_SYSTEM.md` - Detailed subscription system documentation
- `BOOST_TESTING_GUIDE.md` - Comprehensive boost system testing procedures