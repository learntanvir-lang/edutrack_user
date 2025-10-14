
"use client";

import { useState, useContext, memo } from 'react';
import Link from 'next/link';
import { Resource, ResourceLink as TResourceLink } from '@/lib/types';
import { AppDataContext } from '@/context/AppDataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pen, Trash2, Link as LinkIcon, PlusCircle, Edit, ExternalLink, Copy } from 'lucide-react';
import { ResourceDialog } from './ResourceDialog';
import { DeleteConfirmationDialog } from '../DeleteConfirmationDialog';
import { LinkDialog } from './LinkDialog';
import { v4 as uuidv4 } from 'uuid';
import { getIcon, IconName } from '../IconPicker';

interface ResourceCardProps {
    resource: Resource;
}

function ResourceCard({ resource }: ResourceCardProps) {
    const { dispatch } = useContext(AppDataContext);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<TResourceLink | undefined>(undefined);
    const [deletingLink, setDeletingLink] = useState<TResourceLink | null>(null);

    const handleDeleteResource = () => {
        dispatch({ type: "DELETE_RESOURCE", payload: { id: resource.id } });
        setIsDeleteDialogOpen(false);
    };

    const handleDuplicateResource = () => {
        dispatch({ type: "DUPLICATE_RESOURCE", payload: resource });
    };

    const handleAddLink = () => {
        setEditingLink(undefined);
        setIsLinkDialogOpen(true);
    };

    const handleEditLink = (link: TResourceLink) => {
        setEditingLink(link);
        setIsLinkDialogOpen(true);
    };
    
    const handleSaveLink = (linkData: { description: string, url: string, icon?: string }) => {
        const linkToSave: TResourceLink = { 
            id: editingLink?.id || uuidv4(), 
            description: linkData.description, 
            url: linkData.url, 
            icon: linkData.icon 
        };
        
        let updatedLinks: TResourceLink[];
        if (editingLink) {
             updatedLinks = resource.links.map(l => l.id === editingLink.id ? linkToSave : l);
        } else {
             updatedLinks = [...resource.links, linkToSave];
        }
        dispatch({ type: "UPDATE_RESOURCE", payload: { ...resource, links: updatedLinks } });
        setIsLinkDialogOpen(false);
        setEditingLink(undefined);
    };


    const handleDeleteLink = () => {
        if (deletingLink) {
            const updatedLinks = resource.links.filter(link => link.id !== deletingLink.id);
            dispatch({ type: "UPDATE_RESOURCE", payload: { ...resource, links: updatedLinks } });
            setDeletingLink(null);
        }
    };

    return (
        <>
            <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card border-border/50 group">
                <div className="relative aspect-video w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={resource.imageUrl}
                        alt={resource.title}
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
                                Edit Resource Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDuplicateResource}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate Resource
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Resource
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <CardHeader className="pt-4">
                    <CardTitle className="font-bold text-xl text-foreground">{resource.title}</CardTitle>
                    {resource.description && <CardDescription className="text-muted-foreground line-clamp-3">{resource.description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                    {resource.links && resource.links.length > 0 && (
                        <div className="space-y-2">
                             {resource.links.map(link => {
                                const Icon = getIcon(link.icon as IconName);
                                // The user's old data used `title` but the new data uses `description`.
                                const linkText = (link as any).description || (link as any).title;
                                return (
                                <div key={link.id} className="group/link flex items-center gap-1 rounded-md transition-colors border bg-primary/10 hover:bg-primary/20 border-border hover:border-primary">
                                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2 flex-grow text-primary hover:bg-transparent hover:text-primary" asChild>
                                        <Link href={link.url} target="_blank" rel="noopener noreferrer">
                                            {Icon ? <Icon className="h-4 w-4 flex-shrink-0" /> : <ExternalLink className="h-4 w-4 flex-shrink-0" />}
                                            <span className="truncate">{linkText}</span>
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
                            )})}
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

            <ResourceDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                resource={resource}
            />
             <LinkDialog
                open={isLinkDialogOpen}
                onOpenChange={setIsLinkDialogOpen}
                onSave={handleSaveLink}
                link={editingLink}
                itemType="Link"
            />
            <DeleteConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDeleteResource}
                itemName={resource.title}
                itemType="resource"
            />
             {deletingLink && (
                 <DeleteConfirmationDialog
                    open={!!deletingLink}
                    onOpenChange={() => setDeletingLink(null)}
                    onConfirm={handleDeleteLink}
                    itemName={deletingLink.description}
                    itemType="link"
                />
            )}
        </>
    );
}

export default memo(ResourceCard);
