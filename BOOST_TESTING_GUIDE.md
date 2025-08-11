# 🧪 Boost System Testing Guide

**Complete testing checklist for the Gosholo Partner boost system implementation**

---

## ⚙️ Pre-Test Setup

### **Environment Requirements**
- [ ] App deployed to Vercel with latest changes
- [ ] All environment variables set correctly
- [ ] Stripe webhook endpoint configured
- [ ] Database tables created with RLS policies
- [ ] Test Stripe cards available

### **Test User Setup**
1. **Create/Login to test account** on https://gosholo-partner-phi.vercel.app
2. **Create test commerce**: Go to Dashboard → Add at least 1 commerce
3. **Create test content**: Add at least 2 offers and 1 event to have content to boost
4. **Verify initial state**: Should have 0 boost credits

---

## 🎯 Test 1: Database Structure Verification

### **Check Tables Exist**
Go to **Supabase Dashboard → Table Editor**, verify these tables exist:

- [ ] ✅ `user_boost_credits` - should have columns: `user_id`, `available_en_vedette`, `available_visibilite`
- [ ] ✅ `boost_transactions` - should have columns: `user_id`, `boost_type`, `amount_cents`, `stripe_payment_intent_id`
- [ ] ✅ `subscriptions` - should have columns: `user_id`, `plan_type`, `status`
- [ ] ✅ `offers` - should have columns: `boosted`, `boosted_at`, `boost_type`
- [ ] ✅ `events` - should have columns: `boosted`, `boosted_at`, `boost_type`

### **Check RLS Policies**
In **Supabase → Authentication → Policies**, verify policies exist for:
- [ ] ✅ `user_boost_credits`
- [ ] ✅ `boost_transactions` 
- [ ] ✅ `subscriptions`

---

## 🎯 Test 2: À la Carte Boost Purchase Flow

### **Navigate to Boosts Page**
1. **Go to**: `/dashboard/boosts`
2. **Verify UI displays**:
   - [ ] ✅ Boost credits show `0` for both En Vedette and Visibilité
   - [ ] ✅ "Acheter 5€" buttons are visible and clickable
   - [ ] ✅ Your offers/events are listed in the content section
   - [ ] ✅ Boost buttons on content are disabled (no credits)

### **Test En Vedette Boost Purchase**

#### **Step 2.1: Initiate Purchase**
1. **Click "Acheter 5€"** under "Boost En Vedette"
2. **Expected Result**: Modal opens with Stripe payment form

#### **Step 2.2: Complete Payment**
3. **Fill payment form**:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
4. **Click "Payer 5€"**
5. **Expected Results**:
   - [ ] ✅ "Traitement..." loading state shows
   - [ ] ✅ Success message appears
   - [ ] ✅ Modal closes after 2 seconds
   - [ ] ✅ Page refreshes automatically

#### **Step 2.3: Verify Purchase Success**
6. **Check UI Updates**:
   - [ ] ✅ En Vedette credits show `1` (was `0`)
   - [ ] ✅ "En Vedette (1)" button now enabled on content
   - [ ] ✅ Visibilité credits still show `0`

#### **Step 2.4: Verify Backend**

**Stripe Dashboard Check**:
- [ ] ✅ Go to Stripe Dashboard → Payments
- [ ] ✅ See $5.00 payment with status "Succeeded"
- [ ] ✅ Payment intent ID matches webhook logs

**Database Check**:
- [ ] ✅ `user_boost_credits`: Your user has `available_en_vedette: 1`
- [ ] ✅ `boost_transactions`: New record with your user_id, amount_cents: 500

**Webhook Check**:
- [ ] ✅ Stripe Dashboard → Webhooks → Recent deliveries show 200 response
- [ ] ✅ Vercel function logs show "Boost purchase completed" message

### **Test Visibilité Boost Purchase**

#### **Repeat Purchase Flow**
7. **Click "Acheter 5€"** under "Boost Visibilité"
8. **Complete payment** with same test card
9. **Expected Results**:
   - [ ] ✅ Visibilité credits show `1`
   - [ ] ✅ En Vedette credits still show `1`
   - [ ] ✅ Both boost buttons now enabled on content

---

## 🎯 Test 3: Apply Boosts to Content

### **Test En Vedette Boost Application**

#### **Step 3.1: Apply Boost**
1. **Find an offer** in content list
2. **Click "En Vedette (1)"** button
3. **Expected Results**:
   - [ ] ✅ Button changes to "Retirer le boost"
   - [ ] ✅ "En Vedette" badge appears on content
   - [ ] ✅ Time remaining shows "72h restantes" or similar
   - [ ] ✅ En Vedette credit decreases to `0`

#### **Step 3.2: Verify Database Update**
4. **Check database**: `offers` table should show:
   - [ ] ✅ `boosted: true`
   - [ ] ✅ `boost_type: "en_vedette"`
   - [ ] ✅ `boosted_at: [current timestamp]`

### **Test Visibilité Boost Application**
5. **Apply Visibilité boost** to different content (event)
6. **Verify same behavior** as En Vedette test

### **Test Boost Removal**
7. **Click "Retirer le boost"** on boosted content
8. **Expected Results**:
   - [ ] ✅ Badge disappears
   - [ ] ✅ Button returns to "En Vedette (0)" (disabled)
   - [ ] ✅ Database shows `boosted: false`

---

## 🎯 Test 4: Subscription Flow

### **Test Subscription Purchase**

#### **Step 4.1: Initiate Subscription**
1. **Click "S'abonner 8€/mois"** button
2. **Expected Result**: Redirects to Stripe Checkout

