
"use client";

import { useState, useContext } from "react";
import { Chapter } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pen, Trash2, ChevronDown, Copy, GripVertical, CheckCircle, Target, Link as LinkIcon, Edit } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppDataContext } from "@/context/AppDataContext";
import { ChapterDialog } from "./ChapterDialog";
import { ChapterProgressDialog } from "./ChapterProgressDialog"; // New component

interface ChapterAccordionItemProps {
    chapter: Chapter;
    subjectId: string;
    paperId: string;
}

export function ChapterAccordionItem({ chapter, subjectId, paperId }: ChapterAccordionItemProps) {
    const { dispatch } = useContext(AppDataContext);
    const [isEditingChapter, setIsEditingChapter] = useState(false);
    const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);

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

    const classProgress = chapter.classSessions.total > 0 ? (chapter.classSessions.attended / chapter.classSessions.total) * 100 : 0;
    const practiceProgress = chapter.practiceProblems.total > 0 ? (chapter.practiceProblems.completed / chapter.practiceProblems.total) * 100 : 0;

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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setIsEditingChapter(true)}>
                                        <Pen className="mr-2 h-4 w-4" /> Edit Details
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => setIsProgressDialogOpen(true)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit Progress
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
                        <div className="border-t pt-4 space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Class Completion</span>
                                        </div>
                                        <span className="text-sm font-medium">{chapter.classSessions.attended} / {chapter.classSessions.total}</span>
                                    </div>
                                    <Progress value={classProgress} />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Target className="w-4 h-4" />
                                            <span>Practice Problems</span>
                                        </div>
                                        <span className="text-sm font-medium">{chapter.practiceProblems.completed} / {chapter.practiceProblems.total}</span>
                                    </div>
                                    <Progress value={practiceProgress} />
                                </div>
                            </div>
                            {chapter.resourceLinks && chapter.resourceLinks.length > 0 && (
                                <div className="space-y-2">
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <LinkIcon className="w-4 h-4" />
                                            <span>Resources</span>
                                        </div>
                                    <div className="flex flex-col gap-2">
                                        {chapter.resourceLinks.map(link => (
                                            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                                                {link.description || link.url}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                             <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => setIsProgressDialogOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Progress
                            </Button>
                        </div>
                    </AccordionContent>
                </div>
            </AccordionItem>

            <ChapterDialog
                open={isEditingChapter}
                onOpenChange={setIsEditingChapter}
                subjectId={subjectId}
                paperId={paperId}
                chapter={chapter}
            />

            <ChapterProgressDialog
                open={isProgressDialogOpen}
                onOpenChange={setIsProgressDialogOpen}
                subjectId={subjectId}
                paperId={paperId}
                chapter={chapter}
            />
        </>
    );
}
