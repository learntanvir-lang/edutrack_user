

"use client";

import { useState, useContext, memo } from "react";
import { Exam } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Countdown } from "../Countdown";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ExamDialog } from "./ExamDialog";
import { Book, Calendar, Pen, Clock, Info, CalendarRange } from "lucide-react";
import { AppDataContext } from "@/context/AppDataContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NextExamCardProps {
  exam: Exam;
}

function NextExamCard({ exam }: NextExamCardProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { subjects, examCategories } = useContext(AppDataContext);
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

    const categoryName = exam.categoryId ? examCategories.find(c => c.id === exam.categoryId)?.name : 'General';


  return (
    <>
      <Card className={cn(
        "bg-primary text-primary-foreground border-0 shadow-xl rounded-2xl",
        "[--card-foreground:theme(colors.primary.foreground)] [--muted-foreground:theme(colors.primary.foreground/0.8)]",
        "transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1"
      )}>
        <CardHeader className="p-8 pb-6">
            <div className="flex justify-between items-start">
              <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>Next Exam: {categoryName}</span>
                  </div>
                  <CardTitle className="text-3xl font-bold">
                    {exam.name}
                  </CardTitle>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-lg font-bold text-primary-foreground">
                      <Calendar className="h-5 w-5" />
                      <span>{format(new Date(exam.date), "PPPPp")}</span>
                  </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full border border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground" onClick={() => setIsEditDialogOpen(true)}>
                  <Pen className="h-4 w-4" />
              </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-6 p-8 pt-0">
            {exam.startDate && exam.endDate && (
              <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80">
                      <CalendarRange className="h-4 w-4" />
                      <span>{exam.examPeriodTitle || 'Exam Period'}</span>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1 text-base font-bold bg-primary-foreground/20 text-primary-foreground transition-all hover:bg-primary-foreground/30 hover:scale-105">
                     {format(new Date(exam.startDate), "d MMM")} - {format(new Date(exam.endDate), "d MMM, yyyy")}
                  </Badge>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80">
                  <Info className="h-4 w-4" />
                  <span>Syllabus</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(examDetailsBySubject.length > 0 ? examDetailsBySubject : (exam.subjectIds || []).map(sId => ({subjectName: subjects.find(s => s.id === sId)?.name, chapters: ''}))).map((detail, index) => detail && detail.subjectName && (
                  <Badge key={index} variant="secondary" className="px-3 py-1 text-base bg-primary-foreground/20 text-primary-foreground transition-all hover:bg-primary-foreground/30 hover:scale-105">
                    {detail.subjectName}{detail.chapters && ` - ${detail.chapters}`}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80">
                    <Clock className="h-4 w-4" />
                    <span>Time Remaining</span>
                </div>
                <Countdown targetDate={exam.date} isPastOrCompleted={isPast || exam.isCompleted} />
            </div>
        </CardContent>
      </Card>
      <ExamDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} exam={exam} />
    </>
  );
}

export default memo(NextExamCard);