#### **Step 4.2: Complete Subscription**
3. **Fill Stripe Checkout**:
   - Email: test@example.com
   - Card: `4242 4242 4242 4242` (12/34, 123)
   - Complete billing address
4. **Click "Subscribe"**
5. **Expected Results**:
   - [ ] ✅ Redirects back to your site
   - [ ] ✅ Success message in URL or toast

#### **Step 4.3: Verify Subscription**
6. **Check UI**: Subscription section should show active status
7. **Check Database**:
   - [ ] ✅ `profiles`: `is_subscribed: true`
   - [ ] ✅ `user_boost_credits`: Both credits increased by 1 each
8. **Check Stripe**: Dashboard shows active $8/month subscription

---

## 🎯 Test 5: Error Scenarios

### **Test Insufficient Credits**
1. **Use all boost credits** by applying them to content
2. **Try to apply more boosts**
3. **Expected**: Buttons should be disabled showing "(0)"

### **Test Double Boost Prevention**
1. **Try to boost already boosted content**
2. **Expected**: Should not allow (button shows "Retirer le boost")

### **Test Payment Failures**
1. **Use declined card**: `4000 0000 0000 0002`
2. **Expected**: Clear error message, no database changes

### **Test Network Issues**
1. **Disconnect internet during payment**
2. **Expected**: Graceful error handling, retry capability

---

## 🎯 Test 6: Boost Expiry System

### **Test Auto-Expiry Logic**

#### **Manual Time Test** (Optional - for development)
1. **Apply boost to content**
2. **Manually update** `boosted_at` in database to 73+ hours ago
3. **Visit boosts page** (triggers auto-expiry check)
4. **Expected**: Boost should be automatically removed

#### **Check Expiry Function**
1. **Go to** `/dashboard/boosts` multiple times
2. **Check browser console**: Should see "Boost expiry cleanup completed"
3. **Verify**: No false expiry of recent boosts

---

## 🎯 Test 7: Multi-User Testing

### **Create Second Test Account**
1. **Register new user**: different email
2. **Create commerce and content**
3. **Purchase boosts**
4. **Verify isolation**: Users can't see each other's credits/transactions

---

## 🎯 Test 8: Mobile/Responsive Testing

### **Test on Mobile Devices**
1. **Open site on mobile browser**
2. **Test purchase flow**: Stripe Elements should be touch-friendly
3. **Verify UI**: Cards and modals display correctly
4. **Test PWA**: Install as app, test purchase flow

---

## 🎯 Test 9: Performance Testing

### **Load Testing**
1. **Multiple rapid purchases**: Test rate limiting
2. **Concurrent users**: Multiple browsers/accounts
3. **Large content lists**: Many offers/events with boosts
4. **Monitor**: Vercel function execution times

---

## 🚨 Expected Issues & Solutions

### **Common Problems**

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| 404 on table queries | Missing RLS policies | Run RLS policy SQL |
| 406 on user_boost_credits | Query syntax error | Check `.maybeSingle()` usage |
| Webhook 4xx errors | Wrong endpoint URL | Verify Vercel deployment |
| Payment succeeds but no credits | Webhook not processing | Check function logs |
| Frontend shows wrong credits | Cache/refresh issue | Hard refresh browser |

### **Debug Tools**

1. **Browser DevTools**: Network tab for API calls
2. **Vercel Functions**: Real-time logs
3. **Stripe Dashboard**: Webhook delivery logs
4. **Supabase Dashboard**: Table editor + logs

---

## ✅ Success Criteria

### **All Tests Pass When**:
- [ ] ✅ Boost purchases complete successfully
- [ ] ✅ Credits appear immediately after payment
- [ ] ✅ Database records all transactions
- [ ] ✅ Webhooks return 200 responses
- [ ] ✅ Boosts apply/remove correctly
- [ ] ✅ 72h expiry works automatically
- [ ] ✅ Subscriptions grant monthly credits
- [ ] ✅ RLS prevents data leaks between users
- [ ] ✅ Mobile experience is smooth
- [ ] ✅ Error handling is graceful

---

## 📊 Test Results Template

```markdown
## Test Results - [Date]

### Environment
- [ ] App URL: https://gosholo-partner-phi.vercel.app
- [ ] Stripe Mode: Test
- [ ] Database: Supabase Production

### Test Summary
- [ ] ✅/❌ Boost Purchase Flow
- [ ] ✅/❌ Database Updates
- [ ] ✅/❌ Webhook Processing  
- [ ] ✅/❌ Subscription Flow
- [ ] ✅/❌ Boost Application
- [ ] ✅/❌ Auto-Expiry
- [ ] ✅/❌ Error Handling
- [ ] ✅/❌ Mobile Experience

### Issues Found
1. [Description] - [Severity] - [Status]

### Performance Notes
- Average payment completion time: [X]s
- Webhook response time: [X]ms
- Database query performance: Good/Acceptable/Slow

### Ready for Production?
- [ ] ✅ All critical tests pass
- [ ] ✅ No data corruption issues
- [ ] ✅ Performance acceptable
- [ ] ✅ Error handling robust
```

---

## 🚀 Post-Testing Actions

### **If All Tests Pass**
1. ✅ System ready for production migration
2. ✅ Follow `STRIPE_PRODUCTION_MIGRATION.md` guide
3. ✅ Monitor first week of production usage

### **If Tests Fail**
1. ❌ Document all issues
2. ❌ Fix critical bugs first
3. ❌ Re-run failed test cases
4. ❌ Don't proceed to production until clean

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Testing Environment**: Vercel + Supabase + Stripe Test Mode