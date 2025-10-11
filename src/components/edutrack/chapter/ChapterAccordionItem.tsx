
"use client";

import { useState, useContext, memo, useMemo } from "react";
import { Chapter, ResourceLink } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pen, Copy, Trash2, Link as LinkIcon, ExternalLink, Activity, PlusCircle, Edit, MoreVertical } from "lucide-react";
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
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ProgressItemDialog } from "./ProgressItemDialog";
import { ProgressItemDisplay } from "./ProgressItemDisplay";
import { LinkDialog } from "../note/LinkDialog";
import { v4 as uuidv4 } from "uuid";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";


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
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<ResourceLink | undefined>(undefined);
    const [deletingLink, setDeletingLink] = useState<ResourceLink | null>(null);

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
        if (chapter.progressItems.length === 0) {
            return chapter.isCompleted ? 100 : 0;
        }

        const totalWeight = chapter.progressItems.reduce((acc, item) => acc + item.total, 0);
        const weightedCompleted = chapter.progressItems.reduce((acc, item) => acc + item.completed, 0);
        
        return totalWeight > 0 ? Math.round((weightedCompleted / totalWeight) * 100) : 0;
    }, [chapter.progressItems, chapter.isCompleted]);
    
    const handleAddLink = () => {
        setEditingLink(undefined);
        setIsLinkDialogOpen(true);
    };

    const handleEditLink = (link: ResourceLink) => {
        setEditingLink(link);
        setIsLinkDialogOpen(true);
    };
    
    const handleSaveLink = (linkData: { description: string; url: string }) => {
        const chapterPayload = { ...chapter };
        if (editingLink) {
            chapterPayload.resourceLinks = chapter.resourceLinks.map(l => l.id === editingLink.id ? { ...l, ...linkData } : l);
        } else {
            chapterPayload.resourceLinks = [...chapter.resourceLinks, { id: uuidv4(), ...linkData }];
        }
        dispatch({ type: "UPDATE_CHAPTER", payload: { subjectId, paperId, chapter: chapterPayload } });
        setIsLinkDialogOpen(false);
        setEditingLink(undefined);
    };

    const handleDeleteLink = () => {
        if (deletingLink) {
            const updatedLinks = chapter.resourceLinks.filter(link => link.id !== deletingLink.id);
            dispatch({ type: "UPDATE_CHAPTER", payload: { subjectId, paperId, chapter: { ...chapter, resourceLinks: updatedLinks } } });
            setDeletingLink(null);
        }
    };

    return (
        <>
            <div className="bg-card rounded-lg shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
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
                    
                    <div className="pt-4 space-y-6">
                        
                        {/* Progress Section */}
                        <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm font-medium text-muted-foreground gap-2">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    <span>Progress Trackers</span>
                                </div>
                                <Button variant="default" size="sm" onClick={() => setIsProgressItemDialogOpen(true)} className="font-bold transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20 w-full sm:w-auto">
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
                        
                        <Separator />

                        {/* Resources Section */}
                        <div className="space-y-3">
                             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm font-medium text-muted-foreground gap-2">
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" />
                                    <span>Resources</span>
                                </div>
                                <Button variant="default" size="sm" onClick={handleAddLink} className="font-bold transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20 w-full sm:w-auto">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Resource
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {chapter.resourceLinks.map(link => (
                                     <div key={link.id} className="group/link flex items-center gap-1 rounded-md transition-colors border bg-primary/10 hover:bg-primary/20 border-border hover:border-primary">
                                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 flex-grow text-primary hover:bg-transparent hover:text-primary" asChild>
                                            <Link href={link.url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">{link.description || link.url}</span>
                                            </Link>
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-primary">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditLink(link)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => setDeletingLink(link)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}
                                {chapter.resourceLinks.length === 0 && (
                                     <p className="text-sm text-center text-muted-foreground py-4">No resources added.</p>
                                )}
                            </div>
                        </div>
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
            <LinkDialog
                open={isLinkDialogOpen}
                onOpenChange={setIsLinkDialogOpen}
                onSave={handleSaveLink}
                link={editingLink}
                itemType="Resource"
            />
             {deletingLink && (
                 <DeleteConfirmationDialog
                    open={!!deletingLink}
                    onOpenChange={() => setDeletingLink(null)}
                    onConfirm={handleDeleteLink}
                    itemName={deletingLink.description}
                    itemType="resource link"
                />
            )}
        </>
    );
}
export default memo(ChapterAccordionItem);
    
