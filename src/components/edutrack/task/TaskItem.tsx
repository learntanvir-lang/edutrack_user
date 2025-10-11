
"use client";

import { useContext } from 'react';
import { StudyTask } from "@/lib/types";
import { AppDataContext } from '@/context/AppDataContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: StudyTask;
}

export function TaskItem({ task }: TaskItemProps) {
  const { dispatch } = useContext(AppDataContext);

  const handleToggle = () => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { ...task, isCompleted: !task.isCompleted },
    });
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: { id: task.id } });
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors group">
      <Checkbox
        id={`task-${task.id}`}
        checked={task.isCompleted}
        onCheckedChange={handleToggle}
      />
      <label
        htmlFor={`task-${task.id}`}
        className={cn(
          "flex-1 text-sm font-medium cursor-pointer",
          task.isCompleted ? "text-muted-foreground line-through" : "text-foreground"
        )}
      >
        {task.title}
      </label>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete task</span>
      </Button>
    </div>
  );
}
