
"use client";

import { useState, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { StudyTask, TimeLog } from "@/lib/types";
import { format } from "date-fns";
import { Clock, PlusCircle, MoreVertical, Edit, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TimeLogEntryDialog } from "./TimeLogEntryDialog";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";
import { formatDuration } from "@/lib/utils";
import { AppDataContext } from "@/context/AppDataContext";


interface TimeLogDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: StudyTask;
}

export function TimeLogDetailsDialog({ open, onOpenChange, task }: TimeLogDetailsDialogProps) {
    const { dispatch } = useContext(AppDataContext);
    const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<TimeLog | undefined>(undefined);
    const [deletingLog, setDeletingLog] = useState<TimeLog | null>(null);

    const sortedLogs = [...(task.timeLogs || [])].sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    
    const handleAddLog = () => {
        setEditingLog(undefined);
        setIsEntryDialogOpen(true);
    };

    const handleEditLog = (log: TimeLog) => {
        setEditingLog(log);
        setIsEntryDialogOpen(true);
    };
    
    const handleDeleteLog = () => {
        if (deletingLog) {
            dispatch({
                type: 'DELETE_TIME_LOG',
                payload: { taskId: task.id, logId: deletingLog.id }
            });
            setDeletingLog(null);
        }
    };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl flex flex-col">
        <DialogHeader>
          <DialogTitle>Time Log Details</DialogTitle>
          <DialogDescription>
            A detailed breakdown of all study sessions for "{task.title}".
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto -mx-6 px-6">
          <ScrollArea className="h-full">
            {sortedLogs.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedLogs.map((log) => {
                        const start = new Date(log.startTime);
                        const end = log.endTime ? new Date(log.endTime) : new Date();
                        const duration = log.endTime ? formatDuration(end.getTime() - start.getTime()) : 'In progress';

                        return (
                            <TableRow key={log.id}>
                                <TableCell>{format(start, 'd MMM, yyyy')}</TableCell>
                                <TableCell className="font-mono">{format(start, 'h:mm a')} - {log.endTime ? format(end, 'h:mm a') : 'now'}</TableCell>
                                <TableCell className="font-mono">{duration}</TableCell>
                                <TableCell className="text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditLog(log)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setDeletingLog(log)} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-10 h-full">
                <Clock className="h-10 w-10 mb-4" />
                <h3 className="font-semibold text-lg">No Time Logs</h3>
                <p className="text-sm">Start the timer or add a record to log your sessions.</p>
            </div>
            )}
        </ScrollArea>
        </div>
        <DialogFooter className="pt-4 border-t flex-shrink-0">
            <Button 
                onClick={handleAddLog} 
                className="font-bold transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20"
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Record
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <TimeLogEntryDialog 
        open={isEntryDialogOpen}
        onOpenChange={setIsEntryDialogOpen}
        task={task}
        log={editingLog}
    />

    {deletingLog && (
        <DeleteConfirmationDialog 
            open={!!deletingLog}
            onOpenChange={() => setDeletingLog(null)}
            onConfirm={handleDeleteLog}
            itemName="this time log"
            itemType="entry"
        />
    )}
    </>
  );
}
