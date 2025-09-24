
import { useState, useContext } from "react";
import { Chapter } from "@/lib/types";
import { Accordion } from "@/components/ui/accordion";
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
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { v4 as uuidv4 } from 'uuid';

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

  const handleDuplicate = (chapter: Chapter) => {
    dispatch({
      type: "DUPLICATE_CHAPTER",
      payload: { subjectId, paperId, chapter },
    });
  };
  
  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    dispatch({
      type: "REORDER_CHAPTERS",
      payload: {
        subjectId,
        paperId,
        startIndex: source.index,
        endIndex: destination.index,
      },
    });
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
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`chapters-${paperId}`}>
          {(provided) => (
            <Accordion asChild type="multiple" className="w-full space-y-2" {...provided.droppableProps} ref={provided.innerRef}>
              <div>
                {chapters.map((chapter, index) => (
                  <Draggable key={chapter.id} draggableId={chapter.id} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <div className="bg-card rounded-lg shadow-sm">
                          <div className="flex items-center justify-between w-full p-3">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium text-base">{chapter.name}</span>
                            </div>
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
                              <Accordion.Item value={chapter.id} className="border-none p-0">
                                <Accordion.Trigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 group">
                                     <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                  </Button>
                                </Accordion.Trigger>
                                <Accordion.Content className="px-3 pb-3 pt-0">
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
                                </Accordion.Content>
                              </Accordion.Item>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            </Accordion>
          )}
        </Droppable>
      </DragDropContext>
      
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
