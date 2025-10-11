
'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally, but handles errors.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    // This is a Firestore security rule error.
    // Create the rich, contextual error.
    const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: options.merge ? 'update' : 'create',
        requestResourceData: data,
    });
    // Emit the error with the global error emitter.
    errorEmitter.emit('permission-error', permissionError);
  });
}

/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally, but handles errors.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  addDoc(colRef, data)
    .catch(error => {
      // This is a Firestore security rule error.
      // Create the rich, contextual error.
      const permissionError = new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
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
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
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
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
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
