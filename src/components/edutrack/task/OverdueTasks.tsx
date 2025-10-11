
"use client";

import { useState } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TaskItem } from './TaskItem';
import { StudyTask } from '@/lib/types';
import { cn } from '@/lib/utils';

interface OverdueTasksProps {
    tasks: StudyTask[];
}

export function OverdueTasks({ tasks }: OverdueTasksProps) {
    if (tasks.length === 0) {
        return null;
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="overdue-tasks" className="border-none">
                <AccordionTrigger className="p-0 hover:no-underline [&[data-state=open]>div]:bg-red-100/80">
                   <div className="flex items-center justify-between w-full p-3 rounded-lg bg-red-100/50 border border-red-200 text-red-700 transition-colors">
                     <div className="flex items-center gap-2 font-semibold">
                        <AlertCircle className="h-5 w-5" />
                        <span>{tasks.length} Overdue Task(s)</span>
                     </div>
                     <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                   </div>
                </AccordionTrigger>
                <AccordionContent className="bg-card border rounded-b-lg -mt-2 pt-2">
                    <div className="p-4 space-y-4">
                        {tasks.map(task => (
                            <TaskItem key={task.id} task={task} />
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
