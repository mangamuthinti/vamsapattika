# Razorpay Payment Gateway Testing Guide

Complete guide for testing Razorpay payment integration in Vamsapattika.

## 🎯 Testing Objectives

1. ✅ Verify backend payment API endpoints work
2. ✅ Verify frontend Razorpay checkout opens
3. ✅ Test successful payment flow
4. ✅ Test payment verification and signature validation
5. ✅ Verify subscription activation after payment
6. ✅ Test error handling

---

## 📋 Pre-Testing Checklist

### Backend Setup

- [ ] Razorpay keys configured in `.env`
- [ ] `razorpay` package installed
- [ ] Backend server running
- [ ] Database migrations completed
- [ ] Subscription plans created

### Frontend Setup

- [ ] Razorpay Key ID configured in `.env`
- [ ] Razorpay checkout script loaded in `index.html`
- [ ] Frontend dev server running
- [ ] User logged in

---

## 🔧 Step 1: Verify Backend Configuration

### 1.1 Check Environment Variables

```bash
cd backend
source venv/bin/activate

# Check if Razorpay keys are loaded
python manage.py shell
```

In Django shell:
```python
from django.conf import settings

# Check keys are present (should not be empty)
print("RAZORPAY_KEY_ID:", settings.RAZORPAY_KEY_ID[:10] + "...")
print("RAZORPAY_KEY_SECRET:", settings.RAZORPAY_KEY_SECRET[:10] + "...")
exit()
```

**Expected Output:**
```
RAZORPAY_KEY_ID: rzp_live_T...
RAZORPAY_KEY_SECRET: xEUHopD5WW...
```

### 1.2 Check Subscription Plans Exist

```bash
python manage.py shell
```

```python
from payments.models import SubscriptionPlan

plans = SubscriptionPlan.objects.all()
for plan in plans:
    print(f"{plan.name}: {plan.card_limit} cards, ₹{plan.price}")
    
# Should show:
# Free: 4 cards, ₹0
# Silver: 10 cards, ₹499
# Gold: 18 cards, ₹999
# Diamond: -1 cards, ₹1499

exit()
```

### 1.3 Test Payment API Endpoints

**Using cURL or Postman:**

1. **Get Authentication Token (Login first):**

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-user@example.com",
    "password": "your-password"
  }'
```

Save the `access` token from response.

2. **Get Subscription Plans:**

```bash
curl http://localhost:8000/api/payments/plans/
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "Free",
    "card_limit": 4,
    "price": "0.00",
    "features": ["Up to 4 cards", ...]
  },
  {
    "id": 2,
    "name": "Silver",
    "card_limit": 10,
    "price": "499.00",
    ...
  }
]
```

3. **Get User Subscription:**

```bash
curl http://localhost:8000/api/payments/subscription/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "plan": {
    "id": 1,
    "name": "Free",
    "card_limit": 4,
    "price": "0.00"
  },
  "cards_used": 0
}
```

4. **Create Payment Order (Silver Plan - ID 2):**

```bash
curl -X POST http://localhost:8000/api/payments/create-order/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan_id": 2}'
```

**Expected Response:**
```json
{
  "order_id": "order_xxxxxxxxxxxxx",
  "amount": 49900,
  "currency": "INR",
  "key": "rzp_live_TTYsoLLExJH7va",
  "plan_name": "Silver",
  "plan_id": 2
}
```

✅ **If you see this response, backend is working correctly!**

---

## 🎨 Step 2: Verify Frontend Configuration

### 2.1 Check Environment Variables

```bash
cd frontend
cat .env | grep RAZORPAY
```

**Expected Output:**
```
VITE_RAZORPAY_KEY_ID=rzp_live_TTYsoLLExJH7va
```

### 2.2 Check Razorpay Script Loaded

Open browser DevTools → Console, type:
```javascript
window.Razorpay
```

**Expected:** Should show Razorpay object (not undefined)

If undefined, check `frontend/index.html` has:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 2.3 Check Payment Code

Verify the payment integration code exists:

```bash
grep -n "handleUpgrade" frontend/src/pages/FamilyTree/FamilyTreePage.jsx
```

Should show the `handleUpgrade` function with Razorpay integration.

---

## 🧪 Step 3: Test Payment Flow (Development)

### 3.1 Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 3.2 Test User Flow

1. **Open Application:**
   - Go to `http://localhost:5173`
   - Login or register

2. **Open Pricing Modal:**
   - Click "Upgrade Plan" button in toolbar
   - Or click "Add Person" when at card limit

