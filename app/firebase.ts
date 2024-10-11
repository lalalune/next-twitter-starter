"use client";

import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Initializes Firebase App instance.
 * @see https://firebase.google.com/docs/reference/js/app
 */
export function getFirebaseApp() {
  return (
    getApps()?.[0] ??
    initializeApp({
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    })
  );
}

/**
 * Initializes Firebase Auth instance.
 * @see https://firebase.google.com/docs/reference/js/auth
 */
export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}
