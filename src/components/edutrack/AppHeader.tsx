
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EduTrackLogo } from './EduTrackLogo';
import { useUser, useAuth } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'firebase/auth';
import { LogOut, Sparkles, KeyRound, Notebook } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      if (auth) {
        await signOut(auth);
        router.push('/login');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (displayName: string | null | undefined) => {
    if (!displayName) return 'U';
    return displayName.substring(0, 2).toUpperCase();
  };

  const isNotesPage = pathname === '/notes';

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-auto flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <EduTrackLogo className="h-6 w-6" />
              <span className="font-bold text-lg">EduTrack</span>
            </Link>
            {user && !isUserLoading && (
              <div className="hidden md:flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 animate-subtle-pulse">
                <Sparkles className="h-4 w-4 text-primary/80" />
                <span className="text-base font-semibold text-primary">
                  Welcome, {user.displayName || 'User'}
                </span>
                <Sparkles className="h-4 w-4 text-primary/80" />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isUserLoading ? (
              <Skeleton className="h-8 w-20 rounded-md" />
            ) : user ? (
              <>
                <Button 
                    asChild 
                    variant="ghost"
                    size="lg" 
                    className={cn(
                        "font-bold text-primary transition-all duration-300 hover:text-primary hover:shadow-lg hover:shadow-primary/20 hover:ring-2 hover:ring-primary/30",
                        isNotesPage && "bg-primary/10"
                    )}
                >
                    <Link href="/notes">
                        <Notebook className="mr-2 h-4 w-4" />
                        Notes
                    </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      <span>Change Password</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      {user && <ChangePasswordDialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen} />}
    </>
  );
}
