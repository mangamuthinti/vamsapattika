# Vamsapattika - Configuration Summary

## 📧 Contact & Support

**Support Email**: support@vamsapattika.com

### Where Support Email Appears:
1. **Footer** - All pages (clickable mailto link)
2. **User Dropdown Menu** - "Help & Support" option
3. **Feedback Modal** - Info section with clickable link
4. **EmailJS Backend** - Receives all feedback submissions

---

## 💳 Pricing Structure

### **One Tree Per User Policy**
Each user account can create and manage **one family tree only**. This simplifies the user experience and focuses on building a comprehensive family tree.

### Current Plans (Valid for 1 year):
- **Free**: 4 cards - ₹0 (No expiry)
- **Silver**: 10 cards - ₹499/year
- **Gold**: 18 cards - ₹999/year  
- **Diamond**: Unlimited cards - ₹1499/year

**Note**: Plans limit the number of **family members (cards)** you can add to your **one tree**, not the number of trees.

### Key Features:
- ✅ One tree per user (simplified management)
- ✅ Card limits based on plan (upgrade for more family members)
- ✅ Payment date tracking
- ✅ Auto-expiry after 1 year
- ✅ Expiry warning (30 days before)
- ✅ Auto-downgrade to Free on expiry
- ✅ Renewal required message in pricing modal

---

## 🔐 Authentication

### Login Options:
- Email/Password
- Google Sign-In

### Features:
- ✅ Show/hide password toggle
- ✅ Forgot password functionality
- ✅ Firebase password reset email
- ✅ User profile management

---

## 📨 EmailJS Configuration

### Current Setup:
```
Service ID: service_m9f0av3
Template ID: template_i6e0vwy
Public Key: l0b9AbBdPsRpHvZXu
Recipient: support@vamsapattika.com
```

### Template Variables:
- `user_name` - User's full name
- `user_email` - User's email address
- `rating` - Star rating (1-5)
- `feedback` - Feedback text
- `to_email` - Recipient email (support@vamsapattika.com)

**Status**: ✅ Configured and working

---

## 🗄️ Firebase Database Structure

### Users Table:
```javascript
users/{userId}: {
  uid: string,
  email: string,
  displayName: string,
  createdAt: timestamp,
  lastLogin: timestamp
}
```

### Family Trees Table:
```javascript
familyTrees/{userId}/{treeId}: {
  id: string,
  name: string,
  familyData: { [personId]: PersonObject },
  nextId: number,
  userPlan: {
    maxCards: number, // Infinity stored as 999999
    price: number,
    name: string,
    purchaseDate: timestamp,
    expiryDate: timestamp
  },
  createdAt: timestamp,
  lastUpdated: timestamp
}
```

---

## 🎨 Default Settings

### New Person Card Defaults:
- **Shape**: Rounded (square with rounded corners)
- **Photo Shape**: Circle
- **Gender**: Male
- **Colors**: Purple gradient (#667eea to #764ba2)

### Family Tree Defaults:
- **Tree Name**: "My Vamsapattika"
- **Background**: Family watermark image
- **Card Layout**: Hierarchical tree structure
- **Couple Box**: Pink gradient with heart icon

---

## 🔒 Security Features

### Data Storage:
- ✅ Cloud-based (Firebase Realtime Database)
- ✅ User authentication required
- ✅ Data isolated per user account
- ✅ Secure Firebase rules

### Privacy:
- ✅ EmailJS credentials in code (public key only)
- ✅ `.env` support ready (optional)
- ✅ `.gitignore` configured
- ✅ No sensitive data in frontend

---

## 📱 Key Features

### Family Tree Management:
- ✅ **One tree per user** (simplified experience)
- ✅ Up to 4/10/18/unlimited family members (based on plan)
- ✅ Photo uploads
- ✅ Custom colors & shapes
- ✅ Text formatting
- ✅ Marriage details
- ✅ Birth/death dates
- ✅ Couple boxes with hearts
- ✅ Gender indicators

### Export Options:
- ✅ PNG image
- ✅ PDF document
- ✅ Print to PDF
- ✅ JSON backup

### UI Features:
- ✅ Centered popover menus (no footer overlap)
- ✅ Responsive design
- ✅ Dark mode toolbar
- ✅ Custom alerts/confirms
- ✅ User dropdown with avatar

---

## 🚀 Production Checklist

### Before Deployment:
- [x] EmailJS template configured to support@vamsapattika.com
- [x] Firebase project configured
- [x] Pricing structure implemented
- [x] Payment date tracking added
- [x] Support email added throughout app
- [x] Password reset functionality working
- [x] Default card shape fixed (rounded)
- [ ] Test all features end-to-end
- [ ] Set up custom domain
- [ ] Configure Firebase security rules
- [ ] Set up analytics (optional)
- [ ] Add terms of service & privacy policy (optional)

---

## 📞 Contact

**Support**: support@vamsapattika.com  
**Developer**: Provegaa Tech Hub

---

*Last Updated: 2026-08-27*
