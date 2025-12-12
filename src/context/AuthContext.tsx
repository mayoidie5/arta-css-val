import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface User {
  uid: string;
  email: string | null;
  name: string;
  role: 'Admin' | 'Staff' | 'Enumerator';
  status: 'Active' | 'Inactive';
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'Admin' | 'Staff' | 'Enumerator') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  restoreAdminSession: (email: string, password: string) => Promise<void>;
  setAddingUserFlag: (isAdding: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const adminEmailRef = React.useRef<string | null>(null);
  const isAddingUserRef = React.useRef<boolean>(false);

  // Listen for auth state changes and restore session on page refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUserData) => {
      try {
        if (firebaseUserData) {
          // CRITICAL: Check if this is the expected admin user
          // If we're in the middle of adding a user and the current user doesn't match the admin,
          // it means the new user got logged in - immediately sign them out
          if (isAddingUserRef.current && adminEmailRef.current && firebaseUserData.email !== adminEmailRef.current) {
            console.log('Blocking unauthorized login during user creation');
            await signOut(auth);
            setFirebaseUser(null);
            setUser(null);
            setLoading(false);
            return;
          }

          setFirebaseUser(firebaseUserData);
          
          // Get user data from Firestore
          const userDocRef = doc(db, 'users', firebaseUserData.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Check if user is deleted
            if (userData.deleted) {
              // Sign out deleted user immediately
              await signOut(auth);
              setFirebaseUser(null);
              setUser(null);
              setError('This user account has been deleted and cannot be used');
              setLoading(false);
              return;
            }
            
            setUser({
              uid: firebaseUserData.uid,
              email: firebaseUserData.email,
              name: userData.name || firebaseUserData.email || 'User',
              role: userData.role || 'Staff',
              status: userData.status || 'Active'
            });
            
            // Store admin email for verification
            adminEmailRef.current = firebaseUserData.email;
          } else {
            // If user doc doesn't exist, don't create it
            // Just sign them out as they're not a valid user
            await signOut(auth);
            setFirebaseUser(null);
            setUser(null);
          }
        } else {
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if the user is deleted
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.deleted) {
          // Sign out the user immediately
          await signOut(auth);
          setError('This user account has been deleted and cannot be used');
          throw new Error('This user account has been deleted and cannot be used');
        }
      }
    } catch (err: any) {
      const errorMessage = err.code === 'auth/user-not-found' 
        ? 'Email not found' 
        : err.code === 'auth/wrong-password' 
        ? 'Incorrect password' 
        : err.code === 'auth/invalid-email'
        ? 'Invalid email address'
        : err.code === 'auth/user-disabled'
        ? 'User account has been disabled'
        : err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'Admin' | 'Staff' | 'Enumerator') => {
    try {
      setError(null);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store user data in Firestore
      const userDocRef = doc(db, 'users', result.user.uid);
      await setDoc(userDocRef, {
        name,
        email,
        role,
        status: 'Active',
        createdAt: new Date().toISOString()
      });

      setUser({
        uid: result.user.uid,
        email: result.user.email,
        name,
        role,
        status: 'Active'
      });
    } catch (err: any) {
      const errorMessage = err.code === 'auth/email-already-in-use'
        ? 'Email already in use'
        : err.code === 'auth/weak-password'
        ? 'Password is too weak (min. 6 characters)'
        : err.code === 'auth/invalid-email'
        ? 'Invalid email address'
        : err.message || 'Signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const errorMessage = err.code === 'auth/user-not-found'
        ? 'No user found with that email'
        : err.message || 'Failed to send reset email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      setLoading(true);
      
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error('No user logged in');
      }

      // Re-authenticate before changing password
      await signInWithEmailAndPassword(auth, firebaseUser.email, currentPassword);
      
      // Update password
      await updatePassword(firebaseUser, newPassword);
    } catch (err: any) {
      const errorMessage = err.code === 'auth/wrong-password'
        ? 'Current password is incorrect'
        : err.code === 'auth/weak-password'
        ? 'New password is too weak'
        : err.message || 'Failed to change password';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const setAddingUserFlag = (isAdding: boolean) => {
    isAddingUserRef.current = isAdding;
  };

  const restoreAdminSession = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      // Re-authenticate the admin with their saved credentials
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const errorMessage = err.code === 'auth/user-not-found'
        ? 'Admin account not found'
        : err.code === 'auth/wrong-password'
        ? 'Invalid admin credentials'
        : err.message || 'Failed to restore admin session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    login,
    logout,
    signup,
    resetPassword,
    changePassword,
    clearError,
    restoreAdminSession,
    setAddingUserFlag
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
