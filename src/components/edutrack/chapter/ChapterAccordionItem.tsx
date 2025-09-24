
"use client";

import { useState, useContext } from "react";
import { Chapter } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

interface ChapterAccordionItemProps {
    chapter: Chapter;
    subjectId: string;
    paperId: string;
}

export function ChapterAccordionItem({ chapter, subjectId, paperId }: ChapterAccordionItemProps) {
    const { dispatch } = useContext(AppDataContext);
    const [isEditingChapter, setIsEditingChapter] = useState(false);
    const [isAddingActivity, setIsAddingActivity] = useState(false);

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this chapter?")) {
            dispatch({
                type: "DELETE_CHAPTER",
                payload: { subjectId, paperId, chapterId: chapter.id },
            });
        }
    };

    const handleDuplicate = () => {
        dispatch({
            type: "DUPLICATE_CHAPTER",
            payload: { subjectId, paperId, chapter },
        });
    };

    return (
        <>
            <AccordionItem value={chapter.id} className="border-none">
                <div className="bg-card rounded-lg shadow-sm">
                    <div className="flex items-center justify-between w-full p-3">
                        <AccordionTrigger className="p-0 hover:no-underline flex-1 group">
                            <div className="flex items-center gap-2">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                <span className="font-medium text-base">
                                    {chapter.number && `Chapter ${chapter.number}: `}
                                    {chapter.name}
                                </span>
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
                                    <DropdownMenuItem onClick={() => setIsEditingChapter(true)}>
                                        <Pen className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDuplicate}>
                                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
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
                            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setIsAddingActivity(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Activity
                            </Button>
                        </div>
                    </AccordionContent>
                </div>
            </AccordionItem>

            {isEditingChapter && (
                <ChapterDialog
                    open={isEditingChapter}
                    onOpenChange={setIsEditingChapter}
                    subjectId={subjectId}
                    paperId={paperId}
                    chapter={chapter}
                />
            )}

            {isAddingActivity && (
                <ActivityDialog
                    open={isAddingActivity}
                    onOpenChange={setIsAddingActivity}
                    subjectId={subjectId}
                    paperId={paperId}
                    chapterId={chapter.id}
                />
            )}
        </>
    );
}
