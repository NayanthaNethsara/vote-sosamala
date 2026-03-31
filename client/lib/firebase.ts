import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import env from "@/config/env";

// Prevent re-initialization in Next.js dev hot-reloads
const app =
  getApps().length === 0
    ? initializeApp(env.firebase)
    : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
