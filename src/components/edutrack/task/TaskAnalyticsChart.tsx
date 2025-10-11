
"use client";

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';
import type { StudyTask } from '@/lib/types';
import type { DateRange } from 'react-day-picker';

interface TaskAnalyticsChartProps {
  tasks: StudyTask[];
  dateRange: DateRange;
}

const chartConfig = {
  hours: {
    label: 'Hours',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function TaskAnalyticsChart({ tasks, dateRange }: TaskAnalyticsChartProps) {

  const chartData = useMemo(() => {
    if (!dateRange.from || !dateRange.to) {
        return [];
    }
    const daysInInterval = eachDayOfInterval({
        start: startOfDay(dateRange.from),
        end: startOfDay(dateRange.to),
    });

    const dataByDay: { [key: string]: number } = daysInInterval.reduce((acc, day) => {
        acc[format(day, 'yyyy-MM-dd')] = 0;
        return acc;
    }, {} as { [key: string]: number });


    tasks.forEach(task => {
        const taskDate = new Date(task.date);
        const dayKey = format(taskDate, 'yyyy-MM-dd');

        if (dayKey in dataByDay) {
            const timeInMillis = (task.timeLogs || []).reduce((acc, log) => {
                if (log.endTime) {
                    return acc + (new Date(log.endTime).getTime() - new Date(log.startTime).getTime());
                }
                return acc;
            }, 0);
            dataByDay[dayKey] += timeInMillis;
        }
    });

    return Object.entries(dataByDay).map(([date, totalMillis]) => ({
        date,
        hours: parseFloat((totalMillis / (1000 * 60 * 60)).toFixed(2)),
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
  }, [tasks, dateRange]);


    if (chartData.every(d => d.hours === 0)) {
        return (
            <div className="flex h-96 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center shadow-sm">
                <div>
                    <h3 className="text-lg font-semibold text-muted-foreground">No data to display</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Track time on your tasks to see your progress here.</p>
                </div>
            </div>
        )
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Spent</CardTitle>
        <CardDescription>
            Total hours spent on tasks per day for the selected period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={chartData} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => format(new Date(value), 'MMM d')}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => `${value}h`}
                    />
                    <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent 
                            labelFormatter={(label) => format(new Date(label), 'PPP')}
                            formatter={(value) => `${value} hours`}
                        />}
                    />
                    <Bar
                        dataKey="hours"
                        fill="var(--color-hours)"
                        radius={8}
                        barSize={40}
                    />
                </BarChart>
            </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
