
'use client';

import type { Subject, Paper } from '@/lib/types';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
    percentage: number;
}

interface SubjectProgress {
    subject: Subject;
    papers: PaperProgress[];
}


export function SyllabusProgressOverview({ subjects }: SyllabusProgressOverviewProps) {
  const router = useRouter();

  const progressData: SubjectProgress[] = useMemo(() => {
    return subjects.map(subject => {
      const papersProgress = subject.papers.map(paper => {
        let totalChapters = paper.chapters.length;
        let completedChapters = paper.chapters.filter(c => c.isCompleted).length;

        const percentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
        
        return {
          paper,
          completedChapters,
          totalChapters,
          percentage
        };
      });
      return {
        subject,
        papers: papersProgress
      };
    });
  }, [subjects]);

  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Syllabus Progress</CardTitle>
        <BookCopy className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow pt-4">
        {subjects.length > 0 ? (
          <ScrollArea className="h-80 pr-4">
            <div className="space-y-6">
                {progressData.map(({ subject, papers }) => (
                    <div key={subject.id}>
                        <h4 className="font-semibold text-foreground mb-2">{subject.name}</h4>
                        <div className="space-y-3 ml-2 pl-4 border-l">
                            {papers.length > 0 ? papers.map(({ paper, percentage, completedChapters, totalChapters}) => (
                                <div key={paper.id}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-muted-foreground">{paper.name}</span>
                                        <span className="text-xs font-semibold text-primary">{percentage}%</span>
                                    </div>
                                    <Progress value={percentage} />
                                    <p className="text-xs text-muted-foreground mt-1 text-right">{completedChapters} / {totalChapters} Chapters</p>
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
            <p>No subjects added yet.</p>
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
