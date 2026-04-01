"use server";

import env from "@/config/env";
import type { FirebaseClientConfig } from "@/types/firebase";

export async function getFirebaseConfig(): Promise<FirebaseClientConfig> {
  return env.firebase;
}
