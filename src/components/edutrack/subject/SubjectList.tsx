"use client";

import { useState, useContext } from 'react';
import { Subject } from '@/lib/types';
import { AppDataContext } from '@/context/AppDataContext';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pen, Trash2, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

export function SubjectList() {
  const { subjects, dispatch } = useContext(AppDataContext);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const handleDelete = (subjectId: string) => {
    if (confirm('Are you sure you want to delete this subject and all its content?')) {
      dispatch({ type: 'DELETE_SUBJECT', payload: subjectId });
    }
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
        {subjects.map(subject => (
          <AccordionItem key={subject.id} value={subject.id} className="border-none">
            <Card className="shadow-sm">
              <div className="flex items-center justify-between p-4">
                <AccordionTrigger className="p-0 hover:no-underline flex-1 group">
                   <div className="flex items-center gap-4">
                     <CardTitle>{subject.name}</CardTitle>
                     <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                   </div>
                </AccordionTrigger>
                <div className="flex items-center">
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
                      <DropdownMenuItem
                        onClick={() => handleDelete(subject.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <AccordionContent className="p-6 pt-0">
                 <div className="border-t pt-4">
                    <PaperList subjectId={subject.id} papers={subject.papers} />
                 </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>

      {editingSubject && (
        <SubjectDialog
          open={!!editingSubject}
          onOpenChange={() => setEditingSubject(null)}
          subject={editingSubject}
        />
      )}
    </>
  );
}
