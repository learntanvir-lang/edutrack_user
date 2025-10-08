
'use client';
import {
  Auth,
  User,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

type UserCallback = (user: User) => void;
type ErrorCallback = (error: any) => void;

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(error => {
    // Optionally handle anonymous sign-in errors, e.g., via a global error handler
    console.error('Anonymous sign-in failed:', error);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string,
  onSuccess?: UserCallback,
  onError?: ErrorCallback
): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
      onSuccess?.(userCredential.user);
    })
    .catch(error => {
      onError?.(error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string,
  onError?: ErrorCallback
): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
      onError?.(error);
    });
}

/** Initiate sign out (non-blocking). */
export function initiateSignOut(authInstance: Auth, onError?: ErrorCallback): void {
  signOut(authInstance)
    .catch(error => {
        onError?.(error);
    });
}

    