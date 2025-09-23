import { useState } from "react";
import { Chapter } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pen, PlusCircle, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContext } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { ChapterDialog } from "./ChapterDialog";
import { ActivityList } from "../activity/ActivityList";
import { ActivityDialog } from "../activity/ActivityDialog";
import { SummaryGenerator } from "../SummaryGenerator";

interface ChapterListProps {
  chapters: Chapter[];
  subjectId: string;
  paperId: string;
}

export function ChapterList({ chapters, subjectId, paperId }: ChapterListProps) {
  const { dispatch } = useContext(AppDataContext);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [addingActivityToChapter, setAddingActivityToChapter] = useState<string | null>(null);

  const handleDelete = (chapterId: string) => {
    if (confirm("Are you sure you want to delete this chapter and all its activities?")) {
      dispatch({
        type: "DELETE_CHAPTER",
        payload: { subjectId, paperId, chapterId },
      });
    }
  };

  if (chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-muted-foreground">No Chapters Yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Add a chapter to get started.</p>
      </div>
    );
  }

  return (
    <>
      <Accordion type="multiple" className="w-full space-y-4">
        {chapters.map((chapter) => (
          <AccordionItem key={chapter.id} value={chapter.id} className="border-none">
             <div className="bg-card rounded-lg shadow-sm">
              <AccordionTrigger className="p-4 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-lg">{chapter.name}</span>
                  <div className="flex items-center gap-2">
                    <SummaryGenerator chapter={chapter} />
                    <DropdownMenu onOpenChange={(open) => open && event?.stopPropagation()}>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => setEditingChapter(chapter)}>
                                <Pen className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(chapter.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                   </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                <div className="border-t pt-4">
                  <ActivityList
                    activities={chapter.activities}
                    subjectId={subjectId}
                    paperId={paperId}
                    chapterId={chapter.id}
                  />
                   <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setAddingActivityToChapter(chapter.id)}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Activity
                  </Button>
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        ))}
      </Accordion>
      
      {editingChapter && (
        <ChapterDialog
          open={!!editingChapter}
          onOpenChange={() => setEditingChapter(null)}
          subjectId={subjectId}
          paperId={paperId}
          chapter={editingChapter}
        />
      )}

      {addingActivityToChapter && (
          <ActivityDialog
            open={!!addingActivityToChapter}
            onOpenChange={() => setAddingActivityToChapter(null)}
            subjectId={subjectId}
            paperId={paperId}
            chapterId={addingActivityToChapter}
          />
      )}
    </>
  );
}
