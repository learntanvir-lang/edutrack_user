
"use client";

import { useState, useContext } from 'react';
import Link from 'next/link';
import { Note, NoteLink } from '@/lib/types';
import { AppDataContext } from '@/context/AppDataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pen, Trash2, Link as LinkIcon, PlusCircle, Edit } from 'lucide-react';
import { NoteDialog } from './NoteDialog';
import { DeleteConfirmationDialog } from '../DeleteConfirmationDialog';
import { LinkDialog } from './LinkDialog';

interface NoteCardProps {
    note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
    const { dispatch } = useContext(AppDataContext);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<NoteLink | undefined>(undefined);
    const [deletingLink, setDeletingLink] = useState<NoteLink | null>(null);

    const handleDeleteNote = () => {
        dispatch({ type: "DELETE_NOTE", payload: { id: note.id } });
        setIsDeleteDialogOpen(false);
    };

    const handleAddLink = () => {
        setEditingLink(undefined);
        setIsLinkDialogOpen(true);
    };

    const handleEditLink = (link: NoteLink) => {
        setEditingLink(link);
        setIsLinkDialogOpen(true);
    };

    const handleDeleteLink = () => {
        if (deletingLink) {
            const updatedLinks = note.links.filter(link => link.id !== deletingLink.id);
            dispatch({ type: "UPDATE_NOTE", payload: { ...note, links: updatedLinks } });
            setDeletingLink(null);
        }
    };

    return (
        <>
            <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card border-border/50 group">
                <div className="relative aspect-video w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={note.imageUrl}
                        alt={note.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-2 right-2">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-primary/80 text-primary-foreground backdrop-blur-sm hover:bg-primary hover:text-primary-foreground">
                                <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                <Pen className="mr-2 h-4 w-4" />
                                Edit Note Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Note
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <CardHeader className="pt-4">
                    <CardTitle className="font-bold text-xl text-foreground">{note.title}</CardTitle>
                    {note.description && <CardDescription className="text-muted-foreground line-clamp-3">{note.description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                    {note.links && note.links.length > 0 && (
                        <div className="space-y-2">
                             {note.links.map(link => (
                                <div key={link.id} className="group/link flex items-center gap-1 rounded-md transition-colors border hover:bg-primary/10 hover:border-primary hover:text-primary">
                                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2 flex-grow hover:bg-transparent text-foreground/80 hover:text-primary" asChild>
                                        <Link href={link.url} target="_blank" rel="noopener noreferrer">
                                            <LinkIcon className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">{link.title}</span>
                                        </Link>
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
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
                        </div>
                    )}
                </CardContent>
                <CardFooter className="border-t p-2">
                    <Button 
                        variant="default" 
                        className="w-full transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20 text-base font-bold"
                        onClick={handleAddLink}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Link
                    </Button>
                </CardFooter>
            </Card>

            <NoteDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                note={note}
            />
            <LinkDialog
                open={isLinkDialogOpen}
                onOpenChange={setIsLinkDialogOpen}
                note={note}
                link={editingLink}
            />
            <DeleteConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDeleteNote}
                itemName={note.title}
                itemType="note"
            />
             {deletingLink && (
                 <DeleteConfirmationDialog
                    open={!!deletingLink}
                    onOpenChange={() => setDeletingLink(null)}
                    onConfirm={handleDeleteLink}
                    itemName={deletingLink.title}
                    itemType="link"
                />
            )}
        </>
    );
}
