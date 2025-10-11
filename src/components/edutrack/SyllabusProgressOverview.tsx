
'use client';

import type { Subject } from '@/lib/types';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { BookCopy } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface SyllabusProgressOverviewProps {
  subjects: Subject[];
}

interface SubjectOverallProgress {
    subject: Subject;
    completed: number;
    total: number;
    percentage: number;
}


export function SyllabusProgressOverview({ subjects }: SyllabusProgressOverviewProps) {
  const router = useRouter();

  const progressData: SubjectOverallProgress[] = useMemo(() => {
    return subjects
    .filter(subject => subject.showOnDashboard ?? true)
    .map(subject => {
        const progress = subject.papers.flatMap(p => p.chapters).flatMap(c => c.progressItems).reduce(
            (acc, item) => {
              acc.completed += item.completed;
              acc.total += item.total;
              return acc;
            },
            { completed: 0, total: 0 }
        );

        const percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
        
        return {
          subject,
          completed: progress.completed,
          total: progress.total,
          percentage,
        };
      });
  }, [subjects]);

  const visibleSubjects = subjects.filter(s => s.showOnDashboard ?? true);

  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Syllabus Progress</CardTitle>
        <BookCopy className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow pt-4">
        {visibleSubjects.length > 0 ? (
          <ScrollArea className="h-80 pr-4">
            <div className="space-y-4">
                {progressData.map(({ subject, percentage }) => (
                    <div key={subject.id} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-foreground">{subject.name}</span>
                            <span className="font-semibold text-foreground">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                    </div>
                ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
            <p>No subjects to show on dashboard.</p>
            <p className="text-xs">Enable subjects from the Syllabus page.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/syllabus')}>
          View Full Syllabus
        </Button>
      </CardFooter>
    </Card>
  );
}
