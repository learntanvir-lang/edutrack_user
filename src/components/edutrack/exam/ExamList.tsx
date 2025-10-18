

"use client";

import { useContext, useMemo } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { Exam } from "@/lib/types";
import ExamItem from "./ExamItem";
import { Separator } from "@/components/ui/separator";

const MasonryGrid = ({ children }: { children: React.ReactNode }) => (
    <div className="md:columns-2 lg:columns-3 gap-4 space-y-4">
      {children}
    </div>
);

const ExamCategory = ({ title, exams }: { title: string, exams: Exam[] }) => (
    <div>
        <h3 className="text-xl font-bold mb-4 text-muted-foreground">{title}</h3>
        <MasonryGrid>
            {exams.map((exam, index) => (
                <div 
                    key={exam.id} 
                    className="break-inside-avoid animate-fade-in-from-bottom"
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <ExamItem exam={exam} />
                </div>
            ))}
        </MasonryGrid>
    </div>
);

export function ExamList() {
  const { exams, examCategories } = useContext(AppDataContext);
  
  const { upcomingExams, pastExams } = useMemo(() => {
    const now = new Date();
    
    const upcoming = exams
      .filter(exam => new Date(exam.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    const past = exams
      .filter(exam => new Date(exam.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const groupByCategory = (examList: Exam[]) => {
        return examList.reduce((acc, exam) => {
            const categoryId = exam.categoryId || 'general';
            if (!acc[categoryId]) {
                acc[categoryId] = [];
            }
            acc[categoryId].push(exam);
            return acc;
        }, {} as Record<string, Exam[]>);
    };

    return { 
        upcomingExams: groupByCategory(upcoming), 
        pastExams: groupByCategory(past) 
    };
  }, [exams]);

  const sortedCategories = [...examCategories].sort((a, b) => a.order - b.order);
  const generalCategoryId = 'general';

  const upcomingCategories = sortedCategories
      .map(c => c.id)
      .concat(generalCategoryId)
      .filter(id => upcomingExams[id] && upcomingExams[id].length > 0);

  const pastCategories = sortedCategories
      .map(c => c.id)
      .concat(generalCategoryId)
      .filter(id => pastExams[id] && pastExams[id].length > 0);
      

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-muted-foreground">No exams found</h3>
        <p className="mt-1 text-sm text-muted-foreground">Add an exam to start tracking your schedule.</p>
      </div>
    );
  }

  const getCategoryName = (id: string) => {
      if (id === generalCategoryId) return 'General';
      return examCategories.find(c => c.id === id)?.name || 'Unnamed Category';
  }

  return (
    <div className="space-y-8">
        <>
          {upcomingCategories.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Upcoming</h2>
              <div className="space-y-6">
                {upcomingCategories.map(categoryId => (
                    <ExamCategory key={categoryId} title={getCategoryName(categoryId)} exams={upcomingExams[categoryId]} />
                ))}
              </div>
            </div>
          )}

          {pastCategories.length > 0 && (
            <div>
              {upcomingCategories.length > 0 && <Separator className="my-8" />}
              <h2 className="text-2xl font-semibold mb-6">Past</h2>
              <div className="space-y-6">
                {pastCategories.map(categoryId => (
                    <ExamCategory key={categoryId} title={getCategoryName(categoryId)} exams={pastExams[categoryId]} />
                ))}
              </div>
            </div>
          )}
        </>
    </div>
  );
}
