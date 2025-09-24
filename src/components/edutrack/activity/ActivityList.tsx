
"use client";

import { useState, DragEvent } from "react";
import { Activity } from "@/lib/types";
import { ActivityItem } from "./ActivityItem";
import { useContext } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { cn } from "@/lib/utils";


interface ActivityListProps {
  activities: Activity[];
  subjectId: string;
  paperId: string;
  chapterId: string;
}

export function ActivityList({ activities, subjectId, paperId, chapterId }: ActivityListProps) {
  const { dispatch } = useContext(AppDataContext);

  const [draggedItem, setDraggedItem] = useState<Activity | null>(null);
  const [dragOverItem, setDragOverItem] = useState<Activity | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, activity: Activity) => {
    setDraggedItem(activity);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>, activity: Activity) => {
    e.preventDefault();
    if(draggedItem?.id === activity.id) return;
    setDragOverItem(activity);
  };
  
  const handleDragEnd = () => {
    if (draggedItem && dragOverItem && draggedItem.id !== dragOverItem.id) {
      const startIndex = activities.findIndex(c => c.id === draggedItem.id);
      const endIndex = activities.findIndex(c => c.id === dragOverItem.id);
      
      if (startIndex !== -1 && endIndex !== -1) {
        dispatch({
          type: "REORDER_ACTIVITIES",
          payload: {
            subjectId,
            paperId,
            chapterId,
            startIndex: startIndex,
            endIndex: endIndex,
          },
        });
      }
    }
    setDraggedItem(null);
    setDragOverItem(null);
  };


  if (activities.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        No activities in this chapter yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div
          key={activity.id}
          draggable
          onDragStart={(e) => handleDragStart(e, activity)}
          onDragOver={(e) => handleDragOver(e, activity)}
          onDragEnd={handleDragEnd}
          onDragLeave={() => setDragOverItem(null)}
          className={cn(
            "transition-all",
            draggedItem?.id === activity.id && "opacity-50",
            dragOverItem?.id === activity.id && "bg-accent/50"
          )}
        >
          <ActivityItem
            activity={activity}
            subjectId={subjectId}
            paperId={paperId}
            chapterId={chapterId}
          />
        </div>
      ))}
    </div>
  );
}
