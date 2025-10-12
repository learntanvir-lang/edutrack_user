
"use client";

import { useState, useContext } from "react";
import { Paper } from "@/lib/types";
import { AppDataContext } from "@/context/AppDataContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pen, ChevronDown, PlusCircle, Copy, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaperDialog } from "./PaperDialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChapterList } from "../chapter/ChapterList";
import { ChapterDialog } from "../chapter/ChapterDialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";

interface PaperListProps {
  papers: Paper[];
  subjectId: string;
}

export function PaperList({ papers, subjectId }: PaperListProps) {
  const { dispatch } = useContext(AppDataContext);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [deletingPaper, setDeletingPaper] = useState<Paper | null>(null);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [activePaperId, setActivePaperId] = useState<string | null>(null);

  const handleDuplicate = (paper: Paper) => {
    dispatch({ type: "DUPLICATE_PAPER", payload: { subjectId, paper } });
  };
  
  const handleDelete = () => {
    if (deletingPaper) {
      dispatch({ type: "DELETE_PAPER", payload: { subjectId, paperId: deletingPaper.id } });
      setDeletingPaper(null);
    }
  };

  const handleAddChapterClick = (paperId: string) => {
    setActivePaperId(paperId);
    setIsChapterDialogOpen(true);
  };

  const onChapterDialogChange = (open: boolean) => {
    if (!open) {
      setActivePaperId(null);
    }
    setIsChapterDialogOpen(open);
  }

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
        {papers.map((paper) => {
            const paperProgress = paper.chapters.flatMap(c => c.progressItems).reduce(
                (acc, item) => {
                  acc.completed += item.completed;
                  acc.total += item.total;
                  return acc;
                },
                { completed: 0, total: 0 }
            );
            const percentage = paperProgress.total > 0 ? Math.round((paperProgress.completed / paperProgress.total) * 100) : 0;
            
            return (
          <AccordionItem key={paper.id} value={paper.id} className="border-none group/paper">
            <Card className="shadow-sm bg-muted/30 transition-all duration-300 group-data-[state=closed]/paper:hover:shadow-lg group-data-[state=closed]/paper:hover:-translate-y-1">
              <div className="flex items-center justify-between p-4">
                <AccordionTrigger className="p-0 hover:no-underline flex-1 group">
                   <div className="flex items-center gap-4">
                     <CardTitle className="text-lg">{paper.name}</CardTitle>
                     <Badge variant={percentage === 100 ? "default" : "secondary"} className={cn(percentage === 100 && 'bg-green-600')}>{percentage}%</Badge>
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
                      <DropdownMenuItem onClick={() => handleAddChapterClick(paper.id)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Chapter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingPaper(paper)}>
                        <Pen className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleDuplicate(paper)}>
                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={() => setDeletingPaper(paper)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <AccordionContent className="px-4 pb-4 pt-0">
                 <div className="border-t pt-4 space-y-4">
                    <ChapterList subjectId={subjectId} paperId={paper.id} chapters={paper.chapters} />
                 </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        )})}
      </Accordion>

      {editingPaper && (
        <PaperDialog
          open={!!editingPaper}
          onOpenChange={() => setEditingPaper(null)}
          subjectId={subjectId}
          paper={editingPaper}
        />
      )}

      {deletingPaper && (
        <DeleteConfirmationDialog
          open={!!deletingPaper}
          onOpenChange={() => setDeletingPaper(null)}
          onConfirm={handleDelete}
          itemName={deletingPaper.name}
          itemType="paper"
        />
      )}

       {activePaperId && (
        <ChapterDialog
            open={isChapterDialogOpen}
            onOpenChange={onChapterDialogChange}
            subjectId={subjectId}
            paperId={activePaperId}
        />
      )}
    </>
  );
}
