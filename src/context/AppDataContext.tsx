
"use client";

import { createContext, useReducer, useEffect, ReactNode, useContext, useMemo } from "react";
import { Subject, Exam, Resource, Paper, Chapter, StudyTask, TimeLog, ProgressItem, TodoItem, UserSettings } from "@/lib/types";
import { initialData } from "@/lib/data";
import { v4 as uuidv4 } from 'uuid';
import { useFirebase, useUser } from "@/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  getDocsFromCache,
} from "firebase/firestore";
import {
  setDocumentNonBlocking,
  deleteDocumentNonBlocking
} from "@/firebase/non-blocking-updates";
import { format } from "date-fns";


type AppState = {
  subjects: Subject[];
  exams: Exam[];
  resources: Resource[];
  tasks: StudyTask[];
  settings: UserSettings;
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
  | { type: "DELETE_EXAM"; payload: { id: string } }
  | { type: "ADD_RESOURCE"; payload: Resource }
  | { type: "UPDATE_RESOURCE"; payload: Resource }
  | { type: "DUPLICATE_RESOURCE"; payload: Resource }
  | { type: "DELETE_RESOURCE"; payload: { id: string } }
  | { type: "ADD_TASK"; payload: StudyTask }
  | { type: "UPDATE_TASK"; payload: StudyTask }
  | { type: "DELETE_TASK"; payload: { id: string } }
  | { type: "DUPLICATE_TASK_TO_TODAY", payload: { id: string } }
  | { type: "ADD_TIME_LOG"; payload: { taskId: string; log: TimeLog } }
  | { type: "UPDATE_TIME_LOG"; payload: { taskId: string; log: TimeLog } }
  | { type: "DELETE_TIME_LOG"; payload: { taskId: string; logId: string } }
  | { type: "ADD_PROGRESS_ITEM"; payload: { subjectId: string, paperId: string, chapterId: string, progressItem: ProgressItem } }
  | { type: "UPDATE_PROGRESS_ITEM"; payload: { subjectId: string, paperId: string, chapterId: string, progressItem: ProgressItem } }
  | { type: "DELETE_PROGRESS_ITEM"; payload: { subjectId: string, paperId: string, chapterId: string, progressItemId: string } }
  | { type: "TOGGLE_TODO"; payload: { subjectId: string, paperId: string, chapterId: string, progressItemId: string, todoId: string, completed: boolean } }
  | { type: "UPDATE_SETTINGS"; payload: Partial<UserSettings> };


const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "SET_STATE":
      return {
        ...action.payload,
        tasks: (action.payload.tasks || []).map(task => ({
          ...task,
          timeLogs: task.timeLogs || [],
        })),
      };
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
     case "ADD_PROGRESS_ITEM": {
      const { subjectId, paperId, chapterId, progressItem } = action.payload;
      return {
        ...state,
        subjects: state.subjects.map(s =>
          s.id === subjectId
            ? {
                ...s,
                papers: s.papers.map(p =>
                  p.id === paperId
                    ? {
                        ...p,
                        chapters: p.chapters.map(c =>
                          c.id === chapterId
                            ? { ...c, progressItems: [...c.progressItems, progressItem] }
                            : c
                        ),
                      }
                    : p
                ),
              }
            : s
        ),
      };
    }
    case "UPDATE_PROGRESS_ITEM": {
      const { subjectId, paperId, chapterId, progressItem } = action.payload;
      return {
        ...state,
        subjects: state.subjects.map(s =>
          s.id === subjectId
            ? {
                ...s,
                papers: s.papers.map(p =>
                  p.id === paperId
                    ? {
                        ...p,
                        chapters: p.chapters.map(c =>
                          c.id === chapterId
                            ? {
                                ...c,
                                progressItems: c.progressItems.map(item =>
                                  item.id === progressItem.id ? progressItem : item
                                ),
                              }
                            : c
                        ),
                      }
                    : p
                ),
              }
            : s
        ),
      };
    }
    case "DELETE_PROGRESS_ITEM": {
      const { subjectId, paperId, chapterId, progressItemId } = action.payload;
       return {
        ...state,
        subjects: state.subjects.map(s =>
          s.id === subjectId
            ? {
                ...s,
                papers: s.papers.map(p =>
                  p.id === paperId
                    ? {
                        ...p,
                        chapters: p.chapters.map(c =>
                          c.id === chapterId
                            ? {
                                ...c,
                                progressItems: c.progressItems.filter(item => item.id !== progressItemId),
                              }
                            : c
                        ),
                      }
                    : p
                ),
              }
            : s
        ),
      };
    }
    case "TOGGLE_TODO": {
      const { subjectId, paperId, chapterId, progressItemId, todoId, completed } = action.payload;
      return {
        ...state,
        subjects: state.subjects.map(s =>
          s.id === subjectId
            ? {
                ...s,
                papers: s.papers.map(p =>
                  p.id === paperId
                    ? {
                        ...p,
                        chapters: p.chapters.map(c =>
                          c.id === chapterId
                            ? {
                                ...c,
                                progressItems: c.progressItems.map(item =>
                                  item.id === progressItemId && item.type === 'todolist'
                                    ? {
                                        ...item,
                                        todos: item.todos.map(todo =>
                                          todo.id === todoId ? { ...todo, completed } : todo
                                        ),
                                      }
                                    : item
                                ),
                              }
                            : c
                        ),
                      }
                    : p
                ),
              }
            : s
        ),
      };
    }
    case "ADD_EXAM":
      return { ...state, exams: [...state.exams, action.payload] };
    case "UPDATE_EXAM":
      return { ...state, exams: state.exams.map(e => e.id === action.payload.id ? action.payload : e) };
    case "DELETE_EXAM":
      return { ...state, exams: state.exams.filter(e => e.id !== action.payload.id) };
    case "ADD_RESOURCE":
      return { ...state, resources: [...state.resources, action.payload] };
    case "UPDATE_RESOURCE":
      return { ...state, resources: state.resources.map(n => n.id === action.payload.id ? action.payload : n) };
    case "DUPLICATE_RESOURCE": {
        const resource = action.payload;
        const newResource: Resource = {
            ...resource,
            id: uuidv4(),
            title: `${resource.title} (Copy)`,
            createdAt: new Date().toISOString(),
            links: resource.links.map(link => ({...link, id: uuidv4()})),
        };
        return { ...state, resources: [...state.resources, newResource] };
    }
    case "DELETE_RESOURCE":
      return { ...state, resources: state.resources.filter(n => n.id !== action.payload.id) };
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] };
    case "UPDATE_TASK": {
      const updatedTask = action.payload;
      let tasks = state.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
      
      // If the updated task was completed and has an originalId, complete the original task too
      if (updatedTask.isCompleted && updatedTask.originalId) {
        tasks = tasks.map(t => t.id === updatedTask.originalId ? { ...t, isCompleted: true, isArchived: true } : t);
      }
      
      return { ...state, tasks };
    }
    case "DELETE_TASK": {
        const taskToDelete = state.tasks.find(t => t.id === action.payload.id);
        if (!taskToDelete) return state;

        let newTasks = state.tasks.filter(t => t.id !== action.payload.id);

        // If the deleted task was a duplicate, un-archive the original task.
        if (taskToDelete.originalId) {
            newTasks = newTasks.map(t => 
                t.id === taskToDelete.originalId ? { ...t, isArchived: false } : t
            );
        }
        
        return { ...state, tasks: newTasks };
    }
    case "DUPLICATE_TASK_TO_TODAY": {
      const taskToDuplicate = state.tasks.find(t => t.id === action.payload.id);
      if (!taskToDuplicate) return state;

      const newTask: StudyTask = {
        ...taskToDuplicate,
        id: uuidv4(),
        date: format(new Date(), "yyyy-MM-dd"),
        isCompleted: false, // New task is not completed
        timeLogs: [], // Reset time logs
        activeTimeLogId: null,
        originalId: taskToDuplicate.id, // Link back to the original task
        isArchived: false,
      };

      // Archive the original task
      const updatedTasks = state.tasks.map(t => t.id === taskToDuplicate.id ? { ...t, isArchived: true } : t);

      return { ...state, tasks: [...updatedTasks, newTask] };
    }
    case "ADD_TIME_LOG": {
        return {
            ...state,
            tasks: state.tasks.map(task =>
                task.id === action.payload.taskId
                    ? { ...task, timeLogs: [...(task.timeLogs || []), action.payload.log] }
                    : task
            )
        };
    }
    case "UPDATE_TIME_LOG": {
        return {
            ...state,
            tasks: state.tasks.map(task =>
                task.id === action.payload.taskId
                    ? { ...task, timeLogs: (task.timeLogs || []).map(log => log.id === action.payload.log.id ? action.payload.log : log) }
                    : task
            )
        };
    }
    case "DELETE_TIME_LOG": {
        return {
            ...state,
            tasks: state.tasks.map(task =>
                task.id === action.payload.taskId
                    ? { ...task, timeLogs: (task.timeLogs || []).filter(log => log.id !== action.payload.logId) }
                    : task
            )
        };
    }
    case "UPDATE_SETTINGS":
        return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
};

