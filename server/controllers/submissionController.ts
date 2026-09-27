import type { Request, Response } from 'express';
import { CodingProblemModel, SubmissionModel, UserModel } from '../models/index.js';
import { executeCodeInSandbox } from '../services/codeExecutionService.js';

export async function createSubmission(req: Request, res: Response) {
  try {
    const {
      interviewId,
      problemId,
      language = 'javascript',
      code,
      customInput,
      isSubmit = false,
    } = req.body;

    if (!problemId || !code) {
      return res.status(400).json({ error: 'Problem ID and source code are required.' });
    }

    const problem = await CodingProblemModel.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Coding problem not found.' });
    }

    const user = req.user!;
    const testCasesToRun = isSubmit
      ? problem.testCases
      : (customInput !== undefined
          ? [{ input: customInput, expectedOutput: '', isHidden: false }]
          : problem.testCases.slice(0, 2)); // visible sample cases for "Run"

    const execResult = await executeCodeInSandbox(
      language,
      code,
      testCasesToRun,
      customInput
    );

    let savedSubmission = null;
    if (isSubmit) {
      savedSubmission = await SubmissionModel.create({
        interviewId,
        problemId,
        candidateId: user.userId,
        candidateName: user.name,
        language,
        code,
        status: execResult.status,
        runtimeMs: execResult.runtimeMs,
        memoryKb: execResult.memoryKb,
        testCasesPassed: execResult.testCasesPassed,
        totalTestCases: execResult.totalTestCases,
        output: execResult.output,
        error: execResult.compilationError || execResult.runtimeError,
      });
    }

    return res.json({
      ...execResult,
      submissionId: savedSubmission?._id,
    });
  } catch (err: any) {
    console.error('createSubmission error:', err);
    return res.status(500).json({ error: 'Code execution failed due to an internal error.' });
  }
}

export async function getSubmissionById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const submission = await SubmissionModel.findById(id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }
    return res.json(submission);
  } catch (err: any) {
    console.error('getSubmissionById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve submission.' });
  }
}

export async function getSubmissions(req: Request, res: Response) {
  try {
    const { interviewId, candidateId, problemId } = req.query;
    let filter: Record<string, any> = {};

    if (interviewId) filter.interviewId = interviewId;
    if (candidateId) filter.candidateId = candidateId;
    if (problemId) filter.problemId = problemId;

    const submissions = await SubmissionModel.find(filter);
    submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json(submissions);
  } catch (err: any) {
    console.error('getSubmissions error:', err);
    return res.status(500).json({ error: 'Failed to retrieve submissions.' });
  }
}
