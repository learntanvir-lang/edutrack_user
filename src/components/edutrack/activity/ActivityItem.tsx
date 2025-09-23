"use client";

import { useState, useContext } from "react";
import { Activity } from "@/lib/types";
import { AppDataContext } from "@/context/AppDataContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { GripVertical, Link as LinkIcon, Minus, MoreHorizontal, Pen, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityDialog } from "./ActivityDialog";
import { Progress } from "@/components/ui/progress";

interface ActivityItemProps {
  activity: Activity;
  subjectId: string;
  paperId: string;
  chapterId: string;
}

export function ActivityItem({ activity, subjectId, paperId, chapterId }: ActivityItemProps) {
  const { dispatch } = useContext(AppDataContext);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleToggle = (checked: boolean) => {
    dispatch({
      type: "UPDATE_ACTIVITY",
      payload: { subjectId, paperId, chapterId, activity: { ...activity, completed: checked } },
    });
  };

  const handleCounterChange = (amount: number) => {
    const newCount = Math.max(0, (activity.count || 0) + amount);
    dispatch({
      type: "UPDATE_ACTIVITY",
      payload: { subjectId, paperId, chapterId, activity: { ...activity, count: newCount } },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this activity?")) {
      dispatch({
        type: "DELETE_ACTIVITY",
        payload: { subjectId, paperId, chapterId, activityId: activity.id },
      });
    }
  };

  const renderActivityContent = () => {
    switch (activity.type) {
      case "checkbox":
        return (
          <div className="flex items-center space-x-3">
            <Checkbox
              id={activity.id}
              checked={activity.completed}
              onCheckedChange={handleToggle}
              aria-labelledby={`label-${activity.id}`}
            />
            <label
              id={`label-${activity.id}`}
              htmlFor={activity.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {activity.title}
            </label>
          </div>
        );
      case "counter":
        const progress = ((activity.count || 0) / (activity.target || 1)) * 100;
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{activity.title}</span>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">{activity.count || 0} / {activity.target || '∞'}</span>
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleCounterChange(-1)}><Minus className="h-4 w-4"/></Button>
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleCounterChange(1)}><Plus className="h-4 w-4"/></Button>
                </div>
            </div>
            {activity.target && <Progress value={progress} className="h-2" />}
          </div>
        );
      case "link":
        return (
            <a href={activity.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between group">
                <span className="text-sm font-medium group-hover:text-primary transition-colors">{activity.title}</span>
                <LinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-md bg-background hover:bg-muted/50 transition-colors">
      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
      <div className="flex-1">{renderActivityContent()}</div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Pen className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ActivityDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          subjectId={subjectId}
          paperId={paperId}
          chapterId={chapterId}
          activity={activity}
        />
      </div>
    </div>
  );
}