3. **Select a Plan:**
   - Click "Upgrade" on Silver plan (₹499)

4. **Check Browser Console:**
   - Open DevTools → Console
   - Should see: Order data received
   - Should see: Razorpay checkout options

5. **Razorpay Checkout Opens:**
   - Razorpay modal should appear
   - Shows plan details and amount

### 3.3 Test with Test Mode (First)

**Important:** Before testing with live keys, switch to test mode first!

1. **Update to Test Keys Temporarily:**

   Backend `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   ```

   Frontend `.env`:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
   ```

2. **Restart Both Servers**

3. **Test Payment with Test Card:**
   - Card Number: `4111 1111 1111 1111`
   - Expiry: Any future date (e.g., `12/25`)
   - CVV: Any 3 digits (e.g., `123`)
   - Name: Any name

4. **Complete Payment:**
   - Click "Pay"
   - Should succeed instantly (test mode)

5. **Check Console:**
   - Should see payment success handler called
   - Should see verification API called

6. **Verify Subscription Updated:**
   - Check profile or subscription status
   - Should show upgraded plan

✅ **If test mode works, proceed to live testing**

### 3.4 Test with Live Keys

**⚠️ WARNING:** This will charge real money!

1. **Switch Back to Live Keys:**

   Backend `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_live_TTYsoLLExJH7va
   RAZORPAY_KEY_SECRET=xEUHopD5WW3KkfTc2PWO9L5q
   ```

   Frontend `.env`:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_live_TTYsoLLExJH7va
   ```

2. **Restart Both Servers**

3. **Make Small Test Payment:**
   - Use Silver plan (₹499) for testing
   - Use a real card
   - You will be charged!

4. **Complete Real Payment:**
   - Enter real card details
   - Complete authentication (OTP/3D Secure)
   - Payment should process

5. **Verify Success:**
   - Razorpay success handler called
   - Backend verifies payment
   - Subscription updated
   - Success message shown

6. **Check Razorpay Dashboard:**
   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Check **Payments** → Should see your test payment
   - Status should be "Captured"

---

## 🐛 Step 4: Test Error Scenarios

### 4.1 Payment Failure

1. **Use Invalid Card (Test Mode):**
   - Card: `4000 0000 0000 0002`
   - This card will fail

2. **Check Error Handling:**
   - Error message should display
   - User should stay on same screen
   - Subscription should NOT update

### 4.2 Payment Cancellation

1. **Open Razorpay Checkout**
2. **Click "X" or "Cancel"**
3. **Verify:**
   - Modal closes gracefully
   - No error messages
   - User can try again

### 4.3 Network Error

1. **Open DevTools → Network**
2. **Set to "Offline"**
3. **Try to upgrade plan**
4. **Should show network error message**

---

## ✅ Step 5: Verification Checklist

After testing, verify:

### Backend Verification

- [ ] `/api/payments/plans/` returns all plans
- [ ] `/api/payments/create-order/` creates Razorpay order
- [ ] `/api/payments/verify-payment/` validates signature
- [ ] User subscription updates after successful payment
- [ ] PaymentTransaction record created in database
- [ ] Razorpay keys are loaded from environment

### Frontend Verification

- [ ] Pricing modal displays correctly
- [ ] Plan prices and features shown
- [ ] "Upgrade" button works
- [ ] Razorpay checkout opens with correct details
- [ ] Amount displayed is correct
- [ ] Payment success updates UI
- [ ] Error handling works
- [ ] Environment variable loaded (check in console)

### Integration Verification

- [ ] Order creation works (backend → Razorpay)
- [ ] Payment completion works (Razorpay → backend)
- [ ] Signature verification works
- [ ] Subscription activation automatic
- [ ] Card limit enforcement works
- [ ] Can add more cards after upgrade

---

## 🔍 Debugging Payment Issues

### Issue: Razorpay Checkout Not Opening

**Check:**
1. Razorpay script loaded in `index.html`
2. Browser console for errors
3. `VITE_RAZORPAY_KEY_ID` in `.env`
4. Order creation API succeeded

**Debug in Console:**
```javascript
console.log('Razorpay Key:', import.meta.env.VITE_RAZORPAY_KEY_ID);
console.log('Razorpay Object:', window.Razorpay);
```

### Issue: Payment Verification Failed

**Check:**
1. Backend has correct `RAZORPAY_KEY_SECRET`
2. Signature calculation is correct
3. Check backend logs for verification errors

**Debug:**
```bash
# Check backend logs
tail -f backend/logs/*.log

# Or Django shell
python manage.py shell
```

