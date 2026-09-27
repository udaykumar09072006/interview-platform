import type { Request, Response } from 'express';
import {
  InterviewFeedbackModel,
  InterviewModel,
  SubmissionModel,
  NotificationModel,
  UserModel,
} from '../models/index.js';
import type { CategoryScores, EvaluationDecision } from '../models/types.js';

export async function createFeedback(req: Request, res: Response) {
  try {
    const { id } = req.params; // interviewId
    const {
      scores,
      finalStatus = 'Further Evaluation',
      detailedFeedback = '',
    } = req.body;

    const interview = await InterviewModel.findById(id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    const user = req.user!;
    if (user.role !== 'admin' && interview.interviewerId !== user.userId) {
      return res.status(403).json({ error: 'Only the designated interviewer or admin can evaluate this candidate.' });
    }

    // Default categories
    const categoryScores: CategoryScores = {
      dsa: Number(scores?.dsa || 5),
      problemSolving: Number(scores?.problemSolving || 5),
      programming: Number(scores?.programming || 5),
      technicalKnowledge: Number(scores?.technicalKnowledge || 5),
      communication: Number(scores?.communication || 5),
      systemDesign: Number(scores?.systemDesign || 5),
      codeQuality: Number(scores?.codeQuality || 5),
    };

    // Calculate total & average
    const keys = Object.keys(categoryScores);
    const sum = keys.reduce((acc, k) => acc + (categoryScores[k] || 0), 0);
    const totalScore = sum; // out of 70
    const averageScore = Math.round((sum / keys.length) * 10) / 10; // out of 10

    // Compute coding performance from submissions
    const submissions = await SubmissionModel.find({ interviewId: id });
    const problemSubmissionsMap = new Map<string, boolean>();
    let testCasesPassedCount = 0;
    let testCasesTotalCount = 0;

    for (const sub of submissions) {
      testCasesPassedCount += sub.testCasesPassed || 0;
      testCasesTotalCount += sub.totalTestCases || 0;
      if (sub.status === 'Accepted') {
        problemSubmissionsMap.set(sub.problemId, true);
      }
    }

    const problemsSolvedCount = problemSubmissionsMap.size;
    const problemsTotalCount = interview.codingProblems.length;

    // Check if feedback already exists for this interview, update or create
    const existing = await InterviewFeedbackModel.findOne({ interviewId: id });
    let feedback;

    if (existing) {
      feedback = await InterviewFeedbackModel.findByIdAndUpdate(existing._id, {
        scores: categoryScores,
        totalScore,
        averageScore,
        finalStatus: finalStatus as EvaluationDecision,
        detailedFeedback,
        problemsSolvedCount,
        problemsTotalCount,
        testCasesPassedCount,
        testCasesTotalCount,
        submittedAt: new Date().toISOString(),
      });
    } else {
      feedback = await InterviewFeedbackModel.create({
        interviewId: id,
        candidateId: interview.candidateId,
        interviewerId: user.userId,
        scores: categoryScores,
        totalScore,
        averageScore,
        finalStatus: finalStatus as EvaluationDecision,
        detailedFeedback,
        problemsSolvedCount,
        problemsTotalCount,
        testCasesPassedCount,
        testCasesTotalCount,
        submittedAt: new Date().toISOString(),
      });
    }

    // Mark interview completed
    await InterviewModel.findByIdAndUpdate(id, {
      status: 'completed',
      endedAt: interview.endedAt || new Date().toISOString(),
    });

    // Notify candidate
    await NotificationModel.create({
      userId: interview.candidateId,
      title: 'Interview Evaluation Submitted',
      message: `Your technical evaluation for "${interview.title}" has been submitted by the interviewer.`,
      type: 'feedback_ready',
      isRead: false,
      link: `/results/${interview._id}`,
    });

    return res.status(201).json(feedback);
  } catch (err: any) {
    console.error('createFeedback error:', err);
    return res.status(500).json({ error: 'Failed to record candidate evaluation.' });
  }
}

export async function getFeedbackByInterviewId(req: Request, res: Response) {
  try {
    const { id } = req.params; // interviewId
    const interview = await InterviewModel.findById(id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    const user = req.user!;
    if (
      user.role !== 'admin' &&
      interview.candidateId !== user.userId &&
      interview.interviewerId !== user.userId
    ) {
      return res.status(403).json({ error: 'Unauthorized to view this evaluation.' });
    }

    const feedback = await InterviewFeedbackModel.findOne({ interviewId: id });
    if (!feedback) {
      return res.status(404).json({ error: 'Evaluation report has not been submitted yet for this interview.' });
    }

    const candidate = await UserModel.findById(interview.candidateId);
    const interviewer = await UserModel.findById(interview.interviewerId);

    return res.json({
      feedback,
      interview,
      candidate: candidate ? { name: candidate.name, email: candidate.email, title: candidate.title } : null,
      interviewer: interviewer ? { name: interviewer.name, email: interviewer.email, title: interviewer.title, company: interviewer.company } : null,
    });
  } catch (err: any) {
    console.error('getFeedbackByInterviewId error:', err);
    return res.status(500).json({ error: 'Failed to retrieve feedback report.' });
  }
}
