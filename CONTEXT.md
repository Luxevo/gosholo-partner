# Gosholo Partner - Codebase Context

## 📋 Project Overview

**Gosholo Partner** is a modern, responsive dashboard application for merchants/partners of the Gosholo platform. It's built with Next.js 15, TypeScript, and Supabase, featuring a comprehensive subscription and boost system for managing business content.

### Key Features
- **Unified Merchant Dashboard**: Integrated management of businesses, offers, and events from a single dashboard
- **Commerce Management**: Create, edit, and manage business profiles directly from the dashboard
- **Content Management**: Create, edit, and delete offers and events with full CRUD operations
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
- **Date Management**: date-fns for date formatting and manipulation

### Project Structure
```
gosholo-partner/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── forgot-password/ # Password recovery
│   ├── dashboard/         # Main dashboard pages
│   │   ├── boosts/        # Boost & subscription system
│   │   ├── evenements/    # Events management (legacy)
│   │   ├── offres/        # Offers management (legacy)
│   │   ├── profil/        # User profile
│   │   ├── support/       # Support page
│   │   └── page.tsx       # Main unified dashboard
│   ├── layout.tsx         # Root layout with PWA config
│   ├── page.tsx           # Home page with auth redirect
│   └── globals.css        # Global styles + responsive utilities
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard-layout.tsx  # Main dashboard layout
│   ├── sidebar.tsx       # Navigation sidebar
│   ├── header.tsx        # Top navigation header
│   ├── commerce-creation-flow.tsx  # Commerce creation wizard
│   ├── commerce-management-flow.tsx # Commerce editing
│   ├── offer-creation-flow.tsx  # Offer creation/editing wizard
│   └── event-creation-flow.tsx  # Event creation/editing wizard
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
  category: Database["public"]["Enums"]["commerce_category_enum"] | null
  email: string | null
  phone: string | null
  website: string | null
  image_url: string | null
  status: string | null
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
  is_active: boolean | null
  uses_commerce_location: boolean
  custom_location: string | null
  start_date: string | null
  end_date: string | null
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
  is_active: boolean
  uses_commerce_location: boolean
  custom_location: string | null
  start_date: string | null
  end_date: string | null
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
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string | null
  updated_at: string | null
}
```

### Database Enums
```typescript
commerce_category_enum: 
  | "Restaurant" | "Café" | "Boulangerie" | "Épicerie" 
  | "Commerce" | "Service" | "Santé" | "Beauté" 
  | "Sport" | "Culture" | "Éducation" | "Autre"

offer_type_enum: "in_store" | "online" | "both"
boost_type_enum: "en_vedette" | "visibilite"
content_type_enum: "offer" | "event" | "commerce"
subscription_plan_enum: "free" | "pro"
```

### Database Functions
- `check_content_limit(user_uuid, content_type)` - Validates content creation limits
- `use_boost_credits(user_uuid, credits_to_use)` - Manages boost credit usage
- `user_has_credits(user_uuid, required_credits)` - Checks credit availability
- `expire_old_boosts()` - Cleans up expired boosts

## 🎯 Core Features

### 1. Unified Dashboard Management
**Integrated approach to business management:**

#### Commerce Management
- **Creation**: 3-step creation flow (Form → Preview → Confirmation) with commerce categories
- **Editing**: Direct modification of commerce details through modal interface
- **Validation**: Client-side validation for required fields
- **Categories**: Support for 12 business categories with proper enum handling
- **Profile Integration**: Complete commerce management available from profile page
- **Side-by-Side Layout**: Responsive grid display for commerce cards
- **Cascade Deletion**: Safe deletion with automatic cleanup of associated content

#### Content Management
- **Offers**: Full CRUD operations with date management (start_date, end_date)
- **Events**: Full CRUD operations with date management (start_date, end_date)
- **Direct Creation**: Create offers/events directly from commerce cards
- **Pre-selection**: Commerce auto-selection when creating from specific commerce
- **Editing**: In-place editing with modal interfaces
- **Deletion**: Confirmation dialogs with database cleanup

### 2. Subscription System
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

### 3. Boost System
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

### 4. Content Management

#### Offers
- **Auto-expiration**: Offers automatically deactivate after 30 days
- **Status tracking**: Active, Expiring soon, Expired
- **Type support**: In-store, Online, Both
- **Location options**: Use commerce location or custom location
- **3-step creation flow**: Form → Preview → Confirmation
- **Date management**: Start and end dates for offer validity
- **Form validation**: Comprehensive validation with error messages
- **Preview mode**: Review offer details before publishing
- **Confirmation step**: Final confirmation with visibility information
- **Edit mode**: Direct editing without preview/confirmation steps

