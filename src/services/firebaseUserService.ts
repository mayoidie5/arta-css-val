import {
  createUserWithEmailAndPassword,
  deleteUser,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
  getAuth
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { auth, db, createUserAuth } from '../firebase';

export interface AdminUser {
  id: string; // Firebase UID
  uid: string; // Same as id for consistency
  name: string;
  email: string;
  role: 'Admin' | 'Staff' | 'Enumerator';
  status: 'Active' | 'Inactive';
  createdAt: string;
  lastLogin?: string;
  deleted?: boolean;
}

/**
 * Add a new user to Firebase Auth and create user profile in Firestore
 * Uses a separate auth instance to avoid affecting the admin's logged-in session
 * The new user is NOT left logged in - they are signed out immediately after creation
 */
export const addUserToFirebase = async (
  email: string,
  password: string,
  name: string,
  role: 'Admin' | 'Staff' | 'Enumerator'
): Promise<{ user: AdminUser; previousAuthEmail?: string }> => {
  try {
    // Create user using the separate auth instance
    // This will NOT affect the main auth instance (where admin is logged in)
    const userCredential = await createUserWithEmailAndPassword(createUserAuth, email, password);
    const uid = userCredential.user.uid;

    // Create user profile in Firestore
    const userData: Omit<AdminUser, 'id'> = {
      uid,
      name,
      email,
      role,
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', uid), userData);

    // Sign out the newly created user immediately
    // The new user should NOT be logged in after creation
    await signOut(createUserAuth);

    return { 
      user: { id: uid, ...userData },
      previousAuthEmail: undefined
    };
  } catch (error: any) {
    const errorMessage = error.code === 'auth/email-already-in-use'
      ? 'Email already in use'
      : error.code === 'auth/weak-password'
      ? 'Password too weak (minimum 6 characters)'
      : error.message || 'Failed to add user';
    throw new Error(errorMessage);
  }
};

/**
 * Get all users from Firestore
 */
export const getAllUsers = async (): Promise<AdminUser[]> => {
  try {
    const q = query(collection(db, 'users'));
    const querySnapshot = await getDocs(q);
    const users: AdminUser[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<AdminUser, 'id'>;
      users.push({
        id: doc.id,
        ...data
      });
    });

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Listen to real-time updates of all users
 */
export const subscribeToUsers = (
  callback: (users: AdminUser[]) => void,
  errorCallback?: (error: any) => void
): Unsubscribe => {
  const q = query(collection(db, 'users'));
  
  return onSnapshot(
    q,
    (querySnapshot) => {
      const users: AdminUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<AdminUser, 'id'>;
        users.push({
          id: doc.id,
          ...data
        });
      });
      callback(users);
    },
    (error) => {
      console.error('Firestore subscription error:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      
      if (errorCallback) {
        errorCallback(error);
      }
    }
  );
};

/**
 * Update user profile in Firestore
 */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<Omit<AdminUser, 'id' | 'uid' | 'createdAt'>>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updates);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update user');
  }
};

/**
 * Delete user from Firebase Auth and Firestore
 * Note: This requires the user to be signed in or you need Admin SDK
 * For now, we'll just mark the user as deleted in Firestore
 */
export const deleteUserProfile = async (uid: string): Promise<void> => {
  try {
    // Mark user as deleted instead of removing the document
    // This prevents the user from being re-created when they try to log in
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { deleted: true });

    // Note: To delete from Firebase Auth, you would need:
    // 1. Admin SDK on backend
    // 2. Or the user to be currently signed in (but then they can't delete themselves)
    // So we're only marking as deleted in Firestore for now
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete user');
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<AdminUser | null> => {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data() as Omit<AdminUser, 'id'>;
    return {
      id: doc.id,
      ...data
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Disable/Enable user by updating status in Firestore
 */
export const toggleUserStatus = async (
  uid: string,
  status: 'Active' | 'Inactive'
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { status });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update user status');
  }
};

/**
 * Fetch all users from Firestore with their auth status
 * This ensures we get all users that have been created
 */
export const getAllUsersWithAuthStatus = async (): Promise<AdminUser[]> => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const users: AdminUser[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as Omit<AdminUser, 'id'>;
      users.push({
        id: doc.id,
        ...data
      });
    });

    return users.sort((a, b) => {
      // Sort by creation date, newest first
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

/**
 * Note: To list Firebase Authentication users, you would need:
 * 1. Cloud Function backend (since Firebase Auth can only be listed server-side)
 * 2. Admin SDK
 * 
 * For now, we use Firestore as the source of truth since all users are synced there
 * when created via the application.
 */
