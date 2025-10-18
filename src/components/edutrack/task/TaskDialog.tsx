
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
import { StudyTask } from "@/lib/types";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppDataContext } from '@/context/AppDataContext';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronsUpDown, Check, PlusCircle, MoreVertical, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.date({ required_error: "Due date is required" }),
  priority: z.coerce.number().min(1, "Priority is required."),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string; // YYYY-MM-DD for pre-selection
  task?: StudyTask;
}

export function TaskDialog({ open, onOpenChange, date, task }: TaskDialogProps) {
  const { tasks, dispatch } = useContext(AppDataContext);
  const isEditing = !!task;

  const [isCategoryCreatorOpen, setIsCategoryCreatorOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  
  const [isSubcategoryCreatorOpen, setIsSubcategoryCreatorOpen] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null);
  const [deletingSubcategory, setDeletingSubcategory] = useState<string | null>(null);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(date),
      priority: 1,
      category: "General",
      subcategory: "",
    },
  });
  
  const watchedCategory = form.watch("category");

  const { categories, subcategoriesByCategory } = useMemo(() => {
    const cats = new Set<string>();
    const subcats: { [key: string]: Set<string> } = {};

    tasks.forEach(t => {
      cats.add(t.category);
      if (t.subcategory) {
        if (!subcats[t.category]) {
          subcats[t.category] = new Set();
        }
        subcats[t.category].add(t.subcategory);
      }
    });
    
    return {
      categories: Array.from(cats).sort(),
      subcategoriesByCategory: Object.entries(subcats).reduce((acc, [key, value]) => {
            acc[key] = Array.from(value).sort();
            return acc;
        }, {} as { [key: string]: string[] }),
    };
  }, [tasks]);

  useEffect(() => {
    if (open) {
      if (isEditing && task) {
        form.reset({
          title: task.title,
          description: task.description || "",
          date: new Date(task.date),
          priority: task.priority,
          category: task.category,
          subcategory: task.subcategory || "",
        });
      } else {
        form.reset({
          title: "",
          description: "",
          date: new Date(date),
          priority: 1,
          category: "General",
          subcategory: "",
        });
      }
    }
  }, [task, open, form, isEditing, date]);


  const onSubmit = (values: TaskFormValues) => {
    const taskData: StudyTask = {
      ...(isEditing ? task : {}),
      id: task?.id || uuidv4(),
      title: values.title,
      description: values.description || null,
      isCompleted: task?.isCompleted || false,
      date: format(values.date, "yyyy-MM-dd"),
      priority: values.priority,
      category: values.category,
      subcategory: values.subcategory || null,
      startTime: task?.startTime || null,
      endTime: task?.endTime || null,
      color: task?.color || null,
      icon: task?.icon || null,
      timeLogs: task?.timeLogs || [],
      activeTimeLogId: task?.activeTimeLogId || null,
      isArchived: task?.isArchived ?? false,
      originalId: task?.originalId
    };

    dispatch({
      type: isEditing ? "UPDATE_TASK" : "ADD_TASK",
      payload: taskData,
    });
    onOpenChange(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
      onOpenChange(isOpen);
  }

  const handleSaveCategory = () => {
    if (newCategoryName) {
      if (editingCategory) {
        dispatch({ type: 'UPDATE_TASK_CATEGORY', payload: { oldName: editingCategory, newName: newCategoryName } });
        if (form.getValues('category') === editingCategory) {
            form.setValue('category', newCategoryName);
        }
      } else {
        form.setValue('category', newCategoryName);
      }
      setNewCategoryName("");
      setIsCategoryCreatorOpen(false);
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = () => {
      if (deletingCategory) {
          dispatch({ type: 'DELETE_TASK_CATEGORY', payload: { name: deletingCategory } });
          if (form.getValues('category') === deletingCategory) {
            form.setValue('category', 'General');
          }
          setDeletingCategory(null);
      }
  };

  const handleSaveSubcategory = () => {
    if (newSubcategoryName && watchedCategory) {
        if (editingSubcategory) {
            dispatch({ type: 'UPDATE_TASK_SUBCATEGORY', payload: { category: watchedCategory, oldName: editingSubcategory, newName: newSubcategoryName } });
            if (form.getValues('subcategory') === editingSubcategory) {
                form.setValue('subcategory', newSubcategoryName);
            }
        } else {
            form.setValue('subcategory', newSubcategoryName);
        }
        setNewSubcategoryName("");
        setIsSubcategoryCreatorOpen(false);
        setEditingSubcategory(null);
    }
  };

  const handleDeleteSubcategory = () => {
      if (deletingSubcategory && watchedCategory) {
          dispatch({ type: 'DELETE_TASK_SUBCATEGORY', payload: { category: watchedCategory, name: deletingSubcategory } });
          if (form.getValues('subcategory') === deletingSubcategory) {
            form.setValue('subcategory', '');
          }
          setDeletingSubcategory(null);
      }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{isEditing ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for this task." : "Add a new task to your study plan."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto -mx-6 px-6">
          <ScrollArea className="h-full">
            <Form {...form}>
              <form id="task-form" className="space-y-4 px-1">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Review Chapter 5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Add more details about the task..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
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
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Category</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                {field.value || "Select category"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search or create..." />
                                            <CommandList>
                                                <CommandEmpty onSelect={() => {
                                                    const currentVal = form.getValues('category');
                                                    setNewCategoryName(currentVal);
                                                    setEditingCategory(null);
                                                    setIsCategoryCreatorOpen(true);
                                                }}>
                                                    No category found. Create new?
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {categories.map((cat) => (
                                                        <CommandItem
                                                            value={cat}
                                                            key={cat}
                                                            onSelect={() => form.setValue("category", cat)}
                                                            className="group"
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", cat === field.value ? "opacity-100" : "opacity-0")} />
                                                            <span className="flex-1">{cat}</span>
                                                             <DropdownMenu>
                                                              <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                                                  <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                              </DropdownMenuTrigger>
                                                              <DropdownMenuContent side="right" align="start" onClick={(e) => e.stopPropagation()}>
                                                                  <DropdownMenuItem onClick={() => { setEditingCategory(cat); setNewCategoryName(cat); setIsCategoryCreatorOpen(true); }}>
                                                                      <Edit className="mr-2 h-4 w-4" /> Edit
                                                                  </DropdownMenuItem>
                                                                  <DropdownMenuItem onClick={() => setDeletingCategory(cat)} className="text-destructive">
                                                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                  </DropdownMenuItem>
                                                              </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                                <CommandSeparator />
                                                <CommandItem onSelect={() => {setEditingCategory(null); setNewCategoryName(""); setIsCategoryCreatorOpen(true);}}>
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                    Create new category
                                                </CommandItem>
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
                        name="subcategory"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Subcategory (Optional)</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                {field.value || "Select subcategory"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search or create..." />
                                            <CommandList>
                                                <CommandEmpty>No subcategory found.</CommandEmpty>
                                                <CommandGroup>
                                                    {(subcategoriesByCategory[watchedCategory] || []).map((subcat) => (
                                                        <CommandItem
                                                            value={subcat}
                                                            key={subcat}
                                                            onSelect={() => form.setValue("subcategory", subcat)}
                                                             className="group"
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", subcat === field.value ? "opacity-100" : "opacity-0")} />
                                                            <span className="flex-1">{subcat}</span>
                                                             <DropdownMenu>
                                                              <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                                                  <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                              </DropdownMenuTrigger>
                                                              <DropdownMenuContent side="right" align="start" onClick={(e) => e.stopPropagation()}>
                                                                  <DropdownMenuItem onClick={() => { setEditingSubcategory(subcat); setNewSubcategoryName(subcat); setIsSubcategoryCreatorOpen(true); }}>
                                                                      <Edit className="mr-2 h-4 w-4" /> Edit
                                                                  </DropdownMenuItem>
                                                                  <DropdownMenuItem onClick={() => setDeletingSubcategory(subcat)} className="text-destructive">
                                                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                  </DropdownMenuItem>
                                                              </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                                 <CommandSeparator />
                                                 <CommandItem onSelect={() => {setEditingSubcategory(null); setNewSubcategoryName(""); setIsSubcategoryCreatorOpen(true);}}>
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                    Create new subcategory
                                                </CommandItem>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
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
          <Button onClick={form.handleSubmit(onSubmit)} form="task-form" className="font-bold transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20">{isEditing ? "Save Changes" : "Add Task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    <AlertDialog open={isCategoryCreatorOpen} onOpenChange={setIsCategoryCreatorOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{editingCategory ? "Edit Category" : "Create New Category"}</AlertDialogTitle>
                <AlertDialogDescription>
                    {editingCategory ? `Rename the category "${editingCategory}". This will update it for all tasks.` : "Enter a name for the new task category."}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
                <Label htmlFor="new-category-name">Category Name</Label>
                <Input id="new-category-name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="e.g., Study" />
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSaveCategory}>{editingCategory ? "Save" : "Create"}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    {deletingCategory && (
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will delete the category "{deletingCategory}" from all tasks and move them to "General". This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCategory} variant="destructive">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )}

    <AlertDialog open={isSubcategoryCreatorOpen} onOpenChange={setIsSubcategoryCreatorOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{editingSubcategory ? "Edit Subcategory" : "Create New Subcategory"}</AlertDialogTitle>
                <AlertDialogDescription>
                   {editingSubcategory ? `Rename the subcategory "${editingSubcategory}". This will update it for all tasks in the "${watchedCategory}" category.` : `Enter a name for the new subcategory under "${watchedCategory}".`}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
                <Label htmlFor="new-subcategory-name">Subcategory Name</Label>
                <Input id="new-subcategory-name" value={newSubcategoryName} onChange={e => setNewSubcategoryName(e.target.value)} placeholder="e.g., Practice Problems" />
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSaveSubcategory}>{editingSubcategory ? "Save" : "Create"}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

     {deletingSubcategory && (
      <AlertDialog open={!!deletingSubcategory} onOpenChange={() => setDeletingSubcategory(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                   This will delete the subcategory "{deletingSubcategory}" from all tasks in the "{watchedCategory}" category. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSubcategory} variant="destructive">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )}
    </>
  );
}
