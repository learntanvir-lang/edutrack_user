
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
import { ProgressItem } from "@/lib/types";
import { useContext, useEffect } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconPicker, type IconName } from '../IconPicker';

const progressItemSchema = z.object({
  name: z.string().min(1, "Tracker name is required"),
  type: z.enum(["todo", "counter"]),
  icon: z.string().optional(),
  total: z.coerce.number().min(1, "Must be at least 1").optional(),
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
      icon: undefined,
      total: 10,
    },
  });

  const watchType = form.watch("type");

  useEffect(() => {
    if (progressItem && open) {
      form.reset({
        name: progressItem.name,
        type: progressItem.type,
        icon: progressItem.icon,
        total: progressItem.total,
      });
    } else if (!isEditing && open) {
      form.reset({
        name: "",
        type: "counter",
        icon: undefined,
        total: 10,
      });
    }
  }, [progressItem, open, form, isEditing]);

  const onSubmit = (values: ProgressItemFormValues) => {
    const progressItemData: ProgressItem = {
      id: progressItem?.id || uuidv4(),
      name: values.name,
      type: values.type,
      icon: values.type === 'counter' ? values.icon : undefined,
      completed: progressItem?.completed || 0,
      total: values.type === 'counter' ? values.total || 0 : (values.type === 'todo' ? 1 : 0),
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
              <form id="progress-item-form" className="space-y-4">
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a tracker type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="counter">Counter</SelectItem>
                                    <SelectItem value="todo">To-do</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {watchType === "counter" && (
                    <>
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
                         <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Icon (Optional)</FormLabel>
                                    <FormControl>
                                       <IconPicker value={field.value as IconName} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}
              </form>
            </Form>
          </ScrollArea>
        </div>
        <DialogFooter className="pt-4 border-t flex-shrink-0">
          <Button onClick={form.handleSubmit(onSubmit)} form="progress-item-form" className="font-bold transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20">{isEditing ? "Save Changes" : "Add Tracker"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
