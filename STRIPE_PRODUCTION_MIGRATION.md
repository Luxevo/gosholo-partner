# 🚀 Stripe Test → Production Migration Guide

**Complete step-by-step guide to migrate from Stripe Test mode to Live production payments**

---

## ⚠️ Prerequisites
- [ ] Stripe account fully verified and activated for Live mode
- [ ] Business information completed in Stripe
- [ ] Bank account connected for payouts
- [ ] Current test integration working perfectly

---

## 📋 Phase 1: Stripe Live Mode Setup

### Step 1.1: Switch to Live Mode
1. Login to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle switch from **"Test data"** to **"Live data"** (top left corner)
3. ⚠️ **Important**: You are now in Live mode - real money will be charged!

### Step 1.2: Create Live Products (Exact Copy of Test Products)

#### Product 1: Boost En Vedette
1. Go to **Products** → **Add product**
2. **Name**: `Boost En Vedette`
3. **Description**: `72h boost prioritaire dans les recherches avec badge spécial`
4. **Pricing model**: One-time
5. **Price**: `$5.00` USD
6. **Click "Save product"**
7. **📝 Copy the Price ID** (starts with `price_live_...`) → Save this!

#### Product 2: Boost Visibilité
1. **Add product**
2. **Name**: `Boost Visibilité`
3. **Description**: `72h boost visibilité élargie sur la carte Mapbox`
4. **Pricing model**: One-time
5. **Price**: `$5.00` USD
6. **Click "Save product"**
7. **📝 Copy the Price ID** (starts with `price_live_...`) → Save this!

#### Product 3: Abonnement Pro Mensuel
1. **Add product**
2. **Name**: `Abonnement Pro Mensuel Gosholo`
3. **Description**: `1 boost En Vedette + 1 boost Visibilité par mois + fonctionnalités Pro`
4. **Pricing model**: Recurring
5. **Price**: `$8.00` USD
6. **Billing period**: Monthly
7. **Click "Save product"**
8. **📝 Copy the Price ID** (starts with `price_live_...`) → Save this!

#### Product 4: Abonnement Pro Annuel
1. **Add product**
2. **Name**: `Abonnement Pro Annuel Gosholo`
3. **Description**: `1 boost En Vedette + 1 boost Visibilité par mois + fonctionnalités Pro (facturation annuelle, économisez 17%)`
4. **Pricing model**: Recurring
5. **Price**: `$88.00` USD
6. **Billing period**: Yearly
7. **Click "Save product"**
8. **📝 Copy the Price ID** (starts with `price_live_...`) → Save this!

---

## 🔑 Phase 2: Get Live API Keys

### Step 2.1: Get Live Publishable Key
1. Go to **Developers** → **API keys**
2. In **"Standard keys"** section (Live mode)
3. **📝 Copy "Publishable key"** (starts with `pk_live_...`) → Save this!

### Step 2.2: Get Live Secret Key
1. In same **API keys** page
2. Click **"Reveal live key token"** for Secret key
3. **📝 Copy "Secret key"** (starts with `sk_live_...`) → Save this!
4. ⚠️ **Keep this secret - never expose publicly!**

---

## 🔗 Phase 3: Create Live Webhook

### Step 3.1: Create Webhook Endpoint
1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://gosholo-partner-phi.vercel.app/api/stripe/webhooks`
4. **Description**: `Gosholo Partner Live Webhook - Boost System`

