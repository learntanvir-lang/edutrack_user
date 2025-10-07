
"use client";

import { createContext, useReducer, useEffect, ReactNode, useContext } from "react";
import { Subject, Exam, Paper, Chapter } from "@/lib/types";
import { initialData } from "@/lib/data";
import { v4 as uuidv4 } from 'uuid';
import { useFirebase } from "@/firebase";
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
  | { type: "DELETE_SUBJECT"; payload: string }
  | { type: "DUPLICATE_SUBJECT"; payload: Subject }
  | { type: "ADD_PAPER"; payload: { subjectId: string; paper: Paper } }
  | { type: "UPDATE_PAPER"; payload: { subjectId: string; paper: Paper } }
  | { type: "DELETE_PAPER"; payload: { subjectId: string; paperId: string } }
  | { type: "DUPLICATE_PAPER"; payload: { subjectId: string; paper: Paper } }
  | { type: "ADD_CHAPTER"; payload: { subjectId: string; paperId: string; chapter: Chapter } }
  | { type: "UPDATE_CHAPTER"; payload: { subjectId: string; paperId: string; chapter: Chapter } }
  | { type: "DELETE_CHAPTER"; payload: { subjectId: string; paperId: string; chapterId: string } }
  | { type: "DUPLICATE_CHAPTER", payload: { subjectId: string, paperId: string, chapter: Chapter } }
  | { type: "REORDER_CHAPTERS", payload: { subjectId: string, paperId: string, startIndex: number, endIndex: number } }
  | { type: "ADD_EXAM"; payload: Exam }
  | { type: "UPDATE_EXAM"; payload: Exam }
  | { type: "DELETE_EXAM"; payload: string };

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "SET_STATE":
      return action.payload;
    case "ADD_SUBJECT":
      return { ...state, subjects: [...state.subjects, action.payload] };
    case "UPDATE_SUBJECT":
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.id ? action.payload : s) };
    case "DELETE_SUBJECT":
      return { ...state, subjects: state.subjects.filter(s => s.id !== action.payload) };
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
        return {...state, subjects: state.subjects.map(s => s.id === action.payload.subjectId ? {...s, papers: s.papers.map(p => p.id === action.payload.paperId ? {...p, chapters: p.chapters.filter(c => c.id !== action.payload.chapterId)} : p)} : s)};
    case "DUPLICATE_CHAPTER": {
      const { subjectId, paperId, chapter } = action.payload;
      const newChapter: Chapter = {
        ...chapter,
        id: uuidv4(),
        name: `${chapter.name} (Copy)`,
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

// Wrapper for dispatch to also handle Firestore persistence
const createSyncedDispatch = (dispatch: React.Dispatch<Action>, firestore: any, user: any) => {
  return (action: Action) => {
    // First, update local state
    dispatch(action);

    // Then, persist to Firestore if user is logged in
    if (firestore && user) {
      const userId = user.uid;
      switch (action.type) {
        // Subjects
        case "ADD_SUBJECT":
        case "UPDATE_SUBJECT":
          setDoc(doc(firestore, `users/${userId}/subjects`, action.payload.id), action.payload);
          break;
        case "DELETE_SUBJECT":
          deleteDoc(doc(firestore, `users/${userId}/subjects`, action.payload));
          break;
        
        // We need to update the whole subject doc for nested changes
        case "ADD_PAPER":
        case "UPDATE_PAPER":
        case "DELETE_PAPER":
        case "DUPLICATE_PAPER":
        case "ADD_CHAPTER":
        case "UPDATE_CHAPTER":
        case "DELETE_CHAPTER":
        case "DUPLICATE_CHAPTER":
        case "REORDER_CHAPTERS": {
            const tempState = appReducer(initialState, action)
            const subjectToUpdate = tempState.subjects.find(s => s.id === (action.payload as any).subjectId);
            if(subjectToUpdate){
                setDoc(doc(firestore, `users/${userId}/subjects`, subjectToUpdate.id), subjectToUpdate, { merge: true });
            }
          break;
        }

        // Exams
        case "ADD_EXAM":
        case "UPDATE_EXAM":
          setDoc(doc(firestore, `users/${userId}/exams`, action.payload.id), action.payload);
          break;
        case "DELETE_EXAM":
          deleteDoc(doc(firestore, `users/${userId}/exams`, action.payload));
          break;
        
        // This is a special case for duplication, we need to get the final subject from the state
        case "DUPLICATE_SUBJECT":
            const newSubjectState = appReducer(initialState, action);
            const newSubject = newSubjectState.subjects.find(s => s.name === `${action.payload.name} (Copy)`);
            if(newSubject){
                setDoc(doc(firestore, `users/${userId}/subjects`, newSubject.id), newSubject);
            }
            break;
      }
    }
  };
};

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { firestore, user, isUserLoading } = useFirebase();

  // Effect for loading data
  useEffect(() => {
    if (isUserLoading) return; // Wait until we know if user is logged in or not

    const loadData = async () => {
      if (user && firestore) {
        // User is logged in, fetch from Firestore
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
          loadFromLocalStorage(); // Fallback to local storage on error
        }
      } else {
        // User is not logged in, use local storage
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

  // Effect for saving data
  useEffect(() => {
    // Only save to local storage if the user is NOT logged in.
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


  // Create a dispatch function that is aware of the user and firestore instance
  const syncedDispatch = (action: Action) => {
    // Optimistically update the local state
    const newState = appReducer(state, action);
    dispatch({ type: 'SET_STATE', payload: newState });

    // Persist to Firestore if logged in
    if (user && firestore) {
      const userId = user.uid;
      const findSubject = (subjectId: string) => newState.subjects.find(s => s.id === subjectId);

      switch (action.type) {
        case "ADD_SUBJECT":
        case "UPDATE_SUBJECT":
          setDoc(doc(firestore, `users/${userId}/subjects`, action.payload.id), action.payload);
          break;
        case "DUPLICATE_SUBJECT":
          setDoc(doc(firestore, `users/${userId}/subjects`, newState.subjects[newState.subjects.length - 1].id), newState.subjects[newState.subjects.length - 1]);
          break;
        case "DELETE_SUBJECT":
          deleteDoc(doc(firestore, `users/${userId}/subjects`, action.payload));
          break;

        case "ADD_PAPER":
        case "UPDATE_PAPER":
        case "DELETE_PAPER":
        case "DUPLICATE_PAPER":
        case "ADD_CHAPTER":
        case "UPDATE_CHAPTER":
        case "DELETE_CHAPTER":
        case "DUPLICATE_CHAPTER":
        case "REORDER_CHAPTERS": {
          const subject = findSubject(action.payload.subjectId);
          if (subject) {
            setDoc(doc(firestore, `users/${userId}/subjects`, subject.id), subject);
          }
          break;
        }

        case "ADD_EXAM":
        case "UPDATE_EXAM":
          setDoc(doc(firestore, `users/${userId}/exams`, action.payload.id), action.payload);
          break;
        case "DELETE_EXAM":
          deleteDoc(doc(firestore, `users/${userId}/exams`, action.payload));
          break;
        default:
          break;
      }
    }
  };


  return (
    <AppDataContext.Provider value={{ ...state, dispatch: syncedDispatch }}>
      {children}
    </AppDataContext.Provider>
  );
};
