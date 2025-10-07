
"use client";

import { createContext, useReducer, useEffect, ReactNode, useContext, useMemo } from "react";
import { Subject, Exam, Paper, Chapter } from "@/lib/types";
import { initialData } from "@/lib/data";
import { v4 as uuidv4 } from 'uuid';
import { useFirebase, useUser } from "@/firebase";
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  deleteDoc,
  setDoc,
} from "firebase/firestore";

type AppState = {
  subjects: Subject[];
  exams: Exam[];
};

type Action =
  | { type: "SET_STATE"; payload: AppState }
  | { type: "ADD_SUBJECT"; payload: Subject }
  | { type: "UPDATE_SUBJECT"; payload: Subject }
  | { type: "DUPLICATE_SUBJECT"; payload: Subject }
  | { type: "ADD_PAPER"; payload: { subjectId: string; paper: Paper } }
  | { type: "UPDATE_PAPER"; payload: { subjectId: string; paper: Paper } }
  | { type: "DUPLICATE_PAPER"; payload: { subjectId: string; paper: Paper } }
  | { type: "ADD_CHAPTER"; payload: { subjectId: string; paperId: string; chapter: Chapter } }
  | { type: "UPDATE_CHAPTER"; payload: { subjectId: string; paperId: string; chapter: Chapter } }
  | { type: "DUPLICATE_CHAPTER", payload: { subjectId: string, paperId: string, chapter: Chapter } }
  | { type: "REORDER_CHAPTERS", payload: { subjectId: string, paperId: string, startIndex: number, endIndex: number } }
  | { type: "ADD_EXAM"; payload: Exam }
  | { type: "UPDATE_EXAM"; payload: Exam };

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "SET_STATE":
      return action.payload;
    case "ADD_SUBJECT":
      return { ...state, subjects: [...state.subjects, action.payload] };
    case "UPDATE_SUBJECT":
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.id ? action.payload : s) };
    case "DUPLICATE_SUBJECT": {
      const subject = action.payload;
      const newSubject: Subject = {
        ...subject,
        id: uuidv4(),
        name: `${subject.name} (Copy)`,
        papers: subject.papers.map(paper => ({
          ...paper,
          id: uuidv4(),
          chapters: paper.chapters.map(chapter => ({
            ...chapter,
            id: uuidv4(),
            progressItems: chapter.progressItems.map(item => ({...item, id: uuidv4()})),
            resourceLinks: chapter.resourceLinks.map(link => ({...link, id: uuidv4()})),
          }))
        }))
      };
      return { ...state, subjects: [...state.subjects, newSubject] };
    }
    case "ADD_PAPER":
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.subjectId ? { ...s, papers: [...s.papers, action.payload.paper] } : s) };
    case "UPDATE_PAPER":
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.subjectId ? { ...s, papers: s.papers.map(p => p.id === action.payload.paper.id ? action.payload.paper : p) } : s) };
    case "DUPLICATE_PAPER": {
      const { subjectId, paper } = action.payload;
      const newPaper: Paper = {
        ...paper,
        id: uuidv4(),
        name: `${paper.name} (Copy)`,
        chapters: paper.chapters.map(chapter => ({
            ...chapter,
            id: uuidv4(),
            progressItems: chapter.progressItems.map(item => ({...item, id: uuidv4()})),
            resourceLinks: chapter.resourceLinks.map(link => ({...link, id: uuidv4()})),
        }))
      };
      return {...state, subjects: state.subjects.map(s => s.id === subjectId ? { ...s, papers: [...s.papers, newPaper] } : s)};
    }
    case "ADD_CHAPTER":
        return {...state, subjects: state.subjects.map(s => s.id === action.payload.subjectId ? {...s, papers: s.papers.map(p => p.id === action.payload.paperId ? {...p, chapters: [...p.chapters, action.payload.chapter]} : p)}: s)};
    case "UPDATE_CHAPTER":
        return {...state, subjects: state.subjects.map(s => s.id === action.payload.subjectId ? {...s, papers: s.papers.map(p => p.id === action.payload.paperId ? {...p, chapters: p.chapters.map(c => c.id === action.payload.chapter.id ? action.payload.chapter : c)} : p)} : s)};
    case "DUPLICATE_CHAPTER": {
      const { subjectId, paperId, chapter } = action.payload;
      const newChapter: Chapter = {
        ...chapter,
        id: uuidv4(),
        name: `${chapter.name} (Copy)`,
        progressItems: chapter.progressItems.map(item => ({...item, id: uuidv4()})),
        resourceLinks: chapter.resourceLinks.map(link => ({...link, id: uuidv4()})),
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
    case "ADD_EXAM":
      return { ...state, exams: [...state.exams, action.payload] };
    case "UPDATE_EXAM":
      return { ...state, exams: state.exams.map(e => e.id === action.payload.id ? action.payload : e) };
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
  const { firestore, user, isUserLoading } = useFirebase();

  useEffect(() => {
    if (isUserLoading) return; 

    const loadData = async () => {
      if (user && firestore) {
        try {
          const subjectsCol = collection(firestore, `users/${user.uid}/subjects`);
          const examsCol = collection(firestore, `users/${user.uid}/exams`);

          const [subjectsSnapshot, examsSnapshot] = await Promise.all([
            getDocs(subjectsCol),
            getDocs(examsCol),
          ]);
          
          const subjects = subjectsSnapshot.docs.map(doc => doc.data() as Subject);
          const exams = examsSnapshot.docs.map(doc => doc.data() as Exam);

          dispatch({ type: "SET_STATE", payload: { subjects, exams } });
        } catch (error) {
          console.error("Error fetching from Firestore, falling back to local:", error);
          loadFromLocalStorage(); 
        }
      } else {
        loadFromLocalStorage();
      }
    };
    
    const loadFromLocalStorage = () => {
        try {
            const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedData) {
              const parsedData = JSON.parse(storedData);
              if (parsedData.subjects && parsedData.subjects.some((s: any) => s.papers.some((p: any) => p.chapters.some((c: any) => !c.progressItems)))) {
                  dispatch({ type: "SET_STATE", payload: initialData });
              } else {
                  dispatch({ type: "SET_STATE", payload: parsedData });
              }
            } else {
              dispatch({ type: "SET_STATE", payload: initialData });
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            dispatch({ type: "SET_STATE", payload: initialData });
        }
    };

    loadData();

  }, [user, firestore, isUserLoading]);

  useEffect(() => {
    if (!user && !isUserLoading) {
      try {
          if(state.subjects.length > 0 || state.exams.length > 0) {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
          }
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [state, user, isUserLoading]);

  const syncedDispatch = async (action: Action) => {
    dispatch(action);
    const newState = appReducer(state, action);

    if (user && firestore) {
        const userId = user.uid;
        try {
            switch (action.type) {
                case "ADD_SUBJECT":
                case "UPDATE_SUBJECT":
                    await setDoc(doc(firestore, `users/${userId}/subjects`, action.payload.id), action.payload);
                    break;
                case "DUPLICATE_SUBJECT": {
                    const newSubject = newState.subjects.find(s => s.name === `${action.payload.name} (Copy)`);
                    if (newSubject) {
                        await setDoc(doc(firestore, `users/${userId}/subjects`, newSubject.id), newSubject);
                    }
                    break;
                }
                case "ADD_PAPER":
                case "UPDATE_PAPER":
                case "DUPLICATE_PAPER":
                case "ADD_CHAPTER":
                case "UPDATE_CHAPTER":
                case "DUPLICATE_CHAPTER":
                case "REORDER_CHAPTERS": {
                    const subjectToUpdate = newState.subjects.find(s => s.id === action.payload.subjectId);
                    if (subjectToUpdate) {
                        await setDoc(doc(firestore, `users/${userId}/subjects`, subjectToUpdate.id), subjectToUpdate);
                    }
                    break;
                }
                case "ADD_EXAM":
                case "UPDATE_EXAM":
                    await setDoc(doc(firestore, `users/${userId}/exams`, action.payload.id), action.payload);
                    break;
            }
        } catch (error) {
            console.error(`Firestore operation for ${action.type} failed:`, error);
        }
    }
};

  return (
    <AppDataContext.Provider value={{ ...state, dispatch: syncedDispatch }}>
      {children}
    </AppDataContext.Provider>
  );
};
