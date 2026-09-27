import type { Request, Response } from 'express';
import { QuestionModel } from '../models/index.js';

export async function getQuestions(req: Request, res: Response) {
  try {
    const { category, difficulty, search } = req.query;
    let filter: Record<string, any> = {};

    if (category && category !== 'All') {
      filter.category = category;
    }
    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }

    let questions = await QuestionModel.find(filter);

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      questions = questions.filter(
        item =>
          item.title.toLowerCase().includes(q) ||
          item.question.toLowerCase().includes(q) ||
          item.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return res.json(questions);
  } catch (err: any) {
    console.error('getQuestions error:', err);
    return res.status(500).json({ error: 'Failed to retrieve questions from question bank.' });
  }
}

export async function createQuestion(req: Request, res: Response) {
  try {
    const { category, title, question, answerGuide, difficulty = 'Medium', tags = [] } = req.body;

    if (!category || !title || !question || !answerGuide) {
      return res.status(400).json({ error: 'Category, title, question, and answer guide are required.' });
    }

    const newQuestion = await QuestionModel.create({
      category,
      title: title.trim(),
      question: question.trim(),
      answerGuide: answerGuide.trim(),
      difficulty,
      tags: Array.isArray(tags) ? tags : [tags],
    });

    return res.status(201).json(newQuestion);
  } catch (err: any) {
    console.error('createQuestion error:', err);
    return res.status(500).json({ error: 'Failed to create question.' });
  }
}

export async function updateQuestion(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await QuestionModel.findByIdAndUpdate(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Question not found.' });
    }
    return res.json(updated);
  } catch (err: any) {
    console.error('updateQuestion error:', err);
    return res.status(500).json({ error: 'Failed to update question.' });
  }
}

export async function deleteQuestion(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await QuestionModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Question not found.' });
    }
    return res.json({ message: 'Question deleted successfully.' });
  } catch (err: any) {
    console.error('deleteQuestion error:', err);
    return res.status(500).json({ error: 'Failed to delete question.' });
  }
}
