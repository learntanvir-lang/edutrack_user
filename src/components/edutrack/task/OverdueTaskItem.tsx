
"use client";

import { useContext } from 'react';
import { StudyTask } from "@/lib/types";
import { AppDataContext } from '@/context/AppDataContext';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

interface OverdueTaskItemProps {
  task: StudyTask;
}

export function OverdueTaskItem({ task }: OverdueTaskItemProps) {
  const { dispatch } = useContext(AppDataContext);

  const handleMoveToToday = () => {
    dispatch({ type: 'DUPLICATE_TASK_TO_TODAY', payload: { id: task.id } });
  };
  
  const overdueDuration = formatDistanceToNowStrict(new Date(task.date), { addSuffix: true });

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
      <div>
        <p className="font-semibold text-foreground">{task.title}</p>
        <p className="text-sm text-muted-foreground">Overdue by {overdueDuration}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleMoveToToday}
      >
        <Calendar className="mr-2 h-4 w-4" />
        Continue Today
      </Button>
    </div>
  );
}
