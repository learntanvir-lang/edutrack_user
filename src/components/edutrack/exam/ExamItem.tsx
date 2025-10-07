
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
import { Badge } from "@/components/ui/badge";

interface ExamItemProps {
  exam: Exam;
}

export function ExamItem({ exam }: ExamItemProps) {
  const { subjects, dispatch } = useContext(AppDataContext);
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

  const examDetails = (exam.chapterIds || []).map(chapterId => {
    for (const subject of subjects) {
      if (exam.subjectIds.includes(subject.id)) {
        for (const paper of subject.papers) {
          const chapter = paper.chapters.find(c => c.id === chapterId);
          if (chapter) {
            return {
              subjectName: subject.name,
              chapterName: chapter.name
            };
          }
        }
      }
    }
    return null;
  }).filter(Boolean);

  return (
    <>
      <Card className={cn(
          "transition-all duration-300",
          isPast ? 
            (exam.isCompleted ? "bg-green-50 border-green-200 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-1" : "bg-red-50 border-red-200 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-1") :
            "bg-card border-2 border-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1"
      )}>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <CardTitle className="font-bold text-xl">
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
        <CardContent className="space-y-4 px-6 pb-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-1">
              {examDetails.map((detail, index) => detail && (
                <Badge key={index} variant={isPast ? (exam.isCompleted ? 'default' : 'destructive') : 'secondary'} className={cn('px-3 py-1 text-sm', 
                    isPast ? (exam.isCompleted ? 'bg-green-100 text-green-800 transition-all hover:bg-green-200 hover:scale-105' : 'bg-red-100 text-red-800 transition-all hover:bg-red-200 hover:scale-105') : ''
                )}>
                  {detail.subjectName} - {detail.chapterName}
                </Badge>
              ))}
            </div>
            <p className={cn("flex items-center gap-2 pt-2 text-base font-semibold", isPast ? "text-foreground" : "text-primary")}>
              <Calendar className="h-4 w-4" /> {format(new Date(exam.date), "d MMMM, yyyy, p")}
            </p>
          </div>
          <Countdown 
            targetDate={exam.date} 
            isPastOrCompleted={isPast || exam.isCompleted} 
            variant="bordered"
            boxClassName={!isPast ? "bg-primary/10" : ""}
          />
        </CardContent>
        {isPast && (
          <CardFooter className="flex justify-between gap-2">
            <div className="flex w-full items-center space-x-2">
                  <Button
                      onClick={() => handleStatusChange(false)}
                      variant={!exam.isCompleted ? "destructive" : "outline"}
                      size="sm"
                      className="w-full"
                  >
                      <X className="mr-2 h-4 w-4" />
                      Not Completed
                  </Button>
                  <Button
                      onClick={() => handleStatusChange(true)}
                      variant={exam.isCompleted ? "default" : "outline"}
                      size="sm"
                      className={cn("w-full", exam.isCompleted && "bg-green-600 hover:bg-green-700")}
                  >
                      <Check className="mr-2 h-4 w-4" />
                      Completed
                  </Button>
              </div>
          </CardFooter>
        )}
      </Card>
      <ExamDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} exam={exam} />
    </>
  );
}
