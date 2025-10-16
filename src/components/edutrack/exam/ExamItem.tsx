

"use client";

import { useState, useContext, memo } from "react";
import { Exam } from "@/lib/types";
import { AppDataContext } from "@/context/AppDataContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ExamDialog } from "./ExamDialog";
import { Pen, Calendar, Check, X, Trash2, Award, CalendarRange, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Countdown } from "../Countdown";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";

interface ExamItemProps {
  exam: Exam;
}

function ExamItem({ exam }: ExamItemProps) {
  const { subjects, dispatch } = useContext(AppDataContext);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleStatusChange = (isCompleted: boolean) => {
    dispatch({
      type: "UPDATE_EXAM",
      payload: { ...exam, isCompleted },
    });
  };
  
  const handleDelete = () => {
    dispatch({ type: "DELETE_EXAM", payload: { id: exam.id } });
    setIsDeleteDialogOpen(false);
  };

  const isPast = new Date(exam.date) < new Date();

  const examDetailsBySubject = (exam.subjectIds || []).map(subjectId => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return null;

    const chapterNames = (exam.chapterIds || []).map(chapterId => {
      for (const paper of subject.papers) {
        const chapter = paper.chapters.find(c => c.id === chapterId);
        if (chapter) {
          return chapter.name;
        }
      }
      return null;
    }).filter(Boolean);

    if (exam.chapterIds?.length > 0 && chapterNames.length === 0 && (subject.papers.flatMap(p => p.chapters).length > 0)) return null;

    return {
      subjectName: subject.name,
      chapters: chapterNames.join(', ')
    };
  }).filter(Boolean);

  const scorePercentage = exam.isCompleted && exam.totalMarks && exam.marksObtained != null
    ? (exam.marksObtained / exam.totalMarks) * 100
    : 0;
  const isGoodScore = scorePercentage >= 80;

  return (
    <>
      <Card className={cn(
          "transition-all duration-300 w-full",
          isPast ? 
            (exam.isCompleted ? "bg-green-50 border-green-200 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-1" : "bg-red-50 border-red-200 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-1") :
            "bg-blue-50 border-blue-200 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1"
      )}>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-1">
              <CardTitle className="font-bold text-xl text-foreground">
                {exam.name}
              </CardTitle>
               <Badge variant="outline" className={cn(
                   "text-xs font-bold pointer-events-none mt-[10px]", 
                   exam.isEligible ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"
                )}>
                  {exam.isEligible ? <ShieldCheck className="h-3 w-3 mr-1" /> : <ShieldAlert className="h-3 w-3 mr-1" />}
                  {exam.isEligible ? 'Eligible' : 'Not Eligible'}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Pen className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-1">
              {(examDetailsBySubject.length > 0 ? examDetailsBySubject : (exam.subjectIds || []).map(sId => ({subjectName: subjects.find(s => s.id === sId)?.name, chapters: ''}))).map((detail, index) => detail && detail.subjectName && (
                <Badge key={index} variant={isPast ? (exam.isCompleted ? 'default' : 'destructive') : 'secondary'} className={cn('px-3 py-1 text-sm', 
                    isPast ? 
                        (exam.isCompleted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') : 
                        'bg-blue-100 text-blue-800'
                )}>
                  {detail.subjectName}{detail.chapters && ` - ${detail.chapters}`}
                </Badge>
              ))}
            </div>
            <p className={cn("flex items-center gap-2 pt-2 text-base font-semibold", isPast ? "text-foreground" : "text-primary")}>
              <Calendar className="h-4 w-4" /> {format(new Date(exam.date), "d MMMM, yyyy, p")}
            </p>
            {exam.startDate && exam.endDate && (
              <div className="pt-1 mb-[10px]">
                <p className="font-semibold text-foreground text-sm mb-[10px]">{exam.examPeriodTitle}</p>
                <p className={cn("flex items-center gap-2 text-sm font-bold", isPast ? "text-muted-foreground" : "text-primary/90")}>
                  <CalendarRange className="h-4 w-4" /> 
                  {format(new Date(exam.startDate), "d MMM")} - {format(new Date(exam.endDate), "d MMM, yyyy")}
                </p>
              </div>
            )}
            {exam.examFee && exam.examFee > 0 && (
                <div className="flex items-center gap-4 text-sm font-medium pt-2">
                    <span>Fee: <span className="font-bold">{exam.examFee}</span></span>
                    <span>Status: 
                        <span className={cn("font-bold", exam.isFeePaid ? 'text-green-600' : 'text-red-600')}>
                            {exam.isFeePaid ? ' Paid' : ' Not Paid'}
                        </span>
                    </span>
                </div>
            )}
          </div>
          {!isPast ? (
            <Countdown 
              targetDate={exam.date} 
              isPastOrCompleted={false} 
              variant="bordered"
              boxClassName="bg-primary/10"
            />
          ) : exam.isCompleted && exam.marksObtained != null && exam.totalMarks != null ? (
            <div className={cn("flex items-center justify-center gap-4 rounded-lg border p-3",
              isGoodScore ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
            )}>
              <Award className={cn("h-8 w-8", isGoodScore ? 'text-green-600' : 'text-red-600')} />
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-muted-foreground">SCORE:</span>
                <span className="text-2xl font-bold text-foreground">{exam.marksObtained}</span>
                <span className="text-base text-muted-foreground">out of</span>
                <span className="text-2xl font-bold text-foreground">{exam.totalMarks}</span>
              </div>
            </div>
          ) : (
             <Countdown 
                targetDate={exam.date} 
                isPastOrCompleted={true}
                variant="bordered"
            />
          )}
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
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={exam.name}
        itemType="exam"
      />
    </>
  );
}
export default memo(ExamItem);

    