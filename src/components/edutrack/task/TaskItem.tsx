
"use client";

import { useContext, useState, useEffect, useMemo } from 'react';
import { StudyTask, TimeLog } from "@/lib/types";
import { AppDataContext } from '@/context/AppDataContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Play, Square, MoreVertical, Calendar, Flag, Tag, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TaskDialog } from './TaskDialog';
import { format, isBefore, startOfToday } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { v4 as uuidv4 } from 'uuid';
import { TimeLogDetailsDialog } from './TimeLogDetailsDialog';


interface TaskItemProps {
  task: StudyTask;
}

export function TaskItem({ task }: TaskItemProps) {
  const { dispatch } = useContext(AppDataContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isTimeLogOpen, setIsTimeLogOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  const activeLog = useMemo(() => {
    if (!task.activeTimeLogId || !task.timeLogs) return null;
    return task.timeLogs.find(log => log.id === task.activeTimeLogId);
  }, [task.activeTimeLogId, task.timeLogs]);
  
  const isOverdue = useMemo(() => {
    return isBefore(new Date(task.date), startOfToday()) && !task.isCompleted;
  }, [task.date, task.isCompleted]);


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeLog) {
      interval = setInterval(() => {
        setNow(new Date());
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeLog]);

  const totalTimeSpent = useMemo(() => {
    if (!task.timeLogs) return 0;
    return task.timeLogs.reduce((acc, log) => {
        if (log.id === task.activeTimeLogId) {
            // This is the currently running log
             return acc + (now.getTime() - new Date(log.startTime).getTime());
        }
        if (log.endTime) {
            return acc + (new Date(log.endTime).getTime() - new Date(log.startTime).getTime());
        }
        return acc;
    }, 0);
  }, [task.timeLogs, task.activeTimeLogId, now]);


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
    if (task.activeTimeLogId) {
      // Stop timer
      const now = new Date().toISOString();
      const updatedLogs = (task.timeLogs || []).map(log => 
        log.id === task.activeTimeLogId ? { ...log, endTime: now } : log
      );

      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          ...task,
          timeLogs: updatedLogs,
          activeTimeLogId: null,
        },
      });
    } else {
      // Start timer
      const newLog: TimeLog = {
        id: uuidv4(),
        startTime: new Date().toISOString(),
        endTime: '', // No end time yet
      };
      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          ...task,
          timeLogs: [...(task.timeLogs || []), newLog],
          activeTimeLogId: newLog.id,
        },
      });
    }
  };
  
    const formatTime = (totalMilliseconds: number) => {
        if (totalMilliseconds < 1000) return '0s';

        const hours = Math.floor(totalMilliseconds / 3600000);
        const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
        const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
        
        let parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0) parts.push(`${seconds}s`);

        return parts.join(' ') || '0s';
  };

  return (
    <>
    <div className={cn(
        "flex items-start gap-4 p-4 rounded-lg border transition-all duration-300",
        task.isCompleted 
            ? "bg-muted/30 border-dashed" 
            : "bg-card hover:shadow-lg",
        isOverdue && "border-red-500/50 shadow-md shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20"
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
                    "text-sm",
                    task.isCompleted ? "text-muted-foreground/80 line-through" : "text-muted-foreground"
                )}>
                    {task.description}
                </p>
            )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn(
                "flex items-center gap-1.5",
                isOverdue ? "border-red-500 text-red-500" : "border-primary",
                task.isCompleted && "border-muted-foreground/50 text-muted-foreground"
            )}>
                <Calendar className="h-3 w-3" />
                {format(new Date(task.date), 'MMM dd')}
            </Badge>
            <Badge variant="outline" className={cn("flex items-center gap-1.5 border-primary", task.isCompleted && "border-muted-foreground/50 text-muted-foreground")}>
                <Flag className="h-3 w-3" />
                Priority: {task.priority}
            </Badge>
             <Badge variant="secondary" className={cn("flex items-center gap-1.5", task.isCompleted && "bg-muted text-muted-foreground")}>
                <Tag className="h-3 w-3" />
                {task.category}
            </Badge>
            {task.subcategory && <Badge variant="secondary" className={cn("flex items-center gap-1.5", task.isCompleted && "bg-muted text-muted-foreground")}>{task.subcategory}</Badge>}
            
            <button onClick={() => setIsTimeLogOpen(true)} className="disabled:opacity-50" disabled={!task.timeLogs || task.timeLogs.length === 0}>
                <Badge variant="outline" className={cn("flex items-center gap-1.5 font-mono cursor-pointer transition-colors border-primary", task.isCompleted ? "border-muted-foreground/50 text-muted-foreground" : "hover:bg-primary/10")}>
                    <Clock className="h-3 w-3" />
                    {formatTime(totalTimeSpent)}
                </Badge>
            </button>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {!task.isCompleted && (
            <Button
                variant={task.activeTimeLogId ? 'destructive' : 'outline'}
                size="icon"
                className="h-8 w-8 text-foreground"
                onClick={handleTimerToggle}
            >
                {task.activeTimeLogId ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span className="sr-only">{task.activeTimeLogId ? 'Stop timer' : 'Start timer'}</span>
            </Button>
        )}
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
    <TimeLogDetailsDialog
        open={isTimeLogOpen}
        onOpenChange={setIsTimeLogOpen}
        task={task}
    />
    </>
  );
}
