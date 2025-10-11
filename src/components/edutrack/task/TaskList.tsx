
"use client";

import { StudyTask } from "@/lib/types";
import { TaskItem } from "./TaskItem";
import { Separator } from "@/components/ui/separator";

interface TaskListProps {
  tasks: StudyTask[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-16">
        <h3 className="font-semibold text-lg">No tasks for this day</h3>
        <p className="text-sm">Enjoy your free time!</p>
      </div>
    );
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isCompleted === b.isCompleted) return 0;
    return a.isCompleted ? 1 : -1;
  });

  return (
    <div className="space-y-1">
      <Separator className="mb-4" />
      {sortedTasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
