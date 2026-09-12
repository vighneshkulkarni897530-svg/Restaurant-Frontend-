'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

interface FirebaseAuthContextType {
  firebaseUser: FirebaseUser | null;
  isFirebaseLoading: boolean;
  isFirebaseConfigured: boolean;
  signInWithGoogle: () => Promise<FirebaseUser | null>;
  signInWithEmail: (email: string, pass: string) => Promise<FirebaseUser | null>;
  signUpWithEmail: (email: string, pass: string) => Promise<FirebaseUser | null>;
  logoutFirebase: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  firebaseUser: null,
  isFirebaseLoading: true,
  isFirebaseConfigured: false,
  signInWithGoogle: async () => null,
  signInWithEmail: async () => null,
  signUpWithEmail: async () => null,
  logoutFirebase: async () => {},
  getIdToken: async () => null,
});

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const initAuth = async () => {
      try {
        if (auth) {
          const { onAuthStateChanged } = await import('firebase/auth');
          unsubscribe = onAuthStateChanged(auth, (user) => {
            setFirebaseUser(user);
            setIsFirebaseLoading(false);
          });
        } else {
          setIsFirebaseLoading(false);
        }
      } catch (e) {
        setIsFirebaseLoading(false);
      }
    };
    initAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (): Promise<FirebaseUser | null> => {
    try {
      if (!auth || !googleProvider) return null;
      const { signInWithPopup } = await import('firebase/auth');
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('[Firebase Auth] Google Sign In Failed:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<FirebaseUser | null> => {
    try {
      if (!auth) return null;
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const result = await signInWithEmailAndPassword(auth, email, pass);
      return result.user;
    } catch (error) {
      console.error('[Firebase Auth] Email Sign In Failed:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string): Promise<FirebaseUser | null> => {
    try {
      if (!auth) return null;
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      return result.user;
    } catch (error) {
      console.error('[Firebase Auth] Sign Up Failed:', error);
      throw error;
    }
  };

  const logoutFirebase = async () => {
    try {
      if (!auth) return;
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (error) {
      console.error('[Firebase Auth] Sign Out Failed:', error);
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!firebaseUser) return null;
    return await firebaseUser.getIdToken();
  };

  return (
    <FirebaseAuthContext.Provider
      value={{
        firebaseUser,
        isFirebaseLoading,
        isFirebaseConfigured,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logoutFirebase,
        getIdToken,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export const useFirebaseAuth = () => useContext(FirebaseAuthContext);
