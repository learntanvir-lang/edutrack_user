
"use client";

import { createContext, useReducer, useEffect, ReactNode } from "react";
import { Subject, Exam, Paper, Chapter, Activity } from "@/lib/types";
import { initialData } from "@/lib/data";
import { v4 as uuidv4 } from 'uuid';

type AppState = {
  subjects: Subject[];
  exams: Exam[];
};

type Action =
  | { type: "SET_STATE"; payload: AppState }
  | { type: "ADD_SUBJECT"; payload: Subject }
  | { type: "UPDATE_SUBJECT"; payload: Subject }
  | { type: "DELETE_SUBJECT"; payload: string }
  | { type: "ADD_PAPER"; payload: { subjectId: string; paper: Paper } }
  | { type: "UPDATE_PAPER"; payload: { subjectId: string; paper: Paper } }
  | { type: "DELETE_PAPER"; payload: { subjectId: string; paperId: string } }
  | { type: "ADD_CHAPTER"; payload: { subjectId: string; paperId: string; chapter: Chapter } }
  | { type: "UPDATE_CHAPTER"; payload: { subjectId: string; paperId: string; chapter: Chapter } }
  | { type: "DELETE_CHAPTER"; payload: { subjectId: string; paperId: string; chapterId: string } }
  | { type: "DUPLICATE_CHAPTER", payload: { subjectId: string, paperId: string, chapter: Chapter } }
  | { type: "REORDER_CHAPTERS", payload: { subjectId: string, paperId: string, startIndex: number, endIndex: number } }
  | { type: "ADD_ACTIVITY"; payload: { subjectId: string; paperId: string; chapterId: string; activity: Activity } }
  | { type: "UPDATE_ACTIVITY"; payload: { subjectId: string; paperId: string; chapterId: string; activity: Activity } }
  | { type: "DELETE_ACTIVITY"; payload: { subjectId: string; paperId: string; chapterId: string; activityId: string } }
  | { type: "REORDER_ACTIVITIES", payload: { subjectId: string; paperId: string; chapterId: string; startIndex: number; endIndex: number } }
  | { type: "ADD_EXAM"; payload: Exam }
  | { type: "UPDATE_EXAM"; payload: Exam }
  | { type: "DELETE_EXAM"; payload: string };

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "SET_STATE":
      return action.payload;
    // Subject actions
    case "ADD_SUBJECT":
      return { ...state, subjects: [...state.subjects, action.payload] };
    case "UPDATE_SUBJECT":
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.id ? action.payload : s) };
    case "DELETE_SUBJECT":
      return { ...state, subjects: state.subjects.filter(s => s.id !== action.payload) };
    // Paper actions
    case "ADD_PAPER":
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.subjectId ? { ...s, papers: [...s.papers, action.payload.paper] } : s) };
    case "UPDATE_PAPER":
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.subjectId ? { ...s, papers: s.papers.map(p => p.id === action.payload.paper.id ? action.payload.paper : p) } : s) };
    case "DELETE_PAPER":
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.subjectId ? { ...s, papers: s.papers.filter(p => p.id !== action.payload.paperId) } : s) };
    // Chapter actions
    case "ADD_CHAPTER":
        return {...state, subjects: state.subjects.map(s => s.id === action.payload.subjectId ? {...s, papers: s.papers.map(p => p.id === action.payload.paperId ? {...p, chapters: [...p.chapters, action.payload.chapter]} : p)}: s)};
    case "UPDATE_CHAPTER":
        return {...state, subjects: state.subjects.map(s => s.id === action.payload.subjectId ? {...s, papers: s.papers.map(p => p.id === action.payload.paperId ? {...p, chapters: p.chapters.map(c => c.id === action.payload.chapter.id ? action.payload.chapter : c)} : p)} : s)};
    case "DELETE_CHAPTER":
        return {...state, subjects: state.subjects.map(s => s.id === action.payload.subjectId ? {...s, papers: s.papers.map(p => p.id === action.payload.paperId ? {...p, chapters: p.chapters.filter(c => c.id !== action.payload.chapterId)} : p)} : s)};
    case "DUPLICATE_CHAPTER": {
      const { subjectId, paperId, chapter } = action.payload;
      const newChapter: Chapter = {
        ...chapter,
        id: uuidv4(),
        name: `${chapter.name} (Copy)`,
        activities: chapter.activities.map(activity => ({
          ...activity,
          id: uuidv4(),
        })),
      };
      return {...state, subjects: state.subjects.map(s => s.id === subjectId ? {...s, papers: s.papers.map(p => p.id === paperId ? {...p, chapters: [...p.chapters, newChapter]} : p)}: s)};
    }
    case "REORDER_CHAPTERS": {
      const { subjectId, paperId, startIndex, endIndex } = action.payload;
      return {
        ...state,
        subjects: state.subjects.map(s => {
          if (s.id === subjectId) {
            return {
              ...s,
              papers: s.papers.map(p => {
                if (p.id === paperId) {
                  const newChapters = Array.from(p.chapters);
                  const [removed] = newChapters.splice(startIndex, 1);
                  newChapters.splice(endIndex, 0, removed);
                  return { ...p, chapters: newChapters };
                }
                return p;
              }),
            };
          }
          return s;
        }),
      };
    }
    // Activity actions
    case "ADD_ACTIVITY": {
        const { subjectId, paperId, chapterId, activity } = action.payload;
        return {
            ...state,
            subjects: state.subjects.map(subject => {
                if (subject.id !== subjectId) return subject;
                return {
                    ...subject,
                    papers: subject.papers.map(paper => {
                        if (paper.id !== paperId) return paper;
                        return {
                            ...paper,
                            chapters: paper.chapters.map(chapter => {
                                if (chapter.id !== chapterId) return chapter;
                                return {
                                    ...chapter,
                                    activities: [...chapter.activities, activity],
                                };
                            }),
                        };
                    }),
                };
            }),
        };
    }
    case "UPDATE_ACTIVITY": {
        const { subjectId, paperId, chapterId, activity } = action.payload;
        return {
            ...state,
            subjects: state.subjects.map(subject => {
                if (subject.id !== subjectId) return subject;
                return {
                    ...subject,
                    papers: subject.papers.map(paper => {
                        if (paper.id !== paperId) return paper;
                        return {
                            ...paper,
                            chapters: paper.chapters.map(chapter => {
                                if (chapter.id !== chapterId) return chapter;
                                return {
                                    ...chapter,
                                    activities: chapter.activities.map(act =>
                                        act.id === activity.id ? activity : act
                                    ),
                                };
                            }),
                        };
                    }),
                };
            }),
        };
    }
    case "DELETE_ACTIVITY": {
        const { subjectId, paperId, chapterId, activityId } = action.payload;
        return {
            ...state,
            subjects: state.subjects.map(subject => {
                if (subject.id !== subjectId) return subject;
                return {
                    ...subject,
                    papers: subject.papers.map(paper => {
                        if (paper.id !== paperId) return paper;
                        return {
                            ...paper,
                            chapters: paper.chapters.map(chapter => {
                                if (chapter.id !== chapterId) return chapter;
                                return {
                                    ...chapter,
                                    activities: chapter.activities.filter(
                                        act => act.id !== activityId
                                    ),
                                };
                            }),
                        };
                    }),
                };
            }),
        };
    }
    case "REORDER_ACTIVITIES": {
      const { subjectId, paperId, chapterId, startIndex, endIndex } = action.payload;
      return {
        ...state,
        subjects: state.subjects.map(s => {
          if (s.id === subjectId) {
            return {
              ...s,
              papers: s.papers.map(p => {
                if (p.id === paperId) {
                  return {
                    ...p,
                    chapters: p.chapters.map(c => {
                      if (c.id === chapterId) {
                        const newActivities = Array.from(c.activities);
                        const [removed] = newActivities.splice(startIndex, 1);
                        newActivities.splice(endIndex, 0, removed);
                        return { ...c, activities: newActivities };
                      }
                      return c;
                    }),
                  };
                }
                return p;
              }),
            };
          }
          return s;
        }),
      };
    }
    // Exam actions
    case "ADD_EXAM":
      return { ...state, exams: [...state.exams, action.payload] };
    case "UPDATE_EXAM":
      return { ...state, exams: state.exams.map(e => e.id === action.payload.id ? action.payload : e) };
    case "DELETE_EXAM":
      return { ...state, exams: state.exams.filter(e => e.id !== action.payload) };
    default:
      return state;
  }
};

const initialState: AppState = {
  subjects: [],
  exams: [],
};

export const AppDataContext = createContext<{
  subjects: Subject[];
  exams: Exam[];
  dispatch: React.Dispatch<Action>;
}>({
  ...initialState,
  dispatch: () => null,
});

const LOCAL_STORAGE_KEY = "eduTrackData";

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Quick check to see if it's old data structure
        if (parsedData.subjects && parsedData.subjects.some((s: any) => s.papers === undefined)) {
            // This is likely old data, load initial data instead
            dispatch({ type: "SET_STATE", payload: initialData });
        } else {
            dispatch({ type: "SET_STATE", payload: parsedData });
        }
      } else {
        // Load initial seed data if no data is in local storage
        dispatch({ type: "SET_STATE", payload: initialData });
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      dispatch({ type: "SET_STATE", payload: initialData });
    }
  }, []);

  useEffect(() => {
    try {
        if(state.subjects.length > 0 || state.exams.length > 0) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        }
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [state]);

  return (
    <AppDataContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AppDataContext.Provider>
  );
};
