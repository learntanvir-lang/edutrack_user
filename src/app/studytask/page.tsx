
"use client";

import { useState, useMemo, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { AppDataContext } from '@/context/AppDataContext';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { format, startOfToday, isBefore, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { TaskList } from '@/components/edutrack/task/TaskList';
import { TaskDialog } from '@/components/edutrack/task/TaskDialog';
import { CalendarView } from '@/components/edutrack/task/CalendarView';
import { TaskProgressCard } from '@/components/edutrack/task/TaskProgressCard';
import { OverdueTasks } from '@/components/edutrack/task/OverdueTasks';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TaskAnalyticsChart } from '@/components/edutrack/task/TaskAnalyticsChart';
import type { DateRange } from 'react-day-picker';
import { WeeklyTargetCard } from '@/components/edutrack/task/WeeklyTargetCard';

export type ViewType = 'daily' | 'weekly' | 'monthly';

export default function StudyTaskPage() {
  const { tasks } = useContext(AppDataContext);
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('daily');
  
  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else if (!user.emailVerified) {
        router.push('/verify-email');
      }
    }
  }, [user, isUserLoading, router]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  const { todaysTasks, overdueTasks } = useMemo(() => {
    const today = startOfToday();
    const allTasks = tasks;
    const todaysTasks = allTasks.filter(task => format(new Date(task.date), 'yyyy-MM-dd') === selectedDateStr);
    const overdueTasks = allTasks.filter(task => isBefore(new Date(task.date), today) && !task.isCompleted && !task.isArchived);
    return { todaysTasks, overdueTasks };
  }, [tasks, selectedDateStr]);
  
  const chartDateRange = useMemo((): DateRange => {
    const date = selectedDate || new Date();
    switch (activeView) {
        case 'weekly':
            return { from: startOfWeek(date, { weekStartsOn: 1 }), to: endOfWeek(date, { weekStartsOn: 1 }) };
        case 'monthly':
            return { from: startOfMonth(date), to: endOfMonth(date) };
        default:
             return { from: startOfWeek(date, { weekStartsOn: 1 }), to: endOfWeek(date, { weekStartsOn: 1 }) };
    }
  }, [activeView, selectedDate]);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <aside className="lg:col-span-1 space-y-6 animate-fade-in-from-left">
                <TaskProgressCard tasks={todaysTasks} />
                <WeeklyTargetCard tasks={tasks} />
                <CalendarView selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </aside>
            <main className="lg:col-span-2 animate-fade-in-from-right">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-foreground">
                        {format(selectedDate, "MMMM do, yyyy")}
                    </h1>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <Button size="lg" onClick={() => setIsTaskDialogOpen(true)} className="font-bold transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Task
                        </Button>
                        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ViewType)}>
                            <TabsList className="bg-primary/10 rounded-lg">
                                <TabsTrigger value="daily" className="text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md rounded-md">Daily</TabsTrigger>
                                <TabsTrigger value="weekly" className="text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md rounded-md">Weekly</TabsTrigger>
                                <TabsTrigger value="monthly" className="text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md rounded-md">Monthly</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                 <Tabs value={activeView}>
                    <TabsContent value="daily">
                        <div className="space-y-8">
                            <OverdueTasks tasks={overdueTasks} />
                            <div className="p-6 bg-card rounded-lg border shadow-sm">
                                <TaskList tasks={todaysTasks} />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="weekly">
                        <TaskAnalyticsChart tasks={tasks} dateRange={chartDateRange} viewType={activeView} />
                    </TabsContent>
                    <TabsContent value="monthly">
                        <TaskAnalyticsChart tasks={tasks} dateRange={chartDateRange} viewType={activeView} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
      </div>
      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        date={selectedDateStr}
      />
    </>
  );
}
