"use client";

import { useState, useContext } from "react";
import { Subject } from "@/lib/types";
import { AppDataContext } from "@/context/AppDataContext";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pen, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { SubjectDialog } from "./SubjectDialog";

export function SubjectList() {
  const { subjects, dispatch } = useContext(AppDataContext);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const handleDelete = (subjectId: string) => {
    if (confirm("Are you sure you want to delete this subject and all its content?")) {
      dispatch({ type: "DELETE_SUBJECT", payload: subjectId });
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card key={subject.id} className="shadow-sm hover:shadow-md transition-shadow relative group">
            <Link href={`/subjects/${subject.id}`} className="block h-full p-6">
                <CardTitle>{subject.name}</CardTitle>
            </Link>
            <div className="absolute top-4 right-4">
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
                    <DropdownMenuItem onClick={() => handleDelete(subject.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>
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
