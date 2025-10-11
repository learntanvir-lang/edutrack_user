
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { StudyTask } from "@/lib/types";
import { Progress } from '@/components/ui/progress';

interface TaskProgressCardProps {
    tasks: StudyTask[];
}

export function TaskProgressCard({ tasks }: TaskProgressCardProps) {
    const { completed, total, totalTimeSpent, percentage } = useMemo(() => {
        const completedTasks = tasks.filter(t => t.isCompleted).length;
        const totalTasks = tasks.length;
        return {
            completed: completedTasks,
            total: totalTasks,
            totalTimeSpent: tasks.reduce((acc, task) => acc + (task.timeSpent || 0), 0),
            percentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        }
    }, [tasks]);

    const formatTime = (totalSeconds: number) => {
        if (totalSeconds === 0) return 'No time tracked';
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m spent`;
        return `${minutes}m spent`;
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Today's Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground text-lg">{completed} / {total} completed</span>
                     <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(totalTimeSpent)}</span>
                    </div>
                </div>
                <Progress value={percentage} className="h-2" />
            </CardContent>
        </Card>
    );
}
