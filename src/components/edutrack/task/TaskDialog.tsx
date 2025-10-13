
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
import { StudyTask } from "@/lib/types";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppDataContext } from '@/context/AppDataContext';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ColorPicker } from "./ColorPicker";
import { TaskIconPicker, IconName } from "./TaskIconPicker";


const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.date({ required_error: "Due date is required" }),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string; // YYYY-MM-DD for pre-selection
  task?: StudyTask;
}

export function TaskDialog({ open, onOpenChange, date, task }: TaskDialogProps) {
  const { dispatch } = useContext(AppDataContext);
  const isEditing = !!task;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(date),
      startTime: "",
      endTime: "",
      color: "",
      icon: "",
      category: "General",
      subcategory: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && task) {
        form.reset({
          title: task.title,
          description: task.description || "",
          date: new Date(task.date),
          startTime: task.startTime || "",
          endTime: task.endTime || "",
          color: task.color || "",
          icon: task.icon || "",
          category: task.category,
          subcategory: task.subcategory || "",
        });
      } else {
        form.reset({
          title: "",
          description: "",
          date: new Date(date),
          startTime: "",
          endTime: "",
          color: "#64B5F6", // Default to primary color
          icon: "Book",
          category: "General",
          subcategory: "",
        });
      }
    }
  }, [task, open, form, isEditing, date]);


  const onSubmit = (values: TaskFormValues) => {
    const taskData: StudyTask = {
      id: task?.id || uuidv4(),
      title: values.title,
      description: values.description || null,
      isCompleted: task?.isCompleted || false,
      date: format(values.date, "yyyy-MM-dd"),
      startTime: values.startTime || null,
      endTime: values.endTime || null,
      color: values.color || null,
      icon: values.icon || null,
      priority: task?.priority || 1,
      category: values.category,
      subcategory: values.subcategory || null,
      timeLogs: task?.timeLogs || [],
      activeTimeLogId: task?.activeTimeLogId || null,
    };

    dispatch({
      type: isEditing ? "UPDATE_TASK" : "ADD_TASK",
      payload: taskData,
    });
    onOpenChange(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
      onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for this task." : "Add a new task to your study plan."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-6 -mr-6">
            <Form {...form}>
              <form id="task-form" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Review Chapter 5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Add more details about the task..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value ? (
                                    format(field.value, "PPP")
                                    ) : (
                                    <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                />
                            </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time (Optional)</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time (Optional)</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Physics" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="subcategory"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subcategory (Optional)</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Practice Problems" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                   </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <FormControl>
                                        <ColorPicker value={field.value || ""} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Icon</FormLabel>
                                    <FormControl>
                                       <TaskIconPicker value={field.value as IconName} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
              </form>
            </Form>
        </ScrollArea>
        </div>
        <DialogFooter className="pt-4 border-t flex-shrink-0">
          <Button onClick={form.handleSubmit(onSubmit)} form="task-form">{isEditing ? "Save Changes" : "Add Task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
