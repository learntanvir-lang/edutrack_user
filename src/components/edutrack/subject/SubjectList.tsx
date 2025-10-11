
"use client";

import { useState, useContext, useMemo } from 'react';
import { Subject } from '@/lib/types';
import { AppDataContext } from '@/context/AppDataContext';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pen, ChevronDown, PlusCircle, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SubjectDialog } from './SubjectDialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PaperList } from '../paper/PaperList';
import { Card, CardTitle } from '@/components/ui/card';
import { PaperDialog } from '../paper/PaperDialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DeleteConfirmationDialog } from '../DeleteConfirmationDialog';

export function SubjectList() {
  const { subjects, dispatch } = useContext(AppDataContext);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [isPaperDialogOpen, setIsPaperDialogOpen] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => a.name.localeCompare(b.name));
  }, [subjects]);

  const handleDuplicate = (subject: Subject) => {
    const newSubject = {
      ...subject,
      createdAt: new Date().toISOString(), // new timestamp for duplicate
    }
    dispatch({ type: 'DUPLICATE_SUBJECT', payload: newSubject });
  };
  
  const handleDelete = () => {
    if (deletingSubject) {
        dispatch({ type: "DELETE_SUBJECT", payload: { id: deletingSubject.id } });
        setDeletingSubject(null);
    }
  };

  const handleAddPaperClick = (subjectId: string) => {
    setActiveSubjectId(subjectId);
    setIsPaperDialogOpen(true);
  };

  const onPaperDialogChange = (open: boolean) => {
    if (!open) {
      setActiveSubjectId(null);
    }
    setIsPaperDialogOpen(open);
  }
  
  const toggleShowOnDashboard = (subject: Subject) => {
    dispatch({
      type: 'UPDATE_SUBJECT',
      payload: { ...subject, showOnDashboard: !(subject.showOnDashboard ?? true) },
    });
  };

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-muted-foreground">No subjects yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Add a subject to begin organizing your studies.</p>
      </div>
    );
  }

  return (
    <>
      <Accordion type="multiple" className="w-full space-y-4">
        {sortedSubjects.map(subject => {
            const subjectProgress = subject.papers.flatMap(p => p.chapters).flatMap(c => c.progressItems).reduce(
                (acc, item) => {
                  acc.completed += item.completed;
                  acc.total += item.total;
                  return acc;
                },
                { completed: 0, total: 0 }
            );
            const percentage = subjectProgress.total > 0 ? Math.round((subjectProgress.completed / subjectProgress.total) * 100) : 0;
            const isVisible = subject.showOnDashboard ?? true;

            return (
          <AccordionItem key={subject.id} value={subject.id} className="border-none">
            <Card className="shadow-sm">
              <div className="flex items-center justify-between p-4">
                <AccordionTrigger className="p-0 hover:no-underline flex-1 group">
                   <div className="flex items-center gap-4">
                     <CardTitle>
                       {subject.name}
                      </CardTitle>
                      <Badge variant={percentage === 100 ? "default" : "secondary"} className={cn(percentage === 100 && 'bg-green-600')}>{percentage}%</Badge>
                     <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                   </div>
                </AccordionTrigger>
                <div className="flex items-center">
                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleShowOnDashboard(subject)} title={isVisible ? "Hide from dashboard" : "Show on dashboard"}>
                        {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setEditingSubject(subject)}>
                        <Pen className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleDuplicate(subject)}>
                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={() => setDeletingSubject(subject)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <AccordionContent className="p-6 pt-0">
                 <div className="border-t pt-4 space-y-4">
                    <PaperList subjectId={subject.id} papers={subject.papers} />
                    <Button 
                        variant="default"
                        size="sm"
                        className="w-full transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20"
                        onClick={() => handleAddPaperClick(subject.id)}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Paper
                    </Button>
                 </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        )})}
      </Accordion>

      {editingSubject && (
        <SubjectDialog
          open={!!editingSubject}
          onOpenChange={() => setEditingSubject(null)}
          subject={editingSubject}
        />
      )}

      {deletingSubject && (
        <DeleteConfirmationDialog
            open={!!deletingSubject}
            onOpenChange={() => setDeletingSubject(null)}
            onConfirm={handleDelete}
            itemName={deletingSubject.name}
            itemType="subject"
        />
      )}

      {activeSubjectId && (
        <PaperDialog
            open={isPaperDialogOpen}
            onOpenChange={onPaperDialogChange}
            subjectId={activeSubjectId}
        />
      )}
    </>
  );
}
