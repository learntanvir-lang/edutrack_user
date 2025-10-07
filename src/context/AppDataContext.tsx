
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
  | { type: "DELETE_SUBJECT"; payload: { id: string } }
  | { type: "ADD_PAPER"; payload: { subjectId: string; paper: Paper } }
  | { type: "UPDATE_PAPER"; payload: { subjectId: string; paper: Paper } }
  | { type: "DUPLICATE_PAPER"; payload: { subjectId: string; paper: Paper } }
  | { type: "DELETE_PAPER"; payload: { subjectId: string; paperId: string } }
  | { type: "ADD_CHAPTER"; payload: { subjectId: string; paperId: string; chapter: Chapter } }
  | { type: "UPDATE_CHAPTER"; payload: { subjectId: string; paperId: string; chapter: Chapter } }
  | { type: "DUPLICATE_CHAPTER", payload: { subjectId: string, paperId: string, chapter: Chapter } }
  | { type: "DELETE_CHAPTER"; payload: { subjectId: string; paperId: string; chapterId: string } }
  | { type: "REORDER_CHAPTERS", payload: { subjectId: string, paperId: string, startIndex: number, endIndex: number } }
  | { type: "ADD_EXAM"; payload: Exam }
  | { type: "UPDATE_EXAM"; payload: Exam }
  | { type: "DELETE_EXAM"; payload: { id: string } };

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "SET_STATE":
      return action.payload;
    case "ADD_SUBJECT":
      return { ...state, subjects: [...state.subjects, action.payload] };
    case "UPDATE_SUBJECT":
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.id ? action.payload : s) };
    case "DELETE_SUBJECT":
      return { ...state, subjects: state.subjects.filter(s => s.id !== action.payload.id) };
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
    case "DELETE_PAPER":
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.subjectId ? { ...s, papers: s.papers.filter(p => p.id !== action.payload.paperId) } : s) };
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
    case "DELETE_CHAPTER":
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.subjectId ? { ...s, papers: s.papers.map(p => p.id === action.payload.paperId ? { ...p, chapters: p.chapters.filter(c => c.id !== action.payload.chapterId) } : p) } : s) };
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
    case "DELETE_EXAM":
      return { ...state, exams: state.exams.filter(e => e.id !== action.payload.id) };
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
          console.error("Error fetching from Firestore:", error);
          dispatch({ type: "SET_STATE", payload: initialData });
        }
      } else {
        dispatch({ type: "SET_STATE", payload: initialData });
      }
    };
    
    loadData();

  }, [user, firestore, isUserLoading]);

  const syncedDispatch = async (action: Action) => {
    
    if (user && firestore) {
        const userId = user.uid;
        try {
             switch (action.type) {
                case 'DELETE_SUBJECT':
                    await deleteDoc(doc(firestore, `users/${userId}/subjects`, action.payload.id));
                    break;
                case 'DELETE_PAPER': {
                    const subject = state.subjects.find(s => s.id === action.payload.subjectId);
                    if (subject) {
                        const updatedPapers = subject.papers.filter(p => p.id !== action.payload.paperId);
                        await setDoc(doc(firestore, `users/${userId}/subjects`, subject.id), {...subject, papers: updatedPapers});
                    }
                    break;
                }
                case 'DELETE_CHAPTER': {
                     const subject = state.subjects.find(s => s.id === action.payload.subjectId);
                    if (subject) {
                        const updatedPapers = subject.papers.map(p => {
                            if (p.id === action.payload.paperId) {
                                return {...p, chapters: p.chapters.filter(c => c.id !== action.payload.chapterId)};
                            }
                            return p;
                        });
                        await setDoc(doc(firestore, `users/${userId}/subjects`, subject.id), {...subject, papers: updatedPapers});
                    }
                    break;
                }
                case 'DELETE_EXAM':
                    await deleteDoc(doc(firestore, `users/${userId}/exams`, action.payload.id));
                    break;
            }
        } catch (error) {
            console.error(`Firestore delete operation for ${action.type} failed:`, error);
        }
    }
    
    // Update local state AFTER Firestore operation
    dispatch(action);
    
    if (user && firestore) {
        const userId = user.uid;
        const newState = appReducer(state, action);
        try {
            switch (action.type) {
                case "ADD_SUBJECT":
                case "UPDATE_SUBJECT":
                    await setDoc(doc(firestore, `users/${userId}/subjects`, action.payload.id), action.payload);
                    break;
                case "DUPLICATE_SUBJECT": {
                    const newSubject = newState.subjects.find(s => s.id !== action.payload.id && s.name === `${action.payload.name} (Copy)`);
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
            console.error(`Firestore write operation for ${action.type} failed:`, error);
        }
    }
};

  return (
    <AppDataContext.Provider value={{ ...state, dispatch: syncedDispatch }}>
      {children}
    </AppDataContext.Provider>
  );
};
