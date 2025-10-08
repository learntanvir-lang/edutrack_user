
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useUser, useFirebase } from '@/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { collection, doc, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
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

    try {
        const subjectsColRef = collection(firestore, `users/${userId}/subjects`);
        const examsColRef = collection(firestore, `users/${userId}/exams`);
        const userDocRef = doc(firestore, `users/${userId}`);

        const [subjectsSnapshot, examsSnapshot] = await Promise.all([
            getDocs(subjectsColRef),
            getDocs(examsColRef),
        ]);

        const batch = writeBatch(firestore);

        subjectsSnapshot.forEach(doc => batch.delete(doc.ref));
        examsSnapshot.forEach(doc => batch.delete(doc.ref));
        batch.delete(userDocRef);

        await batch.commit();
    } catch (error) {
        console.error("Failed to delete user data from Firestore:", error);
        // This is a critical failure. We should not proceed to delete the auth user
        // as it would leave orphaned data without an owner.
        throw new Error("Could not delete user data. Aborting account deletion.");
    }
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
      // 1. Re-authenticate user to confirm their identity
      const credential = EmailAuthProvider.credential(user.email, values.password);
      await reauthenticateWithCredential(user, credential);

      const userId = user.uid;
      
      // 2. Attempt to delete all associated Firestore data FIRST.
      await deleteAllUserData(userId);

      // 3. If data deletion is successful, delete the user's authentication account.
      await deleteUser(user);

      toast({
        title: 'Account Deleted',
        description: 'Your account and all associated data have been permanently deleted.',
      });

      // 4. Redirect to login page
      router.push('/login');
      handleOpenChange(false);

    } catch (error) {
      setLoading(false);
      
      let description = 'An unexpected error occurred. Please try again.';
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/wrong-password') {
          description = 'The password you entered is incorrect.';
          form.setError('password', { type: 'manual', message: description });
        } else if (error.code === 'auth/requires-recent-login') {
          description = 'This operation is sensitive and requires a recent login. Please sign out and sign back in to continue.';
        }
      } else if (error instanceof Error) {
        description = error.message;
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
