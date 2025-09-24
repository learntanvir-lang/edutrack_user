
import { useState, useContext, useRef, DragEvent } from "react";
import { Chapter } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pen, PlusCircle, Trash2, ChevronDown, Copy, GripVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppDataContext } from "@/context/AppDataContext";
import { ChapterDialog } from "./ChapterDialog";
import { ActivityList } from "../activity/ActivityList";
import { ActivityDialog } from "../activity/ActivityDialog";
import { SummaryGenerator } from "../SummaryGenerator";
import { v4 as uuidv4 } from 'uuid';
import { cn } from "@/lib/utils";


interface ChapterListProps {
  chapters: Chapter[];
  subjectId: string;
  paperId: string;
}

export function ChapterList({ chapters, subjectId, paperId }: ChapterListProps) {
  const { dispatch } = useContext(AppDataContext);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [addingActivityToChapter, setAddingActivityToChapter] = useState<string | null>(null);

  // Drag and Drop state
  const [draggedItem, setDraggedItem] = useState<Chapter | null>(null);
  const [dragOverItem, setDragOverItem] = useState<Chapter | null>(null);

  const handleDelete = (chapterId: string) => {
    if (confirm("Are you sure you want to delete this chapter and all its activities?")) {
      dispatch({
        type: "DELETE_CHAPTER",
        payload: { subjectId, paperId, chapterId },
      });
    }
  };

  const handleDuplicate = (chapter: Chapter) => {
    dispatch({
      type: "DUPLICATE_CHAPTER",
      payload: { subjectId, paperId, chapter },
    });
  };
  
  const handleDragStart = (e: DragEvent<HTMLDivElement>, chapter: Chapter) => {
    setDraggedItem(chapter);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>, chapter: Chapter) => {
    e.preventDefault();
    if(draggedItem?.id === chapter.id) return;
    setDragOverItem(chapter);
  };
  
  const handleDragEnd = () => {
    if (draggedItem && dragOverItem && draggedItem.id !== dragOverItem.id) {
      const startIndex = chapters.findIndex(c => c.id === draggedItem.id);
      const endIndex = chapters.findIndex(c => c.id === dragOverItem.id);
      
      if (startIndex !== -1 && endIndex !== -1) {
        dispatch({
          type: "REORDER_CHAPTERS",
          payload: {
            subjectId,
            paperId,
            startIndex: startIndex,
            endIndex: endIndex,
          },
        });
      }
    }
    setDraggedItem(null);
    setDragOverItem(null);
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
      <div className="w-full">
        <Accordion type="multiple" className="w-full space-y-2">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              draggable
              onDragStart={(e) => handleDragStart(e, chapter)}
              onDragOver={(e) => handleDragOver(e, chapter)}
              onDragEnd={handleDragEnd}
              onDragLeave={() => setDragOverItem(null)}
              className={cn(
                "transition-all",
                draggedItem?.id === chapter.id && "opacity-50",
                dragOverItem?.id === chapter.id && "bg-accent"
              )}
            >
              <AccordionItem value={chapter.id} className="border-none">
                  <div className="bg-card rounded-lg shadow-sm">
                  <div className="flex items-center justify-between w-full p-3">
                      <AccordionTrigger className="p-0 hover:no-underline flex-1 group">
                      <div className="flex items-center gap-2">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                          <span className="font-medium text-base">{chapter.name}</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </div>
                      </AccordionTrigger>
                      <div className="flex items-center gap-1 ml-4">
                      <SummaryGenerator chapter={chapter} />
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setEditingChapter(chapter)}>
                              <Pen className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(chapter)}>
                              <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(chapter.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                      </div>
                  </div>
                  <AccordionContent className="px-3 pb-3 pt-0">
                      <div className="border-t pt-3">
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
            </div>
          ))}
        </Accordion>
      </div>
      
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
