
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useUser, useFirebase } from '@/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

const deleteAccountSchema = z.object({
  password: z.string().min(1, { message: 'Password is required to delete your account.' }),
});

type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { firestore, auth } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: '',
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  const deleteAllUserData = async (userId: string) => {
    if (!firestore) return;

    const subjectsColRef = collection(firestore, `users/${userId}/subjects`);
    const examsColRef = collection(firestore, `users/${userId}/exams`);
    const userDocRef = doc(firestore, `users/${userId}`);

    const batch = writeBatch(firestore);

    // Delete subcollections
    const [subjectsSnapshot, examsSnapshot] = await Promise.all([
      getDocs(subjectsColRef),
      getDocs(examsColRef),
    ]);

    subjectsSnapshot.forEach(doc => batch.delete(doc.ref));
    examsSnapshot.forEach(doc => batch.delete(doc.ref));
    
    // Delete the user document itself
    batch.delete(userDocRef);
    
    await batch.commit();
  };

  const onSubmit = async (values: DeleteAccountFormValues) => {
    if (!user || !user.email || !firestore || !auth) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not find user information or Firebase services.',
      });
      return;
    }

    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, values.password);
      await reauthenticateWithCredential(user, credential);

      // 1. Delete Firestore data
      await deleteAllUserData(user.uid);
      
      // 2. Delete auth user
      await deleteUser(user);

      toast({
        title: 'Account Deleted',
        description: 'Your account and all associated data have been permanently deleted.',
      });

      // Redirect to login page, state will update automatically
      router.push('/login');
      handleOpenChange(false);

    } catch (error) {
      setLoading(false);
      const firebaseError = error as FirebaseError;
      let description = 'An unexpected error occurred. Please try again.';

      if (firebaseError.code === 'auth/wrong-password') {
        description = 'The password you entered is incorrect.';
        form.setError('password', { type: 'manual', message: description });
      } else if (firebaseError.code === 'auth/requires-recent-login') {
        description = 'This operation is sensitive and requires a recent login. Please sign out and sign back in to continue.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Account Deletion Failed',
        description,
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account
            and remove all your data from our servers. Please enter your password to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button type="submit" variant="destructive" disabled={loading}>
                  {loading ? 'Deleting Account...' : 'Delete Account'}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