const initialState: AppState = {
  subjects: [],
  exams: [],
  resources: [],
  tasks: [],
  settings: {
    id: 'user-settings',
    weeklyStudyGoal: 10, // Default goal
    lastWeekGoalMetShown: new Date(0).toISOString(),
  },
};

export const AppDataContext = createContext<{
  subjects: Subject[];
  exams: Exam[];
  resources: Resource[];
  tasks: StudyTask[];
  settings: UserSettings;
  dispatch: React.Dispatch<Action>;
}>({
  ...initialState,
  dispatch: () => null,
});

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { firestore, user, isUserLoading } = useFirebase();

  useEffect(() => {
    const loadData = async () => {
      // Step 1: Immediately load data from localStorage if available
      const lastUserId = localStorage.getItem('lastUserId');
      const localDataStr = lastUserId ? localStorage.getItem(`appData-${lastUserId}`) : null;
      
      if (localDataStr) {
          try {
              const localData = JSON.parse(localDataStr);
              dispatch({ type: "SET_STATE", payload: localData });
          } catch (e) {
              console.error("Failed to parse local data:", e);
              dispatch({ type: "SET_STATE", payload: initialData });
          }
      } else {
          // Fallback to initial sample data if no user and no local data
          if (!user) {
              dispatch({ type: "SET_STATE", payload: initialData });
          }
      }

      // Step 2: Once user and firestore are available, fetch from cloud and sync
      if (user && firestore) {
        try {
          const subjectsCol = collection(firestore, `users/${user.uid}/subjects`);
          const examsCol = collection(firestore, `users/${user.uid}/exams`);
          const resourcesCol = collection(firestore, `users/${user.uid}/resources`);
          const oldNotesCol = collection(firestore, `users/${user.uid}/notes`);
          const tasksCol = collection(firestore, `users/${user.uid}/tasks`);
          
          const [subjectsSnapshot, examsSnapshot, resourcesSnapshot, oldNotesSnapshot, tasksSnapshot, settingsSnapshot] = await Promise.all([
            getDocs(subjectsCol),
            getDocs(examsCol),
            getDocs(resourcesCol),
            getDocs(oldNotesCol),
            getDocs(tasksCol),
            getDocs(collection(firestore, `users/${user.uid}/settings`)),
          ]);

          const subjects = subjectsSnapshot.docs.map(doc => doc.data() as Subject);
          const exams = examsSnapshot.docs.map(doc => doc.data() as Exam);
          const currentResources = resourcesSnapshot.docs.map(doc => doc.data() as Resource);
          const oldNotes = oldNotesSnapshot.docs.map(doc => doc.data() as Resource);
          const tasks = tasksSnapshot.docs.map(doc => ({ ...doc.data(), timeLogs: doc.data().timeLogs || [] }) as StudyTask);

          // Perform a one-time migration from 'notes' to 'resources'
          const resourceIds = new Set(currentResources.map(r => r.id));
          const migratedResources = [...currentResources];
          let migrationOccurred = false;

          for (const note of oldNotes) {
            if (!resourceIds.has(note.id)) {
              migratedResources.push(note);
              // Save the migrated note to the new 'resources' collection
              setDocumentNonBlocking(firestore, `users/${user.uid}/resources`, note.id, note);
              // Delete from the old 'notes' collection
              deleteDocumentNonBlocking(firestore, `users/${user.uid}/notes`, note.id);
              migrationOccurred = true;
            } else {
              // If the note already exists in resources, just delete it from the old collection
              deleteDocumentNonBlocking(firestore, `users/${user.uid}/notes`, note.id);
            }
          }
          
          let settings: UserSettings;
          if (settingsSnapshot.empty || !settingsSnapshot.docs[0].exists()) {
             settings = initialState.settings;
             setDocumentNonBlocking(firestore, `users/${user.uid}/settings`, 'user-settings', settings);
          } else {
             settings = settingsSnapshot.docs[0].data() as UserSettings;
          }

          const onlineState = { subjects, exams, resources: migratedResources, tasks, settings };
          // Sync with online state
          dispatch({ type: "SET_STATE", payload: onlineState });
          localStorage.setItem(`appData-${user.uid}`, JSON.stringify(onlineState));

        } catch (error) {
          console.error("Error fetching from Firestore server. Offline data will be used.", error);
          // The app will continue to run with the data loaded from localStorage
        }
      }
    };
    
    loadData();

  }, [user, firestore]);
  
  useEffect(() => {
    if (user) {
        localStorage.setItem('lastUserId', user.uid);
    }
  }, [user]);

  const syncedDispatch = useMemo(() => {
    const originalDispatch = dispatch;
    
    return (action: Action) => {
        // 1. Optimistically update local state
        originalDispatch(action);
        
        const newState = appReducer(state, action);

        // 2. Queue up the Firestore/localStorage operation
        if (user && firestore) {
            localStorage.setItem(`appData-${user.uid}`, JSON.stringify(newState));
            const userId = user.uid;
            
            switch (action.type) {
                case "ADD_SUBJECT":
                case "UPDATE_SUBJECT":
                    setDocumentNonBlocking(firestore, `users/${userId}/subjects`, action.payload.id, action.payload);
                    break;
                case "DUPLICATE_SUBJECT": {
                    const newSubject = newState.subjects.find(s => s.name === `${action.payload.name} (Copy)`);
                    if (newSubject) {
                        setDocumentNonBlocking(firestore, `users/${userId}/subjects`, newSubject.id, newSubject);
                    }
                    break;
                }
                case "DELETE_SUBJECT":
                    deleteDocumentNonBlocking(firestore, `users/${userId}/subjects`, action.payload.id);
                    break;
                
                case "ADD_PAPER":
                case "UPDATE_PAPER":
                case "DUPLICATE_PAPER":
                case "DELETE_PAPER":
                case "ADD_CHAPTER":
                case "UPDATE_CHAPTER":
                case "DUPLICATE_CHAPTER":
                case "DELETE_CHAPTER":
                case "REORDER_CHAPTERS": {
                    const subjectToUpdate = newState.subjects.find(s => s.id === action.payload.subjectId);
                    if (subjectToUpdate) {
                        setDocumentNonBlocking(firestore, `users/${userId}/subjects`, subjectToUpdate.id, subjectToUpdate);
                    }
                    break;
                }
                 case "ADD_PROGRESS_ITEM":
                case "UPDATE_PROGRESS_ITEM":
                case "DELETE_PROGRESS_ITEM":
                case "TOGGLE_TODO": {
                    const subjectToUpdate = newState.subjects.find(s => s.id === action.payload.subjectId);
                    if (subjectToUpdate) {
                        setDocumentNonBlocking(firestore, `users/${userId}/subjects`, subjectToUpdate.id, subjectToUpdate);
                    }
                    break;
                }
        
                case "ADD_EXAM":
                case "UPDATE_EXAM":
                    setDocumentNonBlocking(firestore, `users/${userId}/exams`, action.payload.id, action.payload);
                    break;
                case "DELETE_EXAM":
                    deleteDocumentNonBlocking(firestore, `users/${userId}/exams`, action.payload.id);
                    break;
        
                case "ADD_RESOURCE":
                case "UPDATE_RESOURCE":
                    setDocumentNonBlocking(firestore, `users/${userId}/resources`, action.payload.id, action.payload);
                    break;
                case "DUPLICATE_RESOURCE": {
                    const newResource = newState.resources.find(n => n.title === `${action.payload.title} (Copy)`);
                    if (newResource) {
                        setDocumentNonBlocking(firestore, `users/${userId}/resources`, newResource.id, newResource);
                    }
                    break;
                }
                case "DELETE_RESOURCE":
                    deleteDocumentNonBlocking(firestore, `users/${userId}/resources`, action.payload.id);
                    break;
                
                case "ADD_TASK":
                case "UPDATE_TASK":
                    setDocumentNonBlocking(firestore, `users/${userId}/tasks`, action.payload.id, action.payload);
                    if (action.payload.isCompleted && action.payload.originalId) {
                      const originalTask = newState.tasks.find(t => t.id === action.payload.originalId);
                      if (originalTask) {
                        setDocumentNonBlocking(firestore, `users/${userId}/tasks`, originalTask.id, originalTask);
                      }
                    }
                    break;
                case "DELETE_TASK": {
                    deleteDocumentNonBlocking(firestore, `users/${userId}/tasks`, action.payload.id);
                    const taskToDelete = state.tasks.find(t => t.id === action.payload.id);
                     if (taskToDelete?.originalId) {
                        const originalTask = newState.tasks.find(t => t.id === taskToDelete.originalId);
                        if(originalTask) {
                            setDocumentNonBlocking(firestore, `users/${userId}/tasks`, originalTask.id, originalTask);
                        }
                    }
                    break;
                }
                case "DUPLICATE_TASK_TO_TODAY": {
                    const newTask = newState.tasks.find(t => t.originalId === action.payload.id);
                     if (newTask) {
                        setDocumentNonBlocking(firestore, `users/${userId}/tasks`, newTask.id, newTask);
                    }
                    const originalTask = newState.tasks.find(t => t.id === action.payload.id);
                    if (originalTask) {
                        setDocumentNonBlocking(firestore, `users/${userId}/tasks`, originalTask.id, originalTask);
                    }
                    break;
                }
                
                case "ADD_TIME_LOG":
                case "UPDATE_TIME_LOG":
                case "DELETE_TIME_LOG": {
                    const taskToUpdate = newState.tasks.find(t => t.id === action.payload.taskId);
                    if (taskToUpdate) {
                         setDocumentNonBlocking(firestore, `users/${userId}/tasks`, taskToUpdate.id, taskToUpdate);
                    }
                    break;
                }
                case "UPDATE_SETTINGS": {
                    setDocumentNonBlocking(firestore, `users/${userId}/settings`, 'user-settings', newState.settings);
                    break;
                }
            }
        }
    };
  }, [state, user, firestore]);

  return (
    <AppDataContext.Provider value={{ ...state, dispatch: syncedDispatch }}>
      {children}
    </AppDataContext.Provider>
  );
};
