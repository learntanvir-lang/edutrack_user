
"use client";

import { useMemo } from "react";
import { Chapter } from "@/lib/types";
import ChapterAccordionItem from "./ChapterAccordionItem";

interface ChapterListProps {
  chapters: Chapter[];
  subjectId: string;
  paperId: string;
}

export function ChapterList({ chapters, subjectId, paperId }: ChapterListProps) {
  const sortedChapters = useMemo(() => {
    return [...chapters].sort((a, b) => {
      const numA = parseFloat(a.number || '0');
      const numB = parseFloat(b.number || '0');
      if (isNaN(numA) || isNaN(numB)) {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      }
      return numA - numB;
    });
  }, [chapters]);

  if (chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-muted-foreground">No Chapters Yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Add a chapter to get started.</p>
      </div>
    );
  }

  return (
      <div className="w-full space-y-2">
          {sortedChapters.map((chapter) => (
            <div key={chapter.id}>
              <ChapterAccordionItem 
                chapter={chapter}
                subjectId={subjectId}
                paperId={paperId}
              />
            </div>
          ))}
      </div>
  );
}
