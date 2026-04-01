const env = {
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY ?? "",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.FIREBASE_APP_ID ?? "",
  },
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  adminEmails: (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map(e => e.trim()).filter(Boolean),
} as const;

export default env;
