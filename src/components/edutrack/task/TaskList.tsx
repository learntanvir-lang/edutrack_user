
"use client";

import { StudyTask } from "@/lib/types";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  tasks: StudyTask[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>No tasks for today. Add one to get started!</p>
      </div>
    );
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isCompleted === b.isCompleted) return 0;
    return a.isCompleted ? 1 : -1;
  });

  return (
    <div className="space-y-2">
      {sortedTasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
