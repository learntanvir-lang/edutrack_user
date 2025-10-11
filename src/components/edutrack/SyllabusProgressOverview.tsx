
'use client';

import type { Subject } from '@/lib/types';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { BookCopy, CheckCircle2 } from 'lucide-react';

interface SyllabusProgressOverviewProps {
  subjects: Subject[];
}

export function SyllabusProgressOverview({ subjects }: SyllabusProgressOverviewProps) {
  const router = useRouter();

  const progress = useMemo(() => {
    let totalChapters = 0;
    let completedChapters = 0;

    subjects.forEach(subject => {
      subject.papers.forEach(paper => {
        totalChapters += paper.chapters.length;
        paper.chapters.forEach(chapter => {
          if (chapter.isCompleted) {
            completedChapters++;
          }
        });
      });
    });

    const percentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
    return { totalChapters, completedChapters, percentage };
  }, [subjects]);

  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Syllabus Progress</CardTitle>
        <BookCopy className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow">
        {progress.totalChapters > 0 ? (
          <>
            <div className="text-3xl font-bold text-primary">{progress.percentage}%</div>
            <p className="text-xs text-muted-foreground">
              {progress.completedChapters} out of {progress.totalChapters} chapters completed
            </p>
            <Progress value={progress.percentage} className="mt-4" />
             {progress.percentage === 100 && (
                <div className="mt-4 flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-semibold">All chapters completed. Great job!</p>
                </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground">
            <p>No subjects or chapters added yet.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/syllabus')}>
          View Syllabus
        </Button>
      </CardFooter>
    </Card>
  );
}
