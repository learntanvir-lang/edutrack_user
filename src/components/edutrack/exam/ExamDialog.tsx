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
import { cn } from "@/lib/utils";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { Exam } from "@/lib/types";
import { useContext, useMemo, useState } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

const examSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  subjectIds: z.array(z.string()).min(1, "At least one subject is required"),
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
  const [isSubjectSelectOpen, setSubjectSelectOpen] = useState(false);
  const [isChapterSelectOpen, setChapterSelectOpen] = useState(false);

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: isEditing && exam ? {
      name: exam.name,
      subjectIds: [exam.subjectId],
      chapterIds: [exam.chapterId],
      date: new Date(exam.date),
    } : {
      name: "",
      subjectIds: [],
      chapterIds: [],
      date: undefined,
    },
  });

  const selectedSubjectIds = form.watch("subjectIds") || [];
  const selectedChapterIds = form.watch("chapterIds") || [];
  
  const chaptersBySubject = useMemo(() => {
    if (!selectedSubjectIds.length) return [];
    return subjects
      .filter(s => selectedSubjectIds.includes(s.id))
      .map(subject => ({
        subjectName: subject.name,
        subjectId: subject.id,
        chapters: subject.papers.flatMap(p => p.chapters.map(c => ({...c, paperName: p.name})))
      }));
  }, [selectedSubjectIds, subjects]);

  const allChapters = useMemo(() => chaptersBySubject.flatMap(s => s.chapters.map(c => ({...c, subjectId: s.subjectId}))), [chaptersBySubject]);


  const onSubmit = (values: ExamFormValues) => {
    if (isEditing && exam) {
      dispatch({
        type: "UPDATE_EXAM",
        payload: {
          id: exam.id,
          name: values.name,
          subjectId: values.subjectIds[0],
          chapterId: values.chapterIds[0], 
          date: values.date.toISOString(),
          isCompleted: exam.isCompleted,
        },
      });
    } else {
      values.chapterIds.forEach((chapterId) => {
        const chapter = allChapters.find(c => c.id === chapterId);
        if (chapter) {
          dispatch({
            type: "ADD_EXAM",
            payload: {
              id: uuidv4(),
              name: values.name,
              subjectId: chapter.subjectId,
              chapterId: chapterId,
              date: values.date.toISOString(),
              isCompleted: false,
            },
          });
        }
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
            {isEditing ? "Update the details of your exam." : "Add a new exam to your schedule. You can select multiple subjects and chapters to create exams for each."}
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
              name="subjectIds"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Subject(s)</FormLabel>
                  <Popover open={isSubjectSelectOpen} onOpenChange={setSubjectSelectOpen}>
                      <PopoverTrigger asChild>
                          <FormControl>
                              <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                  "w-full justify-between h-auto min-h-10",
                                  !field.value?.length && "text-muted-foreground"
                              )}
                              disabled={isEditing}
                              >
                              <div className="flex gap-1 flex-wrap">
                                  {selectedSubjectIds.length > 0 ? selectedSubjectIds.map(subjectId => {
                                      const subject = subjects.find(s => s.id === subjectId);
                                      return <Badge key={subjectId} variant="secondary">{subject?.name}</Badge>
                                  }) : "Select subjects..."}
                              </div>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                          </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                              <CommandInput placeholder="Search subjects..." />
                              <CommandList>
                                <CommandEmpty>No subjects found.</CommandEmpty>
                                <CommandGroup>
                                    {subjects.map((subject) => (
                                    <CommandItem
                                        value={subject.name}
                                        key={subject.id}
                                        onSelect={() => {
                                            const currentIds = field.value || [];
                                            const newIds = currentIds.includes(subject.id)
                                                ? currentIds.filter((id) => id !== subject.id)
                                                : [...currentIds, subject.id];
                                            form.setValue("subjectIds", newIds, { shouldValidate: true });
                                            form.setValue("chapterIds", []);
                                        }}
                                    >
                                        <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedSubjectIds.includes(subject.id) ? "opacity-100" : "opacity-0"
                                        )}
                                        />
                                        {subject.name}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                              </CommandList>
                          </Command>
                      </PopoverContent>
                  </Popover>
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
                                disabled={!selectedSubjectIds.length || isEditing}
                                >
                                <div className="flex gap-1 flex-wrap">
                                    {selectedChapterIds.length > 0 ? selectedChapterIds.map(chapterId => {
                                        const chapter = allChapters.find(c => c.id === chapterId);
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
                                <CommandList>
                                <CommandEmpty>No chapters found.</CommandEmpty>
                                {chaptersBySubject.map(subject => (
                                  <CommandGroup key={subject.subjectId} heading={subject.subjectName}>
                                    {subject.chapters.map((chapter) => (
                                    <CommandItem
                                        value={chapter.name}
                                        key={chapter.id}
                                        onSelect={() => {
                                            const currentIds = field.value || [];
                                            const newIds = currentIds.includes(chapter.id)
                                                ? currentIds.filter((id) => id !== chapter.id)
                                                : [...currentIds, chapter.id];
                                            form.setValue("chapterIds", newIds, { shouldValidate: true });
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
                                ))}
                                </CommandList>
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
