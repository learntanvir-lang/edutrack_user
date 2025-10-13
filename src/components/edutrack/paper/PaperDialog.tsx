
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
import { Paper } from "@/lib/types";
import { useContext } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';

const paperSchema = z.object({
  name: z.string().min(1, "Paper name is required"),
});

type PaperFormValues = z.infer<typeof paperSchema>;

interface PaperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  paper?: Paper;
}

export function PaperDialog({ open, onOpenChange, subjectId, paper }: PaperDialogProps) {
  const { dispatch } = useContext(AppDataContext);
  const isEditing = !!paper;

  const form = useForm<PaperFormValues>({
    resolver: zodResolver(paperSchema),
    defaultValues: {
      name: paper?.name || "",
    },
  });

  const onSubmit = (values: PaperFormValues) => {
    dispatch({
      type: isEditing ? "UPDATE_PAPER" : "ADD_PAPER",
      payload: {
        subjectId,
        paper: {
          id: paper?.id || uuidv4(),
          name: values.name,
          chapters: paper?.chapters || [],
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
          <DialogTitle>{isEditing ? "Edit Paper" : "Add Paper"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the name of this paper." : "Add a new paper to this subject."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paper Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1st Paper" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="font-bold transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20">{isEditing ? "Save Changes" : "Add Paper"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
