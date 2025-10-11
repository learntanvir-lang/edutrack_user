
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { StudyTask } from "@/lib/types";

interface TaskProgressCardProps {
    tasks: StudyTask[];
}

export function TaskProgressCard({ tasks }: TaskProgressCardProps) {
    const { completed, total } = useMemo(() => {
        return {
            completed: tasks.filter(t => t.isCompleted).length,
            total: tasks.length
        }
    }, [tasks]);

    // Simple estimation, can be refined
    const estimatedTime = useMemo(() => {
        const remainingTasks = total - completed;
        if (remainingTasks <= 0) return "Done!";
        if (remainingTasks * 25 < 60) return `${remainingTasks * 25} minutes`;
        const hours = Math.floor((remainingTasks * 25) / 60);
        const minutes = (remainingTasks * 25) % 60;
        return `${hours}h ${minutes}m remaining`;

    }, [completed, total]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Today's Progress</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground text-lg">{completed} / {total} completed</span>
                     <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                        <Clock className="h-4 w-4" />
                        <span>{total > 0 ? estimatedTime : 'No tasks'}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
