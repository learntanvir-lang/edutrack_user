
"use client";

import { useState, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Note } from '@/lib/types';
import { AppDataContext } from '@/context/AppDataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pen, Trash2, Link as LinkIcon } from 'lucide-react';
import { NoteDialog } from './NoteDialog';
import { DeleteConfirmationDialog } from '../DeleteConfirmationDialog';
import { cn } from '@/lib/utils';

interface NoteCardProps {
    note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
    const { dispatch } = useContext(AppDataContext);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleDelete = () => {
        dispatch({ type: "DELETE_NOTE", payload: { id: note.id } });
        setIsDeleteDialogOpen(false);
    };

    return (
        <>
            <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card border-border/50 group">
                <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                        src={note.imageUrl}
                        alt={note.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-2 right-2">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white/80 hover:bg-white/20 hover:text-white">
                                <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                <Pen className="mr-2 h-4 w-4" />
                                Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <CardHeader className="pt-4">
                    <CardTitle className="font-bold text-xl text-foreground">{note.title}</CardTitle>
                    <CardDescription className="text-muted-foreground line-clamp-3">{note.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                    {note.links && note.links.length > 0 && (
                        <div className="space-y-2">
                             {note.links.map(link => (
                                <Button key={link.id} variant="outline" size="sm" className="w-full justify-start gap-2" asChild>
                                    <Link href={link.url} target="_blank" rel="noopener noreferrer">
                                        <LinkIcon className="h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">{link.title}</span>
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <NoteDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                note={note}
            />
            <DeleteConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                itemName={note.title}
                itemType="note"
            />
        </>
    );
}
