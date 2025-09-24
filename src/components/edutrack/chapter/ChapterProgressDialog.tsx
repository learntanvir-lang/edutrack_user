
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
import { Chapter, ResourceLink } from "@/lib/types";
import { useContext, useEffect } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';
import { PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const progressSchema = z.object({
  classSessions: z.object({
    attended: z.coerce.number().min(0, "Cannot be negative"),
    total: z.coerce.number().min(0, "Cannot be negative"),
  }),
  practiceProblems: z.object({
    completed: z.coerce.number().min(0, "Cannot be negative"),
    total: z.coerce.number().min(0, "Cannot be negative"),
  }),
  resourceLinks: z.array(z.object({
    id: z.string(),
    url: z.string().url("Must be a valid URL"),
    description: z.string().min(1, "Description is required"),
  })),
  isCompleted: z.boolean(),
});

type ProgressFormValues = z.infer<typeof progressSchema>;

interface ChapterProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  paperId: string;
  chapter: Chapter;
}

export function ChapterProgressDialog({ open, onOpenChange, subjectId, paperId, chapter }: ChapterProgressDialogProps) {
  const { dispatch } = useContext(AppDataContext);

  const form = useForm<ProgressFormValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      classSessions: { attended: 0, total: 0 },
      practiceProblems: { completed: 0, total: 0 },
      resourceLinks: [],
      isCompleted: false,
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "resourceLinks"
  });

  useEffect(() => {
    if (chapter && open) {
      form.reset({
        classSessions: chapter.classSessions,
        practiceProblems: chapter.practiceProblems,
        resourceLinks: chapter.resourceLinks,
        isCompleted: chapter.isCompleted,
      });
    }
  }, [chapter, open, form]);

  const onSubmit = (values: ProgressFormValues) => {
    const totalProgressItems = values.classSessions.total + values.practiceProblems.total;
    const completedProgressItems = values.classSessions.attended + values.practiceProblems.completed;
    const isCompleted = totalProgressItems > 0 && completedProgressItems === totalProgressItems;

    dispatch({
      type: "UPDATE_CHAPTER",
      payload: {
        subjectId,
        paperId,
        chapter: {
          ...chapter,
          classSessions: values.classSessions,
          practiceProblems: values.practiceProblems,
          resourceLinks: values.resourceLinks,
          isCompleted: isCompleted,
        },
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Progress for {chapter.name}</DialogTitle>
          <DialogDescription>
            Update your progress and resources for this chapter.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4 rounded-md border p-4">
                <h3 className="text-lg font-medium">Class Sessions</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="classSessions.attended"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Attended</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="classSessions.total"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Total</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="space-y-4 rounded-md border p-4">
                 <h3 className="text-lg font-medium">Practice Problems</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="practiceProblems.completed"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Completed</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="practiceProblems.total"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Total</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="space-y-4 rounded-md border p-4">
                <h3 className="text-lg font-medium">Resource Links</h3>
                <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                        <div className="flex-grow space-y-2">
                            <FormField
                                control={form.control}
                                name={`resourceLinks.${index}.description`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`resourceLinks.${index}.url`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ id: uuidv4(), url: '', description: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Link
                </Button>
            </div>

            <DialogFooter>
              <Button type="submit">Save Progress</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
