
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Activity, ActivityType } from "@/lib/types";
import { useContext, useEffect } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';

const activitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["checkbox", "counter", "link"]),
  target: z.coerce.number().optional(),
  url: z.string().url("Must be a valid URL").optional(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  paperId: string;
  chapterId: string;
  activity?: Activity;
}

export function ActivityDialog({ open, onOpenChange, subjectId, paperId, chapterId, activity }: ActivityDialogProps) {
  const { dispatch } = useContext(AppDataContext);
  const isEditing = !!activity;

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: "",
      type: "checkbox",
      target: undefined,
      url: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && activity) {
        form.reset({
          title: activity.title,
          type: activity.type,
          target: activity.target,
          url: activity.url || ''
        });
      } else {
        form.reset({
          title: "",
          type: "checkbox",
          target: undefined,
          url: ""
        });
      }
    }
  }, [open, isEditing, activity, form]);


  const activityType = form.watch("type");

  const onSubmit = (values: ActivityFormValues) => {
    if (isEditing) {
        const updatedActivity: Activity = {
            ...activity,
            title: values.title,
            type: values.type as ActivityType,
            target: values.type === 'counter' ? values.target || 1 : undefined,
            url: values.type === 'link' ? values.url : undefined,
          };
          dispatch({
            type: "UPDATE_ACTIVITY",
            payload: { subjectId, paperId, chapterId, activity: updatedActivity },
          });
    } else {
        const newActivity: Activity = {
            id: uuidv4(),
            title: values.title,
            type: values.type as ActivityType,
            ...(values.type === 'checkbox' && { completed: false }),
            ...(values.type === 'counter' && { count: 0, target: values.target || 1 }),
            ...(values.type === 'link' && { url: values.url }),
          };
          dispatch({
            type: "ADD_ACTIVITY",
            payload: { subjectId, paperId, chapterId, activity: newActivity },
          });
    }
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Activity" : "Add Activity"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of your activity." : "Add a new activity to this chapter."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Read section 5.1" {...field} />
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
                  <FormLabel>Activity Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an activity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                      <SelectItem value="counter">Counter</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {activityType === "counter" && (
              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Count</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 10 problems" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {activityType === "link" && (
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit">{isEditing ? "Save Changes" : "Add Activity"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
