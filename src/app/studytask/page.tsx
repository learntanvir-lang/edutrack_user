
"use client";

import { useState, useMemo, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { AppDataContext } from '@/context/AppDataContext';
import { Plus, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { format, startOfToday, isBefore } from 'date-fns';
import { TaskList } from '@/components/edutrack/task/TaskList';
import { TaskDialog } from '@/components/edutrack/task/TaskDialog';
import { CalendarView } from '@/components/edutrack/task/CalendarView';
import { TaskProgressCard } from '@/components/edutrack/task/TaskProgressCard';
import { OverdueTasks } from '@/components/edutrack/task/OverdueTasks';

export default function StudyTaskPage() {
  const { tasks } = useContext(AppDataContext);
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  
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
    const overdueTasks = allTasks.filter(task => isBefore(new Date(task.date), today) && !task.isCompleted);
    return { todaysTasks, overdueTasks };
  }, [tasks, selectedDateStr]);


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
          
          {/* Left Column */}
          <aside className="lg:col-span-1 space-y-6">
            <TaskProgressCard tasks={todaysTasks} />
            <CalendarView selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          </aside>

          {/* Right Column */}
          <main className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-foreground">
                      {format(selectedDate, "MMMM do, yyyy")}
                  </h1>
                  <Button size="lg" onClick={() => setIsTaskDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
              </div>
              
              <div className="space-y-8">
                  <OverdueTasks tasks={overdueTasks} />

                  <div className="p-6 bg-card rounded-lg border shadow-sm">
                      <TaskList tasks={todaysTasks} />
                  </div>
              </div>
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
