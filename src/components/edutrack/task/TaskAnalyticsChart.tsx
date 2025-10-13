

'use client';

import { useMemo, useState, useRef, useContext } from 'react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList, Dot, Rectangle, TooltipProps } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format, eachDayOfInterval, eachWeekOfInterval, differenceInCalendarDays, isValid, differenceInCalendarWeeks } from 'date-fns';
import type { StudyTask } from '@/lib/types';
import type { DateRange } from 'react-day-picker';
import type { ViewType } from '@/app/studytask/page';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Info, Calendar, BarChart2, Target, CalendarClock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppDataContext } from '@/context/AppDataContext';

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
    const minutes = Math.round((totalMilliseconds % 3600000) / 60000);
    
    let parts = [];
    if (hours > 0) parts.push(formatType === 'long' ? `${hours} hours` : `${hours}h`);
    if (minutes > 0 || (hours === 0 && totalMilliseconds > 0)) parts.push(formatType === 'long' ? `${minutes} minutes` : `${minutes}m`);

    return parts.join(' ') || (formatType === 'short' ? '0m' : '0 minutes');
};

const CustomDot = (props: any) => {
    const { cx, cy, stroke, payload } = props;

    if (payload.hours > 0) {
        return <Dot cx={cx} cy={cy} r={5} fill="hsl(var(--background))" stroke={stroke} strokeWidth={2} />;
    }

    return null;
};

const CustomLabel = (props: any) => {
    const { x, y, value } = props;
    if (value === 0) {
        return null;
    }
    if (!value) return null;

    const timeString = formatTime(value * 3600000, 'short');
    
    return (
        <text x={x} y={y} dy={-15} fill="hsl(var(--foreground))" fontSize={14} fontWeight="bold" textAnchor="middle">
            {timeString}
        </text>
    );
};

const CustomXAxisTick = (props: any) => {
    const { x, y, payload, viewType } = props;
    const { value } = payload;
    if (viewType === 'monthly') {
      return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={0} dy={16} textAnchor="middle" fill="#666">
            {value}
          </text>
        </g>
      );
    }
    try {
        const date = new Date(`${value}T00:00:00`);
        if (isValid(date)) {
            return (
                <g transform={`translate(${x},${y})`}>
                    <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={12}>
                        {format(date, 'd MMM')}
                    </text>
                    <text x={0} y={0} dy={30} textAnchor="middle" fill="#666" fontSize={12}>
                        {format(date, 'E')}
                    </text>
                </g>
            );
        }
    } catch (e) { /* ignore */ }
    
    return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={0} dy={16} textAnchor="middle" fill="#666">
            {value}
          </text>
        </g>
      );
}

