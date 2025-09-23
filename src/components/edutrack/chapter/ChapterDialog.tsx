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
import { Chapter } from "@/lib/types";
import { useContext } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';

const chapterSchema = z.object({
  name: z.string().min(1, "Chapter name is required"),
});

type ChapterFormValues = z.infer<typeof chapterSchema>;

interface ChapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  paperId: string;
  chapter?: Chapter;
}

export function ChapterDialog({ open, onOpenChange, subjectId, paperId, chapter }: ChapterDialogProps) {
  const { dispatch } = useContext(AppDataContext);
  const isEditing = !!chapter;

  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      name: chapter?.name || "",
    },
  });

  const onSubmit = (values: ChapterFormValues) => {
    dispatch({
      type: isEditing ? "UPDATE_CHAPTER" : "ADD_CHAPTER",
      payload: {
        subjectId,
        paperId,
        chapter: {
          id: chapter?.id || uuidv4(),
          name: values.name,
          activities: chapter?.activities || [],
          isCompleted: chapter?.isCompleted || false,
        },
      },
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Chapter" : "Add Chapter"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the name of this chapter." : "Add a new chapter to this paper."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chapter Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Vector" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{isEditing ? "Save Changes" : "Add Chapter"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
