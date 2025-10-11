
"use client";

import { useEffect, useState } from 'react';
import { ExamList } from '@/components/edutrack/exam/ExamList';
import { Loader2, PlusCircle } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ExamDialog } from '@/components/edutrack/exam/ExamDialog';

export default function ExamsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else if (!user.emailVerified) {
        router.push('/verify-email');
      }
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user || !user.emailVerified) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Exams
          </h1>
           <Button 
              variant="default"
              className="font-bold transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20"
              onClick={() => setIsExamDialogOpen(true)}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Exam
            </Button>
        </div>
        
        <ExamList />
      </div>
      <ExamDialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen} />
    </>
  );
}
