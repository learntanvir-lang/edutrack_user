
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
import { Subject } from "@/lib/types";
import { useContext } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';

const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().optional(),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject;
}

export function SubjectDialog({ open, onOpenChange, subject }: SubjectDialogProps) {
  const { dispatch } = useContext(AppDataContext);
  const isEditing = !!subject;

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: subject?.name || "",
      code: subject?.code || "",
    },
  });

  const onSubmit = (values: SubjectFormValues) => {
    dispatch({
      type: isEditing ? "UPDATE_SUBJECT" : "ADD_SUBJECT",
      payload: {
        id: subject?.id || uuidv4(),
        name: values.name,
        code: values.code,
        papers: subject?.papers || [],
        createdAt: subject?.createdAt || new Date().toISOString(),
        showOnDashboard: subject?.showOnDashboard ?? true,
      },
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) form.reset();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Subject" : "Add Subject"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of this subject." : "Add a new subject to track."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Physics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Code (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., PHY-101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="font-bold transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20">{isEditing ? "Save Changes" : "Add Subject"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
