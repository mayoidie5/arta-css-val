# Updated Firestore Security Rules - Fixed for Questions Collection

## Problem
The current Firestore security rules don't include rules for the `questions` collection, which is why edits to questions are being denied and not persisting.

## Solution - Updated Rules

Go to [Firebase Console](https://console.firebase.google.com) and follow these steps:

### Step 1: Navigate to Firestore Rules
1. Select project: **arta-a6d0f**
2. Go to **Firestore Database** → **Rules** tab
3. Click **Edit Rules**

### Step 2: Replace ALL Rules with These Updated Rules

⚠️ **IMPORTANT**: Key differences from previous rules:
- **Questions** `read` is now set to `allow true` (public access)
  - Users WITHOUT login can see the survey questions
  - Real-time updates work for everyone
- **Questions** `write` remains restricted to authenticated admin users only
  - Only admins can add/edit/delete questions
- **Responses** `create` is set to `allow true` (public access)
  - Unauthenticated users can submit survey responses

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - authenticated users can read
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && (
        request.auth.uid == userId ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin')
      );
      allow delete: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
    }

    // IMPORTANT: Questions collection - public read, admin write
    match /questions/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
    }

    // Responses collection - ANYONE can create (public survey submissions)
    match /responses/{document=**} {
      allow read: if request.auth != null;
      allow create: if true;
    }

    // Deny everything else by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 3: Click "Publish"

Wait for the confirmation: **"Rules updated successfully"**

### Step 4: Test in Your App

1. **Add a question** in the Manage Questions section
2. **Edit the question** - change the text
3. **Delete the question**
4. **Refresh the page** (F5 or Ctrl+R)
5. **Verify the changes persisted**

## What Changed

✅ **Added `/questions/{document=**}` rule** - Allows authenticated admins to:
- Read all questions
- Create new questions
- Update existing questions  
- Delete questions

This fixes the issue where question edits weren't being saved to Firestore!

## Rules Summary

| Collection | Operation | Requirement | Notes |
|-----------|-----------|-------------|-------|
| users | read | authenticated | Admins only |
| users | create | authenticated | During signup |
| users | update | authenticated OR admin | Self or admin |
| users | delete | admin only | Admins only |
| **questions** | **read** | **PUBLIC (no auth needed)** | Anyone can see questions |
| **questions** | **write** | **authenticated + admin role** | Admins only can edit |
| **responses** | **read** | **authenticated** | Admins for dashboard |
| **responses** | **create** | **PUBLIC (no auth needed)** | Anyone can submit survey |
| other | any | DENIED | Default deny all |

## Troubleshooting

### Still getting "Permission denied" errors?
1. Make sure you **clicked Publish** after editing the rules
2. Wait a few seconds for the rules to propagate
3. Refresh your browser (Ctrl+Shift+R for hard refresh)
4. Check the browser console (F12) for error messages

### Changes still not persisting after refresh?
1. Clear your browser cache (Ctrl+Shift+Delete)
2. Close and reopen the app
3. Verify in Firebase Console → Firestore Database → Data that the questions were saved

## Next Steps

After updating the security rules:
1. Test adding a new question
2. Test editing a question text
3. Test reordering questions
4. Test deleting a question
5. **Refresh the page** to verify all changes persisted
6. The app should now work without needing to refresh!
