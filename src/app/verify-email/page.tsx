
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MailCheck, Loader2, LogOut } from 'lucide-react';
import { EduTrackLogo } from '@/components/edutrack/EduTrackLogo';

export default function VerifyEmailPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.emailVerified) {
        router.push('/');
      }
    }
    
    // Set up an interval to reload the user to check for verification status
    const interval = setInterval(() => {
        user?.reload().then(() => {
            if(user?.emailVerified) {
                router.push('/');
            }
        });
    }, 3000);

    return () => clearInterval(interval);

  }, [user, isUserLoading, router]);

  const handleResendVerification = async () => {
    if (!user) return;
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: 'Verification Email Sent',
        description: 'A new verification link has been sent to your email address.',
      });
    } catch (error) {
      console.error("Error resending verification email:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send verification email. Please try again later.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex items-center space-x-2 mb-8">
        <EduTrackLogo className="h-8 w-8" />
        <span className="font-bold text-2xl">EduTrack</span>
      </div>
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <MailCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to <span className="font-semibold text-foreground">{user.email}</span>. Please check your inbox and click the link to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Once your email is verified, you will be automatically redirected to the dashboard.
          </p>
          <Button onClick={handleResendVerification} disabled={isSending} className="w-full">
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : (
              'Resend Verification Email'
            )}
          </Button>
          <p className="text-xs text-muted-foreground pt-2">
            Wrong account?{' '}
            <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleSignOut}>
               Sign out
            </Button>
          </p>
        </CardContent>
      </Card>
       <div className="absolute bottom-4 right-4">
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
       </div>
    </div>
  );
}
