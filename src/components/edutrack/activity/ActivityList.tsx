import { Activity } from "@/lib/types";
import { ActivityItem } from "./ActivityItem";

interface ActivityListProps {
  activities: Activity[];
  subjectId: string;
  paperId: string;
  chapterId: string;
}

export function ActivityList({ activities, subjectId, paperId, chapterId }: ActivityListProps) {
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
        <ActivityItem
          key={activity.id}
          activity={activity}
          subjectId={subjectId}
          paperId={paperId}
          chapterId={chapterId}
        />
      ))}
    </div>
  );
}
