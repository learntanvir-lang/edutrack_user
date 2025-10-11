
"use client";

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line, DotProps, LabelList, Dot } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';
import type { StudyTask } from '@/lib/types';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Download, ListFilter } from 'lucide-react';

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

const formatTime = (totalMilliseconds: number, formatType: 'short' | 'long') => {
    if (totalMilliseconds < 60000) return formatType === 'short' ? '0m' : '0 minutes';

    const hours = Math.floor(totalMilliseconds / 3600000);
    const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
    
    let parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(' ');
};

const CustomDot = (props: any) => {
    const { cx, cy, stroke, payload } = props;

    if (payload.hours > 0) {
        return <Dot cx={cx} cy={cy} r={5} fill={stroke} strokeWidth={2} />;
    }

    return null;
};

const CustomLabel = (props: any) => {
    const { x, y, value, index } = props;
    if (value === 0) return null;

    const timeString = formatTime(value * 3600000, 'short');
    
    return (
        <text x={x} y={y} dy={-15} fill="hsl(var(--foreground))" fontSize={12} fontWeight="bold" textAnchor="middle">
            {timeString}
        </text>
    );
};


export function TaskAnalyticsChart({ tasks, dateRange }: TaskAnalyticsChartProps) {

  const { chartData, totalTime } = useMemo(() => {
    if (!dateRange.from || !dateRange.to) {
        return { chartData: [], totalTime: 0 };
    }
    const daysInInterval = eachDayOfInterval({
        start: startOfDay(dateRange.from),
        end: startOfDay(dateRange.to),
    });

    let totalMilliseconds = 0;
    
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
                    const sessionTime = new Date(log.endTime).getTime() - new Date(log.startTime).getTime();
                    totalMilliseconds += sessionTime;
                    return acc + sessionTime;
                }
                return acc;
            }, 0);
            dataByDay[dayKey] += timeInMillis;
        }
    });

    const chartData = Object.entries(dataByDay).map(([date, totalMillis]) => ({
        date,
        hours: parseFloat((totalMillis / (1000 * 60 * 60)).toFixed(2)),
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return { chartData, totalTime: totalMilliseconds };
    
  }, [tasks, dateRange]);


    if (chartData.every(d => d.hours === 0)) {
        return (
            <div className="flex h-[450px] w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center shadow-sm">
                <div>
                    <h3 className="text-lg font-semibold text-muted-foreground">No data to display</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Track time on your tasks to see your progress here.</p>
                </div>
            </div>
        )
    }

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
                <CardTitle className="text-xl font-bold">Time Summary</CardTitle>
                <CardDescription className="text-3xl font-bold text-primary">{formatTime(totalTime, 'long')}</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        tickFormatter={(value) => format(new Date(value), 'E')}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        tickFormatter={(value) => `${value}h`}
                    />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        content={<ChartTooltipContent 
                            labelFormatter={(label) => format(new Date(label), 'PPP')}
                            formatter={(value) => `${formatTime(Number(value) * 3600000, 'long')}`}
                            indicator="dot"
                        />}
                    />
                    <Line
                        type="monotone"
                        dataKey="hours"
                        stroke="var(--color-hours)"
                        strokeWidth={3}
                        dot={<CustomDot />}
                    >
                      <LabelList content={<CustomLabel />} />
                    </Line>
                </LineChart>
            </ChartContainer>
        </div>
        {dateRange.from && dateRange.to && (
            <div className="text-center font-semibold text-muted-foreground mt-4">
                {format(dateRange.from, 'd MMM, yyyy')} - {format(dateRange.to, 'd MMM, yyyy')}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
