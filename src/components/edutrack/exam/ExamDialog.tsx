
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, Check, ChevronsUpDown, X } from "lucide-react";
import { format } from "date-fns";
import { Exam } from "@/lib/types";
import { useContext, useMemo, useState, useEffect } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DateRange } from "react-day-picker";
import { Checkbox } from "@/components/ui/checkbox";

const examSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  subjectIds: z.array(z.string()).optional(),
  chapterIds: z.array(z.string()).optional(),
  date: z.date({ required_error: "Main exam date is required" }),
  time: z.string().optional(),
  isCompleted: z.boolean(),
  marksObtained: z.coerce.number().optional(),
  totalMarks: z.coerce.number().optional(),
  examPeriodTitle: z.string().optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  isEligible: z.boolean().optional(),
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
  const isPast = isEditing && exam ? new Date(exam.date) < new Date() : false;

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      name: "",
      subjectIds: [],
      chapterIds: [],
      date: undefined,
      time: '09:00',
      isCompleted: false,
      marksObtained: undefined,
      totalMarks: undefined,
      examPeriodTitle: "",
      dateRange: {
        from: undefined,
        to: undefined,
      },
      isEligible: false,
    },
  });

  useEffect(() => {
    if (isEditing && exam) {
        const examDate = new Date(exam.date);
      form.reset({
        name: exam.name,
        subjectIds: exam.subjectIds,
        chapterIds: exam.chapterIds,
        date: examDate,
        time: format(examDate, "HH:mm"),
        isCompleted: exam.isCompleted,
        marksObtained: exam.marksObtained,
        totalMarks: exam.totalMarks,
        examPeriodTitle: exam.examPeriodTitle,
        dateRange: {
            from: exam.startDate ? new Date(exam.startDate) : undefined,
            to: exam.endDate ? new Date(exam.endDate) : undefined,
        },
        isEligible: exam.isEligible,
      })
    } else {
      form.reset({
        name: "",
        subjectIds: [],
        chapterIds: [],
        date: undefined,
        time: '09:00',
        isCompleted: false,
        marksObtained: undefined,
        totalMarks: undefined,
        examPeriodTitle: "",
        dateRange: {
            from: undefined,
            to: undefined,
        },
        isEligible: false,
      })
    }
  }, [exam, isEditing, form, open]);

  const selectedSubjectIds = form.watch("subjectIds") || [];
  const selectedChapterIds = form.watch("chapterIds") || [];
  const isCompleted = form.watch("isCompleted");
  
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
    const [hours, minutes] = (values.time || "00:00").split(':').map(Number);
    const combinedDate = new Date(values.date);
    combinedDate.setHours(hours, minutes);

    const examData: Exam = {
      id: exam?.id || uuidv4(),
      name: values.name,
      subjectIds: values.subjectIds || [],
      chapterIds: values.chapterIds || [],
      date: combinedDate.toISOString(),
      isCompleted: values.isCompleted,
      marksObtained: values.marksObtained || 0,
      totalMarks: values.totalMarks || 0,
      examPeriodTitle: values.examPeriodTitle || '',
      startDate: values.dateRange?.from?.toISOString() || '',
      endDate: values.dateRange?.to?.toISOString() || '',
      isEligible: values.isEligible || false,
    };
    
    if (values.isCompleted) {
        if (typeof values.marksObtained === 'number' && !isNaN(values.marksObtained)) {
            examData.marksObtained = values.marksObtained;
        }
        if (typeof values.totalMarks === 'number' && !isNaN(values.totalMarks)) {
            examData.totalMarks = values.totalMarks;
        }
    }


    dispatch({
      type: isEditing ? "UPDATE_EXAM" : "ADD_EXAM",
      payload: examData,
    });
    
    form.reset();
    onOpenChange(false);
  };
  
  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
        form.reset();
    }
    onOpenChange(isOpen);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{isEditing ? "Edit Exam" : "Add Exam"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of your exam." : "Add a new exam to your schedule."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto -mx-6 px-6">
          <ScrollArea className="h-full">
            <Form {...form}>
              <form id="exam-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mid-term Exam" {...field} />
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
                      <Popover>
                          <PopoverTrigger asChild>
                              <FormControl>
                                  <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                      "w-full justify-between h-auto min-h-10",
                                      !field.value?.length && "text-muted-foreground"
                                  )}
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
                            <ScrollArea>
                              <Command className="max-h-60">
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
                                                const isSelected = currentIds.includes(subject.id);
                                                const newIds = isSelected
                                                    ? currentIds.filter((id) => id !== subject.id)
                                                    : [...currentIds, subject.id];
                                                form.setValue("subjectIds", newIds, { shouldValidate: true });
                                                
                                                const availableChapterIds = subjects
                                                  .filter(s => newIds.includes(s.id))
                                                  .flatMap(s => s.papers)
                                                  .flatMap(p => p.chapters)
                                                  .map(c => c.id);
                                                
                                                const newChapterIds = (form.getValues("chapterIds") || []).filter(id => availableChapterIds.includes(id));
                                                form.setValue("chapterIds", newChapterIds, { shouldValidate: true });
                                            }}
                                        >
                                            <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                (field.value || []).includes(subject.id) ? "opacity-100" : "opacity-0"
                                            )}
                                            />
                                            {subject.name}
                                        </CommandItem>
                                        ))}
                                    </CommandGroup>
                                  </CommandList>
                              </Command>
                            </ScrollArea>
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
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between h-auto min-h-10",
                                        !field.value?.length && "text-muted-foreground"
                                    )}
                                    disabled={!selectedSubjectIds.length}
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
                              <ScrollArea>
                                <Command className="max-h-60">
                                    <CommandInput placeholder="Search chapters..." />
                                    <CommandList>
                                    <CommandEmpty>No chapters found. Select a subject first.</CommandEmpty>
                                    {chaptersBySubject.map(subject => (
                                      <CommandGroup key={subject.subjectId} heading={subject.subjectName}>
                                        {subject.chapters.map((chapter) => (
                                        <CommandItem
                                            value={`${subject.subjectName}-${chapter.name}`}
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
                                                (field.value || []).includes(chapter.id) ? "opacity-100" : "opacity-0"
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
                              </ScrollArea>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Main Exam Date</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Exam Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />
                <div className="space-y-4 rounded-md border p-4">
                  <h3 className="text-lg font-medium">Exam Period (Optional)</h3>
                   <FormField
                      control={form.control}
                      name="examPeriodTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Period Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Final Exams" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <FormField
                    control={form.control}
                    name="dateRange"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start & End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value?.from && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value?.from ? (
                                  field.value.to ? (
                                    <>
                                      {format(field.value.from, "LLL dd, y")} -{" "}
                                      {format(field.value.to, "LLL dd, y")}
                                    </>
                                  ) : (
                                    format(field.value.from, "LLL dd, y")
                                  )
                                ) : (
                                  <span>Pick a date range</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={field.value?.from}
                              selected={field.value as DateRange}
                              onSelect={field.onChange}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="isEligible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Eligible Status</FormLabel>
                        <FormDescription>
                          Mark if you are eligible to sit for this exam.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {isPast && (
                    <>
                        <Separator />
                        <div className="space-y-4 rounded-md border p-4">
                            <h3 className="text-lg font-medium">Exam Result</h3>
                            <FormField
                                control={form.control}
                                name="isCompleted"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Status</FormLabel>
                                            <FormDescription>
                                                Mark this exam as completed or not.
                                            </FormDescription>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button type="button" onClick={() => field.onChange(false)} variant={!field.value ? "destructive" : "outline"} size="sm">
                                                <X className="mr-2 h-4 w-4" />
                                                Not Completed
                                            </Button>
                                            <Button type="button" onClick={() => field.onChange(true)} variant={field.value ? "default" : "outline"} size="sm" className={cn(field.value && "bg-green-600 hover:bg-green-700")}>
                                                <Check className="mr-2 h-4 w-4" />
                                                Completed
                                            </Button>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            {isCompleted && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <FormField
                                        control={form.control}
                                        name="marksObtained"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Marks Obtained</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 85" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="totalMarks"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Total Marks</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </>
                )}
              </form>
            </Form>
          </ScrollArea>
        </div>
        <DialogFooter className="pt-4 border-t flex-shrink-0">
          <Button type="submit" form="exam-form" onClick={form.handleSubmit(onSubmit)} className="font-bold transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20">{isEditing ? "Save Changes" : "Add Exam"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    