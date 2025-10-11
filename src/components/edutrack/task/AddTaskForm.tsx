
"use client";

import { useState, useContext } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from 'uuid';
import { AppDataContext } from '@/context/AppDataContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Plus } from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(1, "Task title cannot be empty."),
});
type TaskFormValues = z.infer<typeof taskSchema>;

interface AddTaskFormProps {
  date: string; // YYYY-MM-DD
}

export function AddTaskForm({ date }: AddTaskFormProps) {
  const { dispatch } = useContext(AppDataContext);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "" },
  });

  const onSubmit = (values: TaskFormValues) => {
    dispatch({
      type: "ADD_TASK",
      payload: {
        id: uuidv4(),
        title: values.title,
        date: date,
        isCompleted: false,
      },
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2 mb-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input placeholder="Add a new task for this day..." {...field} className="h-11" />
              </FormControl>
              <FormMessage className="mt-1"/>
            </FormItem>
          )}
        />
        <Button type="submit" size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </form>
    </Form>
  );
}
