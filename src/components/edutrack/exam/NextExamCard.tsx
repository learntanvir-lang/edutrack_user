"use client";

import { useState } from "react";
import { Exam } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Countdown } from "../Countdown";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ExamDialog } from "./ExamDialog";
import { Book, Calendar, Pen } from "lucide-react";

interface NextExamCardProps {
  exam: Exam;
  subjectName: string;
  chapterName: string;
}

export default function NextExamCard({ exam, subjectName, chapterName }: NextExamCardProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  return (
    <>
        <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
            <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl font-bold text-primary">
                {exam.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                    <Book className="h-4 w-4" /> {subjectName} - {chapterName}
                </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                <Pen className="h-4 w-4" />
            </Button>
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <Countdown targetDate={exam.date} />
        </CardContent>
        <CardFooter className="bg-muted/50 p-4 rounded-b-lg">
            <div className="flex items-center text-sm font-medium text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{format(new Date(exam.date), "EEE, dd MMM yyyy")}</span>
            </div>
        </CardFooter>
        </Card>
        <ExamDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} exam={exam} />
    </>
  );
}
