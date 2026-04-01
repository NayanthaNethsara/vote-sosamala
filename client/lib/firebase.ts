import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getFirebaseConfig } from "@/app/actions/auth";

let resolvedAuth: Auth | null = null;
let initPromise: Promise<Auth> | null = null;

export async function getFirebaseAuth(): Promise<Auth> {
  if (resolvedAuth) return resolvedAuth;
  if (initPromise) return initPromise;

  initPromise = getFirebaseConfig().then((config) => {
    const app = getApps()[0] ?? initializeApp(config);
    resolvedAuth = getAuth(app);
    return resolvedAuth;
  });

  return initPromise;
}

export const googleProvider = new GoogleAuthProvider();
