
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Dispatch, SetStateAction } from "react";

interface CalendarViewProps {
    selectedDate: Date;
    setSelectedDate: Dispatch<SetStateAction<Date>>;
}

export function CalendarView({ selectedDate, setSelectedDate }: CalendarViewProps) {
    return (
        <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardContent className="p-2">
                 <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="w-full"
                    />
            </CardContent>
        </Card>
    )
}
