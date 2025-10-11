
"use client";

import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { ProgressItem, TodoItem } from "@/lib/types";
import { useContext, useEffect, useState } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const progressItemSchema = z.object({
  name: z.string().min(1, "Tracker name is required"),
  type: z.enum(["counter", "todolist"]),
  total: z.coerce.number().min(1, "Must be at least 1").optional(),
  todos: z.array(z.object({
      id: z.string(),
      text: z.string().min(1, "To-do text cannot be empty"),
      completed: z.boolean(),
  })).optional()
});

type ProgressItemFormValues = z.infer<typeof progressItemSchema>;

interface ProgressItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  paperId: string;
  chapterId: string;
  progressItem?: ProgressItem;
}

export function ProgressItemDialog({ open, onOpenChange, subjectId, paperId, chapterId, progressItem }: ProgressItemDialogProps) {
  const { dispatch } = useContext(AppDataContext);
  const isEditing = !!progressItem;

  const form = useForm<ProgressItemFormValues>({
    resolver: zodResolver(progressItemSchema),
    defaultValues: {
      name: "",
      type: "counter",
      total: 10,
      todos: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "todos",
  });

  const watchType = form.watch("type");

  useEffect(() => {
    if (progressItem && open) {
      form.reset({
        name: progressItem.name,
        type: progressItem.type,
        total: progressItem.total,
        todos: progressItem.todos || [],
      });
    } else if (!isEditing && open) {
      form.reset({
        name: "",
        type: "counter",
        total: 10,
        todos: [],
      });
    }
  }, [progressItem, open, form, isEditing]);

  const onSubmit = (values: ProgressItemFormValues) => {
    const progressItemData: ProgressItem = {
      id: progressItem?.id || uuidv4(),
      name: values.name,
      type: values.type,
      completed: progressItem?.completed || 0,
      total: values.type === 'counter' ? values.total || 0 : 0,
      todos: values.type === 'todolist' ? values.todos || [] : [],
    };

    dispatch({
      type: isEditing ? "UPDATE_PROGRESS_ITEM" : "ADD_PROGRESS_ITEM",
      payload: { subjectId, paperId, chapterId, progressItem: progressItemData },
    });
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  const handleAddTodo = () => {
      append({ id: uuidv4(), text: '', completed: false });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Progress Tracker" : "Add New Progress Tracker"}</DialogTitle>
          <DialogDescription>Track your progress for this chapter.</DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-6 -mr-6">
            <Form {...form}>
              <form id="progress-item-form" className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracker Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Practice Problems" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tracker Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditing}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a tracker type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="counter">Counter</SelectItem>
                                    <SelectItem value="todolist">To-do list</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {watchType === "counter" && (
                    <FormField
                        control={form.control}
                        name="total"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Count</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="e.g., 50" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                
                {watchType === "todolist" && (
                    <div className="space-y-4">
                        <FormLabel>To-do Items</FormLabel>
                        <div className="space-y-2">
                        {fields.map((field, index) => (
                            <FormField
                                key={field.id}
                                control={form.control}
                                name={`todos.${index}.text`}
                                render={({ field: todoField }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormControl>
                                                <Input {...todoField} placeholder={`To-do #${index + 1}`} />
                                            </FormControl>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                         <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                        </div>
                         <Button type="button" variant="outline" size="sm" onClick={handleAddTodo}>
                            Add To-do
                        </Button>
                    </div>
                )}

              </form>
            </Form>
          </ScrollArea>
        </div>
        <DialogFooter className="pt-4 border-t flex-shrink-0">
          <Button onClick={form.handleSubmit(onSubmit)} form="progress-item-form">{isEditing ? "Save Changes" : "Add Tracker"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
