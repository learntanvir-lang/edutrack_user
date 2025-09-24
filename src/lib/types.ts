export type ActivityType = 'checkbox' | 'counter' | 'link';

export interface Activity {
  id: string;
  title: string;
  type: ActivityType;
  completed?: boolean;
  count?: number;
  target?: number;
  url?: string;
  notes?: string;
}

export interface Chapter {
  id: string;
  name: string;
  activities: Activity[];
  isCompleted: boolean;
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
