

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
import { CalendarIcon, Check, ChevronsUpDown, X, Eye, EyeOff, PlusCircle, MoreVertical, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Exam, ExamCategory } from "@/lib/types";
import { useContext, useMemo, useState, useEffect } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DateRange } from "react-day-picker";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


const examSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  categoryId: z.string().optional(),
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
  showEligibility: z.boolean().optional(),
  examFee: z.coerce.number().optional(),
  isFeePaid: z.boolean().optional(),
});

type ExamFormValues = z.infer<typeof examSchema>;

interface ExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam?: Exam;
}

export function ExamDialog({ open, onOpenChange, exam }: ExamDialogProps) {
  const { subjects, examCategories, dispatch } = useContext(AppDataContext);
  const isEditing = !!exam;
  const isPast = isEditing && exam ? new Date(exam.date) < new Date() : false;

  // State for creating/editing categories
  const [isCategoryCreatorOpen, setIsCategoryCreatorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExamCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ExamCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryOrder, setCategoryOrder] = useState(1);

  useEffect(() => {
      if (isCategoryCreatorOpen) {
          if (editingCategory) {
              setCategoryName(editingCategory.name);
              setCategoryOrder(editingCategory.order);
          } else {
              const nextOrder = examCategories.length > 0 ? Math.max(...examCategories.map(c => c.order)) + 1 : 1;
              setCategoryName("");
              setCategoryOrder(nextOrder);
          }
      }
  }, [isCategoryCreatorOpen, editingCategory, examCategories]);

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      name: "",
      categoryId: undefined,
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
      showEligibility: true,
      examFee: undefined,
      isFeePaid: false,
    },
  });

  useEffect(() => {
    if (isEditing && exam) {
        const examDate = new Date(exam.date);
      form.reset({
        name: exam.name,
        categoryId: exam.categoryId,
        subjectIds: exam.subjectIds,
        chapterIds: exam.chapterIds,
        date: examDate,
        time: format(examDate, "HH:mm"),
        isCompleted: exam.isCompleted,
        marksObtained: exam.marksObtained ?? undefined,
        totalMarks: exam.totalMarks ?? undefined,
        examPeriodTitle: exam.examPeriodTitle ?? "",
        dateRange: {
            from: exam.startDate ? new Date(exam.startDate) : undefined,
            to: exam.endDate ? new Date(exam.endDate) : undefined,
        },
        isEligible: exam.isEligible,
        showEligibility: exam.showEligibility ?? true,
        examFee: exam.examFee ?? undefined,
        isFeePaid: exam.isFeePaid,
      })
    } else {
      form.reset({
        name: "",
        categoryId: undefined,
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
        showEligibility: true,
        examFee: undefined,
        isFeePaid: false,
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
      categoryId: values.categoryId,
      subjectIds: values.subjectIds || [],
      chapterIds: values.chapterIds || [],
      date: combinedDate.toISOString(),
      createdAt: exam?.createdAt || new Date().toISOString(),
      isCompleted: values.isCompleted || false,
      marksObtained: values.isCompleted && typeof values.marksObtained === 'number' && !isNaN(values.marksObtained) ? values.marksObtained : null,
      totalMarks: values.isCompleted && typeof values.totalMarks === 'number' && !isNaN(values.totalMarks) ? values.totalMarks : null,
      examPeriodTitle: values.examPeriodTitle || null,
      startDate: values.dateRange?.from?.toISOString() || null,
      endDate: values.dateRange?.to?.toISOString() || null,
      isEligible: values.isEligible ?? false,
      showEligibility: values.showEligibility ?? true,
      examFee: typeof values.examFee === 'number' && !isNaN(values.examFee) ? values.examFee : null,
      isFeePaid: values.isFeePaid ?? false,
    };
    
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

  const handleSaveCategory = () => {
      if (categoryName && categoryOrder > 0) {
          if (editingCategory) {
              dispatch({ type: 'UPDATE_EXAM_CATEGORY', payload: { ...editingCategory, name: categoryName, order: categoryOrder } });
          } else {
              const newCategory: ExamCategory = { id: uuidv4(), name: categoryName, order: categoryOrder };
              dispatch({ type: 'ADD_EXAM_CATEGORY', payload: newCategory });
              form.setValue('categoryId', newCategory.id, { shouldValidate: true });
          }
          setIsCategoryCreatorOpen(false);
          setEditingCategory(null);
      }
  };
  
  const handleDeleteCategory = () => {
      if (deletingCategory) {
          dispatch({ type: 'DELETE_EXAM_CATEGORY', payload: { id: deletingCategory.id } });
          setDeletingCategory(null);
      }
  };
  
  return (
    <>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Category</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                            {field.value ? examCategories.find(c => c.id === field.value)?.name : "Select category"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search category..." />
                                        <CommandList>
                                            <CommandEmpty>No category found.</CommandEmpty>
                                            <CommandGroup>
                                                {examCategories.map((category) => (
                                                    <CommandItem
                                                        value={category.name}
                                                        key={category.id}
                                                        onSelect={() => form.setValue("categoryId", category.id)}
                                                        className="group"
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", category.id === field.value ? "opacity-100" : "opacity-0")} />
                                                        <span className="flex-1">{category.name}</span>
                                                        <DropdownMenu onOpenChange={(e) => e.stopPropagation()}>
                                                          <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                                              <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                          </DropdownMenuTrigger>
                                                          <DropdownMenuContent side="right" align="start" onClick={(e) => e.stopPropagation()}>
                                                              <DropdownMenuItem onClick={() => { setEditingCategory(category); setIsCategoryCreatorOpen(true); }}>
                                                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                                              </DropdownMenuItem>
                                                              <DropdownMenuItem onClick={() => setDeletingCategory(category)} className="text-destructive">
                                                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                              </DropdownMenuItem>
                                                          </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                            <CommandSeparator />
                                            <CommandGroup>
                                                <CommandItem onSelect={() => {setEditingCategory(null); setIsCategoryCreatorOpen(true);}}>
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                    Create new category
                                                </CommandItem>
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <FormField
                      control={form.control}
                      name="examFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exam Fee (Optional)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 50" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="isFeePaid"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-8">
                          <div className="space-y-0.5">
                            <FormLabel>Fee Status</FormLabel>
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
                      <div className="flex items-center gap-2">
                        <FormField
                            control={form.control}
                            name="showEligibility"
                            render={({ field: showField }) => (
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => showField.onChange(!showField.value)}
                                  className="h-8 w-8 text-muted-foreground"
                                >
                                    {showField.value ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </Button>
                            )}
                        />
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
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
    
      <AlertDialog open={isCategoryCreatorOpen} onOpenChange={setIsCategoryCreatorOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>{editingCategory ? "Edit Category" : "Create New Category"}</AlertDialogTitle>
            <AlertDialogDescription>
                {editingCategory ? "Update the name and order for this category." : "Add a new category for your exams. The order number determines its position in the list."}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input id="category-name" value={categoryName} onChange={e => setCategoryName(e.target.value)} placeholder="e.g., Finals" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category-order">Order</Label>
                    <Input id="category-order" type="number" value={categoryOrder} onChange={e => setCategoryOrder(Number(e.target.value))} />
                </div>
            </div>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveCategory}>{editingCategory ? "Save Changes" : "Create"}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {deletingCategory && (
          <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This will delete the category "{deletingCategory.name}". Exams using this category will become uncategorized. This action cannot be undone.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteCategory} variant="destructive">Delete</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
      )}
    </>
  );
}
