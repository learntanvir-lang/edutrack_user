
"use client";

import { useMemo, useContext, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AppDataContext } from '@/context/AppDataContext';
import NextExamCard from '@/components/edutrack/exam/NextExamCard';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { exams } = useContext(AppDataContext);
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else if (!user.emailVerified) {
        router.push('/verify-email');
      }
    }
  }, [user, isUserLoading, router]);
  
  const nextExam = useMemo(() => {
    if (!exams) return null;
    const upcoming = exams
      .filter(exam => new Date(exam.date) >= new Date() && !exam.isCompleted)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming[0];
  }, [exams]);

  if (isUserLoading || !user || !user.emailVerified) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Dashboard
        </h1>
        
        {nextExam ? (
          <NextExamCard
            exam={nextExam}
          />
        ) : (
          <Card className="bg-primary text-primary-foreground border-0">
            <CardHeader>
              <CardTitle>No Upcoming Exams</CardTitle>
              <CardDescription className="text-primary-foreground/80">Add an exam to start tracking.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" onClick={() => router.push('/exams')}>Add Exam</Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-8">
          {/* You can add more dashboard widgets here in the future */}
        </div>
    </div>
  );
}
