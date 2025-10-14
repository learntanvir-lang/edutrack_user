
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Dispatch, SetStateAction, useMemo } from "react";
import type { StudyTask } from "@/lib/types";
import { format, isSameDay } from "date-fns";
import type { DayContentProps } from "react-day-picker";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
    selectedDate: Date;
    setSelectedDate: Dispatch<SetStateAction<Date>>;
    tasks: StudyTask[];
}

export function CalendarView({ selectedDate, setSelectedDate, tasks }: CalendarViewProps) {
    const { completedDays, incompleteDays } = useMemo(() => {
        const statusByDay: { [key: string]: 'completed' | 'incomplete' } = {};

        tasks.forEach(task => {
            const taskDate = new Date(task.date);
            const dayKey = format(taskDate, 'yyyy-MM-dd');

            if (statusByDay[dayKey] === 'incomplete') {
                return;
            }

            if (task.isCompleted) {
                if (!statusByDay[dayKey]) {
                    statusByDay[dayKey] = 'completed';
                }
            } else {
                statusByDay[dayKey] = 'incomplete';
            }
        });

        const completedDays: Date[] = [];
        const incompleteDays: Date[] = [];

        for (const dayKey in statusByDay) {
            const date = new Date(dayKey);
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Adjust for timezone
            if (statusByDay[dayKey] === 'completed') {
                completedDays.push(date);
            } else {
                incompleteDays.push(date);
            }
        }

        return { completedDays, incompleteDays };

    }, [tasks]);

    const CustomDay = (props: DayContentProps) => {
        const { date, activeModifiers } = props;
        const isCompleted = completedDays.some(d => isSameDay(d, date));
        const isIncomplete = incompleteDays.some(d => isSameDay(d, date));
        
        return (
            <div className="relative w-full h-full flex items-center justify-center">
                <span className={cn(activeModifiers.selected && "font-bold")}>{date.getDate()}</span>
                {isCompleted && <div className="day-dot day-dot-green" />}
                {isIncomplete && <div className="day-dot day-dot-red" />}
            </div>
        );
    };

    return (
        <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardContent className="p-2">
                 <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="w-full"
                    components={{
                        DayContent: CustomDay,
                    }}
                    modifiers={{
                        completed: completedDays,
                        incomplete: incompleteDays,
                    }}
                 />
            </CardContent>
        </Card>
    )
}
