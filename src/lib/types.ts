

export interface ResourceLink {
  id: string;
  url: string;
  description: string;
  icon?: string;
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
  icon?: string;
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

export interface ExamCategory {
    id: string;
    name: string;
    order: number;
}

export interface Exam {
  id: string;
  name: string;
  categoryId?: string;
  subjectIds: string[];
  chapterIds: string[];
  date: string; // ISO 8601 format
  isCompleted: boolean;
  marksObtained?: number;
  totalMarks?: number;
  examPeriodTitle?: string;
  startDate?: string;
  endDate?: string;
  isEligible?: boolean;
  showEligibility?: boolean;
  examFee?: number;
  isFeePaid?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  links: ResourceLink[];
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
  description?: string | null;
  isCompleted: boolean;
  date: string; // YYYY-MM-DD format
  startTime?: string | null;
  endTime?: string | null;
  color?: string | null;
  icon?: string | null;
  priority: number;
  category: string;
  subcategory?: string | null;
  timeLogs: TimeLog[];
  activeTimeLogId?: string | null;
  originalId?: string; // To link a duplicated task to its original
  isArchived?: boolean; // To hide overdue tasks that have been moved
}

export interface UserSettings {
    id: string;
    weeklyStudyGoal: number; // in hours
    lastWeekGoalMetShown: string; // ISO date string
}
