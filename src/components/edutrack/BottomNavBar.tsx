
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookCopy, Target, ListTodo, Library, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

export function BottomNavBar() {
  const pathname = usePathname();
  const { user } = useUser();

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/syllabus', label: 'Syllabus', icon: BookCopy },
    { href: '/exams', label: 'Exams', icon: Target },
    { href: '/studytask', label: 'Tasks', icon: ListTodo },
    { href: '/resources', label: 'Resources', icon: Library },
  ];

  if (!user) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block border-t bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'inline-flex flex-col items-center justify-center px-2 rounded-lg group',
              pathname === href
                ? 'text-primary'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            <Icon className="w-6 h-6 mb-1 transition-transform group-hover:scale-110" />
            <span className="sr-only">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
