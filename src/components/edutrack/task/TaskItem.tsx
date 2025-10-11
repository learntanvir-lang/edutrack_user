
"use client";

import { useContext, useState } from 'react';
import { StudyTask } from "@/lib/types";
import { AppDataContext } from '@/context/AppDataContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TaskDialog } from './TaskDialog';
import { format } from 'date-fns';

interface TaskItemProps {
  task: StudyTask;
}

export function TaskItem({ task }: TaskItemProps) {
  const { dispatch } = useContext(AppDataContext);
  const [isEditing, setIsEditing] = useState(false);

  const handleToggle = () => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { ...task, isCompleted: !task.isCompleted },
    });
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: { id: task.id } });
  };

  const priorityColors = {
    High: "bg-red-500",
    Medium: "bg-yellow-500",
    Low: "bg-blue-500",
  };

  return (
    <>
    <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors group">
      <div 
        className={cn("w-2 h-10 rounded-l-md", priorityColors[task.priority])}
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
