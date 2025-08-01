# Gosholo Partner - Subscription & Boost System

## 📋 Overview

The Gosholo Partner platform implements a two-tier subscription system with boost functionality to enhance user visibility and engagement.

## 🎯 Subscription Plans

### Free Plan
- **Content Limit**: 1 total content (1 offer OR 1 event, not both)
- **Boost Credits**: 0 per month
- **Features**: Basic commerce profile, basic content creation
- **Cost**: Free forever

### Pro Plan  
- **Content Limit**: 5 total content (mix of offers and events)
- **Boost Credits**: 1 per month (auto-refilled)
- **Features**: Enhanced visibility, priority support, boost capabilities
- **Cost**: [To be defined]

## 🚀 Boost System

### Boost Types

#### En Vedette Boost
- **Purpose**: Premium visibility in search results
- **Effect**: 
  - Adds "En Vedette" badge to content
  - Shows content first in search results
  - Enhanced visual prominence
- **Duration**: 30 days
- **Cost**: 1 boost credit

#### Visibilité Boost
- **Purpose**: Enhanced map presence
- **Effect**:
  - Makes commerce appear larger on Mapbox
  - Increased map visibility radius
  - Priority placement in map clusters
- **Duration**: 30 days  
- **Cost**: 1 boost credit

### Boost Targets
Boosts can be applied to:
- **Offers**: Individual promotional offers
- **Events**: Specific events
- **Commerce**: Entire business profile

## 🗄️ Database Schema

### Core Tables

#### subscriptions
```sql
id              UUID PRIMARY KEY
user_id         UUID → auth.users(id)
plan_type       subscription_plan_enum ('free', 'pro')
starts_at       TIMESTAMP (when plan started)
ends_at         TIMESTAMP (when plan expires, NULL for active)
status          TEXT ('active', 'cancelled', 'expired')
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### boost_credits
```sql
user_id             UUID PRIMARY KEY → auth.users(id)
credits_available   INTEGER (current available credits)
last_refill_date    TIMESTAMP (last monthly refill)
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

#### boosts
```sql
id              UUID PRIMARY KEY
user_id         UUID → auth.users(id)
commerce_id     UUID → commerces(id)
boost_type      boost_type_enum ('en_vedette', 'visibilite')
content_type    content_type_enum ('offer', 'event', 'commerce')
content_id      UUID (ID of boosted content)
starts_at       TIMESTAMP (boost activation time)
ends_at         TIMESTAMP (boost expiration time)
status          TEXT ('active', 'expired')
created_at      TIMESTAMP
```

### Enums
```sql
-- Subscription plans
subscription_plan_enum: 'free' | 'pro'

-- Boost types
boost_type_enum: 'en_vedette' | 'visibilite'

-- Content that can be boosted
content_type_enum: 'offer' | 'event' | 'commerce'
```

## 🔧 Business Logic Functions

### Content Limit Checking
```sql
check_content_limit(user_uuid UUID, content_type TEXT) RETURNS BOOLEAN
```

**Logic Flow:**
1. Get user's current subscription plan
2. Count existing content (offers + events combined)
3. Apply plan limits:
   - **Free**: Total content < 1
   - **Pro**: Total content < 5
4. Return true if user can create more content

### Monthly Credit Refill
```sql
refill_monthly_boosts() RETURNS void
```

**Logic Flow:**
1. Find all Pro plan users with active subscriptions
2. Check if last refill was before current month
3. Add 1 credit to eligible users
4. Update last_refill_date to current timestamp

### Boost Credit Usage
```sql
use_boost_credits(user_uuid UUID, credits_to_use INTEGER) RETURNS BOOLEAN
```

**Logic Flow:**
1. Check if user has sufficient credits
2. Deduct credits from boost_credits table
3. Return success/failure status

## 🔄 User Journey Flows

### New User Registration
```
1. User registers account
2. Profile created in profiles table
3. Trigger fires: create_user_subscription()
4. Auto-creates:
   - Free subscription in subscriptions table
   - 0 boost credits in boost_credits table
5. User ready to create 1 piece of content
```

### Content Creation Flow
```
1. User attempts to create offer/event
2. Frontend calls check_content_limit()
3. If limit reached:
   - Show upgrade prompt
   - Block content creation
4. If within limit:
   - Allow content creation
   - Update content count
```

### Boost Usage Flow
```
1. User selects content to boost
2. Check available boost credits
3. If insufficient credits:
   - Show upgrade/purchase prompt
4. If sufficient credits:
   - Deduct 1 credit
   - Create boost record
   - Apply boost effects
   - Set 30-day expiration
```

### Plan Upgrade Flow
```
1. User initiates upgrade to Pro
2. Payment processing (external)
3. Update subscription record:
   - plan_type = 'pro'
   - starts_at = NOW()
   - status = 'active'
4. Add 1 boost credit immediately
5. User can now create up to 5 contents
```

## 🛡️ Security & Validation

### Row Level Security (RLS) Policies

#### Content Creation Limits
```sql
-- Offers table
CREATE POLICY "Users can create offers within limits" ON offers
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    check_content_limit(auth.uid(), 'offer')
  );

-- Events table  
CREATE POLICY "Users can create events within limits" ON events
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    check_content_limit(auth.uid(), 'event')
  );
```

#### Boost Usage Protection
```sql
CREATE POLICY "Users can only boost their own content" ON boosts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    user_has_credits(auth.uid(), 1)
  );
```

### Content Limit Validation
- **Frontend**: Check limits before showing create forms
- **Backend**: RLS policies prevent database violations
- **API**: Additional validation in API endpoints

## 🎨 Frontend Implementation

