"use client";

import { useContext, useState, useMemo } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { ExamItem } from "./ExamItem";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ExamDialog } from "./ExamDialog";
import { Separator } from "@/components/ui/separator";

export function ExamList() {
  const { exams } = useContext(AppDataContext);
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);

  const { upcomingExams, pastExams } = useMemo(() => {
    const now = new Date();
    const upcoming = exams
      .filter(exam => new Date(exam.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const past = exams
      .filter(exam => new Date(exam.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { upcomingExams: upcoming, pastExams: past };
  }, [exams]);

  return (
    <div className="space-y-8">
       <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsExamDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Exam
            </Button>
        </div>

      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-muted-foreground">No exams found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add an exam to start tracking your schedule.</p>
        </div>
      ) : (
        <>
          {upcomingExams.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Upcoming</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingExams.map(exam => (
                  <ExamItem 
                    key={exam.id} 
                    exam={exam} 
                  />
                ))}
              </div>
            </div>
          )}

          {pastExams.length > 0 && (
            <div>
              {upcomingExams.length > 0 && <Separator className="my-8" />}
              <h2 className="text-2xl font-semibold mb-4">Past</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastExams.map(exam => (
                  <ExamItem 
                    key={exam.id} 
                    exam={exam} 
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <ExamDialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen} />
    </div>
  );
}
