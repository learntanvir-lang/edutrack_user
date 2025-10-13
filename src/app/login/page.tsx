
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useFirebase } from '@/firebase';
import {
  sendEmailVerification,
  updateProfile,
  ActionCodeSettings,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';


const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const signupSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.'}),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  const handleAuthError = (error: FirebaseError) => {
    setLoading(false);
    let title = 'An unexpected error occurred.';
    let description = error.message;

    switch (error.code) {
      case 'auth/user-not-found':
        title = 'Login Failed';
        description = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        title = 'Login Failed';
        description = 'Incorrect password. Please try again.';
        break;
      case 'auth/email-already-in-use':
        title = 'Sign Up Failed';
        description = 'An account with this email address already exists.';
        break;
      case 'auth/invalid-email':
        title = 'Invalid Email';
        description = 'Please enter a valid email address.';
        break;
      case 'auth/weak-password':
        title = 'Weak Password';
        description = 'The password must be at least 6 characters long.';
        break;
      default:
        break;
    }

    toast({
      variant: 'destructive',
      title,
      description,
    });
  };

  const onLoginSubmit = (values: LoginFormValues) => {
    setLoading(true);
    signInWithEmailAndPassword(auth, values.email, values.password)
        .then(() => {
            router.push('/');
        })
        .catch(handleAuthError)
        .finally(() => setLoading(false));
  };

  const onSignupSubmit = async (values: SignupFormValues) => {
    setLoading(true);
    
    if (!firestore) {
        setLoading(false);
        toast({ variant: 'destructive', title: 'Error', description: 'Database service is not available.' });
        return;
    }

    try {
        // 1. Check for username uniqueness
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("username", "==", values.username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            signupForm.setError("username", {
                type: "manual",
                message: "This username is already taken. Please choose another one.",
            });
            setLoading(false);
            return;
        }

        // 2. Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;
        
        // --- Chain background tasks ---

        // 3. Update profile
        updateProfile(user, { displayName: values.username }).catch(profileError => {
            console.error("Failed to update user profile:", profileError);
        });

        // 4. Create user document in Firestore
        const userDocRef = doc(firestore, "users", user.uid);
        setDoc(userDocRef, {
            id: user.uid,
            username: values.username,
            displayName: values.username,
            email: user.email,
        }, { merge: true }).catch(dbError => {
            console.error("Failed to create user document:", dbError);
            // Optional: Implement retry logic or notify user of data sync issue
        });
        
        // 5. Send verification email
        const actionCodeSettings: ActionCodeSettings = {
            url: `${window.location.origin}/`,
            handleCodeInApp: true,
        };
        sendEmailVerification(user, actionCodeSettings)
            .then(() => {
                toast({
                    title: 'Account Created!',
                    description: 'A verification email has been sent. Please verify to continue.',
                });
            })
            .catch(emailError => {
                console.error("Failed to send verification email:", emailError);
                toast({
                    variant: 'destructive',
                    title: 'Could Not Send Verification',
                    description: 'Your account was created, but we failed to send a verification email. Please try resending it from the next page.',
                });
            });

        // --- Navigate immediately ---
        router.push('/verify-email');

    } catch (error) {
        if (error instanceof FirebaseError) {
            handleAuthError(error);
        } else {
            console.error("An unexpected error occurred during signup:", error);
            toast({
                variant: 'destructive',
                title: 'Sign Up Failed',
                description: 'An unexpected error occurred. Please try again.',
            });
            setLoading(false);
        }
    }
  };


  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center bg-background p-4">
      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Access your personalized study dashboard.
              </CardDescription>
            </CardHeader>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
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
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>
                Create an account to save and sync your progress.
              </CardDescription>
            </CardHeader>
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
                <CardContent className="space-y-4">
                   <FormField
                    control={signupForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. janesmith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
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
                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
