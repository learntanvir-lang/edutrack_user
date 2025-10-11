
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StudyTask, TimeLog } from "@/lib/types";
import { format, formatDistanceStrict } from "date-fns";
import { Clock, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface TimeLogDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: StudyTask;
}

export function TimeLogDetailsDialog({ open, onOpenChange, task }: TimeLogDetailsDialogProps) {
    
    const formatLogEntry = (log: TimeLog) => {
        const start = new Date(log.startTime);
        const end = log.endTime ? new Date(log.endTime) : new Date();

        const formattedStart = format(start, "d MMM, yyyy h:mm a");
        const formattedEnd = log.endTime ? format(end, "h:mm a") : "now";

        const duration = formatDistanceStrict(end, start);
        
        return `${formattedStart} - ${formattedEnd} (${duration})`;
    };

    const sortedLogs = [...(task.timeLogs || [])].sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Time Log Details</DialogTitle>
          <DialogDescription>
            A detailed breakdown of all study sessions for "{task.title}".
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden -mx-6 px-6">
            <ScrollArea className="h-full pr-6 -mr-6">
                {sortedLogs.length > 0 ? (
                <div className="space-y-4">
                    {sortedLogs.map((log, index) => (
                    <div key={log.id} className="text-sm">
                        <div className="flex items-center gap-3 text-foreground">
                            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="font-mono">{formatLogEntry(log)}</span>
                        </div>
                        {log.id === task.activeTimeLogId && (
                           <div className="pl-7 text-xs text-green-600 font-semibold animate-pulse">
                                Session in progress...
                            </div>
                        )}
                    </div>
                    ))}
                </div>
                ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-10">
                    <Clock className="h-10 w-10 mb-4" />
                    <h3 className="font-semibold text-lg">No Time Logs</h3>
                    <p className="text-sm">Start the timer on this task to begin logging your sessions.</p>
                </div>
                )}
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
