
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
import { TaskDialog } from './TaskDialog';

interface AddTaskFormProps {
  date: string; // YYYY-MM-DD
}

export function AddTaskForm({ date }: AddTaskFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-start gap-2 mb-6">
        <Input 
            placeholder="Add a new task for this day..." 
            className="h-11 flex-1"
            onFocus={() => setIsDialogOpen(true)}
            readOnly
        />
        <Button size="lg" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      <TaskDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        date={date}
      />
    </>
  );
}
