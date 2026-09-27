import type { Request, Response } from 'express';
import { CodingProblemModel } from '../models/index.js';

export async function getProblems(req: Request, res: Response) {
  try {
    const { difficulty, search } = req.query;
    let filter: Record<string, any> = {};

    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }

    let problems = await CodingProblemModel.find(filter);

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      problems = problems.filter(
        p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    return res.json(problems);
  } catch (err: any) {
    console.error('getProblems error:', err);
    return res.status(500).json({ error: 'Failed to retrieve coding problems.' });
  }
}

export async function getProblemById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const problem = await CodingProblemModel.findById(id);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    return res.json(problem);
  } catch (err: any) {
    console.error('getProblemById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve problem details.' });
  }
}

export async function createProblem(req: Request, res: Response) {
  try {
    const {
      title,
      description,
      difficulty = 'Medium',
      constraints = [],
      examples = [],
      testCases = [],
      supportedLanguages = ['javascript', 'typescript', 'python', 'java', 'cpp'],
      starterCode = {},
      timeLimitMs = 1000,
      memoryLimitMb = 128,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const newProblem = await CodingProblemModel.create({
      title: title.trim(),
      description: description.trim(),
      difficulty,
      constraints,
      examples,
      testCases,
      supportedLanguages,
      starterCode,
      timeLimitMs,
      memoryLimitMb,
    });

    return res.status(201).json(newProblem);
  } catch (err: any) {
    console.error('createProblem error:', err);
    return res.status(500).json({ error: 'Failed to create coding problem.' });
  }
}
