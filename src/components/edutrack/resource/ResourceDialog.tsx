
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
import { Textarea } from "@/components/ui/textarea";
import { Resource } from "@/lib/types";
import { useContext, useEffect } from "react";
import { AppDataContext } from "@/context/AppDataContext";
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from "@/components/ui/scroll-area";

const resourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  imageUrl: z.string().url("Must be a valid image URL").min(1, "Image URL is required"),
  serialNumber: z.coerce.number().min(1, "Serial number is required"),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

interface ResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: Resource;
}

export function ResourceDialog({ open, onOpenChange, resource }: ResourceDialogProps) {
  const { resources, dispatch } = useContext(AppDataContext);
  const isEditing = !!resource;

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      serialNumber: 1,
    },
  });

  useEffect(() => {
    if (resource && open) {
      form.reset({
        title: resource.title,
        description: resource.description,
        imageUrl: resource.imageUrl,
        serialNumber: resource.serialNumber,
      });
    } else if (!isEditing && open) {
      const nextSerialNumber = resources.length > 0 ? Math.max(...resources.map(r => r.serialNumber)) + 1 : 1;
      form.reset({
        title: "",
        description: "",
        imageUrl: `https://picsum.photos/seed/${uuidv4()}/600/400`,
        serialNumber: nextSerialNumber,
      });
    }
  }, [resource, open, form, isEditing, resources]);

  const onSubmit = (values: ResourceFormValues) => {
    const resourceData: Resource = {
      id: resource?.id || uuidv4(),
      title: values.title,
      description: values.description || "",
      imageUrl: values.imageUrl,
      serialNumber: values.serialNumber,
      links: resource?.links || [],
      createdAt: resource?.createdAt || new Date().toISOString(),
    };

    dispatch({
      type: isEditing ? "UPDATE_RESOURCE" : "ADD_RESOURCE",
      payload: resourceData,
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{isEditing ? "Edit Resource" : "Add New Resource"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for your resource." : "Add a new resource to your collection."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto -mx-6 px-6">
          <ScrollArea className="h-full">
            <Form {...form}>
              <form id="resource-form" className="space-y-4 px-1">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Quantum Physics Explained" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="serialNumber"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Serial Number</FormLabel>
                            <FormControl>
                            <Input type="number" {...field} />
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
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="A short description of your resource..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </form>
            </Form>
          </ScrollArea>
        </div>
        <DialogFooter className="pt-4 border-t flex-shrink-0">
          <Button onClick={form.handleSubmit(onSubmit)} form="resource-form" className="font-bold transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20">{isEditing ? "Save Changes" : "Add Resource"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
