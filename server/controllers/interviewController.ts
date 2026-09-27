import type { Request, Response } from 'express';
import {
  InterviewModel,
  UserModel,
  CodingProblemModel,
  QuestionModel,
  NotificationModel,
} from '../models/index.js';

export async function createInterview(req: Request, res: Response) {
  try {
    const {
      title,
      type,
      candidateId,
      date,
      startTime,
      duration = 60,
      difficulty = 'Medium',
      description,
      questions = [],
      codingProblems = [],
    } = req.body;

    if (!title || !type || !candidateId || !date || !startTime) {
      return res.status(400).json({
        error: 'Title, type, candidateId, date, and startTime are required.',
      });
    }

    const candidate = await UserModel.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }

    const interviewer = await UserModel.findById(req.user!.userId);
    if (!interviewer) {
      return res.status(404).json({ error: 'Interviewer profile not found.' });
    }

    const newInterview = await InterviewModel.create({
      title: title.trim(),
      type,
      candidateId: candidate._id,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      interviewerId: interviewer._id,
      interviewerName: interviewer.name,
      interviewerEmail: interviewer.email,
      date,
      startTime,
      duration: Number(duration),
      difficulty,
      status: 'scheduled',
      description: description || '',
      questions,
      codingProblems,
      candidateJoined: false,
      interviewerJoined: false,
    });

    // Notify candidate
    await NotificationModel.create({
      userId: candidate._id,
      title: 'New Interview Invitation',
      message: `You have been scheduled for "${newInterview.title}" on ${date} at ${startTime}.`,
      type: 'interview_invite',
      isRead: false,
      link: `/interview/${newInterview._id}`,
    });

    return res.status(201).json(newInterview);
  } catch (err: any) {
    console.error('createInterview error:', err);
    return res.status(500).json({ error: 'Failed to create interview schedule.' });
  }
}

export async function getInterviews(req: Request, res: Response) {
  try {
    const user = req.user!;
    let filter: Record<string, any> = {};

    if (user.role === 'candidate') {
      filter.candidateId = user.userId;
    } else if (user.role === 'interviewer') {
      filter.interviewerId = user.userId;
    }
    // Admin sees all

    const { status, type, candidateId, interviewerId } = req.query;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (candidateId) filter.candidateId = candidateId;
    if (interviewerId) filter.interviewerId = interviewerId;

    const interviews = await InterviewModel.find(filter);

    // Sort by date/createdAt descending
    interviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json(interviews);
  } catch (err: any) {
    console.error('getInterviews error:', err);
    return res.status(500).json({ error: 'Failed to retrieve interviews.' });
  }
}

export async function getInterviewById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const interview = await InterviewModel.findById(id);

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    // Role check: candidate, interviewer of this interview, or admin
    const user = req.user!;
    if (
      user.role !== 'admin' &&
      interview.candidateId !== user.userId &&
      interview.interviewerId !== user.userId
    ) {
      return res.status(403).json({ error: 'Unauthorized to view this interview.' });
    }

    // Populate problem details
    const populatedProblems = [];
    for (const probId of interview.codingProblems) {
      const prob = await CodingProblemModel.findById(probId);
      if (prob) populatedProblems.push(prob);
    }

    return res.json({
      ...interview,
      populatedProblems,
    });
  } catch (err: any) {
    console.error('getInterviewById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve interview details.' });
  }
}

export async function updateInterview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const interview = await InterviewModel.findById(id);

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    const user = req.user!;
    if (
      user.role !== 'admin' &&
      interview.interviewerId !== user.userId &&
      interview.candidateId !== user.userId
    ) {
      return res.status(403).json({ error: 'Unauthorized to update this interview.' });
    }

    const updated = await InterviewModel.findByIdAndUpdate(id, req.body);
    return res.json(updated);
  } catch (err: any) {
    console.error('updateInterview error:', err);
    return res.status(500).json({ error: 'Failed to update interview.' });
  }
}

export async function deleteInterview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const interview = await InterviewModel.findById(id);

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    const user = req.user!;
    if (user.role !== 'admin' && interview.interviewerId !== user.userId) {
      return res.status(403).json({ error: 'Only the creator or admin can delete this interview.' });
    }

    await InterviewModel.findByIdAndDelete(id);
    return res.json({ message: 'Interview deleted successfully.' });
  } catch (err: any) {
    console.error('deleteInterview error:', err);
    return res.status(500).json({ error: 'Failed to delete interview.' });
  }
}

export async function joinInterview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const interview = await InterviewModel.findById(id);

    if (!interview) {
      return res.status(404).json({ error: 'Interview session not found.' });
    }

    const user = req.user!;
    const isCandidate = interview.candidateId === user.userId;
    const isInterviewer = interview.interviewerId === user.userId || user.role === 'admin';

    if (!isCandidate && !isInterviewer) {
      return res.status(403).json({ error: 'You are not a registered participant for this session.' });
    }

    const updates: Partial<typeof interview> = {};
    if (isCandidate) updates.candidateJoined = true;
    if (isInterviewer) updates.interviewerJoined = true;

    if (interview.status === 'scheduled') {
      updates.status = 'in_progress';
      updates.startedAt = new Date().toISOString();
    }

    const updated = await InterviewModel.findByIdAndUpdate(id, updates);
    return res.json({
      message: 'Joined interview room successfully.',
      interview: updated,
      userRoleInInterview: isInterviewer ? 'interviewer' : 'candidate',
    });
  } catch (err: any) {
    console.error('joinInterview error:', err);
    return res.status(500).json({ error: 'Failed to join interview session.' });
  }
}

export async function endInterview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const interview = await InterviewModel.findById(id);

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    const user = req.user!;
    if (user.role !== 'admin' && interview.interviewerId !== user.userId) {
      return res.status(403).json({ error: 'Only the interviewer or admin can conclude this session.' });
    }

    const updated = await InterviewModel.findByIdAndUpdate(id, {
      status: 'completed',
      endedAt: new Date().toISOString(),
    });

    return res.json({
      message: 'Interview concluded successfully.',
      interview: updated,
    });
  } catch (err: any) {
    console.error('endInterview error:', err);
    return res.status(500).json({ error: 'Failed to end interview session.' });
  }
}
