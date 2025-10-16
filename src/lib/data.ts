
import { Subject, Exam, Resource } from './types';
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

export const initialData: { subjects: Subject[], exams: Exam[], resources: Resource[] } = {
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
                { id: uuidv4(), name: 'Class Sessions', type: 'counter', completed: 8, total: 10 },
                { id: uuidv4(), name: 'Practice Problems', type: 'counter', completed: 25, total: 50 },
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
                { id: uuidv4(), name: 'Class Sessions', type: 'counter', completed: 5, total: 12 },
                { id: uuidv4(), name: 'Practice Problems', type: 'counter', completed: 10, total: 60 },
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
                          { id: uuidv4(), name: 'Class Sessions', type: 'counter', completed: 15, total: 15 },
                          { id: uuidv4(), name: 'Practice Problems', type: 'counter', completed: 80, total: 80 },
                        ],
                        resourceLinks: []
                    }
                ]
            }
        ]
    }
  ],
  exams: [],
  resources: [
    {
        id: uuidv4(),
        title: "Quantum Mechanics Resources",
        description: "A collection of useful links and videos for understanding the basics of quantum mechanics.",
        imageUrl: "https://picsum.photos/seed/1/600/400",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        links: [
            { id: uuidv4(), description: "Feynman Lectures on Physics", url: "https://www.feynmanlectures.caltech.edu/" },
            { id: uuidv4(), description: "Veritasium - The Quantum World", url: "https://www.youtube.com/watch?v=kYAdwS5MFjQ" }
        ]
    }
  ],
};
