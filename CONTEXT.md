# Gosholo Partner - Codebase Context

## 📋 Project Overview

**Gosholo Partner** is a modern, responsive dashboard application for merchants/partners of the Gosholo platform. It's built with Next.js 15, TypeScript, and Supabase, featuring a comprehensive subscription and boost system for managing business content.

### Key Features
- **Merchant Dashboard**: Manage businesses, offers, and events
- **Subscription System**: Free and Pro plans with content limits
- **Boost System**: Visibility enhancement features
- **Responsive Design**: Mobile-first PWA with desktop optimization
- **Real-time Updates**: Automatic offer expiration and status management

## 🏗️ Architecture

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Context + Hooks
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

### Project Structure
```
gosholo-partner/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Main dashboard pages
│   │   ├── offres/        # Offers management
│   │   ├── evenements/    # Events management
│   │   ├── boosts/        # Boost & subscription system
│   │   ├── profil/        # User profile
│   │   └── support/       # Support page
│   ├── layout.tsx         # Root layout with PWA config
│   ├── page.tsx           # Home page with auth redirect
│   └── globals.css        # Global styles + responsive utilities
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard-layout.tsx  # Main dashboard layout
│   ├── sidebar.tsx       # Navigation sidebar
│   ├── header.tsx        # Top navigation header
│   ├── offer-creation-flow.tsx  # Offer creation wizard
│   └── event-creation-flow.tsx  # Event creation wizard
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase client configuration
│   ├── utils.ts          # General utilities
│   └── offer-utils.ts    # Offer-specific utilities
├── hooks/                # Custom React hooks
│   ├── use-offer-expiration.ts  # Offer expiration management
│   ├── use-toast.ts      # Toast notifications
│   └── use-mobile.tsx    # Mobile detection
├── contexts/             # React Context providers
│   └── dashboard-context.tsx  # Dashboard state management
├── types/                # TypeScript type definitions
│   └── supabase.ts       # Generated Supabase types
└── public/               # Static assets
    └── manifest.json     # PWA manifest
```

## 🗄️ Database Schema

### Core Tables

#### `commerces` - Business Information
```typescript
{
  id: string
  user_id: string
  name: string
  description: string | null
  address: string
  category: string
  email: string | null
  phone: string | null
  website: string | null
  image_url: string | null
  status: string
  created_at: string | null
  updated_at: string | null
}
```

#### `offers` - Promotional Offers
```typescript
{
  id: string
  user_id: string
  commerce_id: string
  title: string
  description: string
  offer_type: "in_store" | "online" | "both"
  condition: string | null
  picture: string | null
  is_active: boolean
  uses_commerce_location: boolean
  custom_location: string | null
  created_at: string | null
  updated_at: string | null
}
```

#### `events` - Business Events
```typescript
{
  id: string
  user_id: string
  commerce_id: string
  title: string
  description: string
  condition: string | null
  picture: string | null
  uses_commerce_location: boolean
  custom_location: string | null
  created_at: string | null
  updated_at: string | null
}
```

#### `subscriptions` - User Subscription Plans
```typescript
{
  id: string
  user_id: string
  plan_type: "free" | "pro"
  starts_at: string | null
  ends_at: string | null
  status: string | null
  created_at: string | null
  updated_at: string | null
}
```

#### `boost_credits` - Boost Credit Management
```typescript
{
  user_id: string
  credits_available: number | null
  last_refill_date: string | null
  created_at: string | null
  updated_at: string | null
}
```

#### `boosts` - Active Boost Applications
```typescript
{
  id: string
  user_id: string
  commerce_id: string
  boost_type: "en_vedette" | "visibilite"
  content_type: "offer" | "event" | "commerce"
  content_id: string
  starts_at: string | null
  ends_at: string
  status: string | null
  created_at: string | null
}
```

#### `profiles` - User Profiles
```typescript
{
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string | null
  updated_at: string | null
}
```

### Database Functions
- `check_content_limit(user_uuid, content_type)` - Validates content creation limits
- `use_boost_credits(user_uuid, credits_to_use)` - Manages boost credit usage
- `user_has_credits(user_uuid, required_credits)` - Checks credit availability
- `expire_old_boosts()` - Cleans up expired boosts

## 🎯 Core Features

### 1. Subscription System
**Two-tier subscription model:**

#### Free Plan
- 1 total content (1 offer OR 1 event)
- 0 boost credits per month
- Basic commerce profile features

#### Pro Plan
- 5 total content (mix of offers and events)
- 1 boost credit per month (auto-refilled)
- Enhanced visibility features
- Priority support

### 2. Boost System
**Two types of boosts:**

#### En Vedette Boost
- Premium visibility in search results
- Adds "En Vedette" badge
- Shows content first in results
- Duration: 30 days
- Cost: 1 boost credit

#### Visibilité Boost
- Enhanced map presence
- Larger commerce appearance on Mapbox
- Increased map visibility radius
- Duration: 30 days
- Cost: 1 boost credit

### 3. Content Management

#### Offers
- **Auto-expiration**: Offers automatically deactivate after 30 days
- **Status tracking**: Active, Expiring soon, Expired
- **Type support**: In-store, Online, Both
- **Location options**: Use commerce location or custom location

#### Events
- **Event management**: Create and manage business events
- **Location flexibility**: Commerce location or custom venue
- **Media support**: Picture uploads

