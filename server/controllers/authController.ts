import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel, CandidateProfileModel, InterviewerProfileModel } from '../models/index.js';
import { generateToken } from '../middleware/auth.js';
import type { UserRole } from '../models/types.js';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role = 'candidate', title, company } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const validRole: UserRole = ['candidate', 'interviewer', 'admin'].includes(role) ? role : 'candidate';

    const newUser = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: validRole,
      title: title || (validRole === 'candidate' ? 'Software Developer Candidate' : 'Technical Interviewer'),
      company: company || (validRole === 'candidate' ? 'Open to Work' : 'Intervexa Tech'),
      status: 'active',
    });

    if (validRole === 'candidate') {
      await CandidateProfileModel.create({
        userId: newUser._id,
        skills: ['JavaScript', 'TypeScript', 'React'],
        experienceYears: 2,
        education: 'B.S. in Computer Science',
      });
    } else if (validRole === 'interviewer') {
      await InterviewerProfileModel.create({
        userId: newUser._id,
        department: 'Engineering',
        designation: title || 'Senior Software Engineer',
        totalInterviewsTaken: 0,
      });
    }

    const token = generateToken(newUser);

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({
      message: 'Account registered successfully.',
      user: safeUser,
      token,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed due to a server error.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ error: 'This account has been deactivated by an administrator.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;

    return res.json({
      message: 'Login successful.',
      user: safeUser,
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed due to a server error.' });
  }
}

export async function logout(req: Request, res: Response) {
  return res.json({ message: 'Logged out successfully.' });
}

export async function syncClerkUser(req: Request, res: Response) {
  try {
    const { clerkId, email, name, avatar, role = 'candidate', title, company } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required for Clerk user sync.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = clerkId ? await UserModel.findOne({ clerkId }) : null;
    if (!user) {
      user = await UserModel.findOne({ email: normalizedEmail });
    }

    const validRole: UserRole = ['candidate', 'interviewer', 'admin'].includes(role) ? role : 'candidate';

    if (user) {
      // Update existing user with Clerk information
      user = await UserModel.findByIdAndUpdate(user._id, {
        clerkId: clerkId || user.clerkId,
        avatar: avatar || user.avatar,
        name: name ? name.trim() : user.name,
      });
    } else {
      // Create user from Clerk
      const randomPasswordHash = await bcrypt.hash(`clerk_${Date.now()}_${Math.random()}`, 10);
      user = await UserModel.create({
        name: name ? name.trim() : normalizedEmail.split('@')[0],
        email: normalizedEmail,
        clerkId,
        avatar,
        passwordHash: randomPasswordHash,
        role: validRole,
        title: title || (validRole === 'candidate' ? 'Software Developer Candidate' : 'Technical Interviewer'),
        company: company || (validRole === 'candidate' ? 'Open to Work' : 'Intervexa Tech'),
        status: 'active',
      });

      if (validRole === 'candidate') {
        await CandidateProfileModel.create({
          userId: user._id,
          skills: ['JavaScript', 'TypeScript', 'React'],
          experienceYears: 2,
          education: 'Software Engineer',
        });
      } else if (validRole === 'interviewer') {
        await InterviewerProfileModel.create({
          userId: user._id,
          department: 'Engineering',
          designation: title || 'Senior Software Engineer',
          totalInterviewsTaken: 0,
        });
      }
    }

    if (!user) {
      return res.status(500).json({ error: 'Failed to process Clerk user.' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ error: 'This account has been deactivated by an administrator.' });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;

    let profile: any = null;
    if (user.role === 'candidate') {
      profile = await CandidateProfileModel.findOne({ userId: user._id });
    } else if (user.role === 'interviewer') {
      profile = await InterviewerProfileModel.findOne({ userId: user._id });
    }

    return res.json({
      message: 'Clerk account synchronized successfully.',
      user: safeUser,
      profile,
      token,
    });
  } catch (err: any) {
    console.error('Clerk sync error:', err);
    return res.status(500).json({ error: 'Failed to synchronize Clerk user.' });
  }
}

export async function updateRole(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    const { role } = req.body;
    const validRole: UserRole = ['candidate', 'interviewer', 'admin'].includes(role) ? role : 'candidate';

    const updatedUser = await UserModel.findByIdAndUpdate(req.user.userId, { role: validRole });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (validRole === 'candidate') {
      const existing = await CandidateProfileModel.findOne({ userId: updatedUser._id });
      if (!existing) {
        await CandidateProfileModel.create({
          userId: updatedUser._id,
          skills: ['JavaScript', 'TypeScript', 'React'],
          experienceYears: 2,
          education: 'Software Engineer',
        });
      }
    } else if (validRole === 'interviewer') {
      const existing = await InterviewerProfileModel.findOne({ userId: updatedUser._id });
      if (!existing) {
        await InterviewerProfileModel.create({
          userId: updatedUser._id,
          department: 'Engineering',
          designation: 'Technical Interviewer',
          totalInterviewsTaken: 0,
        });
      }
    }

    const token = generateToken(updatedUser);
    const { passwordHash: _, ...safeUser } = updatedUser;

    return res.json({
      message: 'Role updated successfully.',
      user: safeUser,
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update user role.' });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const { passwordHash: _, ...safeUser } = user;

    let profile: any = null;
    if (user.role === 'candidate') {
      profile = await CandidateProfileModel.findOne({ userId: user._id });
    } else if (user.role === 'interviewer') {
      profile = await InterviewerProfileModel.findOne({ userId: user._id });
    }

    return res.json({
      user: safeUser,
      profile,
    });
  } catch (err: any) {
    console.error('getMe error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
}