export function TaskAnalyticsChart({ tasks, dateRange, viewType }: TaskAnalyticsChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const { settings } = useContext(AppDataContext);

  const { categories, subcategoriesByCategory } = useMemo(() => {
    const allCategories = new Set<string>();
    const subcats: { [key: string]: Set<string> } = {};

    tasks.forEach(task => {
        if (task.category) {
            allCategories.add(task.category);
            if (task.subcategory) {
                if (!subcats[task.category]) {
                    subcats[task.category] = new Set<string>();
                }
                subcats[task.category].add(task.subcategory);
            }
        }
    });

    return {
        categories: ['all', ...Array.from(allCategories).sort()],
        subcategoriesByCategory: Object.entries(subcats).reduce((acc, [key, value]) => {
            acc[key] = ['all', ...Array.from(value).sort()];
            return acc;
        }, {} as { [key: string]: string[] }),
    };
  }, [tasks]);
  
  const availableSubcategories = subcategoriesByCategory[selectedCategory] || ['all'];

  const { chartData, totalTime, maxHours, averageDailyTime, averageWeeklyTime } = useMemo(() => {
    if (!dateRange.from || !dateRange.to || !isValid(dateRange.from) || !isValid(dateRange.to)) {
        return { chartData: [], totalTime: 0, maxHours: 1, averageDailyTime: 0, averageWeeklyTime: 0 };
    }

    const filteredTasks = tasks.filter(task => {
        const categoryMatch = selectedCategory === 'all' || task.category === selectedCategory;
        const subcategoryMatch = selectedSubcategory === 'all' || task.subcategory === selectedSubcategory;
        return categoryMatch && subcategoryMatch;
    });

    let totalMilliseconds = 0;
    
    const tasksByDay: { [key: string]: number } = {};

    filteredTasks.forEach(task => {
        const taskDate = new Date(task.date);
         if (isValid(taskDate) && taskDate >= dateRange.from! && taskDate <= dateRange.to!) {
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
    
    let data: { date?: string; week?: string; hours: number }[];
    
    if (viewType === 'monthly') {
        const weeks = eachWeekOfInterval(
            { start: dateRange.from, end: dateRange.to },
            { weekStartsOn: 6 } // Saturday
        );

        data = weeks.map((weekStart, index) => {
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

    } else { // weekly or daily
        const daysInInterval = eachDayOfInterval({
            start: dateRange.from,
            end: dateRange.to,
        });

        data = daysInInterval.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            return {
                date: dayKey,
                hours: parseFloat(((tasksByDay[dayKey] || 0) / (1000 * 60 * 60)).toFixed(2)),
            };
        });
    }

    const maxHoursValue = data.length > 0 ? Math.max(...data.map(d => d.hours)) : 0;

    const daysInPeriod = differenceInCalendarDays(dateRange.to, dateRange.from) + 1;
    const avgTime = daysInPeriod > 0 ? totalMilliseconds / daysInPeriod : 0;
    const weeksInPeriod = differenceInCalendarWeeks(dateRange.to, dateRange.from, { weekStartsOn: 6 }) + 1;
    const avgWeeklyTime = weeksInPeriod > 0 ? totalMilliseconds / weeksInPeriod : 0;
    
    return { 
        chartData: data, 
        totalTime: totalMilliseconds, 
        maxHours: Math.ceil(maxHoursValue + 0.5) || 1,
        averageDailyTime: avgTime,
        averageWeeklyTime: avgWeeklyTime,
    };
    
  }, [tasks, dateRange, viewType, selectedCategory, selectedSubcategory]);

  const CustomTooltipCursor = (props: TooltipProps<number, string>) => {
    const { active, coordinate, payload } = props;
    if (active && coordinate && payload && payload.length) {
      return (
        <Rectangle
            fill="hsl(var(--primary))"
            opacity={0.2}
            x={coordinate.x}
            width={1.5}
            height={320}
        />
      );
    }
    return null;
  };
  
  const getTooltipLabelFormatter = (label: string) => {
    if (viewType === 'monthly') return label;
    try {
       const date = new Date(`${label}T00:00:00`);
       if (isValid(date)) {
        return format(date, 'PPP');
       }
    } catch (e) {
        // ignore
    }
    return label;
  }

  return (
    <Card className="shadow-lg rounded-xl border border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="grid gap-2 flex-1">
                <CardTitle className="text-xl font-bold">{viewType.charAt(0).toUpperCase() + viewType.slice(1)} Time Summary</CardTitle>
                <CardDescription className="text-3xl font-bold text-primary">{formatTime(totalTime, 'long')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {categories.map(cat => (
                            <DropdownMenuItem key={cat} onSelect={() => {
                                setSelectedCategory(cat);
                                setSelectedSubcategory('all'); // Reset subcategory when category changes
                            }}>
                                {cat === 'all' ? 'All Categories' : cat}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" disabled={selectedCategory === 'all' || availableSubcategories.length <= 1}>
                            {selectedSubcategory === 'all' ? 'All Subcategories' : selectedSubcategory}
                             <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {availableSubcategories.map(subcat => (
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
                <LineChart data={chartData} margin={{ top: 30, right: 20, left: -20, bottom: 20 }}>
                    <CartesianGrid stroke="hsl(var(--border) / 0.5)" />
                    <XAxis
                        dataKey={viewType === 'monthly' ? "week" : "date"}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        tick={<CustomXAxisTick viewType={viewType} />}
                        height={40}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        domain={[0, maxHours]}
                        tickFormatter={(value) => `${Number(value).toFixed(1)}h`}
                    />
                    <Tooltip
                        cursor={<CustomTooltipCursor />}
                        content={<ChartTooltipContent 
                            labelFormatter={getTooltipLabelFormatter}
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
            <div className="text-center font-semibold text-primary mt-4">
                {format(dateRange.from, 'd MMM, yyyy')} - {format(dateRange.to, 'd MMM, yyyy')}
            </div>
        )}
        {viewType === 'weekly' && (
            <Alert className="mt-4 bg-primary/5 border-primary/20">
                <AlertDescription className="grid grid-cols-1 divide-y divide-primary/10">
                    <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 py-2">
                        <Target className="h-5 w-5 text-primary" />
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground">Weekly Target</span>
                            <span className="font-bold text-primary">{settings.weeklyStudyGoal}h</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 py-2">
                        <BarChart2 className="h-5 w-5 text-primary" />
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground">Weekly Total</span>
                            <span className="font-bold text-primary">{formatTime(totalTime, 'short')}</span>
                        </div>
                    </div>
                     <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 py-2">
                        <CalendarClock className="h-5 w-5 text-primary" />
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground">Daily Average</span>
                            <span className="font-bold text-primary">{formatTime(averageDailyTime, 'short')}</span>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>
        )}
        {viewType === 'monthly' && (
            <Alert className="mt-4 bg-primary/5 border-primary/20">
                <AlertDescription className="grid grid-cols-1 divide-y divide-primary/10">
                    <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 py-2">
                        <BarChart2 className="h-5 w-5 text-primary" />
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground">Monthly Total</span>
                            <span className="font-bold text-primary">{formatTime(totalTime, 'short')}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 py-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground">Weekly Average</span>
                            <span className="font-bold text-primary">{formatTime(averageWeeklyTime, 'short')}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 py-2">
                        <CalendarClock className="h-5 w-5 text-primary" />
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground">Daily Average</span>
                            <span className="font-bold text-primary">{formatTime(averageDailyTime, 'short')}</span>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
    

  

    

    