### Subscription Status Display
```typescript
// Components to show current plan status
<SubscriptionBadge plan={userPlan} />
<ContentLimitIndicator current={contentCount} max={planLimit} />
<BoostCreditsCounter credits={availableCredits} />
```

### Content Creation Guards
```typescript
const handleCreateContent = async () => {
  const canCreate = await checkContentLimit(user.id, contentType)
  
  if (!canCreate) {
    showUpgradePrompt({
      title: "Limite atteinte",
      message: planMessages[userPlan].limitReached,
      upgradeAction: () => navigateToUpgrade()
    })
    return
  }
  
  // Proceed with content creation
  createContent(formData)
}
```

### Boost UI Elements
```typescript
// Boost button component
<BoostButton 
  contentId={content.id}
  contentType="offer"
  availableCredits={credits}
  onBoost={handleBoost}
/>

// Boosted content indicators
<EnVedetteBadge show={content.hasEnVedette} />
<VisibiliteBadge show={content.hasVisibilite} />
```

## 📱 Error Messages & User Feedback

### Content Limit Messages
```typescript
const planMessages = {
  free: {
    limitReached: "Plan gratuit: 1 contenu maximum atteint. Passez au plan Pro pour créer jusqu'à 5 contenus!",
    upgradePrompt: "Débloquez plus de contenu avec le plan Pro"
  },
  pro: {
    limitReached: "Plan Pro: 5 contenus maximum atteints. Supprimez du contenu existant ou contactez le support.",
    upgradePrompt: "Vous utilisez déjà le plan Pro"
  }
}
```

### Boost Error Messages
```typescript
const boostMessages = {
  insufficientCredits: "Crédits boost insuffisants. Passez au plan Pro pour obtenir 1 crédit par mois.",
  alreadyBoosted: "Ce contenu est déjà boosté. Attendez l'expiration pour le booster à nouveau.",
  boostSuccess: "Boost activé! Votre contenu sera mis en avant pendant 30 jours."
}
```

## ⚙️ Automated Processes

### Monthly Credit Refill (Cron Job)
```javascript
// Supabase Edge Function - runs monthly
export async function handler() {
  const { data, error } = await supabase.rpc('refill_monthly_boosts')
  
  if (error) {
    console.error('Monthly refill failed:', error)
    return new Response('Error', { status: 500 })
  }
  
  console.log('Monthly boost credits refilled successfully')
  return new Response('Success', { status: 200 })
}
```

### Boost Expiration Cleanup
```sql
-- Function to expire old boosts (run daily)
CREATE OR REPLACE FUNCTION expire_old_boosts()
RETURNS void AS $$
BEGIN
  UPDATE boosts 
  SET status = 'expired'
  WHERE ends_at < NOW() AND status = 'active';
END;
$$ LANGUAGE plpgsql;
```

## 📊 Analytics & Monitoring

### Key Metrics to Track
- **Subscription Conversions**: Free → Pro upgrade rate
- **Boost Usage**: Credits used per month, most popular boost types
- **Content Creation**: Average content per user by plan
- **Plan Retention**: Monthly churn rates by plan

### Database Queries for Analytics
```sql
-- Plan distribution
SELECT plan_type, COUNT(*) 
FROM subscriptions 
WHERE status = 'active' 
GROUP BY plan_type;

-- Boost usage by type
SELECT boost_type, COUNT(*) 
FROM boosts 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY boost_type;

-- Content creation by plan
SELECT s.plan_type, 
       COUNT(o.id) as offers, 
       COUNT(e.id) as events
FROM subscriptions s
LEFT JOIN offers o ON s.user_id = o.user_id
LEFT JOIN events e ON s.user_id = e.user_id
WHERE s.status = 'active'
GROUP BY s.plan_type;
```

## 🚀 Deployment Checklist

### Database Setup
- [ ] Create all enums (subscription_plan_enum, boost_type_enum, content_type_enum)
- [ ] Create tables (subscriptions, boost_credits, boosts)
- [ ] Set up RLS policies
- [ ] Create business logic functions
- [ ] Set up triggers for new user setup

### Backend Implementation
- [ ] API endpoints for subscription management
- [ ] Boost credit management APIs
- [ ] Content limit validation middleware
- [ ] Monthly refill cron job setup

### Frontend Implementation
- [ ] Subscription status components
- [ ] Content creation limit guards
- [ ] Boost UI components
- [ ] Upgrade/payment flow
- [ ] Error message handling

### Testing
- [ ] Test content limits for both plans
- [ ] Test boost credit usage and refill
- [ ] Test subscription upgrades/downgrades
- [ ] Test RLS policies
- [ ] Test cron job functionality

## 🔮 Future Enhancements

### Potential Features
- **Custom Boost Durations**: 7, 14, 30, 60 day options
- **Boost Packages**: Bundle deals for multiple credits
- **Analytics Dashboard**: Boost performance metrics
- **A/B Testing**: Different boost effectiveness
- **Enterprise Plan**: Unlimited content + advanced features
- **Referral System**: Earn boost credits for referrals

### Technical Improvements
- **Real-time Notifications**: Boost expiration alerts
- **Advanced Targeting**: Geographic boost targeting
- **Boost Scheduling**: Schedule boosts for future dates
- **Performance Monitoring**: Boost ROI tracking
- **API Rate Limiting**: Based on subscription plan

---

## 📞 Support & Maintenance

For questions about the subscription system implementation, contact the development team. This system requires regular monitoring of:
- Monthly credit refill process
- Boost expiration cleanup
- Subscription status accuracy
- Performance of limit checking functions

Last updated: [Current Date]
Version: 1.0