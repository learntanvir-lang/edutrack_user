"use client";

import { useState, useContext } from "react";
import { Paper } from "@/lib/types";
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
import { PaperDialog } from "./PaperDialog";

interface PaperListProps {
  papers: Paper[];
  subjectId: string;
}

export function PaperList({ papers, subjectId }: PaperListProps) {
  const { dispatch } = useContext(AppDataContext);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);

  const handleDelete = (paperId: string) => {
    if (confirm("Are you sure you want to delete this paper and all its chapters?")) {
      dispatch({ type: "DELETE_PAPER", payload: { subjectId, paperId } });
    }
  };

  if (papers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-muted-foreground">No Papers Yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Add a paper to organize your chapters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papers.map((paper) => (
          <Card key={paper.id} className="shadow-sm hover:shadow-md transition-shadow relative group">
            <Link href={`/subjects/${subjectId}/${paper.id}`} className="block h-full">
                <CardHeader>
                    <CardTitle>{paper.name}</CardTitle>
                </CardHeader>
            </Link>
             <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setEditingPaper(paper)}>
                      <Pen className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(paper.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>
      {editingPaper && (
        <PaperDialog
          open={!!editingPaper}
          onOpenChange={() => setEditingPaper(null)}
          subjectId={subjectId}
          paper={editingPaper}
        />
      )}
    </>
  );
}
