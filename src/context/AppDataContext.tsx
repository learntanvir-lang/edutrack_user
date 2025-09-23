"use client";

import { createContext, useReducer, useEffect, ReactNode } from "react";
import { Subject, Exam, Paper, Chapter, Activity } from "@/lib/types";
import { initialData } from "@/lib/data";

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
  | { type: "ADD_ACTIVITY"; payload: { subjectId: string; paperId: string; chapterId: string; activity: Activity } }
  | { type: "UPDATE_ACTIVITY"; payload: { subjectId: string; paperId: string; chapterId: string; activity: Activity } }
  | { type: "DELETE_ACTIVITY"; payload: { subjectId: string; paperId: string; chapterId: string; activityId: string } }
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
    // Activity actions
    case "ADD_ACTIVITY":
        return {...state, subjects: state.subjects.map(s => s.id === action.payload.subjectId ? {...s, papers: s.papers.map(p => p.id === action.payload.paperId ? {...p, chapters: p.chapters.map(c => c.id === action.payload.chapterId ? {...c, activities: [...c.activities, action.payload.activity] } : c)} : p)} : s)};
    case "UPDATE_ACTIVITY":
        return {...state, subjects: state.subjects.map(s => s.id === action.payload.subjectId ? {...s, papers: s.papers.map(p => p.id === action.payload.paperId ? {...p, chapters: p.chapters.map(c => c.id === action.payload.chapterId ? {...c, activities: c.activities.map(a => a.id === action.payload.activity.id ? action.payload.activity : a) } : c)} : p)} : s)};
    case "DELETE_ACTIVITY":
        return {...state, subjects: state.subjects.map(s => s.id === action.payload.subjectId ? {...s, papers: s.papers.map(p => p.id === action.payload.paperId ? {...p, chapters: p.chapters.map(c => c.id === action.payload.chapterId ? {...c, activities: c.activities.filter(a => a.id !== action.payload.activityId) } : c)} : p)} : s)};
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
        dispatch({ type: "SET_STATE", payload: JSON.parse(storedData) });
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
