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

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  clerkId?: string;
  avatar?: string;
  title?: string;
  company?: string;
  status: 'active' | 'disabled';
  createdAt: string;
}

export interface CandidateProfile {
  _id: string;
  userId: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  experienceYears: number;
  education: string;
  bio?: string;
}

export interface InterviewerProfile {
  _id: string;
  userId: string;
  department: string;
  designation: string;
  totalInterviewsTaken: number;
  bio?: string;
}

export interface CodingProblem {
  _id: string;
  title: string;
  description: string;
  difficulty: InterviewDifficulty;
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
}

export interface InterviewQuestion {
  _id: string;
  category: 'JavaScript' | 'React' | 'Node.js' | 'Database' | 'DSA' | 'System Design' | 'General';
  title: string;
  question: string;
  answerGuide: string;
  difficulty: InterviewDifficulty;
  tags: string[];
}

export interface Interview {
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
  duration: number;
  difficulty: InterviewDifficulty;
  status: InterviewStatus;
  description: string;
  questions: string[];
  codingProblems: string[];
  candidateJoined: boolean;
  interviewerJoined: boolean;
  populatedProblems?: CodingProblem[];
  notes?: string;
  sharedNotes?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
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

export interface InterviewFeedback {
  _id: string;
  interviewId: string;
  candidateId: string;
  interviewerId: string;
  scores: CategoryScores;
  totalScore: number;
  averageScore: number;
  finalStatus: EvaluationDecision;
  detailedFeedback: string;
  problemsSolvedCount?: number;
  problemsTotalCount?: number;
  testCasesPassedCount?: number;
  testCasesTotalCount?: number;
  submittedAt: string;
}

export interface Submission {
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
}

export interface ExecutionResult {
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Compilation Error' | 'Runtime Error';
  output: string;
  runtimeMs: number;
  memoryKb: number;
  testCasesPassed: number;
  totalTestCases: number;
  testResults: {
    testCaseIndex: number;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    isHidden: boolean;
    error?: string;
  }[];
  compilationError?: string;
  runtimeError?: string;
  submissionId?: string;
}

export interface ChatMessage {
  _id: string;
  interviewId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'interview_invite' | 'interview_reminder' | 'feedback_ready' | 'general';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalCandidates: number;
  totalInterviewers: number;
  totalInterviews: number;
  completedInterviews: number;
  scheduledInterviews: number;
  inProgressInterviews: number;
  totalQuestions: number;
  totalCodingProblems: number;
  evaluationsCount: number;
  globalAverageScore: number;
}
