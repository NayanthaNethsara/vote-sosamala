import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFirebaseConfig } from "@/app/actions/auth";

let resolvedAuth: Auth | null = null;
let resolvedStorage: FirebaseStorage | null = null;
let initPromise: Promise<void> | null = null;

async function initFirebase(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = getFirebaseConfig().then((config) => {
    const app = getApps()[0] ?? initializeApp(config);
    resolvedAuth = getAuth(app);
    resolvedStorage = getStorage(app);
  });

  return initPromise;
}

export async function getFirebaseAuth(): Promise<Auth> {
  if (resolvedAuth) return resolvedAuth;
  await initFirebase();
  return resolvedAuth!;
}

export async function getFirebaseStorage(): Promise<FirebaseStorage> {
  if (resolvedStorage) return resolvedStorage;
  await initFirebase();
  return resolvedStorage!;
}

export const googleProvider = new GoogleAuthProvider();
