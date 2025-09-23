"use client";

import { useState, useMemo, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { AppDataContext } from '@/context/AppDataContext';
import { Exam, Subject } from '@/lib/types';
import NextExamCard from '@/components/edutrack/exam/NextExamCard';
import { ExamList } from '@/components/edutrack/exam/ExamList';
import { SubjectList } from '@/components/edutrack/subject/SubjectList';
import { PlusCircle } from 'lucide-react';
import { SubjectDialog } from '@/components/edutrack/subject/SubjectDialog';

type View = 'exams' | 'subjects';

export default function Home() {
  const [activeView, setActiveView] = useState<View | null>(null);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const { exams, subjects } = useContext(AppDataContext);

  const upcomingExams = useMemo(() => {
    return exams
      .filter(exam => new Date(exam.date) >= new Date() && !exam.isCompleted)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exams]);

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'N/A';
  };

  const getChapterName = (subjectId: string, chapterId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return 'N/A';
    for (const paper of subject.papers) {
      const chapter = paper.chapters.find(c => c.id === chapterId);
      if (chapter) return chapter.name;
    }
    return 'N/A';
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Upcoming Exams
        </h1>
        {upcomingExams.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingExams.map(exam => (
              <NextExamCard
                key={exam.id}
                exam={exam}
                subjectName={getSubjectName(exam.subjectId)}
                chapterName={getChapterName(exam.subjectId, exam.chapterId)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-muted-foreground">No upcoming exams</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add an exam to start tracking.</p>
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b pb-4">
            <div className="flex gap-2">
                 <Button
                    variant={activeView === 'exams' ? 'default' : 'outline'}
                    onClick={() => setActiveView(activeView === 'exams' ? null : 'exams')}
                    className="transition-all"
                >
                    All Exams
                </Button>
                <Button
                    variant={activeView === 'subjects' ? 'default' : 'outline'}
                    onClick={() => setActiveView(activeView === 'subjects' ? null : 'subjects')}
                    className="transition-all"
                >
                    Subjects
                </Button>
            </div>
            {activeView === 'subjects' && (
                <Button variant="outline" size="sm" onClick={() => setIsSubjectDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Subject
                </Button>
            )}
        </div>

        <div>
          {activeView === 'exams' && <ExamList />}
          {activeView === 'subjects' && <SubjectList />}
        </div>
      </section>
      
      <SubjectDialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen} />
    </div>
  );
}
