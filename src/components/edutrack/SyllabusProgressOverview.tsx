
'use client';

import type { Subject, Paper } from '@/lib/types';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { BookCopy } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SyllabusProgressOverviewProps {
  subjects: Subject[];
}

interface PaperProgress {
    paper: Paper;
    completedChapters: number;
    totalChapters: number;
}

interface SubjectProgress {
    subject: Subject;
    papers: PaperProgress[];
}


export function SyllabusProgressOverview({ subjects }: SyllabusProgressOverviewProps) {
  const router = useRouter();

  const progressData: SubjectProgress[] = useMemo(() => {
    return subjects
    .filter(subject => subject.showOnDashboard ?? true)
    .map(subject => {
      const papersProgress = subject.papers.map(paper => {
        let totalChapters = paper.chapters.length;
        let completedChapters = paper.chapters.filter(c => c.isCompleted).length;
        
        return {
          paper,
          completedChapters,
          totalChapters,
        };
      });
      return {
        subject,
        papers: papersProgress
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
                {progressData.map(({ subject, papers }) => (
                    <div key={subject.id}>
                        <h4 className="font-semibold text-foreground mb-2">{subject.name}</h4>
                        <div className="space-y-2 ml-4">
                            {papers.length > 0 ? papers.map(({ paper, completedChapters, totalChapters}) => (
                                <div key={paper.id} className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{paper.name}</span>
                                    <span className="text-sm font-semibold text-foreground">{completedChapters} / {totalChapters} Chapters</span>
                                </div>
                            )) : (
                                <p className="text-xs text-muted-foreground">No papers in this subject.</p>
                            )}
                        </div>
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
