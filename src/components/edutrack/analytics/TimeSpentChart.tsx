
"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';

interface TimeSpentChartProps {
  data: { date: string; hours: number }[];
}

const chartConfig = {
  hours: {
    label: 'Hours',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function TimeSpentChart({ data }: TimeSpentChartProps) {
    if (data.length === 0) {
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
    <div className="h-96 w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={data} accessibilityLayer>
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
  );
}
