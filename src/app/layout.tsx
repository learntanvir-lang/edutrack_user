
import type { Metadata } from 'next';
import { AppDataProvider } from '@/context/AppDataContext';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { cn } from '@/lib/utils';
import { AppHeader } from '@/components/edutrack/AppHeader';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'EduTrack - Student Exam & Syllabus Tracker',
  description: 'A modern way to track your exams, subjects, and study progress.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <meta name="application-name" content="EduTrack" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EduTrack" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2563EB" />
        
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <FirebaseClientProvider>
          <AppDataProvider>
            <div className="relative flex min-h-screen flex-col">
              <AppHeader />
              <main className="flex-1">{children}</main>
              <footer className="w-full border-t bg-background">
                <div className="container mx-auto py-4 text-center text-sm text-muted-foreground">
                  All Right Reserved By TANVIR MAHMUD
                </div>
              </footer>
            </div>
            <Toaster />
          </AppDataProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
