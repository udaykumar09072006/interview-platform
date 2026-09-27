export type UserRole = 'candidate' | 'interviewer' | 'admin';
export type InterviewType = 
  | 'Technical Interview' 
  | 'Coding Interview' 
  | 'HR Interview' 
  | 'System Design Interview' 
  | 'Full Stack Interview';
export type InterviewDifficulty = 'Easy' | 'Medium' | 'Hard';
export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type EvaluationDecision = 'Selected' | 'Rejected' | 'Further Evaluation';

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  clerkId?: string;
  avatar?: string;
  title?: string;
  company?: string;
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface CandidateProfileDoc {
  _id: string;
  userId: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  experienceYears: number;
  education: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewerProfileDoc {
  _id: string;
  userId: string;
  department: string;
  designation: string;
  totalInterviewsTaken: number;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewDoc {
  _id: string;
  title: string;
  type: InterviewType;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  interviewerId: string;
  interviewerName?: string;
  interviewerEmail?: string;
  date: string;
  startTime: string;
  duration: number; // in minutes
  difficulty: InterviewDifficulty;
  status: InterviewStatus;
  description: string;
  questions: string[]; // Question IDs or custom question texts
  codingProblems: string[]; // Problem IDs
  candidateJoined: boolean;
  interviewerJoined: boolean;
  codeState?: {
    [problemId: string]: {
      language: string;
      code: string;
    };
  };
  notes?: string;
  sharedNotes?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionDoc {
  _id: string;
  category: 'JavaScript' | 'React' | 'Node.js' | 'Database' | 'DSA' | 'System Design' | 'General';
  title: string;
  question: string;
  answerGuide: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CodingProblemDoc {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }[];
  supportedLanguages: string[];
  starterCode: Record<string, string>;
  timeLimitMs: number;
  memoryLimitMb: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionDoc {
  _id: string;
  interviewId?: string;
  problemId: string;
  candidateId: string;
  candidateName?: string;
  language: string;
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Compilation Error' | 'Runtime Error';
  runtimeMs: number;
  memoryKb: number;
  testCasesPassed: number;
  totalTestCases: number;
  output?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryScores {
  dsa: number;
  problemSolving: number;
  programming: number;
  technicalKnowledge: number;
  communication: number;
  systemDesign: number;
  codeQuality: number;
  [key: string]: number;
}

export interface InterviewFeedbackDoc {
  _id: string;
  interviewId: string;
  candidateId: string;
  interviewerId: string;
  scores: CategoryScores;
  totalScore: number; // out of 70 or 100
  averageScore: number; // out of 10
  finalStatus: EvaluationDecision;
  detailedFeedback: string;
  problemsSolvedCount?: number;
  problemsTotalCount?: number;
  testCasesPassedCount?: number;
  testCasesTotalCount?: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageDoc {
  _id: string;
  interviewId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDoc {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'interview_invite' | 'interview_reminder' | 'feedback_ready' | 'general';
  isRead: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}
