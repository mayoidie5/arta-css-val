/**
 * Firebase Authentication Service
 * 
 * NOTE: Firebase Authentication users can ONLY be listed using the Admin SDK
 * on a backend server. The client-side SDK does not have this capability for security reasons.
 * 
 * To fetch ALL Firebase Authentication users, you need to:
 * 
 * 1. Create a Cloud Function that lists users
 * 2. Call that Cloud Function from the frontend
 * 
 * Example Cloud Function (in Firebase backend):
 * 
 * ```typescript
 * import * as functions from 'firebase-functions';
 * import * as admin from 'firebase-admin';
 * 
 * admin.initializeApp();
 * 
 * export const listAllUsers = functions.https.onCall(async (data, context) => {
 *   // Verify admin role
 *   if (!context.auth) {
 *     throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
 *   }
 * 
 *   const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
 *   if (!userDoc.exists || userDoc.data()?.role !== 'Admin') {
 *     throw new functions.https.HttpsError('permission-denied', 'Must be an admin');
 *   }
 * 
 *   try {
 *     const listUsersResult = await admin.auth().listUsers(1000);
 *     const users = listUsersResult.users.map(userRecord => ({
 *       uid: userRecord.uid,
 *       email: userRecord.email,
 *       displayName: userRecord.displayName,
 *       disabled: userRecord.disabled,
 *       createdAt: userRecord.metadata.creationTime,
 *     }));
 *     return { users };
 *   } catch (error) {
 *     throw new functions.https.HttpsError('internal', 'Error listing users');
 *   }
 * });
 * ```
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

/**
 * List all Firebase Authentication users
 * Requires a Cloud Function to be deployed
 */
export const listAllAuthUsers = async () => {
  try {
    const listAllUsers = httpsCallable(functions, 'listAllUsers');
    const result = await listAllUsers();
    return result.data;
  } catch (error: any) {
    console.error('Error listing auth users:', error);
    throw new Error(
      error.message || 
      'Failed to list authentication users. Ensure Cloud Function is deployed.'
    );
  }
};

/**
 * Current Solution:
 * 
 * Since Cloud Functions aren't deployed yet, we use Firestore as the source of truth.
 * This is actually the RECOMMENDED approach because:
 * 
 * 1. Better Performance: Firestore queries are faster than listing all auth users
 * 2. More Data: Firestore contains additional user metadata (role, status, name, etc.)
 * 3. Simpler Security: No need to expose an admin API endpoint
 * 4. Consistency: Single source of truth for all user data
 * 
 * When a user is created via addUserToFirebase(), both:
 * - Firebase Authentication record is created (for auth)
 * - Firestore user document is created (for user data + role/status)
 * 
 * Therefore, the Firestore collection is already "all users in Firebase".
 */