#### Events
- **Event management**: Create and manage business events
- **Location flexibility**: Commerce location or custom venue
- **Date management**: Start and end dates for event scheduling
- **Status tracking**: Dynamic status based on dates (À venir, En cours, Terminé)
- **Direct creation**: Create events directly from commerce cards
- **Edit mode**: In-place editing with modal interface
- **3-step creation flow**: Form → Preview → Confirmation (matching offers)
- **Form validation**: Comprehensive validation with error messages
- **Preview mode**: Review event details before publishing
- **Confirmation step**: Final confirmation with visibility information
- **No image field**: Streamlined form without optional image upload

### 5. Responsive Design
- **Mobile-first**: Optimized for smartphones and tablets
- **PWA ready**: Installable as native app
- **Touch-friendly**: 44px minimum touch targets
- **Adaptive layouts**: Grids that adjust to screen size
- **Responsive typography**: Text sizes that scale appropriately

## 🔧 Key Components

### Main Dashboard (`app/dashboard/page.tsx`)
- **Unified Interface**: Single page managing all commerce, offers, and events
- **CommerceCard Component**: Individual commerce management with integrated content
- **Modal Management**: Multiple dialog states for different operations
- **Real-time Updates**: Automatic page refresh after data changes
- **Toast Notifications**: User feedback for all operations
- **Consistent Design**: Uniform card layouts for offers and events
- **Full CRUD Operations**: Create, read, update, delete for both offers and events
- **Edit Functionality**: Edit buttons for both offers and events in commerce cards

### Profile Page (`app/dashboard/profil/page.tsx`)
- **Comprehensive User Management**: Complete profile and commerce management in one place
- **Side-by-Side Layout**: Current plan and account info displayed side by side
- **Commerce Management**: Full CRUD operations for user's commerces directly from profile
- **Commerce Creation**: Integrated commerce creation using same modal as dashboard
- **Commerce Editing**: Direct editing of commerce details through modal interface
- **Commerce Deletion**: Safe deletion with confirmation dialog and cascade cleanup
- **Grid Layout**: Responsive grid display (1-3 columns) for commerce cards
- **Subscription Information**: Plan details, usage stats, boost credits display
- **Account Actions**: Profile editing, password change, subscription management
- **Data Synchronization**: Automatic refresh after all commerce operations
- **Consistent UX**: Same modal components and workflows as main dashboard

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

### Commerce Creation Flow (`components/commerce-creation-flow.tsx`)
- **3-step creation process**: Form → Preview → Confirmation
- **Category selection**: Dropdown with 12 business categories
- **Form validation**: Comprehensive validation with error messages
- **Preview mode**: Review commerce details before publishing
- **Confirmation step**: Final confirmation with visibility information
- **Success notifications**: Toast messages for successful operations
- **Error handling**: User-friendly error messages

### Commerce Management Flow (`components/commerce-management-flow.tsx`)
- **Edit mode**: Direct editing of existing commerce details
- **Pre-filled forms**: Auto-population with current commerce data
- **Category management**: Update business category
- **Contact information**: Edit email, phone, website
- **Address management**: Update business address
- **Success notifications**: Toast messages for successful updates

### Offer Creation Flow (`components/offer-creation-flow.tsx`)
- **3-step creation process**: Form → Preview → Confirmation
- **Form validation**: Comprehensive validation with error messages
- **Preview mode**: Review offer details before publishing
- **Confirmation step**: Final confirmation with visibility information
- **Date management**: Start and end dates for offer validity
- **Commerce selection**: Auto-selection if only one available, pre-selection from commerce card
- **Edit mode**: Direct save without preview/confirmation steps
- **Success notifications**: Toast messages for successful operations
- **Error handling**: User-friendly error messages

### Event Creation Flow (`components/event-creation-flow.tsx`)
- **3-step creation process**: Form → Preview → Confirmation (matching offers)
- **Date management**: Start and end dates for event scheduling
- **Commerce selection**: Auto-selection if only one available, pre-selection from commerce card
- **Edit mode**: Direct editing of existing events
- **Location options**: Commerce location or custom venue
- **Form validation**: Required field validation
- **Success notifications**: Toast messages for successful operations
- **No image field**: Streamlined form without optional image upload
- **Preview mode**: Review event details before publishing
- **Confirmation step**: Final confirmation with visibility information

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

### Card Design Consistency
- **Unified styling**: Both offers and events use identical card layouts
- **Color scheme**: `rgba(0,82,102,0.05)` background with `rgba(0,82,102,0.2)` borders
- **Action buttons**: Consistent icon placement and functionality
- **Status badges**: Dynamic status based on content state
- **Date display**: Formatted dates with proper localization

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

