
"use client";

import { useMemo, useContext, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AppDataContext } from '@/context/AppDataContext';
import NextExamCard from '@/components/edutrack/exam/NextExamCard';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { SyllabusProgressOverview } from '@/components/edutrack/SyllabusProgressOverview';
import { ExamOverview } from '@/components/edutrack/ExamOverview';
import { addDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { TaskAnalyticsChart } from '@/components/edutrack/task/TaskAnalyticsChart';
import { useInView } from '@/hooks/useInView';

export default function Home() {
  const { subjects, exams, tasks } = useContext(AppDataContext);
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -6),
    to: new Date(),
  });

  const [nextExamRef, isNextExamInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [syllabusRef, isSyllabusInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [examOverviewRef, isExamOverviewInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [analyticsRef, isAnalyticsInView] = useInView({ triggerOnce: true, threshold: 0.1 });

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
        <h1 className="text-3xl font-bold text-foreground mb-6 gradient-text">
          Dashboard
        </h1>
        
        <div ref={nextExamRef} className={cn("transition-all duration-700 opacity-0", isNextExamInView && "animate-fade-in-from-bottom opacity-100")}>
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
                <Button className="transition-all duration-300 bg-primary-foreground text-primary border-2 border-primary-foreground hover:bg-transparent hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20" onClick={() => router.push('/exams')}>Add Exam</Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div ref={syllabusRef} className={cn("transition-all duration-700 opacity-0", isSyllabusInView && "animate-fade-in-from-left opacity-100")}>
            <SyllabusProgressOverview subjects={subjects} />
          </div>
          <div ref={examOverviewRef} className={cn("transition-all duration-700 opacity-0", isExamOverviewInView && "animate-fade-in-from-right opacity-100")}>
            <ExamOverview exams={exams} />
          </div>
        </div>

        <div ref={analyticsRef} className={cn("mt-8 transition-all duration-700 opacity-0", isAnalyticsInView && "animate-fade-in-from-bottom opacity-100")}>
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold">Custom Analytics</CardTitle>
                            <CardDescription>Analyze your study habits over a specific period.</CardDescription>
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-full sm:w-[300px] justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardHeader>
                <CardContent>
                    {dateRange?.from && dateRange?.to ? (
                        <TaskAnalyticsChart tasks={tasks} dateRange={dateRange} viewType="weekly" />
                    ) : (
                        <div className="flex items-center justify-center h-80 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">Please select a date range to view analytics.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