```python
import hmac
import hashlib

# Test signature verification
order_id = "order_xxxxx"
payment_id = "pay_xxxxx"
signature = "xxxxx"
secret = "your_razorpay_secret"

generated = hmac.new(
    secret.encode(),
    f"{order_id}|{payment_id}".encode(),
    hashlib.sha256
).hexdigest()

print("Match:", generated == signature)
```

### Issue: Subscription Not Updating

**Check:**
1. Payment verification succeeded
2. Check Django signals are working
3. Check user subscription record

**Debug:**
```python
from payments.models import UserSubscription, PaymentTransaction
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.get(email='test@example.com')

# Check subscription
sub = UserSubscription.objects.get(user=user)
print(f"Plan: {sub.subscription_plan.name}")

# Check payment records
payments = PaymentTransaction.objects.filter(user=user)
for p in payments:
    print(f"{p.razorpay_order_id} - {p.status}")
```

### Issue: Keys Not Loaded

**Check:**
1. `.env` file exists in correct location
2. Keys are on separate lines
3. No extra spaces around `=`
4. Server restarted after changing `.env`

**Debug:**
```bash
# Backend
cd backend
source venv/bin/activate
python -c "from decouple import config; print(config('RAZORPAY_KEY_ID'))"

# Frontend
cd frontend
cat .env | grep RAZORPAY
```

---

## 📊 Step 6: Database Verification

Check payment records in database:

```bash
cd backend
source venv/bin/activate
python manage.py shell
```

```python
from payments.models import PaymentTransaction, UserSubscription
from django.contrib.auth import get_user_model

User = get_user_model()

# Check all payment transactions
payments = PaymentTransaction.objects.all().order_by('-created_at')
for p in payments:
    print(f"""
    User: {p.user.email}
    Order: {p.razorpay_order_id}
    Payment: {p.razorpay_payment_id}
    Amount: ₹{p.amount}
    Status: {p.status}
    Created: {p.created_at}
    """)

# Check user subscriptions
subs = UserSubscription.objects.all()
for s in subs:
    print(f"{s.user.email}: {s.subscription_plan.name} - {s.subscription_plan.card_limit} cards")
```

---

## 🎉 Success Criteria

Payment gateway is fully working if:

✅ **Backend:**
- Order creation API works
- Payment verification API works
- Signature validation succeeds
- Subscription updates automatically
- Database records created

✅ **Frontend:**
- Pricing modal displays
- Razorpay checkout opens
- Amount and details correct
- Success flow works
- Error handling works

✅ **Integration:**
- Test mode works with test cards
- Live mode works with real cards
- Payment appears in Razorpay dashboard
- User subscription updates
- Card limits enforced correctly

---

## 📝 Testing Checklist

Use this checklist for systematic testing:

### Preparation
- [ ] Backend server running
- [ ] Frontend server running
- [ ] User account created and logged in
- [ ] Razorpay keys configured
- [ ] Database has subscription plans

### Test Mode Testing
- [ ] Switch to test keys
- [ ] Create order succeeds
- [ ] Razorpay checkout opens
- [ ] Test card payment succeeds
- [ ] Payment verification works
- [ ] Subscription updates
- [ ] Database records created

### Live Mode Testing (Optional)
- [ ] Switch to live keys
- [ ] Small payment (₹499 Silver plan)
- [ ] Real card payment succeeds
- [ ] Appears in Razorpay dashboard
- [ ] Subscription updates correctly

### Error Testing
- [ ] Payment failure handled
- [ ] Payment cancellation handled
- [ ] Network error handled
- [ ] Invalid data handled

### Final Verification
- [ ] Check backend logs - no errors
- [ ] Check frontend console - no errors
- [ ] Check database - records correct
- [ ] Check Razorpay dashboard - payments visible

---

## 📞 Need Help?

If you encounter issues:

1. **Check Logs:**
   - Backend: `tail -f backend/logs/*.log`
   - Frontend: Browser DevTools Console

2. **Verify Configuration:**
   - Backend `.env` has correct keys
   - Frontend `.env` has correct Key ID
   - Servers restarted after .env changes

3. **Test in Order:**
   - Test backend APIs first (with cURL)
   - Then test frontend integration
   - Finally test end-to-end flow

4. **Review Documentation:**
   - [Razorpay Documentation](https://razorpay.com/docs/payments/)
   - Backend code: `backend/payments/views.py`
   - Frontend code: `frontend/src/pages/FamilyTree/FamilyTreePage.jsx`

---

**Last Updated:** August 2026  
**Powered by:** Provegaa Tech Hub
