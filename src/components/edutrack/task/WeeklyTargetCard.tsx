
"use client";

import { useState, useMemo, useContext, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AppDataContext } from '@/context/AppDataContext';
import { StudyTask } from '@/lib/types';
import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { Target, Check, Edit, Save, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WeeklyTargetCardProps {
    tasks: StudyTask[];
}

export function WeeklyTargetCard({ tasks }: WeeklyTargetCardProps) {
    const { settings, dispatch } = useContext(AppDataContext);
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [goal, setGoal] = useState(settings.weeklyStudyGoal);
    const goalMetNotified = useRef(false);

    useEffect(() => {
        setGoal(settings.weeklyStudyGoal);
    }, [settings.weeklyStudyGoal]);
    
    const { totalMillis, percentage } = useMemo(() => {
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        
        let total = 0;
        tasks.forEach(task => {
            if (isWithinInterval(new Date(task.date), { start: weekStart, end: weekEnd })) {
                total += (task.timeLogs || []).reduce((acc, log) => {
                    if (log.endTime) {
                        return acc + (new Date(log.endTime).getTime() - new Date(log.startTime).getTime());
                    }
                    return acc;
                }, 0);
            }
        });

        const goalInMillis = settings.weeklyStudyGoal * 60 * 60 * 1000;
        return {
            totalMillis: total,
            percentage: goalInMillis > 0 ? Math.min((total / goalInMillis) * 100, 100) : 0,
        };
    }, [tasks, settings.weeklyStudyGoal]);

    // Effect to show toast when goal is met
    useEffect(() => {
        if (percentage >= 100 && !goalMetNotified.current) {
            toast({
                title: "🎉 Weekly Goal Achieved! 🎉",
                description: `You've completed your goal of ${settings.weeklyStudyGoal} hours this week. Amazing work!`,
                duration: 5000,
            });
            goalMetNotified.current = true;
        }
        
        // Reset notification status at the start of a new week
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        if (now.getDay() === 1 && now.getHours() < 1) { // Early Monday morning
             goalMetNotified.current = false;
        }

    }, [percentage, settings.weeklyStudyGoal, toast]);
    
    // Effect to show toast for previous week's achievement
    useEffect(() => {
        const now = new Date();
        const lastWeekStart = startOfWeek(new Date(now.setDate(now.getDate() - 7)), { weekStartsOn: 1 });
        const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });
        
        if (new Date(settings.lastWeekGoalMetShown) < lastWeekStart) {
             let total = 0;
             tasks.forEach(task => {
                if (isWithinInterval(new Date(task.date), { start: lastWeekStart, end: lastWeekEnd })) {
                    total += (task.timeLogs || []).reduce((acc, log) => log.endTime ? acc + (new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) : acc, 0);
                }
            });
            
            const goalInMillis = settings.weeklyStudyGoal * 60 * 60 * 1000;
            if (total >= goalInMillis) {
                 toast({
                    title: "🏆 Last Week's Goal Achieved! 🏆",
                    description: `You successfully met your study goal last week. Keep up the momentum!`,
                    duration: 6000,
                });
                dispatch({ type: 'UPDATE_SETTINGS', payload: { lastWeekGoalMetShown: new Date().toISOString() }});
            }
        }
    }, [tasks, settings.weeklyStudyGoal, settings.lastWeekGoalMetShown, dispatch, toast]);

    const handleSave = () => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { weeklyStudyGoal: goal } });
        setIsEditing(false);
    };

    const formatTime = (ms: number) => {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    return (
        <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                   <Trophy className="h-5 w-5 text-amber-500" />
                   Weekly Study Target
                </CardTitle>
                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                    if (isEditing) {
                        handleSave();
                    } else {
                        setIsEditing(true);
                    }
                 }}>
                     {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                 </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex justify-between items-baseline text-sm">
                        <span className="font-semibold text-foreground">{formatTime(totalMillis)} / {settings.weeklyStudyGoal}h</span>
                        <span className={cn("font-bold text-lg", percentage >= 100 ? "text-green-500" : "text-primary")}>{Math.round(percentage)}%</span>
                    </div>
                    <Progress value={percentage} className={cn("h-3", percentage >= 100 && "[&>div]:bg-green-500")} />
                </div>
            </CardContent>
            {isEditing && (
                <CardFooter>
                     <div className="flex w-full items-center gap-2">
                        <Input 
                            type="number" 
                            value={goal} 
                            onChange={(e) => setGoal(Number(e.target.value))}
                            className="h-9"
                        />
                        <Button size="sm" onClick={handleSave}>Save</Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