### 4. Responsive Design
- **Mobile-first**: Optimized for smartphones and tablets
- **PWA ready**: Installable as native app
- **Touch-friendly**: 44px minimum touch targets
- **Adaptive layouts**: Grids that adjust to screen size
- **Responsive typography**: Text sizes that scale appropriately

## 🔧 Key Components

### Dashboard Layout (`components/dashboard-layout.tsx`)
- Responsive sidebar that becomes drawer on mobile
- Header with mobile menu toggle
- Automatic offer expiration checking (every 30 minutes)

### Sidebar (`components/sidebar.tsx`)
- Navigation with active state indicators
- Badge counters for content items
- Mobile sheet implementation
- Gosholo branding

### Dashboard Context (`contexts/dashboard-context.tsx`)
- Global state management for dashboard counts
- Real-time data fetching from Supabase
- Loading states and error handling

### Offer Utilities (`lib/offer-utils.ts`)
- `checkAndDeactivateOffers()`: Automatic expiration management
- `getDaysRemaining()`: Calculate offer lifetime
- `getOfferStatus()`: Status badge generation

### Offer Expiration Hook (`hooks/use-offer-expiration.ts`)
- Periodic checking of offer expiration
- Configurable interval (default: 60 minutes)
- Automatic cleanup of expired offers

## 🎨 Design System

### Brand Colors
- **Primary**: `#016167` (Gosholo green)
- **Secondary**: `#5BC4DB` (Light blue)
- **Accent**: `#FF6233` (Orange)
- **Success**: `#B2FD9D` (Light green)

### Responsive Utilities
```css
/* Text scaling */
.text-responsive-sm    /* xs → sm */
.text-responsive-base  /* sm → base */
.text-responsive-lg    /* base → lg */
.text-responsive-xl    /* lg → xl */
.text-responsive-2xl   /* xl → 2xl */
.text-responsive-3xl   /* 2xl → 3xl */

/* Spacing */
.p-responsive         /* p-4 → p-6 */
.px-responsive        /* px-4 → px-6 */
.py-responsive        /* py-4 → py-6 */
.gap-responsive       /* gap-3 → gap-4 */
.space-y-responsive   /* space-y-4 → space-y-6 */

/* Text truncation */
.line-clamp-1, .line-clamp-2, .line-clamp-3
```

### PWA Features
- **Manifest**: Standalone app mode
- **Theme color**: `#016167`
- **Orientation**: Portrait primary
- **Touch optimization**: 44px minimum targets
- **Zoom prevention**: `user-scalable: no`

## 🔄 Data Flow

### Authentication Flow
1. User visits `/` → Redirected to `/login` or `/dashboard`
2. Supabase Auth handles authentication
3. User profile created automatically
4. Free subscription and 0 boost credits initialized

### Content Creation Flow
1. User attempts to create offer/event
2. Frontend calls `check_content_limit()`
3. If limit reached → Show upgrade prompt
4. If within limit → Allow creation
5. Content count updated in dashboard context

### Boost Application Flow
1. User selects content to boost
2. Check available boost credits
3. If insufficient → Show upgrade prompt
4. If sufficient → Deduct credit and create boost
5. Boost effects applied for 30 days

### Offer Expiration Flow
1. Periodic check every 30 minutes
2. Find offers older than 30 days
3. Update `is_active` to `false`
4. Update dashboard counts
5. Show expiration status in UI

## 🛡️ Security & Validation

### Row Level Security (RLS)
- Users can only access their own data
- Content creation limits enforced at database level
- Boost usage protected by credit validation

### Frontend Validation
- Form validation with Zod schemas
- Content limit checking before creation
- Credit availability verification

### API Security
- Supabase RLS policies
- User authentication required
- Input sanitization and validation

## 📱 Mobile Optimization

### Touch Targets
- Minimum 44px height/width for interactive elements
- Proper spacing between touch targets
- Tap highlight disabled for better UX

### Responsive Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm-lg)
- **Desktop**: > 1024px (lg+)

### PWA Features
- Installable on mobile devices
- Offline-ready (service worker ready)
- App-like experience
- Splash screen and icons

## 🔮 Future Enhancements

### Planned Features
- Service Worker for offline functionality
- Push notifications
- Background sync
- App shortcuts
- Custom splash screen
- Advanced analytics dashboard
- A/B testing for boost effectiveness
- Enterprise plan with unlimited content

### Technical Improvements
- Real-time notifications
- Advanced targeting for boosts
- Boost scheduling
- Performance monitoring
- API rate limiting by plan

## 🚀 Deployment

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Commands
```bash
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Production build
npm start            # Production server
npm run lint         # Code linting
```

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 📊 Monitoring & Analytics

### Key Metrics
- Subscription conversion rates
- Boost usage patterns
- Content creation by plan
- Plan retention rates
- Mobile vs desktop usage

### Error Tracking
- Console error logging
- Supabase error handling
- User feedback collection
- Performance monitoring

---

## 📞 Support & Maintenance

This codebase represents a comprehensive merchant dashboard with advanced subscription and boost systems. The architecture is designed for scalability, maintainability, and excellent user experience across all devices.

For questions about implementation details, contact the development team. Regular monitoring is required for:
- Monthly credit refill process
- Boost expiration cleanup
- Subscription status accuracy
- Performance of limit checking functions

**Last Updated**: Current Date
**Version**: 1.0
**Framework**: Next.js 15
**Database**: Supabase (PostgreSQL)
