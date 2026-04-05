import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let firebaseAppInstance = null;
let firebaseAuthInstance = null;
let firestoreInstance = null;
let authPersistencePromise = null;

export function isFirebaseConfigured() {
  return Object.values(firebaseConfig).every((value) => typeof value === 'string' && value.trim());
}

function getMissingFirebaseKeys() {
  return Object.entries(firebaseConfig)
    .filter(([, value]) => !value?.trim())
    .map(([key]) => key);
}

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    const missingKeys = getMissingFirebaseKeys().join(', ');
    throw new Error(`Firebase is not configured. Missing: ${missingKeys}.`);
  }

  if (!firebaseAppInstance) {
    firebaseAppInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }

  return firebaseAppInstance;
}

export function getFirebaseAuth() {
  if (!firebaseAuthInstance) {
    firebaseAuthInstance = getAuth(getFirebaseApp());
    authPersistencePromise =
      authPersistencePromise || setPersistence(firebaseAuthInstance, browserLocalPersistence);
  }

  return firebaseAuthInstance;
}

export async function ensureFirebaseAuth() {
  const auth = getFirebaseAuth();
  await authPersistencePromise;
  return auth;
}

export function getFirestoreDb() {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }

  return firestoreInstance;
}
