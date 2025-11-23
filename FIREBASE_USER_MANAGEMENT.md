# Firebase User Management Guide

## Current Implementation

The application currently uses **Firestore as the source of truth** for all user data. This is the recommended approach.

### How It Works

1. **User Creation** (`addUserToFirebase`):
   - Creates user in Firebase Authentication
   - Creates user profile in Firestore with metadata (role, status, name, etc.)

2. **User Fetching** (Real-time):
   - Subscribes to Firestore `users` collection
   - Gets all users with their metadata
   - Updates automatically when users are added/edited/deleted

3. **User Updates**:
   - Updates Firestore user document
   - Changes reflected in real-time across all connected clients

## Why Firestore Instead of Listing Auth Users

### Limitations of Firebase Auth Client SDK:
❌ **Cannot list all users** - Client SDK doesn't provide this capability
❌ **Security restriction** - Only Admin SDK can list authentication records
❌ **Requires backend** - Need Cloud Functions or custom API endpoint

### Advantages of Firestore Approach:
✅ **No backend required** - Works entirely on client
✅ **Rich user data** - Stores role, status, and custom fields
✅ **Real-time updates** - Automatic synchronization
✅ **Better performance** - Firestore queries are optimized
✅ **Single source of truth** - All user data in one place

## File Structure

```
src/
├── services/
│   ├── firebaseUserService.ts    # User CRUD operations (Firestore)
│   └── authService.ts             # Authentication helpers + Cloud Function docs
├── firebase.ts                    # Firebase configuration
└── context/
    └── AuthContext.tsx            # Global auth state management
```

## API Reference

### `addUserToFirebase(email, password, name, role)`
Creates a new user in Firebase Auth and Firestore.

```typescript
const user = await addUserToFirebase(
  'user@example.com',
  'password123',
  'John Doe',
  'Staff'
);
```

### `subscribeToUsers(callback)`
Real-time listener for all users. Returns unsubscribe function.

```typescript
const unsubscribe = subscribeToUsers((users) => {
  console.log('Users updated:', users);
});

// Later, cleanup:
unsubscribe();
```

### `getAllUsers()`
Fetch all users once (one-time fetch).

```typescript
const users = await getAllUsers();
```

### `getAllUsersWithAuthStatus()`
Fetch all users sorted by creation date.

```typescript
const users = await getAllUsersWithAuthStatus();
```

### `updateUserProfile(uid, updates)`
Update user profile in Firestore.

```typescript
await updateUserProfile('user-uid', {
  name: 'Jane Doe',
  role: 'Admin',
  status: 'Inactive'
});
```

### `deleteUserProfile(uid)`
Delete user from Firestore (note: Auth user remains).

```typescript
await deleteUserProfile('user-uid');
```

## Firestore Data Structure

```
users/ (collection)
  ├── user-uid-1 (document)
  │   ├── uid: string
  │   ├── name: string
  │   ├── email: string
  │   ├── role: 'Admin' | 'Staff' | 'Enumerator'
  │   ├── status: 'Active' | 'Inactive'
  │   ├── createdAt: ISO string
  │   └── lastLogin?: ISO string
  │
  ├── user-uid-2 (document)
  │   └── ... (same structure)
  │
  └── user-uid-N (document)
      └── ... (same structure)
```

## To Enable Cloud Functions (Optional)

If you want to also access Firebase Auth user metadata, deploy a Cloud Function:

1. **Create `functions/src/index.ts`**:
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const listAllUsers = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
  }

  // Verify user is admin
  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== 'Admin') {
    throw new functions.https.HttpsError('permission-denied', 'Must be an admin');
  }

  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    const users = listUsersResult.users.map(userRecord => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      disabled: userRecord.disabled,
      createdAt: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
    }));
    return { users };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error listing users');
  }
});
```

2. **Deploy**:
```bash
cd functions
npm run deploy
```

3. **Call from frontend** (see `authService.ts`):
```typescript
import { listAllAuthUsers } from '@/services/authService';
const result = await listAllAuthUsers();
```

## Best Practices

1. **Always create users via `addUserToFirebase`** - Ensures both Auth and Firestore are in sync
2. **Use real-time subscriptions** - More efficient than polling
3. **Handle errors gracefully** - Network issues can occur
4. **Verify admin role** - Always check before sensitive operations
5. **Sync lastLogin** - Update when user logs in for audit trails

## Security Considerations

### Firestore Security Rules (Recommended)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Only authenticated users can read their own data
      allow read: if request.auth.uid == userId;
      
      // Only admins can read all users
      allow read: if exists(/databases/$(database)/documents/users/$(request.auth.uid))
                  && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
      
      // Only admins can update users
      allow update: if exists(/databases/$(database)/documents/users/$(request.auth.uid))
                    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
      
      // Only admins can delete users
      allow delete: if exists(/databases/$(database)/documents/users/$(request.auth.uid))
                    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
    }
  }
}
```

## Troubleshooting

### Users not appearing in admin dashboard
- Check Firestore collection: `users`
- Verify user documents have required fields
- Check browser console for errors
- Ensure subscription is active

### User updates not reflecting
- Clear browser cache
- Check Firestore for actual updates
- Verify `updateUserProfile` was called
- Check for Firestore security rule issues

### Can't add new users
- Verify email doesn't already exist
- Check password meets Firebase requirements (min 6 chars)
- Verify user has necessary permissions
- Check browser console for error messages

## Performance Tips

- Use real-time subscriptions for live updates (AdminDashboard)
- Cache user data in local state when possible
- Batch updates with `writeBatch` for multiple changes
- Implement pagination for very large user lists
- Use Firestore indexes for complex queries

