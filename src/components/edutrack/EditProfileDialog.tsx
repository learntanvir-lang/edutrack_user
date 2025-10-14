
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirebase, useUser } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const editProfileSchema = z.object({
  displayName: z.string().min(1, { message: 'Display name is required.' }),
  photoURL: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { auth, firestore } = useFirebase();
  const { toast } = useToast();

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      displayName: '',
      photoURL: '',
    },
  });

  useEffect(() => {
    if (user && open) {
      form.reset({
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
      });
    }
  }, [user, open, form]);

  const onSubmit = async (values: EditProfileFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    setLoading(true);

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: values.displayName,
        photoURL: values.photoURL,
      });

      // Update Firestore user document
      if (firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, {
          displayName: values.displayName,
          // You might want to update other fields here as well
        }, { merge: true });
      }
      
      setLoading(false);
      toast({
        title: 'Success!',
        description: 'Your profile has been updated.',
      });
      onOpenChange(false);
      // The useUser hook will automatically pick up the auth changes
      // and cause a re-render of components that use it.

    } catch (error) {
      setLoading(false);
      const firebaseError = error as FirebaseError;
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: firebaseError.message || 'An unexpected error occurred.',
      });
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset form if dialog is closed without saving
      form.reset({
        displayName: user?.displayName || '',
        photoURL: user?.photoURL || '',
      });
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your display name and profile picture.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto -mx-6 px-6">
          <ScrollArea className="h-full">
            <Form {...form}>
              <form id="edit-profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="photoURL"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Picture URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.png" {...field} />
                      </FormControl>
                      <FormDescription>
                        Recommended size: 400x400 pixels.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                    <FormLabel>Email</FormLabel>
                    <Input value={user?.email || ''} disabled />
                </div>
                <div className="space-y-2">
                    <FormLabel>User ID</FormLabel>
                    <Input value={user?.uid || ''} disabled />
                </div>
              </form>
            </Form>
          </ScrollArea>
        </div>
        <DialogFooter className="pt-4 border-t flex-shrink-0">
          <Button type="submit" form="edit-profile-form" onClick={form.handleSubmit(onSubmit)} disabled={loading} className="font-bold transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
