

"use client";

import { useState, useContext, memo } from "react";
import { Chapter } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pen, Copy, GripVertical, Link as LinkIcon, Edit, ExternalLink, Activity, ChevronDown } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ChapterAccordionItemProps {
    chapter: Chapter;
    subjectId: string;
    paperId: string;
}

function ChapterAccordionItem({ chapter, subjectId, paperId }: ChapterAccordionItemProps) {
    const { dispatch } = useContext(AppDataContext);
    const [isEditingChapter, setIsEditingChapter] = useState(false);

    const handleDuplicate = () => {
        dispatch({
            type: "DUPLICATE_CHAPTER",
            payload: { subjectId, paperId, chapter },
        });
    };

    const chapterProgress = chapter.progressItems.reduce(
        (acc, item) => {
          acc.completed += item.completed;
          acc.total += item.total;
          return acc;
        },
        { completed: 0, total: 0 }
    );
    
    const percentage = chapterProgress.total > 0 ? Math.round((chapterProgress.completed / chapterProgress.total) * 100) : 0;
    
    return (
        <>
            <AccordionItem value={chapter.id} className="border-none">
                <div className="bg-card rounded-lg shadow-sm">
                    <div className="flex items-center justify-between w-full p-3">
                        <AccordionTrigger className="p-0 hover:no-underline flex-1 group">
                            <div className="flex items-center gap-3 flex-1">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                <div className="flex-1 flex items-center gap-3">
                                    <span className="font-bold text-lg text-primary">
                                        {chapter.number && `Chapter ${chapter.number}: `}
                                        {chapter.name}
                                    </span>
                                    <Badge variant={percentage === 100 ? "default" : "secondary"} className={cn(percentage === 100 && 'bg-green-600')}>{percentage}%</Badge>
                                </div>
                            </div>
                             <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
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
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <AccordionContent className="px-3 pb-3 pt-0">
                        <div className="border-t pt-4 space-y-6">
                            
                            {/* Progress Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Activity className="w-4 h-4" />
                                    <span>Progress Trackers</span>
                                </div>
                                <div className="space-y-4 rounded-md bg-muted/50 p-4">
                                    {chapter.progressItems.map(item => {
                                        const progress = item.total > 0 ? (item.completed / item.total) * 100 : 0;
                                        return (
                                            <div key={item.id}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm text-foreground font-medium">{item.name}</span>
                                                    <span className="text-sm font-medium text-muted-foreground">{item.completed} / {item.total}</span>
                                                </div>
                                                <Progress value={progress} />
                                            </div>
                                        );
                                    })}
                                    {chapter.progressItems.length === 0 && (
                                        <p className="text-sm text-center text-muted-foreground py-2">No progress trackers added.</p>
                                    )}
                                </div>
                            </div>
                            
                            {/* Resources Section */}
                            {chapter.resourceLinks && chapter.resourceLinks.length > 0 && (
                                <div className="space-y-3">
                                     <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <LinkIcon className="w-4 h-4" />
                                        <span>Resources</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {chapter.resourceLinks.map(link => (
                                             <Button key={link.id} variant="outline" size="sm" className="w-full justify-between bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800" asChild>
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
                                Edit Chapter Details
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
export default memo(ChapterAccordionItem);
