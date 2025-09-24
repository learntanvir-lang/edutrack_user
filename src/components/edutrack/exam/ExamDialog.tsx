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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { Exam, Subject } from "@/lib/types";
import { useContext, useMemo, useState } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

const examSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  subjectId: z.string().min(1, "Subject is required"),
  chapterIds: z.array(z.string()).min(1, "At least one chapter is required"),
  date: z.date({ required_error: "Exam date is required" }),
});

type ExamFormValues = z.infer<typeof examSchema>;

interface ExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam?: Exam;
}

export function ExamDialog({ open, onOpenChange, exam }: ExamDialogProps) {
  const { subjects, dispatch } = useContext(AppDataContext);
  const isEditing = !!exam;
  const [isChapterSelectOpen, setChapterSelectOpen] = useState(false);

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      name: exam?.name || "",
      subjectId: exam?.subjectId || "",
      chapterIds: exam ? [exam.chapterId] : [],
      date: exam ? new Date(exam.date) : undefined,
    },
  });

  const selectedSubjectId = form.watch("subjectId");
  
  const chapters = useMemo(() => {
    if (!selectedSubjectId) return [];
    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
    if (!selectedSubject) return [];
    return selectedSubject.papers.flatMap(p => p.chapters.map(c => ({...c, paperName: p.name})));
  }, [selectedSubjectId, subjects]);

  const selectedChapterIds = form.watch("chapterIds") || [];


  const onSubmit = (values: ExamFormValues) => {
    if (isEditing && exam) {
      dispatch({
        type: "UPDATE_EXAM",
        payload: {
          id: exam.id,
          name: values.name,
          subjectId: values.subjectId,
          chapterId: values.chapterIds[0], // Can only edit one
          date: values.date.toISOString(),
          isCompleted: exam.isCompleted,
        },
      });
    } else {
      values.chapterIds.forEach((chapterId) => {
        dispatch({
          type: "ADD_EXAM",
          payload: {
            id: uuidv4(),
            name: values.name,
            subjectId: values.subjectId,
            chapterId: chapterId,
            date: values.date.toISOString(),
            isCompleted: false,
          },
        });
      });
    }

    onOpenChange(false);
    form.reset();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Exam" : "Add Exam"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of your exam." : "Add a new exam to your schedule. You can select multiple chapters to create exams for each."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Daily Exam" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('chapterIds', []);
                    }} 
                    defaultValue={field.value}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject: Subject) => (
                        <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="chapterIds"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Chapter(s)</FormLabel>
                    <Popover open={isChapterSelectOpen} onOpenChange={setChapterSelectOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                    "w-full justify-between h-auto min-h-10",
                                    !field.value?.length && "text-muted-foreground"
                                )}
                                disabled={!selectedSubjectId || isEditing}
                                >
                                <div className="flex gap-1 flex-wrap">
                                    {selectedChapterIds.length > 0 ? selectedChapterIds.map(chapterId => {
                                        const chapter = chapters.find(c => c.id === chapterId);
                                        return <Badge key={chapterId} variant="secondary">{chapter?.name}</Badge>
                                    }) : "Select chapters..."}
                                </div>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search chapters..." />
                                <CommandEmpty>No chapters found.</CommandEmpty>
                                <CommandGroup className="max-h-64 overflow-auto">
                                    {chapters.map((chapter) => (
                                    <CommandItem
                                        value={chapter.name}
                                        key={chapter.id}
                                        onSelect={() => {
                                            const currentIds = field.value || [];
                                            const newIds = currentIds.includes(chapter.id)
                                                ? currentIds.filter((id) => id !== chapter.id)
                                                : [...currentIds, chapter.id];
                                            form.setValue("chapterIds", newIds);
                                        }}
                                    >
                                        <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedChapterIds.includes(chapter.id) ? "opacity-100" : "opacity-0"
                                        )}
                                        />
                                        <div>
                                            <p>{chapter.name}</p>
                                            <p className="text-xs text-muted-foreground">{chapter.paperName}</p>
                                        </div>
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Exam Date</FormLabel>
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
            <DialogFooter>
              <Button type="submit">{isEditing ? "Save Changes" : "Add Exam(s)"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
