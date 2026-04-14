"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "@/lib/firebase";
import type { AuthContextValue, AuthUser } from "@/types/auth";
import { fetchMe } from "@/lib/api";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    getFirebaseAuth().then((auth) => {
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const meData = await fetchMe(currentUser);
            (currentUser as AuthUser).role = meData.role;
          } catch (error) {
            console.error("Failed to fetch user role:", error);
            (currentUser as AuthUser).role = "guest";
          }
        }
        setUser(currentUser as AuthUser | null);
        setLoading(false);
      });
    });

    return () => unsubscribe?.();
  }, []);

  const signInWithGoogle = async () => {
    const auth = await getFirebaseAuth();
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    const auth = await getFirebaseAuth();
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