### Step 3.2: Select Events (Exactly These 3)
Click **"Select events"** and add:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.deleted`
- ✅ `payment_intent.succeeded`

### Step 3.3: Finalize Webhook
1. Click **"Add events"**
2. Click **"Add endpoint"**
3. Click on your newly created webhook
4. In **"Signing secret"** section, click **"Reveal"**
5. **📝 Copy the webhook secret** (starts with `whsec_...`) → Save this!

---

## 🎫 Phase 4: Optional Promo Coupon

### Step 4.1: Create First Month Free Coupon
1. Go to **Products** → **Coupons**
2. Click **"Create coupon"**
3. **Coupon ID**: `first_month_free`
4. **Type**: Percent
5. **Percent off**: `100`
6. **Duration**: Once
7. **Max redemptions**: `1000` (or your preferred limit)
8. Click **"Create coupon"**

---

## 🌐 Phase 5: Update Environment Variables

### Step 5.1: Access Vercel Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **gosholo-partner** project
3. Go to **Settings** → **Environment Variables**

### Step 5.2: Update Each Variable
**Replace the existing test variables with these LIVE values:**

| Variable Name | New Live Value | Notes |
|---------------|----------------|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | From Step 2.1 |
| `STRIPE_SECRET_KEY` | `sk_live_...` | From Step 2.2 |
| `STRIPE_SUBSCRIPTION_PRICE_ID` | `price_live_...` | From Step 1.2 (Product 3 - Mensuel) |
| `STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID` | `price_live_...` | From Step 1.2 (Product 4 - Annuel) |
| `STRIPE_BOOST_VISIBILITE_PRICE_ID` | `price_live_...` | From Step 1.2 (Product 2) |
| `STRIPE_BOOST_EN_VEDETTE_PRICE_ID` | `price_live_...` | From Step 1.2 (Product 1) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Step 3.3 |

**⚠️ Keep these UNCHANGED:**
- `SUPABASE_SERVICE_ROLE_KEY` 
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 5.3: Set Environment
For each variable:
- Set **Environments** to: `Production`, `Preview`, `Development`

---

## 🚀 Phase 6: Deploy & Test

### Step 6.1: Trigger New Deployment
1. In Vercel Dashboard → **Deployments**
2. Click **"Redeploy"** on latest deployment
3. Wait for deployment to complete (green ✅)

### Step 6.2: Live Testing Checklist
**⚠️ WARNING: These will charge real money! Use small amounts for testing.**

#### Test Boost Purchase ($5.00)
- [ ] Go to live site: `https://gosholo-partner-phi.vercel.app/dashboard/boosts`
- [ ] Click "Acheter 5€" on a boost
- [ ] Use test card: `4242 4242 4242 4242`, `12/34`, `123`
- [ ] Verify payment succeeds
- [ ] Check boost credit appears in UI
- [ ] Verify transaction in Stripe Dashboard
- [ ] Check database: `boost_transactions` table has new record

#### Test Subscription Mensuel ($8.00/month)
- [ ] Click "S'abonner" et sélectionner "Mensuel"
- [ ] Complete Stripe Checkout with test card
- [ ] Verify subscription shows as active
- [ ] Check monthly boosts appear (1 each type)
- [ ] Verify subscription in Stripe Dashboard
- [ ] Check database: `profiles.is_subscribed = true`

#### Test Subscription Annuel ($88.00/year)
- [ ] Click "S'abonner" et sélectionner "Annuel"
- [ ] Verify price shows "$88/an" with "-17%" badge
- [ ] Complete Stripe Checkout with test card
- [ ] Verify subscription shows as active (yearly billing)
- [ ] Check monthly boosts appear (1 each type)
- [ ] Verify subscription in Stripe Dashboard with "Yearly" interval
- [ ] Check database: `profiles.is_subscribed = true`

#### Test Webhook
- [ ] Check Stripe Dashboard → Webhooks → Your webhook
- [ ] Should show recent successful events
- [ ] No failed webhook attempts

---

## 🔍 Phase 7: Post-Launch Monitoring

### Daily Checks (First Week)
- [ ] Monitor Stripe Dashboard for failed payments
- [ ] Check webhook success rate (should be ~100%)
- [ ] Verify new user registrations create boost_credits records
- [ ] Confirm 72h boost expiry is working

### Weekly Checks
- [ ] Review subscription churn rate
- [ ] Monitor boost purchase frequency
- [ ] Check for any payment disputes
- [ ] Verify monthly boost allocation script

### Monthly Tasks
- [ ] Run `SELECT allocate_monthly_boosts();` on 1st of each month
- [ ] Review Stripe fee reports
- [ ] Check subscription renewal rates

---

## 🆘 Troubleshooting

### Webhook Not Working?
1. Check Stripe Dashboard → Webhooks → Recent deliveries
2. Look for 4xx/5xx errors
3. Verify webhook URL is accessible: `https://gosholo-partner-phi.vercel.app/api/stripe/webhooks`
4. Check Vercel function logs

### Payments Failing?
1. Verify all 6 environment variables are correct
2. Check Stripe Dashboard → Events for error details
3. Ensure live keys match live webhook
4. Test with different cards

### Database Not Updating?
1. Check `SUPABASE_SERVICE_ROLE_KEY` is correct
2. Verify webhook events are being received
3. Check Supabase logs for SQL errors

---

## 📊 Success Metrics

After migration, you should see:
- ✅ Real payments processing in Stripe Dashboard
- ✅ Boost credits appearing in user accounts
- ✅ Subscriptions creating monthly recurring charges
- ✅ Webhook success rate > 95%
- ✅ Database records for all transactions

---

## 🔐 Security Reminders

- ✅ Live secret key is only in Vercel environment variables
- ✅ Webhook secret is only in Vercel environment variables  
- ✅ Never commit live keys to code repository
- ✅ Test keys are completely separate from live keys
- ✅ Only the publishable key (`pk_live_...`) can be safely public

---

**🎉 Congratulations! Your Stripe integration is now live and processing real payments!**

---

## 📞 Support Contacts

- **Stripe Support**: https://support.stripe.com
- **Vercel Support**: https://vercel.com/help
- **Supabase Support**: https://supabase.com/support

**Last Updated**: January 2025  
**Version**: 1.0