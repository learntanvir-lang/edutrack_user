
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EduTrackLogo } from './EduTrackLogo';
import { useUser } from '@/firebase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
import { LogOut, Sparkles, KeyRound, Notebook, User as UserIcon, LayoutDashboard, BookCopy, Target, ListTodo } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { EditProfileDialog } from './EditProfileDialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase';


export function AppHeader() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

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

  const navLinks = [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/syllabus', label: 'Syllabus', icon: BookCopy },
      { href: '/exams', label: 'Exams', icon: Target },
      { href: '/studytask', label: 'Study Tasks', icon: ListTodo },
      { href: '/notes', label: 'Notes', icon: Notebook },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-4">
            <Link href="https://edutrack-tms.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
              <EduTrackLogo className="h-6 w-6" />
              <span className="font-bold text-lg hidden sm:inline-block">EduTrack</span>
            </Link>

            {user && (
                 <nav className="flex items-center gap-2">
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Button
                            key={href}
                            asChild
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "font-bold",
                                pathname === href
                                ? 'text-primary'
                                : 'text-foreground/60',
                                "hover:bg-primary/10 hover:text-primary"
                            )}
                        >
                            <Link href={href}>
                                <Icon className="mr-2 h-4 w-4" />
                                {label}
                            </Link>
                        </Button>
                    ))}
                 </nav>
            )}
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            {isUserLoading ? (
              <Skeleton className="h-8 w-20 rounded-md" />
            ) : user ? (
              <>
                 <div className="hidden md:flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1">
                    <Sparkles className="h-4 w-4 text-primary/80" />
                    <span className="text-sm font-semibold text-primary">
                      Welcome, {user.displayName || 'User'}
                    </span>
                    <Sparkles className="h-4 w-4 text-primary/80" />
                  </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
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
                    <DropdownMenuItem onClick={() => setIsEditProfileOpen(true)}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Edit Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      <span>Change Password</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
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
      {user && <EditProfileDialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen} />}
    </>
  );
}
