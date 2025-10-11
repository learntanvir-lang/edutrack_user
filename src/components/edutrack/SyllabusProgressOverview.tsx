
'use client';

import type { Subject, Paper } from '@/lib/types';
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

interface PaperProgress {
    paper: Paper;
    completedChapters: number;
    totalChapters: number;
    percentage: number;
}

interface SubjectOverallProgress {
    subject: Subject;
    percentage: number;
    papersProgress: PaperProgress[];
}


export function SyllabusProgressOverview({ subjects }: SyllabusProgressOverviewProps) {
  const router = useRouter();

  const progressData: SubjectOverallProgress[] = useMemo(() => {
    return subjects
      .filter(subject => subject.showOnDashboard ?? true)
      .map(subject => {
        
        const papersProgress = subject.papers.map(paper => {
          const completedChapters = paper.chapters.filter(c => c.isCompleted).length;
          const totalChapters = paper.chapters.length;
          const percentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
          return { paper, completedChapters, totalChapters, percentage };
        });

        const totalCompletedChapters = papersProgress.reduce((sum, p) => sum + p.completedChapters, 0);
        const totalChapters = papersProgress.reduce((sum, p) => sum + p.totalChapters, 0);
        const subjectPercentage = totalChapters > 0 ? Math.round((totalCompletedChapters / totalChapters) * 100) : 0;
        
        return {
          subject,
          percentage: subjectPercentage,
          papersProgress,
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
                {progressData.map(({ subject, percentage, papersProgress }) => (
                    <div key={subject.id}>
                        {/* Subject Level Progress */}
                        <div className="space-y-1.5 mb-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-foreground">{subject.name}</span>
                                <span className="font-semibold text-foreground">{percentage}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                        </div>

                        {/* Paper Level Progress */}
                        {papersProgress.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 pl-4">
                                {papersProgress.map(({ paper, percentage: paperPercentage }) => (
                                    <div key={paper.id} className="space-y-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-medium text-muted-foreground truncate" title={paper.name}>{paper.name}</span>
                                            <span className="font-medium text-muted-foreground">{paperPercentage}%</span>
                                        </div>
                                        <Progress value={paperPercentage} className="h-1" />
                                    </div>
                                ))}
                            </div>
                        )}
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
        <Button variant="default" size="sm" className="w-full font-bold transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20" onClick={() => router.push('/syllabus')}>
          View Full Syllabus
        </Button>
      </CardFooter>
    </Card>
  );
}
