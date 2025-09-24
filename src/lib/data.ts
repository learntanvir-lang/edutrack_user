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
              number: "1",
              isCompleted: false,
              progressItems: [
                { id: uuidv4(), name: 'Class Sessions', completed: 8, total: 10 },
                { id: uuidv4(), name: 'Practice Problems', completed: 25, total: 50 },
              ],
              resourceLinks: [
                { id: uuidv4(), url: 'https://www.youtube.com/watch?v=1G5E_C2e2fE', description: 'Vector Intro Video' }
              ]
            },
            {
              id: physicsChapter2Id,
              name: "Dynamics",
              number: "2",
              isCompleted: false,
              progressItems: [
                { id: uuidv4(), name: 'Class Sessions', completed: 5, total: 12 },
                { id: uuidv4(), name: 'Practice Problems', completed: 10, total: 60 },
              ],
              resourceLinks: []
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
                        number: "1",
                        isCompleted: true,
                        progressItems: [
                          { id: uuidv4(), name: 'Class Sessions', completed: 15, total: 15 },
                          { id: uuidv4(), name: 'Practice Problems', completed: 80, total: 80 },
                        ],
                        resourceLinks: []
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
