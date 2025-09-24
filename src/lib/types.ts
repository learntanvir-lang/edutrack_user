
export interface ResourceLink {
  id: string;
  url: string;
  description: string;
}

export interface Chapter {
  id: string;
  number?: string;
  name: string;
  isCompleted: boolean;
  classSessions: { total: number; attended: number };
  practiceProblems: { total: number; completed: number };
  resourceLinks: ResourceLink[];
}

export interface Paper {
  id: string;
  name:string;
  chapters: Chapter[];
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  papers: Paper[];
}

export interface Exam {
  id: string;
  name: string;
  subjectIds: string[];
  chapterIds: string[];
  date: string; // ISO 8601 format
  isCompleted: boolean;
}
