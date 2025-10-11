
"use client";

import { useState, useMemo, useContext, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AppDataContext } from '@/context/AppDataContext';
import { DateRange } from 'react-day-picker';
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { DateRangePicker } from '@/components/edutrack/analytics/DateRangePicker';
import { TimeSpentChart } from '@/components/edutrack/analytics/TimeSpentChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AnalyticsPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { tasks } = useContext(AppDataContext);

    const [range, setRange] = useState<string>('this-week');
    const [customRange, setCustomRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 6),
        to: new Date(),
    });

    useEffect(() => {
        if (!isUserLoading) {
            if (!user) {
                router.push('/login');
            } else if (!user.emailVerified) {
                router.push('/verify-email');
            }
        }
    }, [user, isUserLoading, router]);

    const dateRange = useMemo((): DateRange => {
        const today = new Date();
        switch (range) {
            case 'this-week':
                return { from: startOfWeek(today), to: endOfWeek(today) };
            case 'this-month':
                return { from: startOfMonth(today), to: endOfMonth(today) };
            case 'custom':
                return customRange || { from: today, to: today };
            default:
                return { from: startOfWeek(today), to: endOfWeek(today) };
        }
    }, [range, customRange]);

    const chartData = useMemo(() => {
        const filteredTasks = tasks.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate >= (dateRange.from || 0) && taskDate <= (dateRange.to || Infinity);
        });

        const dataByDay: { [key: string]: number } = {};

        filteredTasks.forEach(task => {
            const day = task.date; // YYYY-MM-DD
            if (!dataByDay[day]) {
                dataByDay[day] = 0;
            }
            const timeInMillis = (task.timeLogs || []).reduce((acc, log) => {
                if (log.endTime) {
                    return acc + (new Date(log.endTime).getTime() - new Date(log.startTime).getTime());
                }
                return acc;
            }, 0);
            dataByDay[day] += timeInMillis;
        });

        return Object.entries(dataByDay).map(([date, totalMillis]) => ({
            date,
            hours: parseFloat((totalMillis / (1000 * 60 * 60)).toFixed(2)),
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
    }, [tasks, dateRange]);

    if (isUserLoading || !user || !user.emailVerified) {
        return (
            <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                    Study Analytics
                </h1>
                <DateRangePicker
                    range={range}
                    setRange={setRange}
                    customRange={customRange}
                    setCustomRange={setCustomRange}
                />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Time Spent</CardTitle>
                    <CardDescription>
                        Total hours spent on tasks per day for the selected period.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TimeSpentChart data={chartData} />
                </CardContent>
            </Card>
        </div>
    );
}
