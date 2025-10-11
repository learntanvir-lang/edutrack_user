
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
import { ResourceLink } from "@/lib/types";
import { useEffect } from "react";

const linkSchema = z.object({
  description: z.string().min(1, "Link title is required"),
  url: z.string().url("Must be a valid URL"),
});

type LinkFormValues = z.infer<typeof linkSchema>;

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: LinkFormValues) => void;
  link?: ResourceLink;
  itemType?: string;
}

export function LinkDialog({ open, onOpenChange, onSave, link, itemType = 'Link' }: LinkDialogProps) {
  const isEditing = !!link;

  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      description: "",
      url: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        description: link?.description || "",
        url: link?.url || "",
      });
    }
  }, [link, open, form]);

  const onSubmit = (values: LinkFormValues) => {
    onSave(values);
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
          <DialogTitle>{isEditing ? `Edit ${itemType}` : `Add New ${itemType}`}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for this link." : `Add a new link.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="link-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
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
          <Button onClick={form.handleSubmit(onSubmit)} form="link-form">{isEditing ? "Save Changes" : `Add ${itemType}`}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
