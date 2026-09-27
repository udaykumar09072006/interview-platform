import { db } from '../config/db.js';
import type {
  UserDoc,
  CandidateProfileDoc,
  InterviewerProfileDoc,
  InterviewDoc,
  QuestionDoc,
  CodingProblemDoc,
  SubmissionDoc,
  InterviewFeedbackDoc,
  ChatMessageDoc,
  NotificationDoc,
} from './types.js';

export const UserModel = db.getCollection<UserDoc>('users');
export const CandidateProfileModel = db.getCollection<CandidateProfileDoc>('candidate_profiles');
export const InterviewerProfileModel = db.getCollection<InterviewerProfileDoc>('interviewer_profiles');
export const InterviewModel = db.getCollection<InterviewDoc>('interviews');
export const QuestionModel = db.getCollection<QuestionDoc>('questions');
export const CodingProblemModel = db.getCollection<CodingProblemDoc>('coding_problems');
export const SubmissionModel = db.getCollection<SubmissionDoc>('submissions');
export const InterviewFeedbackModel = db.getCollection<InterviewFeedbackDoc>('interview_feedbacks');
export const ChatMessageModel = db.getCollection<ChatMessageDoc>('chat_messages');
export const NotificationModel = db.getCollection<NotificationDoc>('notifications');

export * from './types.js';
