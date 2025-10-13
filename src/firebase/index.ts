
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, Firestore, initializeFirestore } from 'firebase/firestore'

export interface FirebaseServices {
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
}

let firebaseServices: FirebaseServices | null = null;
let persistenceEnabled = false;

// IMPORTANT: This function is now async.
export async function initializeFirebase(): Promise<FirebaseServices> {
  // If services are already initialized, return them to avoid re-initializing.
  if (firebaseServices) {
    return firebaseServices;
  }
  
  let firebaseApp: FirebaseApp;
  if (!getApps().length) {
    // When running locally, initialize with the config object.
    // In a deployed App Hosting environment, this object will be empty and
    // the SDK will automatically use the reserved environment variables.
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }

  // Use initializeFirestore to allow for settings.
  const firestore = initializeFirestore(firebaseApp, {
      // Firestore settings can go here if needed in the future
  });
  
  // Enable offline persistence only once.
  if (!persistenceEnabled) {
      try {
        await enableIndexedDbPersistence(firestore);
        persistenceEnabled = true; // Mark as enabled
        console.log("Firestore offline persistence enabled.");
      } catch (err: any) {
        if (err.code == 'failed-precondition') {
            // This can happen if multiple tabs are open.
            // The feature will still work in the other tab.
            console.warn('Firestore persistence failed to enable. It might be enabled in another tab.');
            persistenceEnabled = true; // Still mark as "handled" to avoid retries
        } else if (err.code == 'unimplemented') {
            console.warn('Firestore persistence is not available in this browser environment.');
        }
      }
  }
  
  const auth = getAuth(firebaseApp);
  
  // Store the initialized services in the module-level variable.
  firebaseServices = {
    firebaseApp,
    auth,
    firestore,
  };

  return firebaseServices;
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';
    
