
import { Subject, Exam, Note } from './types';
import { v4 as uuidv4 } from 'uuid';

const physicsChapter1Id = uuidv4();
const physicsChapter2Id = uuidv4();
const chemChapter1Id = uuidv4();
const subjectPhysicsId = uuidv4();
const subjectChemistryId = uuidv4();

const getFutureDate = (days: number, hours: number, minutes: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
}

const getPastDate = (days: number, hours: number, minutes: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
}

export const initialData: { subjects: Subject[], exams: Exam[], notes: Note[] } = {
  subjects: [
    {
      id: subjectPhysicsId,
      name: "Physics",
      code: "PHY-101",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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
      date: getFutureDate(7, 10, 30), // 7 days from now at 10:30 AM
      isCompleted: false
    },
    {
        id: uuidv4(),
        name: "Mid-term Exam",
        subjectIds: [subjectPhysicsId, subjectChemistryId],
        chapterIds: [physicsChapter2Id, chemChapter1Id],
        date: getFutureDate(30, 14, 0), // 30 days from now at 2:00 PM
        isCompleted: false
      },
    {
        id: uuidv4(),
        name: "Final Chemistry",
        subjectIds: [subjectChemistryId],
        chapterIds: [chemChapter1Id],
        date: getPastDate(14, 9, 0), // 14 days ago at 9:00 AM
        isCompleted: true
      }
  ],
  notes: [
    {
        id: uuidv4(),
        title: "Quantum Mechanics Resources",
        description: "A collection of useful links and videos for understanding the basics of quantum mechanics.",
        imageUrl: "https://picsum.photos/seed/1/600/400",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        links: [
            { id: uuidv4(), title: "Feynman Lectures on Physics", url: "https://www.feynmanlectures.caltech.edu/" },
            { id: uuidv4(), title: "Veritasium - The Quantum World", url: "https://www.youtube.com/watch?v=kYAdwS5MFjQ" }
        ]
    }
  ],
};
