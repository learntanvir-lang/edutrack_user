
"use client";

import { useContext, useState, useEffect } from 'react';
import { StudyTask } from "@/lib/types";
import { AppDataContext } from '@/context/AppDataContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Play, Square, MoreVertical, Calendar, Flag, Tag, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TaskDialog } from './TaskDialog';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
    
    return parts.join(' ');
  };

  return (
    <>
    <div className={cn(
        "flex items-start gap-4 p-4 rounded-lg bg-card border transition-all duration-300",
        task.isCompleted ? "border-green-200" : "border-primary/50",
        "shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1"
      )}>
      <Checkbox
        id={`task-${task.id}`}
        checked={task.isCompleted}
        onCheckedChange={handleToggle}
        className="w-5 h-5 mt-1"
      />
      <div className="flex-1 space-y-3">
        <div>
            <p
                className={cn(
                "font-bold text-base cursor-pointer",
                task.isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                )}
                 onClick={() => setIsEditing(true)}
            >
                {task.title}
            </p>
            {task.description && (
                <p className={cn(
                    "text-sm text-muted-foreground",
                    task.isCompleted && "line-through"
                )}>
                    {task.description}
                </p>
            )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {format(new Date(task.date), 'MMM dd')}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5">
                <Flag className="h-3 w-3" />
                Priority: {task.priority}
            </Badge>
             <Badge variant="secondary" className="flex items-center gap-1.5">
                <Tag className="h-3 w-3" />
                {task.category}
            </Badge>
            {task.subcategory && <Badge variant="secondary" className="flex items-center gap-1.5">{task.subcategory}</Badge>}
            <Badge variant="outline" className="flex items-center gap-1.5 font-mono">
                <Clock className="h-3 w-3" />
                {formatTime(elapsedTime)}
            </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
            variant={task.isTimerRunning ? 'destructive' : 'outline'}
            size="icon"
            className="h-8 w-8 text-foreground"
            onClick={handleTimerToggle}
        >
            {task.isTimerRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="sr-only">{task.isTimerRunning ? 'Stop timer' : 'Start timer'}</span>
        </Button>
         <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Task options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                  </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
      </div>
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
