
"use client";

import { useState } from "react";
import { Exam } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Countdown } from "../Countdown";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ExamDialog } from "./ExamDialog";
import { Book, Calendar, Pen, Clock, Edit } from "lucide-react";

interface NextExamCardProps {
  exam: Exam;
  subjectName: string;
  chapterName: string;
}

export default function NextExamCard({ exam, subjectName, chapterName }: NextExamCardProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const isPast = new Date(exam.date) < new Date();
  return (
    <>
      <Card className="bg-primary text-primary-foreground border-0 shadow-xl rounded-2xl">
        <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>Next Exam</span>
                  </div>
                  <CardTitle className="text-4xl font-bold">
                    {exam.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2 text-primary-foreground/90">
                      <Book className="h-4 w-4" /> {subjectName} • {chapterName}
                  </CardDescription>
                  <CardDescription className="flex items-center gap-2 mt-1 text-primary-foreground/90">
                      <Calendar className="h-4 w-4" /> {format(new Date(exam.date), "EEEE, MMMM dd, yyyy")}
                  </CardDescription>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                  <Pen className="mr-2 h-4 w-4" />
                  Edit
              </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80 mb-2">
                <Clock className="h-4 w-4" />
                <span>Time Remaining</span>
            </div>
            <Countdown targetDate={exam.date} isPastOrCompleted={isPast || exam.isCompleted} />
        </CardContent>
      </Card>
      <ExamDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} exam={exam} />
    </>
  );
}
