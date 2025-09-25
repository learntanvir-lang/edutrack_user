

"use client";

import { useState, useContext } from "react";
import { Chapter } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pen, Trash2, ChevronDown, Copy, GripVertical, Link as LinkIcon, Edit, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppDataContext } from "@/context/AppDataContext";
import { ChapterDialog } from "./ChapterDialog";
import Link from "next/link";

interface ChapterAccordionItemProps {
    chapter: Chapter;
    subjectId: string;
    paperId: string;
}

export function ChapterAccordionItem({ chapter, subjectId, paperId }: ChapterAccordionItemProps) {
    const { dispatch } = useContext(AppDataContext);
    const [isEditingChapter, setIsEditingChapter] = useState(false);

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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setIsEditingChapter(true)}>
                                        <Pen className="mr-2 h-4 w-4" /> Edit Chapter
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
                            {chapter.progressItems.map(item => {
                                const progress = item.total > 0 ? (item.completed / item.total) * 100 : 0;
                                return (
                                    <div key={item.id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-muted-foreground">{item.name}</span>
                                            <span className="text-sm font-medium">{item.completed} / {item.total}</span>
                                        </div>
                                        <Progress value={progress} />
                                    </div>
                                );
                            })}
                            
                            {chapter.resourceLinks && chapter.resourceLinks.length > 0 && (
                                <div className="space-y-2 pt-4">
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <LinkIcon className="w-4 h-4" />
                                            <span>Resources</span>
                                        </div>
                                    <div className="flex flex-col gap-2">
                                        {chapter.resourceLinks.map(link => (
                                            <Button key={link.id} variant="outline" size="sm" className="w-full justify-between" asChild>
                                                <Link href={link.url} target="_blank" rel="noopener noreferrer">
                                                    <span className="truncate">{link.description || link.url}</span>
                                                    <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0" />
                                                </Link>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                             <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => setIsEditingChapter(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Chapter
                            </Button>
                        </div>
                    </AccordionContent>
                </div>
            </AccordionItem>

            {/* This dialog now handles everything */}
            <ChapterDialog
                open={isEditingChapter}
                onOpenChange={setIsEditingChapter}
                subjectId={subjectId}
                paperId={paperId}
                chapter={chapter}
            />
        </>
    );
}
