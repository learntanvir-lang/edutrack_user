"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Chapter } from "@/lib/types";
import { generateActivitySummary } from "@/app/actions";
import { Sparkles } from "lucide-react";

type SummaryGeneratorProps = {
  chapter: Chapter;
};

export function SummaryGenerator({ chapter }: SummaryGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setIsOpen(true);

    const activitiesString = chapter.activities
      .map((activity) => {
        let details = `Type: ${activity.type}, Title: "${activity.title}"`;
        if (activity.type === 'checkbox') {
          details += `, Completed: ${activity.completed ? 'Yes' : 'No'}`;
        } else if (activity.type === 'counter') {
          details += `, Progress: ${activity.count || 0}/${activity.target || 'N/A'}`;
        } else if (activity.type === 'link') {
          details += `, URL: ${activity.url}`;
        }
        return details;
      })
      .join("\n");

    if (!activitiesString) {
        setSummary("This chapter has no activities to summarize.");
        setIsLoading(false);
        return;
    }

    try {
      const result = await generateActivitySummary({ activities: activitiesString });
      setSummary(result.summary);
    } catch (error) {
      console.error("Failed to generate summary:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate summary. Please try again.",
      });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleGenerateSummary} disabled={isLoading}>
        <Sparkles className="mr-2 h-4 w-4" />
        {isLoading ? "Generating..." : "Summarize"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chapter Summary</DialogTitle>
            <DialogDescription>
              AI-generated summary for '{chapter.name}'.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{summary}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
