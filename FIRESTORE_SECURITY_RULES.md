# Firestore Security Rules - Fix Users Not Displaying

## Problem
Users only display after login, but not before. This is usually caused by overly restrictive Firestore security rules.

## Solution

### Step 1: Go to Firebase Console
1. Visit https://console.firebase.google.com
2. Select project: **arta-a6d0f**
3. Go to **Firestore Database** → **Rules**

### Step 2: Apply These Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - Allow all authenticated users to read all users
    match /users/{userId} {
      // Any authenticated user can read all users
      allow read: if request.auth != null;
      
      // Only the user themselves can read their own email + personal data
      allow read: if request.auth.uid == userId;
      
      // Admins can update any user
      allow update: if request.auth != null && 
                       exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
      
      // Admins can delete users
      allow delete: if request.auth != null && 
                       exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
      
      // Only allow creates during auth context (signup)
      allow create: if request.auth != null;
    }

    // Survey responses - Allow reads for all authenticated users
    match /responses/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Default deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 3: Alternative - Most Permissive (Dev Only)

⚠️ **WARNING: Only use for development/testing!**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads from users collection
    match /users/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 4: Test in Admin Dashboard

1. **Without logging in**: Go to `/admin` → Check "User Management"
   - Should see loading spinner, then show "No users found" OR list of users
   - Should NOT show error message

2. **After logging in**: 
   - Should immediately show all users
   - Should be able to add/edit/delete users

## Troubleshooting

### Error Message: "Permission denied"
- Your current rules are too restrictive
- Use the rules provided above
- Make sure you click **Publish** after editing

### No users showing at all (even after login)
- Users collection might be empty
- Verify users were created in Firestore (use Firebase Console)
- Check browser console (F12) for actual error messages
- Verify Firebase initialization (check that auth is working)

### Users showing briefly then disappearing
- Security rules might be denying access after initial read
- Make sure rules allow authenticated users to read
- Check for query-time security checks

## Best Practice Rules

For production, use role-based rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
    }

    match /users/{userId} {
      // Any authenticated user can list/read users (admin dashboard)
      allow read: if request.auth != null;
      
      // Only admins can write
      allow create, update, delete: if isAdmin();
    }
  }
}
```

## Rules Checklist

- [ ] Firestore rules have been updated
- [ ] Rules have been **Published** (click the Publish button)
- [ ] You can see "Users collection" in Firebase console
- [ ] Browser console (F12) shows no permission errors
- [ ] Error banner in admin dashboard is gone
- [ ] Users appear in the table (even without login)

## Verify with Firebase Console

1. Go to **Firestore Database** → **Data**
2. Click on **users** collection
3. You should see user documents with fields:
   - `name`
   - `email`
   - `role`
   - `status`
   - `createdAt`
   - `uid`

If you see nothing here, users haven't been created yet. Create a test user first.

## Next Steps

After fixing security rules:
1. Refresh admin dashboard
2. Clear browser cache (Ctrl+Shift+Del)
3. Try accessing `/admin` again
4. Check that users appear without logging in
5. Log in and verify edit/delete works

