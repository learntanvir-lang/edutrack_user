
"use client";

import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line, DotProps, LabelList, Dot } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format, eachDayOfInterval, startOfDay, eachWeekOfInterval, getWeekOfMonth } from 'date-fns';
import type { StudyTask } from '@/lib/types';
import type { DateRange } from 'react-day-picker';
import type { ViewType } from '@/app/studytask/page';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface TaskAnalyticsChartProps {
  tasks: StudyTask[];
  dateRange: DateRange;
  viewType: ViewType;
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
    if (hours > 0) parts.push(formatType === 'long' ? `${hours} hours` : `${hours}h`);
    if (minutes > 0) parts.push(formatType === 'long' ? `${minutes} minutes` : `${minutes}m`);

    return parts.join(' ') || (formatType === 'short' ? '0m' : '0 minutes');
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


export function TaskAnalyticsChart({ tasks, dateRange, viewType }: TaskAnalyticsChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');

  const { categories, subcategories } = useMemo(() => {
    const allCategories = new Set<string>();
    const allSubcategories = new Set<string>();
    tasks.forEach(task => {
        if (task.category) allCategories.add(task.category);
        if (task.subcategory) allSubcategories.add(task.subcategory);
    });
    return {
        categories: ['all', ...Array.from(allCategories).sort()],
        subcategories: ['all', ...Array.from(allSubcategories).sort()],
    };
  }, [tasks]);

  const { chartData, totalTime } = useMemo(() => {
    if (!dateRange.from || !dateRange.to) {
        return { chartData: [], totalTime: 0 };
    }

    const filteredTasks = tasks.filter(task => {
        const categoryMatch = selectedCategory === 'all' || task.category === selectedCategory;
        const subcategoryMatch = selectedSubcategory === 'all' || task.subcategory === selectedSubcategory;
        return categoryMatch && subcategoryMatch;
    });

    let totalMilliseconds = 0;
    
    const tasksByDay: { [key: string]: number } = {};

    filteredTasks.forEach(task => {
        const taskDate = startOfDay(new Date(task.date));
        if (taskDate >= startOfDay(dateRange.from!) && taskDate <= startOfDay(dateRange.to!)) {
            const dayKey = format(taskDate, 'yyyy-MM-dd');
            if (!tasksByDay[dayKey]) {
                tasksByDay[dayKey] = 0;
            }
            const timeInMillis = (task.timeLogs || []).reduce((acc, log) => {
                if (log.endTime) {
                    const sessionTime = new Date(log.endTime).getTime() - new Date(log.startTime).getTime();
                    totalMilliseconds += sessionTime;
                    return acc + sessionTime;
                }
                return acc;
            }, 0);
            tasksByDay[dayKey] += timeInMillis;
        }
    });

    if (viewType === 'monthly') {
        const weeks = eachWeekOfInterval(
            { start: dateRange.from, end: dateRange.to },
            { weekStartsOn: 6 } // Saturday
        );

        const dataByWeek = weeks.map((weekStart, index) => {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
            
            const totalMillisInWeek = daysInWeek.reduce((acc, day) => {
                const dayKey = format(day, 'yyyy-MM-dd');
                return acc + (tasksByDay[dayKey] || 0);
            }, 0);

            return {
                week: `Week ${index + 1}`,
                hours: parseFloat((totalMillisInWeek / (1000 * 60 * 60)).toFixed(2)),
            };
        });

        return { chartData: dataByWeek, totalTime: totalMilliseconds };

    } else { // weekly or daily
        const daysInInterval = eachDayOfInterval({
            start: startOfDay(dateRange.from),
            end: startOfDay(dateRange.to),
        });

        const dataByDay = daysInInterval.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            return {
                date: dayKey,
                hours: parseFloat(((tasksByDay[dayKey] || 0) / (1000 * 60 * 60)).toFixed(2)),
            };
        });

        return { chartData: dataByDay, totalTime: totalMilliseconds };
    }
    
  }, [tasks, dateRange, viewType, selectedCategory, selectedSubcategory]);


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
                <CardTitle className="text-xl font-bold">{viewType.charAt(0).toUpperCase() + viewType.slice(1)} Time Summary</CardTitle>
                <CardDescription className="text-3xl font-bold text-primary">{formatTime(totalTime, 'long')}</CardDescription>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {categories.map(cat => (
                            <DropdownMenuItem key={cat} onSelect={() => setSelectedCategory(cat)}>
                                {cat === 'all' ? 'All Categories' : cat}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            {selectedSubcategory === 'all' ? 'All Subcategories' : selectedSubcategory}
                             <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {subcategories.map(subcat => (
                            <DropdownMenuItem key={subcat} onSelect={() => setSelectedSubcategory(subcat)}>
                                {subcat === 'all' ? 'All Subcategories' : subcat}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                        dataKey={viewType === 'monthly' ? "week" : "date"}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        tickFormatter={(value) => viewType === 'monthly' ? value : format(new Date(value), 'E')}
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
                            labelFormatter={(label) => viewType === 'monthly' ? label : format(new Date(label), 'PPP')}
                            formatter={(value) => `${formatTime(Number(value) * 3600000, 'long') || '0 minutes'}`}
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

    