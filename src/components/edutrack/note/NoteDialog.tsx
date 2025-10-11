
"use client";

import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Note } from "@/lib/types";
import { useContext, useEffect } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';
import { PlusCircle, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  imageUrl: z.string().url("Must be a valid image URL").min(1, "Image URL is required"),
  links: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, "Link title is required"),
    url: z.string().url("Must be a valid URL"),
  })).optional(),
});

type NoteFormValues = z.infer<typeof noteSchema>;

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: Note;
}

export function NoteDialog({ open, onOpenChange, note }: NoteDialogProps) {
  const { dispatch } = useContext(AppDataContext);
  const isEditing = !!note;

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      links: [],
    },
  });

  useEffect(() => {
    if (note && open) {
      form.reset({
        title: note.title,
        description: note.description,
        imageUrl: note.imageUrl,
        links: note.links || [],
      });
    } else if (!isEditing && open) {
      form.reset({
        title: "",
        description: "",
        imageUrl: "https://picsum.photos/seed/placeholder/600/400",
        links: [],
      });
    }
  }, [note, open, form, isEditing]);

  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control: form.control,
    name: "links"
  });

  const onSubmit = (values: NoteFormValues) => {
    const noteData: Note = {
      id: note?.id || uuidv4(),
      title: values.title,
      description: values.description || "",
      imageUrl: values.imageUrl,
      links: values.links || [],
      createdAt: note?.createdAt || new Date().toISOString(),
    };

    dispatch({
      type: isEditing ? "UPDATE_NOTE" : "ADD_NOTE",
      payload: noteData,
    });
    onOpenChange(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
      if (!isOpen) {
        form.reset();
      }
      onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Note" : "Add New Note"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for your note." : "Add a new note to your collection."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="max-h-[70vh] pr-6 -mr-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., My Awesome Project" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="A short description of your note..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Links */}
                <div className="space-y-4 rounded-md border p-4">
                    <h3 className="text-lg font-medium">Links</h3>
                    <div className="space-y-3">
                    {linkFields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-2">
                            <div className="flex-grow space-y-2">
                                <FormField
                                    control={form.control}
                                    name={`links.${index}.title`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Link Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Link Title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`links.${index}.url`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(index)} className="mt-2 text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendLink({ id: uuidv4(), title: '', url: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Link
                    </Button>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4 border-t">
              <Button type="submit">{isEditing ? "Save Changes" : "Add Note"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
