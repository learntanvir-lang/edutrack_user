
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StudyTask, TimeLog } from "@/lib/types";
import { useContext, useEffect } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, set } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const timeLogSchema = z.object({
    startDate: z.date(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
    endDate: z.date(),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
}).refine(data => {
    const start = set(data.startDate, { hours: parseInt(data.startTime.split(':')[0]), minutes: parseInt(data.startTime.split(':')[1]) });
    const end = set(data.endDate, { hours: parseInt(data.endTime.split(':')[0]), minutes: parseInt(data.endTime.split(':')[1]) });
    return end > start;
}, {
    message: "End time must be after start time.",
    path: ["endTime"],
});

type TimeLogFormValues = z.infer<typeof timeLogSchema>;

interface TimeLogEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: StudyTask;
  log?: TimeLog;
}

export function TimeLogEntryDialog({ open, onOpenChange, task, log }: TimeLogEntryDialogProps) {
    const { dispatch } = useContext(AppDataContext);
    const isEditing = !!log;

    const form = useForm<TimeLogFormValues>({
        resolver: zodResolver(timeLogSchema),
        defaultValues: {
            startDate: new Date(),
            startTime: format(new Date(), "HH:mm"),
            endDate: new Date(),
            endTime: format(new Date(), "HH:mm"),
        }
    });

    useEffect(() => {
        if (open) {
            if (isEditing && log) {
                const startDate = new Date(log.startTime);
                const endDate = log.endTime ? new Date(log.endTime) : new Date();
                form.reset({
                    startDate: startDate,
                    startTime: format(startDate, "HH:mm"),
                    endDate: endDate,
                    endTime: format(endDate, "HH:mm"),
                });
            } else {
                form.reset({
                    startDate: new Date(),
                    startTime: format(new Date(), "HH:mm"),
                    endDate: new Date(),
                    endTime: format(new Date(), "HH:mm"),
                });
            }
        }
    }, [log, open, form, isEditing]);

    const onSubmit = (values: TimeLogFormValues) => {
        const [startHours, startMinutes] = values.startTime.split(':').map(Number);
        const startTime = set(values.startDate, { hours: startHours, minutes: startMinutes }).toISOString();
        
        const [endHours, endMinutes] = values.endTime.split(':').map(Number);
        const endTime = set(values.endDate, { hours: endHours, minutes: endMinutes }).toISOString();

        const timeLog: TimeLog = {
            id: log?.id || uuidv4(),
            startTime,
            endTime,
        };

        dispatch({
            type: isEditing ? "UPDATE_TIME_LOG" : "ADD_TIME_LOG",
            payload: { taskId: task.id, log: timeLog }
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Time Log Entry" : "Add Time Log Entry"}</DialogTitle>
                    <DialogDescription>Manually record a study session for "{task.title}".</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Start Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>End Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit">{isEditing ? "Save Changes" : "Add Entry"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

