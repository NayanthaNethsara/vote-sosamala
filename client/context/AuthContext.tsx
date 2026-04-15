"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onIdTokenChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "@/lib/firebase";
import type { AuthContextValue, AuthRole, AuthUser } from "@/types/auth";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AuthRole>("guest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const syncSessionCookie = async (idToken: string): Promise<AuthRole> => {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        return "guest";
      }

      const data = (await res.json()) as { role?: AuthRole };
      return data.role ?? "guest";
    };

    const clearSessionCookie = async () => {
      await fetch("/api/auth/session", {
        method: "DELETE",
      });
    };

    getFirebaseAuth().then((auth) => {
      unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const idToken = await currentUser.getIdToken();
            const nextRole = await syncSessionCookie(idToken);
            setRole(nextRole);
          } catch (error) {
            console.warn("Session sync failed; using guest role", error);
            setRole("guest");
          }
        } else {
          await clearSessionCookie();
          setRole("guest");
        }

        setUser(currentUser);
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
    await fetch("/api/auth/session", { method: "DELETE" });
    const auth = await getFirebaseAuth();
    await firebaseSignOut(auth);
    setRole("guest");
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, signInWithGoogle, signOut }}
    >
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
