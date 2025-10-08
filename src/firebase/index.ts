
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, Firestore } from 'firebase/firestore'

export interface FirebaseServices {
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
}

let firebaseServices: FirebaseServices | null = null;

// IMPORTANT: This function is now async.
export async function initializeFirebase(): Promise<FirebaseServices> {
  // If services are already initialized, return them to avoid re-initializing.
  if (firebaseServices) {
    return firebaseServices;
  }
  
  let firebaseApp: FirebaseApp;
  if (!getApps().length) {
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    firebaseApp = getApp();
  }

  const firestore = getFirestore(firebaseApp);
  
  try {
    // Await persistence enabling BEFORE returning the services
    await enableIndexedDbPersistence(firestore);
  } catch (err: any) {
    if (err.code == 'failed-precondition') {
        // This can happen if multiple tabs are open. Persistence will still work in one of them.
        console.warn('Firestore persistence failed. It might be enabled in another tab.');
    } else if (err.code == 'unimplemented') {
        // The current browser does not support persistence.
        console.warn('Firestore persistence is not available in this browser.');
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
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
