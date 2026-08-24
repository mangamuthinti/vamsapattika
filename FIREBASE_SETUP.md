# Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `family-tree-app` (or any name you like)
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Register Web App

1. In your Firebase project, click the **Web icon** (</>) to add a web app
2. Enter app nickname: `Family Tree Web`
3. **Check** "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 3: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Click on "Email/Password" under Sign-in providers
4. **Enable** Email/Password
5. Click "Save"

## Step 4: Setup Realtime Database

1. In Firebase Console, go to **Build > Realtime Database**
2. Click "Create Database"
3. Select location closest to you (e.g., `us-central1`)
4. Choose **"Start in test mode"** for now
5. Click "Enable"

### Set Database Rules (Important!)

Go to the "Rules" tab and replace with:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "familyTrees": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

Click "Publish"

## Step 5: Update Configuration

Open `src/firebase/config.js` and replace the config with your Firebase project details:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Database Structure

### Table 1: users (User Information)
```
users/
  {userId}/
    - uid: string
    - email: string
    - displayName: string
    - createdAt: timestamp
    - lastLogin: timestamp
```

### Table 2: familyTrees (Family Tree Data)
```
familyTrees/
  {userId}/
    - familyData: object (all person nodes)
    - nextId: number
    - lastUpdated: timestamp
```

## Features Implemented

✅ User Registration (Sign Up)
✅ User Login
✅ User Logout
✅ Automatic data save to Firebase
✅ Load user's data on login
✅ Each user has separate family tree data
✅ Data syncs across devices
✅ Secure database rules (users can only access their own data)

## Free Tier Limits

Firebase Free Plan (Spark):
- **Authentication**: Unlimited users
- **Realtime Database**: 1GB storage, 10GB/month bandwidth
- **Hosting**: 10GB storage, 360MB/day bandwidth

This is **more than enough** for a family tree app!

## Test the App

1. Start the dev server: `npm run dev`
2. Go to `http://localhost:5173`
3. Click "Sign Up" to create an account
4. After signup, you'll be logged in automatically
5. Create your family tree
6. Data saves automatically to Firebase
7. Logout and login again - your data will be restored!

## Troubleshooting

**Error: "Firebase: Error (auth/operation-not-allowed)"**
- Make sure Email/Password authentication is enabled in Firebase Console

**Error: "PERMISSION_DENIED"**
- Check database rules are set correctly
- Make sure user is logged in

**Data not saving:**
- Check browser console for errors
- Verify Firebase config is correct
- Check database rules

## Need Help?

Check Firebase documentation: https://firebase.google.com/docs
