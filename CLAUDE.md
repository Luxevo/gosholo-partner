# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gosholo Partner Dashboard is a mobile-first responsive PWA built with Next.js 15 for French merchants to manage their businesses, offers, and events. The application features a comprehensive dashboard with commerce management, offer creation flows, event management, and user authentication.

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
- **TypeScript**: Full type safety with generated Supabase types

### Database Schema
Core entities managed via Supabase:
- `profiles` - User account information
- `commerces` - Business/store information with categories
- `offers` - Business offers with types (in_store, online, both)
- `events` - Business events with location options
- Subscription system with boost credits and content limits

### Project Structure
```
app/                     # Next.js 13+ app directory
├── (auth)/             # Auth pages group
├── dashboard/          # Protected dashboard routes
├── layout.tsx          # Root layout with PWA configuration
└── globals.css         # Global styles with responsive utilities

components/             # React components
├── ui/                 # shadcn/ui component library
├── *-flow.tsx         # Multi-step workflow components
├── dashboard-layout.tsx # Responsive layout with sidebar
├── sidebar.tsx         # Navigation with mobile drawer
└── header.tsx          # Adaptive header component

contexts/               # React context providers
└── dashboard-context.tsx # Global state for dashboard data

hooks/                  # Custom React hooks
├── use-mobile.tsx      # Mobile breakpoint detection
├── use-offer-expiration.ts # Offer expiry logic
└── use-toast.ts        # Toast notifications

lib/                    # Utilities and configurations
├── supabase/           # Database client setup
├── utils.ts            # Tailwind utilities and helpers
└── offer-utils.ts      # Business logic for offers

types/                  # TypeScript definitions
└── supabase.ts         # Generated database types
```

### Key Patterns

#### State Management
- `DashboardContext` provides global state for user profile, commerces, offers, and events
- Custom hooks encapsulate reusable logic (mobile detection, offer expiration)
- Context refreshes data after mutations

#### Component Architecture
- Flow components (`*-creation-flow.tsx`) handle multi-step workflows
- Responsive layout system with mobile-first approach
- shadcn/ui provides consistent, accessible components
- Components follow composition pattern with proper TypeScript interfaces

#### Database Integration
- Supabase client with SSR support via `@supabase/ssr`
- Generated types in `types/supabase.ts` ensure type safety
- Row-level security policies enforce data access controls
- Real-time subscriptions available for live updates

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

## Development Guidelines

### Database Operations
- Always use the `createClient()` function from `lib/supabase/client.ts`
- Check authentication status before database operations
- Handle errors gracefully with user-friendly messages
- Use generated TypeScript types from `types/supabase.ts`

### Component Development
- Follow mobile-first responsive design principles
- Use shadcn/ui components for consistency
- Implement proper loading states and error boundaries
- Ensure accessibility with proper ARIA labels

### Styling
- Use Tailwind CSS utility classes
- Follow the design system colors defined in `tailwind.config.ts`
- Brand colors: `brand-primary` (#016167), `brand-accent` (#FF6233)
- Use CSS variables for theme consistency

### Authentication
- Protected routes require authentication check
- User profiles are managed in the `profiles` table
- Handle auth state changes appropriately
- Redirect unauthenticated users to login

### Performance Considerations
- Optimize for mobile devices and slow networks
- Use Next.js built-in optimizations (Image, fonts, etc.)
- Implement proper caching strategies
- Consider PWA offline capabilities

## Environment Variables

Required environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Important Files

- `contexts/dashboard-context.tsx` - Central state management
- `types/supabase.ts` - Database type definitions (auto-generated)
- `components/dashboard-layout.tsx` - Main responsive layout
- `lib/supabase/client.ts` - Database client configuration
- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - Styling configuration with brand colors