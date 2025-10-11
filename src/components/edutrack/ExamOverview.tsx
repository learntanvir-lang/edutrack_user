
'use client';

import type { Exam } from '@/lib/types';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Target, Check, CalendarDays, Clock } from 'lucide-react';

interface ExamOverviewProps {
  exams: Exam[];
}

export function ExamOverview({ exams }: ExamOverviewProps) {
  const router = useRouter();

  const overview = useMemo(() => {
    const now = new Date();
    const upcomingExams = exams.filter(exam => new Date(exam.date) >= now && !exam.isCompleted).length;
    const pastExams = exams.filter(exam => new Date(exam.date) < now);
    const completedExams = pastExams.filter(exam => exam.isCompleted).length;

    return {
      upcomingExams,
      completedExams,
      totalPast: pastExams.length,
    };
  }, [exams]);

  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Exam Overview</CardTitle>
        <Target className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/10">
          <CalendarDays className="h-8 w-8 text-primary" />
          <div>
            <div className="text-3xl font-bold text-primary">{overview.upcomingExams}</div>
            <p className="text-sm text-muted-foreground font-medium">Upcoming Exam(s)</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-lg bg-green-500/10">
          <Check className="h-8 w-8 text-green-600" />
          <div>
            <div className="text-3xl font-bold text-green-600">{overview.completedExams}</div>
            <p className="text-sm text-muted-foreground font-medium">Completed Exam(s)</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-500/10">
          <Clock className="h-8 w-8 text-slate-600" />
          <div>
            <div className="text-3xl font-bold text-slate-600">{overview.totalPast}</div>
            <p className="text-sm text-muted-foreground font-medium">Past Exam(s)</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/exams')}>
          View All Exams
        </Button>
      </CardFooter>
    </Card>
  );
}
