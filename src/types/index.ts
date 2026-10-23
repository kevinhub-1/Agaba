export type UserRole = 'teacher' | 'student';

export interface Student {
  id: string;
  studentId: string; // e.g. "CT-2026-001"
  name: string;
  email: string;
  password: string; // Login password to the app
  formGrade: string; // e.g. "Senior 4 / Grade 11"
  stream: string; // e.g. "Stream Alpha (Computer Science)"
  avatar: string;
  phone?: string;
  bio?: string;
  targetGrade?: string;
  performanceAverage: number; // e.g. 88%
  completedAssignments: number;
  totalAssignments: number;
  status: 'active' | 'needs_attention';
  lastActive: string;
}

export interface Teacher {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  avatar: string;
  activeClassesCount: number;
  totalStudents: number;
}

export interface AssignmentQuestion {
  id: string;
  number: number;
  text: string;
  marks: number;
  questionType: 'theory' | 'code' | 'practical';
  starterCode?: string;
  hint?: string;
  solutionGuide?: string;
}

export interface Assignment {
  id: string;
  title: string;
  topic: string;
  subject: string;
  dueDate: string;
  totalMarks: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string;
  questions: AssignmentQuestion[];
  attachments: Array<{
    name: string;
    size: string;
    type: string;
  }>;
  status: 'active' | 'closed';
  createdAt: string;
  teacherName: string;
}

export interface StudentAnswer {
  questionId: string;
  answerText: string;
  codeSnippet?: string;
  scoreAwarded?: number;
  teacherRemarks?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  status: 'submitted' | 'graded';
  answers: StudentAnswer[];
  attachedFiles: Array<{
    name: string;
    size: string;
  }>;
  totalScore?: number;
  maxScore: number;
  teacherOverallFeedback?: string;
  gradedAt?: string;
}

export interface TutorialStep {
  title: string;
  content: string;
  codeSnippet?: string;
  highlightNote?: string;
}

export interface Tutorial {
  id: string;
  title: string;
  category: 'Programming' | 'Computer Hardware' | 'Networking' | 'Databases' | 'Web Tech' | 'Cybersecurity';
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  coverImage: string;
  videoUrl?: string;
  instructor: string;
  viewsCount: number;
  rating: number;
  keyTakeaways: string[];
  steps: TutorialStep[];
  interactiveQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface PaperAttachment {
  id: string;
  title: string;
  subject: string;
  year: number;
  term: string;
  formGrade: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  instructions?: string;
  downloadCount: number;
}

export interface PastPaper extends PaperAttachment {}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'important' | 'exam' | 'reminder';
  author: string;
  badgeText: string;
}
