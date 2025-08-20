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

# Testing (if available)
# No test framework currently configured
# Consider adding: jest, @testing-library/react, playwright for e2e
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
- `commerces` - Business/store information with categories and location data
- `offers` - Business offers with boost capabilities, expiration, and location
- `events` - Business events with boost capabilities and date ranges
- `user_boost_credits` - Available boost credits per user (en_vedette, visibilite)
- `boost_transactions` - Purchase history for boost credits with Stripe data
- `subscriptions` - User subscription plans (free/pro) with status tracking

#### Key Database Functions
- `check_content_limit()` - Validates content creation based on subscription plan
- `expire_old_boosts()` - Automatically expires boosts after 72 hours
- `use_boost_credits()` - Handles boost credit deduction
- `user_has_credits()` - Checks if user has sufficient credits

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
- **Content Limits**: Enforced at database level via RLS policies and frontend validation

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
- Real-time subscriptions for live data updates (if needed)
- Proper error handling with user-friendly messages

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
- **Middleware-based protection**: `middleware.ts` handles all authentication and redirects
- Protected routes (`/dashboard/*`) automatically redirect unauthenticated users to login
- Auth pages (`/login`, `/register`, etc.) redirect authenticated users to dashboard
- User profiles are managed in the `profiles` table with subscription status
- Login page handles redirect parameters for seamless user experience after auth
- Authentication state is managed by Supabase Auth with SSR support

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
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
# Optional Stripe Price IDs for specific products
STRIPE_SUBSCRIPTION_PRICE_ID=your_subscription_price_id
STRIPE_BOOST_EN_VEDETTE_PRICE_ID=your_boost_vedette_price_id
STRIPE_BOOST_VISIBILITE_PRICE_ID=your_boost_visibilite_price_id

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

## Important Files

- `middleware.ts` - Authentication middleware with automatic redirects
- `contexts/dashboard-context.tsx` - Central state management with boost credits
- `types/supabase.ts` - Database type definitions (auto-generated)
- `components/dashboard-layout.tsx` - Main responsive layout
- `components/boost-purchase-form.tsx` - Stripe payment integration
- `lib/supabase/client.ts` - Database client configuration
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/stripe.ts` - Stripe configuration
- `hooks/use-offer-expiration.ts` - Automatic offer expiry cleanup
- `hooks/use-boost-expiry.ts` - Automatic boost expiry cleanup
- `app/api/stripe/webhooks/route.ts` - Payment webhook handler
- `app/(auth)/login/page.tsx` - Login with redirect handling
- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - Styling configuration with brand colors
- `SUBSCRIPTION_SYSTEM.md` - Detailed subscription system documentation
- `BOOST_TESTING_GUIDE.md` - Comprehensive boost system testing procedures

## Common Development Patterns

### Adding New Database Operations
1. **Middleware handles authentication**: No need to check auth in protected routes
2. **Use type-safe queries**: Import types from `types/supabase.ts`
3. **Handle RLS policies**: Ensure proper row-level security for user data
4. **Error handling**: Provide user-friendly error messages

```typescript
// Example pattern for database operations (in protected routes)
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
// User is guaranteed to exist due to middleware protection

const { data, error } = await supabase
  .from('offers')
  .select('*')
  .eq('user_id', user!.id)

if (error) {
  console.error('Database error:', error)
  throw new Error('Failed to fetch data')
}
```

### Context State Updates
- Always refresh dashboard context after mutations using `refreshCounts()`
- Update local state immediately for better UX, then refresh from server
- Handle loading states appropriately in components

### Boost Credit Management
- Check available credits before allowing boost actions
- Deduct credits optimistically, rollback on error
- Update both `user_boost_credits` table and context state
- Handle 72-hour expiry logic in `use-boost-expiry.ts`

### Form Validation Patterns
- Use React Hook Form with Zod for consistent validation
- Follow existing form patterns in flow components
- Provide real-time validation feedback
- Handle server-side validation errors gracefully

## Key Architecture Decisions

### Why Context Over Redux
- Simpler state management for dashboard-focused app
- Direct integration with Supabase real-time features
- Easier to understand and maintain for small to medium complexity

### Why Supabase Functions Over API Routes
- Leverages database-level business logic
- Better performance with direct database functions
- Consistent with RLS security model
- Easier to test and maintain

### Why 72-Hour Boost Expiry
- Provides meaningful visibility window
- Prevents indefinite boosting without payment
- Automatic cleanup reduces manual intervention
- Balances user value with business model

## Important Development Notes

### Middleware Authentication Flow
- **Protected routes**: All `/dashboard/*` routes are automatically protected
- **Auth redirects**: Unauthenticated users are redirected to `/login` with return URL
- **Seamless login**: After login, users are redirected to their originally requested page
- **Auth page protection**: Authenticated users are redirected away from auth pages
- **API routes**: Middleware skips API routes to avoid interference with webhooks

### Content Limits Enforcement
- Free users: 1 total content (offer OR event)
- Pro users: 5 total content (mix of offers and events)
- Limits enforced at multiple levels: frontend, API, and database RLS
- Use `check_content_limit()` function before allowing content creation

### Stripe Integration
- All payments go through Stripe Elements for security
- Webhook handling is critical for credit allocation
- Test with Stripe test cards: `4242 4242 4242 4242`
- Production requires proper webhook endpoint configuration

### Mobile-First Development
- Always test on mobile devices (responsive design)
- Touch targets should be minimum 44px for accessibility
- Use `use-mobile.tsx` hook for breakpoint detection
- Sidebar becomes drawer on mobile using shadcn/ui Sheet

### Security Considerations
- Never expose Stripe secret keys in frontend code
- All sensitive operations happen server-side or in database functions
- RLS policies protect user data isolation
- Input validation with Zod schemas prevents malicious data

### Data Refresh Patterns
- Call `refreshCounts()` after any mutation that affects dashboard state
- Use optimistic updates for better UX, but always sync with server
- Handle loading states gracefully to prevent flickering
- Consider implementing real-time subscriptions for live updates