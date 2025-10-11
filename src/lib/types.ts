

export interface ResourceLink {
  id: string;
  url: string;
  description: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ProgressItem {
  id: string;
  name: string;
  type: 'todo' | 'counter';
  completed: number;
  total: number;
}

export interface Chapter {
  id: string;
  number?: string;
  name: string;
  isCompleted: boolean;
  progressItems: ProgressItem[];
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
  createdAt: string; // ISO 8601 format
  showOnDashboard?: boolean;
}

export interface Exam {
  id: string;
  name: string;
  subjectIds: string[];
  chapterIds: string[];
  date: string; // ISO 8601 format
  isCompleted: boolean;
  marksObtained?: number;
  totalMarks?: number;
}

export interface NoteLink {
  id: string;
  title: string;
  url: string;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  links: NoteLink[];
  createdAt: string; // ISO 8601 format
}

export interface TimeLog {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
}

export interface StudyTask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  date: string; // YYYY-MM-DD format
  priority: number;
  category: string;
  subcategory?: string;
  timeLogs: TimeLog[];
  activeTimeLogId?: string | null;
  originalId?: string; // To link a duplicated task to its original
  isArchived?: boolean; // To hide overdue tasks that have been moved
}
