
"use client";

import { useState, useContext } from 'react';
import { ProgressItem } from "@/lib/types";
import { AppDataContext } from "@/context/AppDataContext";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreVertical, Edit, Trash2, Plus, Minus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProgressItemDialog } from './ProgressItemDialog';
import { DeleteConfirmationDialog } from '../DeleteConfirmationDialog';
import { cn } from '@/lib/utils';
import { getIcon, IconName } from './IconPicker';

interface ProgressItemDisplayProps {
    item: ProgressItem;
    subjectId: string;
    paperId: string;
    chapterId: string;
}

export function ProgressItemDisplay({ item, subjectId, paperId, chapterId }: ProgressItemDisplayProps) {
    const { dispatch } = useContext(AppDataContext);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const Icon = getIcon(item.icon as IconName);

    const handleCounterChange = (increment: number) => {
        const newCompleted = Math.max(0, Math.min(item.total, item.completed + increment));
        if (newCompleted !== item.completed) {
            dispatch({
                type: 'UPDATE_PROGRESS_ITEM',
                payload: { subjectId, paperId, chapterId, progressItem: { ...item, completed: newCompleted } }
            });
        }
    };

    const handleTodoToggle = (completed: boolean) => {
        dispatch({
            type: 'UPDATE_PROGRESS_ITEM',
            payload: { subjectId, paperId, chapterId, progressItem: { ...item, completed: completed ? 1 : 0, total: 1 } }
        });
    };
    
    const handleDelete = () => {
        dispatch({ type: 'DELETE_PROGRESS_ITEM', payload: { subjectId, paperId, chapterId, progressItemId: item.id }});
        setIsDeleting(false);
    }

    const progress = item.total > 0 ? (item.completed / item.total) * 100 : 0;

    return (
        <>
            <div className="p-2 pr-10 relative rounded-md bg-muted/50">
                {item.type === 'counter' ? (
                     <div className="flex items-center justify-between gap-4">
                        <p className="text-base font-medium text-foreground flex-shrink-0 flex items-center gap-2">
                           {Icon && <Icon className="h-4 w-4" />}
                           {item.name}
                        </p>
                        <div className="flex-1 flex items-center gap-2">
                             <div className="w-full bg-secondary rounded-full h-2.5">
                                <div
                                    className="bg-primary h-2.5 rounded-full"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleCounterChange(-1)}>
                                <Minus className="h-4 w-4" />
                            </Button>
                             <span className="text-xs font-mono text-muted-foreground w-12 text-center">{item.completed}/{item.total}</span>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleCounterChange(1)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : ( // To-do type
                    <div className="flex items-center">
                        <Checkbox 
                            id={item.id} 
                            checked={item.completed === 1} 
                            onCheckedChange={(checked) => handleTodoToggle(!!checked)}
                            className="mr-3 h-5 w-5"
                        />
                        <label htmlFor={item.id} className={cn("text-base font-medium flex-1", item.completed === 1 && "line-through text-muted-foreground")}>
                            {item.name}
                        </label>
                    </div>
                )}
                
                <div className="absolute top-1 right-1">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsDeleting(true)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <ProgressItemDialog
                open={isEditing}
                onOpenChange={setIsEditing}
                subjectId={subjectId}
                paperId={paperId}
                chapterId={chapterId}
                progressItem={item}
            />
            <DeleteConfirmationDialog
                open={isDeleting}
                onOpenChange={setIsDeleting}
                onConfirm={handleDelete}
                itemName={item.name}
                itemType="progress tracker"
            />
        </>
    );
}
