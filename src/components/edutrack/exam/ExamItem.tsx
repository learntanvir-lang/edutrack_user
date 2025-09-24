"use client";

import { useState, useContext } from "react";
import { Exam } from "@/lib/types";
import { AppDataContext } from "@/context/AppDataContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ExamDialog } from "./ExamDialog";
import { Pen, Trash2, Calendar, BookOpen, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Countdown } from "../Countdown";

interface ExamItemProps {
  exam: Exam;
  subjectName: string;
  chapterName: string;
}

export function ExamItem({ exam, subjectName, chapterName }: ExamItemProps) {
  const { dispatch } = useContext(AppDataContext);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleStatusChange = (isCompleted: boolean) => {
    dispatch({
      type: "UPDATE_EXAM",
      payload: { ...exam, isCompleted },
    });
  };
  
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this exam?")) {
      dispatch({
        type: "DELETE_EXAM",
        payload: exam.id,
      });
    }
  }

  const isPast = new Date(exam.date) < new Date();

  return (
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow bg-red-50/20 border-red-200 rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <CardTitle className="font-bold text-2xl">
              {exam.name}
            </CardTitle>
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditDialogOpen(true)}>
                    <Pen className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> {subjectName} - {chapterName}
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> {format(new Date(exam.date), "P")}
            </p>
          </div>
          {!isPast && <Countdown targetDate={exam.date} />}
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Button
            onClick={() => handleStatusChange(false)}
            variant={!exam.isCompleted ? "destructive" : "outline"}
            size="sm"
            className={cn("w-full", !exam.isCompleted ? "bg-red-500 text-white" : "")}
          >
            <X className="mr-2 h-4 w-4"/>
            Not Completed
          </Button>
          <Button
            onClick={() => handleStatusChange(true)}
            variant={exam.isCompleted ? "default" : "outline"}
            size="sm"
            className={cn("w-full", exam.isCompleted ? "bg-green-600 hover:bg-green-700 text-white" : "")}
          >
            <Check className="mr-2 h-4 w-4" />
            Completed
          </Button>
        </CardFooter>
      </Card>
      <ExamDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} exam={exam} />
    </>
  );
}
