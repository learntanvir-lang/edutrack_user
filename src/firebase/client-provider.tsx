
'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase, type FirebaseServices } from '@/firebase';
import { Loader2 } from 'lucide-react';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // We define an async function inside useEffect to call our async initializer
    const init = async () => {
      try {
        const firebaseServices = await initializeFirebase();
        setServices(firebaseServices);
      } catch (e) {
        console.error("Failed to initialize Firebase:", e);
        setError(e as Error);
      }
    };
    
    init();
  }, []); // Empty dependency array ensures this runs only once on mount

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Error initializing application.</p>
      </div>
    );
  }

  if (!services) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
