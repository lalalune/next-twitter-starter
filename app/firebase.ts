"use client";

import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Initializes Firebase App instance.
 * @see https://firebase.google.com/docs/reference/js/app
 */
export function getFirebaseApp() {
  const conf = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  }
  console.log("*** conf", conf);
  return (
    getApps()?.[0] ??
    initializeApp(conf)
  );
}

/**
 * Initializes Firebase Auth instance.
 * @see https://firebase.google.com/docs/reference/js/auth
 */
export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}
