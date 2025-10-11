
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
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
import { Note, NoteLink } from "@/lib/types";
import { useContext, useEffect } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';

const linkSchema = z.object({
  title: z.string().min(1, "Link title is required"),
  url: z.string().url("Must be a valid URL"),
});

type LinkFormValues = z.infer<typeof linkSchema>;

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note;
  link?: NoteLink;
}

export function LinkDialog({ open, onOpenChange, note, link }: LinkDialogProps) {
  const { dispatch } = useContext(AppDataContext);
  const isEditing = !!link;

  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: link?.title || "",
        url: link?.url || "",
      });
    }
  }, [link, open, form]);

  const onSubmit = (values: LinkFormValues) => {
    let updatedLinks: NoteLink[];

    if (isEditing) {
      updatedLinks = note.links.map(l => (l.id === link.id ? { ...l, ...values } : l));
    } else {
      updatedLinks = [...note.links, { id: uuidv4(), ...values }];
    }

    dispatch({
      type: "UPDATE_NOTE",
      payload: { ...note, links: updatedLinks },
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Link" : "Add New Link"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for this link." : `Add a new link to "${note.title}".`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="link-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Official Documentation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </form>
        </Form>
        <DialogFooter>
          <Button onClick={form.handleSubmit(onSubmit)} form="link-form">{isEditing ? "Save Changes" : "Add Link"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
