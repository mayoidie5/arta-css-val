/**
 * QUICK FIX GUIDE - FIRESTORE SECURITY RULES
 * 
 * Your error: "Permission denied. Check Firestore security rules. 
 *              Users collection must be readable by authenticated users."
 * 
 * This means the current Firestore rules are denying access to the users collection.
 * 
 * ============================================================================
 * STEP-BY-STEP FIX (Takes 2 minutes)
 * ============================================================================
 * 
 * 1. Open: https://console.firebase.google.com
 * 
 * 2. In the left sidebar, select project "arta-a6d0f"
 * 
 * 3. Click "Firestore Database"
 * 
 * 4. Click the "Rules" tab at the top
 * 
 * 5. You should see blue text "Edit Rules" - click it
 * 
 * 6. Select ALL the text (Ctrl+A)
 * 
 * 7. DELETE everything
 * 
 * 8. PASTE the rules below:
 */

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - visible to authenticated users
    match /users/{userId} {
      // ANY authenticated user can READ all users
      allow read: if request.auth != null;
      
      // Users can CREATE (when signing up)
      allow create: if request.auth != null;
      
      // Users can UPDATE their own profile, or ADMINS can update anyone
      allow update: if request.auth != null && (
        request.auth.uid == userId || // User updating themselves
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin') // Admin updating others
      );
      
      // Only ADMINS can DELETE users
      allow delete: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
    }

    // Responses collection
    match /responses/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }

    // Deny everything else by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

/**
 * 9. Click the BLUE "Publish" button
 * 
 * 10. Wait for it to say "Rules updated" at the bottom
 * 
 * 11. Go back to the admin dashboard in your app
 * 
 * 12. Refresh the page (F5 or Ctrl+R)
 * 
 * 13. Users should now appear in the User Management section!
 * 
 * ============================================================================
 * WHAT THESE RULES DO
 * ============================================================================
 * 
 * ✅ Allow ANY authenticated user to READ all users in the collection
 *    - This fixes your permission error
 *    - Admin dashboard can now load users
 * 
 * ✅ Allow users to CREATE their own profile (when signing up)
 * 
 * ✅ Allow users to UPDATE their own data, or ADMINS to update anyone's
 * 
 * ✅ Allow only ADMINS to DELETE users
 * 
 * ============================================================================
 * IF IT STILL DOESN'T WORK
 * ============================================================================
 * 
 * 1. Make sure you clicked "Publish" (there should be a confirmation)
 * 
 * 2. Clear your browser cache:
 *    - Press: Ctrl + Shift + Delete
 *    - Select "All time"
 *    - Check "Cookies and other site data"
 *    - Click "Clear data"
 * 
 * 3. Close all browser tabs with the app
 * 
 * 4. Reopen the app and try again
 * 
 * 5. Open browser console (F12) and look for any error messages
 * 
 * ============================================================================
 * NEXT STEP
 * ============================================================================
 * 
 * After users appear:
 * 1. Try adding a new user (click "Add User" button)
 * 2. Try editing a user (click the edit icon)
 * 3. Try deleting a user (click the trash icon)
 * 4. All changes should appear in real-time
 * 
 * If you see "Permission denied" for any of these operations,
 * make sure your user account has role: 'Admin' in Firestore.
 * 
 * ============================================================================
 */
