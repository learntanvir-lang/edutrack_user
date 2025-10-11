
'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  type Firestore,
  type SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally, but handles errors.
 */
export function setDocumentNonBlocking(firestore: Firestore, collectionPath: string, docId: string, data: any) {
  const docRef = doc(firestore, collectionPath, docId);
  setDoc(docRef, data, { merge: true }).catch(error => {
    // This is a Firestore security rule error.
    // Create the rich, contextual error.
    const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'write', // Covers both create and update with merge
        requestResourceData: data,
    });
    // Emit the error with the global error emitter.
    errorEmitter.emit('permission-error', permissionError);
  });
}

/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally, but handles errors.
 */
export function updateDocumentNonBlocking(firestore: Firestore, collectionPath: string, docId: string, data: any) {
  const docRef = doc(firestore, collectionPath, docId);
  updateDoc(docRef, data)
    .catch(error => {
      // This is a Firestore security rule error.
      // Create the rich, contextual error.
      const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
      });
      // Emit the error with the global error emitter.
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally, but handles errors.
 */
export function deleteDocumentNonBlocking(firestore: Firestore, collectionPath: string, docId: string) {
  const docRef = doc(firestore, collectionPath, docId);
  deleteDoc(docRef)
    .catch(error => {
      // This is a Firestore security rule error.
      // Create the rich, contextual error.
      const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
      });
      // Emit the error with the global error emitter.
      errorEmitter.emit('permission-error', permissionError);
    });
}
