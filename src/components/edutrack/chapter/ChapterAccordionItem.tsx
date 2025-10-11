

"use client";

import { useState, useContext, memo, useMemo } from "react";
import { Chapter } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pen, Copy, Trash2, Link as LinkIcon, ExternalLink, Activity, PlusCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppDataContext } from "@/context/AppDataContext";
import { ChapterDialog } from "./ChapterDialog";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ProgressItemDialog } from "./ProgressItemDialog";
import { ProgressItemDisplay } from "./ProgressItemDisplay";


interface ChapterAccordionItemProps {
    chapter: Chapter;
    subjectId: string;
    paperId: string;
}

function ChapterAccordionItem({ chapter, subjectId, paperId }: ChapterAccordionItemProps) {
    const { dispatch } = useContext(AppDataContext);
    const [isEditingChapter, setIsEditingChapter] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isProgressItemDialogOpen, setIsProgressItemDialogOpen] = useState(false);

    const handleDuplicate = () => {
        dispatch({
            type: "DUPLICATE_CHAPTER",
            payload: { subjectId, paperId, chapter },
        });
    };

    const handleDelete = () => {
        dispatch({
            type: "DELETE_CHAPTER",
            payload: { subjectId, paperId, chapterId: chapter.id },
        });
        setIsDeleteDialogOpen(false);
    };

    const overallProgress = useMemo(() => {
        if (chapter.progressItems.length === 0) return 0;

        const totalWeight = chapter.progressItems.reduce((acc, item) => acc + item.total, 0);
        const weightedCompleted = chapter.progressItems.reduce((acc, item) => acc + item.completed, 0);
        
        return totalWeight > 0 ? Math.round((weightedCompleted / totalWeight) * 100) : 0;
    }, [chapter.progressItems]);
    
    return (
        <>
            <div className="border-none bg-card rounded-lg shadow-sm">
                <div className="flex items-center justify-between w-full p-3">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="flex-1 flex items-center gap-3">
                            <span className="font-bold text-lg text-primary">
                                {chapter.number && `Chapter ${chapter.number}: `}
                                {chapter.name}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
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
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="px-3 pb-3 pt-0">
                    <div className="flex items-center gap-3 mb-4">
                        <Progress value={overallProgress} className="h-2 flex-1" />
                        <Badge variant={overallProgress === 100 ? "default" : "secondary"} className={cn("font-bold", overallProgress === 100 && 'bg-green-600')}>{overallProgress}%</Badge>
                    </div>
                    <Separator />
                    <div className="pt-4 space-y-6">
                        
                        {/* Progress Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    <span>Progress Trackers</span>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setIsProgressItemDialogOpen(true)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Tracker
                                </Button>
                            </div>
                            <div className="space-y-2 rounded-md bg-muted/50 p-2">
                               {chapter.progressItems.map(item => (
                                    <ProgressItemDisplay 
                                        key={item.id}
                                        item={item} 
                                        subjectId={subjectId}
                                        paperId={paperId}
                                        chapterId={chapter.id}
                                    />
                               ))}
                                {chapter.progressItems.length === 0 && (
                                    <p className="text-sm text-center text-muted-foreground py-4">No progress trackers added.</p>
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
                    </div>
                </div>
            </div>

            <ChapterDialog
                open={isEditingChapter}
                onOpenChange={setIsEditingChapter}
                subjectId={subjectId}
                paperId={paperId}
                chapter={chapter}
            />
            <DeleteConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                itemName={chapter.name}
                itemType="chapter"
            />
            <ProgressItemDialog
                open={isProgressItemDialogOpen}
                onOpenChange={setIsProgressItemDialogOpen}
                subjectId={subjectId}
                paperId={paperId}
                chapterId={chapter.id}
            />
        </>
    );
}
export default memo(ChapterAccordionItem);
