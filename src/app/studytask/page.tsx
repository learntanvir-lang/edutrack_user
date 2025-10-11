
"use client";

import { useState, useContext, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AppDataContext } from '@/context/AppDataContext';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { TaskList } from '@/components/edutrack/task/TaskList';
import { AddTaskForm } from '@/components/edutrack/task/AddTaskForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudyTaskPage() {
  const { tasks, dispatch } = useContext(AppDataContext);
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else if (!user.emailVerified) {
        router.push('/verify-email');
      }
    }
  }, [user, isUserLoading, router]);

  const todaysTasks = useMemo(() => {
    return tasks.filter(task => task.date === today);
  }, [tasks, today]);

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
          Today's Study Tasks
        </h1>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>
                    {format(new Date(), "eeee, MMMM do")}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <AddTaskForm date={today} />
                <TaskList tasks={todaysTasks} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
