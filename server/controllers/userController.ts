import type { Request, Response } from 'express';
import {
  UserModel,
  CandidateProfileModel,
  InterviewerProfileModel,
  InterviewModel,
  QuestionModel,
  CodingProblemModel,
  InterviewFeedbackModel,
} from '../models/index.js';

export async function getUsers(req: Request, res: Response) {
  try {
    const { role, status, search } = req.query;
    let filter: Record<string, any> = {};

    if (role && role !== 'All') {
      filter.role = role;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }

    let users = await UserModel.find(filter);

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      users = users.filter(
        u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }

    // Strip password hashes
    const sanitized = users.map(({ passwordHash, ...rest }) => rest);
    return res.json(sanitized);
  } catch (err: any) {
    console.error('getUsers error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user accounts.' });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { passwordHash: _, ...safeUser } = user;
    let profile = null;
    if (user.role === 'candidate') {
      profile = await CandidateProfileModel.findOne({ userId: user._id });
    } else if (user.role === 'interviewer') {
      profile = await InterviewerProfileModel.findOne({ userId: user._id });
    }

    return res.json({ user: safeUser, profile });
  } catch (err: any) {
    console.error('getUserById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    if (currentUser.role !== 'admin' && currentUser.userId !== id) {
      return res.status(403).json({ error: 'Unauthorized to modify this profile.' });
    }

    const { status, title, company, name, skills, experienceYears, education, bio, department } = req.body;
    const userUpdates: Record<string, any> = {};

    if (name) userUpdates.name = name;
    if (title) userUpdates.title = title;
    if (company) userUpdates.company = company;
    if (status && currentUser.role === 'admin') {
      userUpdates.status = status;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, userUpdates);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (updatedUser.role === 'candidate') {
      const existingProfile = await CandidateProfileModel.findOne({ userId: id });
      if (existingProfile) {
        await CandidateProfileModel.findByIdAndUpdate(existingProfile._id, {
          skills: skills || existingProfile.skills,
          experienceYears: experienceYears !== undefined ? Number(experienceYears) : existingProfile.experienceYears,
          education: education || existingProfile.education,
          bio: bio || existingProfile.bio,
        });
      }
    } else if (updatedUser.role === 'interviewer') {
      const existingProfile = await InterviewerProfileModel.findOne({ userId: id });
      if (existingProfile) {
        await InterviewerProfileModel.findByIdAndUpdate(existingProfile._id, {
          department: department || existingProfile.department,
          designation: title || existingProfile.designation,
          bio: bio || existingProfile.bio,
        });
      }
    }

    const { passwordHash: _, ...safeUser } = updatedUser;
    return res.json({ message: 'Profile updated successfully.', user: safeUser });
  } catch (err: any) {
    console.error('updateUser error:', err);
    return res.status(500).json({ error: 'Failed to update user profile.' });
  }
}

export async function getPlatformStats(req: Request, res: Response) {
  try {
    const totalUsers = await UserModel.count();
    const totalCandidates = await UserModel.count({ role: 'candidate' });
    const totalInterviewers = await UserModel.count({ role: 'interviewer' });
    const totalInterviews = await InterviewModel.count();
    const completedInterviews = await InterviewModel.count({ status: 'completed' });
    const scheduledInterviews = await InterviewModel.count({ status: 'scheduled' });
    const inProgressInterviews = await InterviewModel.count({ status: 'in_progress' });
    const totalQuestions = await QuestionModel.count();
    const totalCodingProblems = await CodingProblemModel.count();

    const feedbacks = await InterviewFeedbackModel.find();
    let totalScoreSum = 0;
    for (const f of feedbacks) {
      totalScoreSum += f.averageScore || 0;
    }
    const globalAverageScore = feedbacks.length > 0
      ? Math.round((totalScoreSum / feedbacks.length) * 10) / 10
      : 0;

    return res.json({
      totalUsers,
      totalCandidates,
      totalInterviewers,
      totalInterviews,
      completedInterviews,
      scheduledInterviews,
      inProgressInterviews,
      totalQuestions,
      totalCodingProblems,
      evaluationsCount: feedbacks.length,
      globalAverageScore,
    });
  } catch (err: any) {
    console.error('getPlatformStats error:', err);
    return res.status(500).json({ error: 'Failed to compute platform statistics.' });
  }
}