### Commerce Management Flow
1. User clicks "Ajouter un commerce" → Opens creation modal
2. 3-step creation process (Form → Preview → Confirmation)
3. Commerce created in database
4. Dashboard refreshed to show new commerce
5. User can manage commerce via "Gérer ce commerce" button
6. **Profile Management**: Complete commerce CRUD operations available from profile page
7. **Grid Display**: Commerces displayed in responsive grid layout (1-3 columns)
8. **Cascade Operations**: Deletion automatically removes associated offers and events

### Content Creation Flow
1. User attempts to create offer/event from commerce card
2. Frontend calls `check_content_limit()`
3. If limit reached → Show upgrade prompt
4. If within limit → Allow creation
5. **For offers**: 3-step process (Form → Preview → Confirmation)
6. **For events**: 3-step process (Form → Preview → Confirmation)
7. Content count updated in dashboard context

### Content Management Flow
1. **Editing**: Click edit icon → Opens modal with pre-filled form
2. **Deletion**: Click delete icon → Confirmation dialog → Database cleanup
3. **Direct creation**: Click "Créer une offre/événement" → Pre-selected commerce
4. **Status updates**: Real-time status based on dates and content state

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
- Form validation with comprehensive error checking
- Content limit checking before creation
- Credit availability verification
- Required field validation for all forms

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
- Advanced date picker for better UX
- Enhanced profile analytics
- Commerce performance metrics
- Bulk commerce operations

### Technical Improvements
- Real-time notifications
- Advanced targeting for boosts
- Boost scheduling
- Performance monitoring
- API rate limiting by plan
- Optimistic updates for better UX
- Caching strategies for improved performance

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
- Commerce creation rates
- Content editing frequency

### Error Tracking
- Console error logging
- Supabase error handling
- User feedback collection
- Performance monitoring
- Toast notification tracking

## 🔧 Recent Major Changes

### Unified Dashboard Implementation
- **Removed separate pages**: No more dedicated `/commerces`, `/offres`, `/evenements` pages
- **Integrated management**: All operations now happen from main dashboard
- **Modal-based workflows**: All creation/editing done through modal dialogs
- **Consistent UX**: Uniform experience across all content types

### Commerce Management
- **Creation flow**: 3-step process with preview and confirmation
- **Management interface**: Direct editing through modal
- **Category support**: 12 business categories with proper enum handling
- **Validation**: Comprehensive form validation

### Content Management Enhancements
- **CRUD operations**: Full create, read, update, delete for offers and events
- **Date management**: Start and end dates for both offers and events
- **Status tracking**: Dynamic status based on dates and content state
- **Direct creation**: Create content directly from commerce cards
- **Pre-selection**: Commerce auto-selection when creating from specific commerce

### Event Management Improvements
- **3-step creation flow**: Form → Preview → Confirmation (matching offers)
- **Date fields**: Added start_date and end_date to database schema
- **Edit functionality**: Full edit capabilities in dashboard commerce cards
- **Streamlined form**: Removed image field for cleaner UX
- **Consistent display**: Event cards show dates exactly like offer cards
- **Type removal**: Removed unnecessary "Type" field from event cards

### UI/UX Improvements
- **Consistent design**: Uniform card layouts across all content types
- **Better feedback**: Toast notifications for all operations
- **Confirmation dialogs**: Safe deletion with confirmation steps
- **Loading states**: Proper loading indicators during operations
- **Edit buttons**: Functional edit buttons for both offers and events
- **Profile page enhancement**: Side-by-side layout for better information density
- **Commerce grid layout**: Responsive grid display for commerce management
- **Integrated workflows**: Same modal components used across dashboard and profile

### Database Schema Updates
- **Events table**: Added start_date and end_date fields
- **Events table**: Added is_active field for status management
- **Consistent structure**: Events and offers now have matching field structures
- **Type safety**: Updated TypeScript interfaces to match database schema

---

## 📞 Support & Maintenance

This codebase represents a comprehensive merchant dashboard with advanced subscription and boost systems. The architecture is designed for scalability, maintainability, and excellent user experience across all devices.

For questions about implementation details, contact the development team. Regular monitoring is required for:
- Monthly credit refill process
- Boost expiration cleanup
- Subscription status accuracy
- Performance of limit checking functions
- Commerce creation and management workflows
- Content editing and deletion operations
- Event date management and status updates

**Last Updated**: January 27, 2025
**Version**: 2.2
**Framework**: Next.js 15
**Database**: Supabase (PostgreSQL)
**Major Changes**: Unified dashboard, integrated commerce management, full CRUD operations, event management improvements, 3-step event creation flow, enhanced profile page with complete commerce management, side-by-side layout implementation, responsive commerce grid display
