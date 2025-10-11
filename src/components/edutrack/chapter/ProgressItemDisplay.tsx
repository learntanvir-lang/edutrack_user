
"use client";

import { useState, useContext } from 'react';
import { ProgressItem, TodoItem } from "@/lib/types";
import { AppDataContext } from "@/context/AppDataContext";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreVertical, Edit, Trash2, Plus, Minus, ChevronUp, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProgressItemDialog } from './ProgressItemDialog';
import { DeleteConfirmationDialog } from '../DeleteConfirmationDialog';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
    const [isTodoListOpen, setIsTodoListOpen] = useState(true);

    const handleCounterChange = (increment: number) => {
        const newCompleted = Math.max(0, Math.min(item.total, item.completed + increment));
        if (newCompleted !== item.completed) {
            dispatch({
                type: 'UPDATE_PROGRESS_ITEM',
                payload: { subjectId, paperId, chapterId, progressItem: { ...item, completed: newCompleted } }
            });
        }
    };

    const handleTodoToggle = (todoId: string, completed: boolean) => {
        dispatch({
            type: 'TOGGLE_TODO',
            payload: { subjectId, paperId, chapterId, progressItemId: item.id, todoId, completed }
        });
    };
    
    const handleDelete = () => {
        dispatch({ type: 'DELETE_PROGRESS_ITEM', payload: { subjectId, paperId, chapterId, progressItemId: item.id }});
        setIsDeleting(false);
    }

    const completedTodos = item.type === 'todolist' ? item.todos.filter(t => t.completed).length : 0;
    const totalTodos = item.type === 'todolist' ? item.todos.length : 0;
    const progress = item.type === 'counter' 
        ? (item.total > 0 ? (item.completed / item.total) * 100 : 0)
        : (totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0);

    return (
        <>
            <div className="p-2 rounded-md bg-background border">
                <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                         <div className="flex items-center gap-2">
                            <Progress value={progress} className="h-2 w-full max-w-48" />
                            {item.type === 'counter' && <span className="text-xs font-mono text-muted-foreground">{item.completed}/{item.total}</span>}
                            {item.type === 'todolist' && <span className="text-xs font-mono text-muted-foreground">{completedTodos}/{totalTodos}</span>}
                        </div>
                    </div>

                    {item.type === 'counter' && (
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleCounterChange(-1)}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleCounterChange(1)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    
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
                
                {item.type === 'todolist' && item.todos.length > 0 && (
                     <Collapsible open={isTodoListOpen} onOpenChange={setIsTodoListOpen}>
                        <CollapsibleTrigger asChild>
                           <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground mt-2">
                               {isTodoListOpen ? <ChevronUp className="h-4 w-4 mr-2"/> : <ChevronDown className="h-4 w-4 mr-2" />}
                               <span>{completedTodos} of {totalTodos} completed</span>
                           </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="pl-4 pr-2 pt-2 space-y-2">
                                {item.todos.map(todo => (
                                    <div key={todo.id} className="flex items-center gap-3">
                                        <Checkbox 
                                            id={todo.id} 
                                            checked={todo.completed} 
                                            onCheckedChange={(checked) => handleTodoToggle(todo.id, !!checked)}
                                        />
                                        <label htmlFor={todo.id} className={cn("text-sm flex-1", todo.completed && "line-through text-muted-foreground")}>
                                            {todo.text}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}
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

