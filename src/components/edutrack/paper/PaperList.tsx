"use client";

import { useState, useContext } from "react";
import { Paper } from "@/lib/types";
import { AppDataContext } from "@/context/AppDataContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pen, Trash2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaperDialog } from "./PaperDialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChapterList } from "../chapter/ChapterList";

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
      <Accordion type="multiple" className="w-full space-y-3">
        {papers.map((paper) => (
          <AccordionItem key={paper.id} value={paper.id} className="border-none">
            <Card className="shadow-sm bg-muted/30">
              <div className="flex items-center justify-between p-4">
                <AccordionTrigger className="p-0 hover:no-underline flex-1 group">
                   <div className="flex items-center gap-4">
                     <CardTitle className="text-lg">{paper.name}</CardTitle>
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
                      <DropdownMenuItem onClick={() => setEditingPaper(paper)}>
                        <Pen className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(paper.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <AccordionContent className="px-4 pb-4 pt-0">
                 <div className="border-t pt-4">
                    <ChapterList subjectId={subjectId} paperId={paper.id} chapters={paper.chapters} />
                 </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
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
