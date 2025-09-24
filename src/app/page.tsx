"use client";

import { useState, useMemo, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { AppDataContext } from '@/context/AppDataContext';
import { Exam, Subject } from '@/lib/types';
import NextExamCard from '@/components/edutrack/exam/NextExamCard';
import { ExamList } from '@/components/edutrack/exam/ExamList';
import { SubjectList } from '@/components/edutrack/subject/SubjectList';
import { PlusCircle, BookOpen, Target } from 'lucide-react';
import { SubjectDialog } from '@/components/edutrack/subject/SubjectDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

type View = 'exams' | 'subjects';

export default function Home() {
  const [activeView, setActiveView] = useState<View | null>(null);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const { exams, subjects } = useContext(AppDataContext);

  const nextExam = useMemo(() => {
    const upcoming = exams
      .filter(exam => new Date(exam.date) >= new Date() && !exam.isCompleted)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming[0];
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

  const handleViewToggle = (view: View) => {
    setActiveView(prev => prev === view ? null : view);
  };

  if (activeView === 'subjects') {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Button variant="outline" onClick={() => setActiveView(null)} className="mb-4">
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Subjects</h1>
            <Button variant="outline" size="sm" onClick={() => setIsSubjectDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Subject
            </Button>
        </div>
        <SubjectList />
        <SubjectDialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen} />
      </div>
    );
  }

  if (activeView === 'exams') {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Button variant="outline" onClick={() => setActiveView(null)} className="mb-4">
          Back to Dashboard
        </Button>
        <ExamList />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Dashboard
        </h1>
        
        {nextExam ? (
          <NextExamCard
            exam={nextExam}
            subjectName={getSubjectName(nextExam.subjectId)}
            chapterName={getChapterName(nextExam.subjectId, nextExam.chapterId)}
          />
        ) : (
          <Card className="bg-primary text-primary-foreground border-0">
            <CardHeader>
              <CardTitle>No Upcoming Exams</CardTitle>
              <CardDescription className="text-primary-foreground/80">Add an exam to start tracking.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" onClick={() => setActiveView('exams')}>Add Exam</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8 mt-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewToggle('subjects')}>
                <CardHeader className="flex flex-row items-center gap-4">
                    <BookOpen className="w-8 h-8 text-primary" />
                    <div>
                        <CardTitle className="text-xl">Subjects &amp; Syllabus</CardTitle>
                        <CardDescription>Manage all your subjects, papers, and chapters.</CardDescription>
                    </div>
                </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewToggle('exams')}>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Target className="w-8 h-8 text-primary" />
                    <div>
                        <CardTitle className="text-xl">Exams</CardTitle>
                        <CardDescription>Track all your upcoming and past exams.</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>
      
      <SubjectDialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen} />
    </div>
  );
}
