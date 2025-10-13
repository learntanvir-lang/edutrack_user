
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
        
        const timeInMillis = tasks.reduce((acc, task) => {
            if (!task.timeLogs) {
                return acc;
            }
            return acc + task.timeLogs.reduce((logAcc, log) => {
                if (log.endTime) {
                    return logAcc + (new Date(log.endTime).getTime() - new Date(log.startTime).getTime());
                }
                return logAcc;
            }, 0);
        }, 0);

        return {
            completed: completedTasks,
            total: totalTasks,
            totalTimeSpent: timeInMillis,
            percentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        }
    }, [tasks]);

    const formatTime = (totalMilliseconds: number) => {
        if (totalMilliseconds < 1000) return 'No time tracked';
        
        const hours = Math.floor(totalMilliseconds / 3600000);
        const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
        
        if (hours > 0) return `${hours}h ${minutes}m spent`;
        return `${minutes}m spent`;
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Today's Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Progress value={percentage} className="h-2" />
                <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-foreground">{completed} / {total} Completed</span>
                     <div className="flex items-center gap-2 text-primary font-semibold">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(totalTimeSpent)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
