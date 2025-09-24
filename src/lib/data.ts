import { Subject, Exam } from './types';
import { v4 as uuidv4 } from 'uuid';

const physicsChapter1Id = uuidv4();
const physicsChapter2Id = uuidv4();
const chemChapter1Id = uuidv4();
const subjectPhysicsId = uuidv4();
const subjectChemistryId = uuidv4();

export const initialData: { subjects: Subject[], exams: Exam[] } = {
  subjects: [
    {
      id: subjectPhysicsId,
      name: "Physics",
      code: "PHY-101",
      papers: [
        {
          id: uuidv4(),
          name: "1st Paper",
          chapters: [
            {
              id: physicsChapter1Id,
              name: "Vector",
              isCompleted: false,
              activities: [
                { id: uuidv4(), title: "Read Theory", type: 'checkbox', completed: true },
                { id: uuidv4(), title: "Solve 10 problems", type: 'counter', count: 5, target: 10 },
                { id: uuidv4(), title: "Watch lecture video", type: 'link', url: "https://www.youtube.com" }
              ]
            },
            {
              id: physicsChapter2Id,
              name: "Dynamics",
              isCompleted: false,
              activities: [
                { id: uuidv4(), title: "Class notes review", type: 'checkbox', completed: false },
              ]
            }
          ]
        }
      ]
    },
    {
        id: subjectChemistryId,
        name: "Chemistry",
        code: "CHEM-101",
        papers: [
            {
                id: uuidv4(),
                name: "1st Paper",
                chapters: [
                    {
                        id: chemChapter1Id,
                        name: "Atomic Structure",
                        isCompleted: false,
                        activities: []
                    }
                ]
            }
        ]
    }
  ],
  exams: [
    {
      id: uuidv4(),
      name: "Daily Exam-03",
      subjectIds: [subjectPhysicsId],
      chapterIds: [physicsChapter1Id],
      date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), // 7 days from now
      isCompleted: false
    },
    {
        id: uuidv4(),
        name: "Mid-term Exam",
        subjectIds: [subjectPhysicsId, subjectChemistryId],
        chapterIds: [physicsChapter2Id, chemChapter1Id],
        date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(), // 30 days from now
        isCompleted: false
      },
    {
        id: uuidv4(),
        name: "Final Chemistry",
        subjectIds: [subjectChemistryId],
        chapterIds: [chemChapter1Id],
        date: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(), // 14 days ago
        isCompleted: true
      }
  ]
};
