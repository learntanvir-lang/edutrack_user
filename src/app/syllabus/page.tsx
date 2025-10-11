
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SubjectList } from '@/components/edutrack/subject/SubjectList';
import { PlusCircle, Loader2 } from 'lucide-react';
import { SubjectDialog } from '@/components/edutrack/subject/SubjectDialog';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function SyllabusPage() {
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
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

  if (isUserLoading || !user || !user.emailVerified) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Syllabus
        </h1>
        <Button 
          variant="default"
          className="font-bold transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20"
          onClick={() => setIsSubjectDialogOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      <div className="space-y-6">
        <SubjectList />
      </div>

      <SubjectDialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen} />
    </div>
  );
}
