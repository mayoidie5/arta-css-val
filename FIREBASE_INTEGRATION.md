# Firebase Integration Setup Guide

## ✅ What's Been Integrated

### 1. Firebase Configuration (`src/firebase.ts`)
- ✅ Firebase app initialization
- ✅ Authentication (Firebase Auth)
- ✅ Firestore Database
- ✅ Cloud Storage
- ✅ Analytics

**Credentials Used:**
```
Project ID: arta-a6d0f
Auth Domain: arta-a6d0f.firebaseapp.com
Storage Bucket: arta-a6d0f.firebasestorage.app
```

### 2. Authentication Context (`src/context/AuthContext.tsx`)
- ✅ Global auth state management
- ✅ Firebase Auth integration
- ✅ Firestore user profiles
- ✅ Password reset functionality
- ✅ Error handling with user-friendly messages

**Features:**
- `login()` - Sign in with email/password
- `logout()` - Sign out
- `signup()` - Create new user with role
- `resetPassword()` - Send password reset email
- `changePassword()` - Update password

### 3. Admin Dashboard Integration
- ✅ Firebase login (replaces local state)
- ✅ Real-time auth state checking
- ✅ Loading states
- ✅ Error messages
- ✅ Protected access (only logged-in users can access admin)

### 4. App-level Integration
- ✅ AuthProvider wraps entire app
- ✅ Automatic auth state persistence
- ✅ Session management

---

## 🚀 How to Use

### First Time Setup

1. **Create Admin Account in Firebase:**
   - Go to Firebase Console (https://console.firebase.google.com)
   - Select project: `arta-a6d0f`
   - Go to Authentication > Users
   - Click "Add User" 
   - Enter email and password
   - Click "Create User"

2. **Set User Role in Firestore:**
   - Go to Firestore Database
   - Create collection: `users`
   - Add document with User ID as document ID
   - Add fields:
     ```json
     {
       "name": "Admin Name",
       "email": "admin@example.com",
       "role": "Admin",
       "status": "Active",
       "createdAt": "2025-11-23T00:00:00.000Z"
     }
     ```

### Login Flow

1. **User enters email/password**
   ```
   Email: admin@valenzuela.gov.ph
   Password: ••••••••
   ```

2. **Firebase validates credentials**
   - Success: User logged in, role loaded from Firestore
   - Failure: Error message displayed

3. **User can:**
   - View dashboard
   - Manage responses
   - Access admin features
   - Change password (via Change Password dialog)

### Password Reset Flow

1. **User clicks "Forgot Password?"**
2. **Enters email address**
3. **Firebase sends reset email**
4. **User clicks link in email**
5. **Sets new password**
6. **Can login with new password**

---

## 📊 Firestore Structure

### `users` Collection
```
users/
├── {uid}/
│   ├── name: string
│   ├── email: string
│   ├── role: "Admin" | "Staff" | "Enumerator"
│   ├── status: "Active" | "Inactive"
│   └── createdAt: ISO8601
```

---

## 🔐 Security Rules (Recommended)

Set these Firestore security rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read their own user data
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Admins can read all responses
    match /responses/{document=**} {
      allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "Admin";
      allow write: if false;
    }
  }
}
```

---

## 🧪 Testing

### Test Cases

1. **Valid Login:**
   - Email: Valid Firebase user email
   - Password: Correct password
   - Expected: Logged in, dashboard shown

2. **Invalid Email:**
   - Email: Non-existent user
   - Expected: Error message "Email not found"

3. **Wrong Password:**
   - Email: Valid user
   - Password: Wrong password
   - Expected: Error message "Incorrect password"

4. **Forgot Password:**
   - Email: Valid user email
   - Expected: Reset email sent

5. **Logout:**
   - Click "Logout" button
   - Expected: Return to login screen

---

## 🐛 Troubleshooting

### "Login failed" error
- Check Firebase credentials in `src/firebase.ts`
- Verify user exists in Firebase Console
- Check Firebase is enabled in project

### "Email not found"
- User doesn't exist in Firebase
- Create user in Firebase Console first

### "Unable to send reset email"
- Check email is registered in Firebase
- Check Firebase project has email enabled

### Auth state not persisting
- Check browser localStorage is enabled
- Firebase auth persistence is enabled by default

---

## 📚 Environment Variables

Currently using Firebase config in code. For production, move to `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSyAgZV5W_AauAn8X7r7kOjtIcjUSj0g_ISw
VITE_FIREBASE_AUTH_DOMAIN=arta-a6d0f.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=arta-a6d0f
VITE_FIREBASE_STORAGE_BUCKET=arta-a6d0f.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=714515987128
VITE_FIREBASE_APP_ID=1:714515987128:web:264b4a9f4c807a834d124d
VITE_FIREBASE_MEASUREMENT_ID=G-RXZRSWQ14B
```

Update `src/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... etc
};
```

---

## 🔗 Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)

---

## ✨ Next Steps

1. Create admin users in Firebase Console
2. Set up Firestore security rules
3. Move Firebase config to environment variables
4. Test all authentication flows
5. Deploy to production

