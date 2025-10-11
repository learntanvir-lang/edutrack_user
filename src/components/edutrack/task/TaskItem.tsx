
"use client";

import { useContext, useState, useEffect } from 'react';
import { StudyTask } from "@/lib/types";
import { AppDataContext } from '@/context/AppDataContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TaskDialog } from './TaskDialog';
import { format, formatDistanceToNowStrict } from 'date-fns';

interface TaskItemProps {
  task: StudyTask;
}

export function TaskItem({ task }: TaskItemProps) {
  const { dispatch } = useContext(AppDataContext);
  const [isEditing, setIsEditing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(task.timeSpent);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (task.isTimerRunning && task.timerStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const start = new Date(task.timerStartTime!);
        const newElapsedTime = task.timeSpent + Math.floor((now.getTime() - start.getTime()) / 1000);
        setElapsedTime(newElapsedTime);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [task.isTimerRunning, task.timerStartTime, task.timeSpent]);
  
  useEffect(() => {
    setElapsedTime(task.timeSpent);
  }, [task.timeSpent]);

  const handleToggle = () => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { ...task, isCompleted: !task.isCompleted },
    });
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: { id: task.id } });
  };
  
  const handleTimerToggle = () => {
    if (task.isTimerRunning) {
      // Stop timer
      const now = new Date();
      const start = new Date(task.timerStartTime!);
      const newTimeSpent = task.timeSpent + Math.floor((now.getTime() - start.getTime()) / 1000);
      const { timerStartTime, ...taskWithoutStartTime } = task;

      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          ...taskWithoutStartTime,
          isTimerRunning: false,
          timeSpent: newTimeSpent,
        },
      });
    } else {
      // Start timer
      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          ...task,
          isTimerRunning: true,
          timerStartTime: new Date().toISOString(),
        },
      });
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return "bg-red-500";
    if (priority === 2) return "bg-yellow-500";
    if (priority >= 3) return "bg-blue-500";
    return "bg-gray-400";
  }
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
    <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors group">
      <div 
        className={cn("w-2 h-10 rounded-l-md", getPriorityColor(task.priority))}
        title={`Priority: ${task.priority}`}
      />
      <Checkbox
        id={`task-${task.id}`}
        checked={task.isCompleted}
        onCheckedChange={handleToggle}
        className="w-5 h-5"
      />
      <div className="flex-1" onClick={() => setIsEditing(true)}>
        <p
            className={cn(
            "font-medium cursor-pointer",
            task.isCompleted ? "text-muted-foreground line-through" : "text-foreground"
            )}
        >
            {task.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {format(new Date(task.date), 'MMM dd')}
            <Badge variant="outline">{task.category}</Badge>
            {task.subcategory && <Badge variant="outline">{task.subcategory}</Badge>}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-foreground w-24 text-center">{formatTime(elapsedTime)}</span>
        <Button
            variant={task.isTimerRunning ? 'destructive' : 'outline'}
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary transition-all"
            onClick={handleTimerToggle}
        >
            {task.isTimerRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="sr-only">{task.isTimerRunning ? 'Stop timer' : 'Start timer'}</span>
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsEditing(true)}
      >
        <Edit className="h-4 w-4" />
        <span className="sr-only">Edit task</span>
      </Button>
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
    <TaskDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        task={task}
        date={task.date}
    />
    </>
  );
}
