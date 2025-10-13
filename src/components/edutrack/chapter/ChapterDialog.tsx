
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
import { useContext, useEffect } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from "@/components/ui/scroll-area";

const chapterSchema = z.object({
  name: z.string().min(1, "Chapter name is required"),
  number: z.string().optional(),
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
      name: "",
      number: "",
    },
  });

  useEffect(() => {
    if (chapter && open) {
      form.reset({
        name: chapter.name,
        number: chapter.number,
      });
    } else if (!isEditing && open) {
      form.reset({
        name: "",
        number: "",
      });
    }
  }, [chapter, open, form, isEditing]);


  const onSubmit = (values: ChapterFormValues) => {
    const totalItems = chapter?.progressItems?.reduce((sum, item) => sum + item.total, 0) || 0;
    const completedItems = chapter?.progressItems?.reduce((sum, item) => sum + item.completed, 0) || 0;
    const isCompleted = totalItems > 0 && completedItems >= totalItems;

    const chapterData: Chapter = {
      id: chapter?.id || uuidv4(),
      name: values.name,
      number: values.number,
      isCompleted: chapter?.isCompleted || isCompleted,
      progressItems: chapter?.progressItems || [],
      resourceLinks: chapter?.resourceLinks || [],
    };

    dispatch({
      type: isEditing ? "UPDATE_CHAPTER" : "ADD_CHAPTER",
      payload: {
        subjectId,
        paperId,
        chapter: chapterData,
      },
    });
    onOpenChange(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
      if (!isOpen) {
        form.reset({
            name: "",
            number: "",
        });
      }
      onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Chapter" : "Add New Chapter"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the name and number for this chapter." : "Add a new chapter to this paper."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-6 -mr-6">
            <Form {...form}>
              <form id="chapter-form" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chapter Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1 or 5.2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                </div>
              </form>
            </Form>
        </ScrollArea>
        </div>
        <DialogFooter className="pt-4 border-t flex-shrink-0">
          <Button onClick={form.handleSubmit(onSubmit)} form="chapter-form" className="font-bold transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20">{isEditing ? "Save Changes" : "Add Chapter"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
