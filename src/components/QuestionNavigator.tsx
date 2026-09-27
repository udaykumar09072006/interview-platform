import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle2, Circle, Plus } from 'lucide-react';
import type { UserRole } from '../types';

interface QuestionNavigatorProps {
  questions: string[];
  userRole: UserRole;
  onAddQuestion?: (q: string) => void;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  userRole,
  onAddQuestion,
}) => {
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());
  const [newQuestionText, setNewQuestionText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const toggleComplete = (idx: number) => {
    setCompletedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestionText.trim() && onAddQuestion) {
      onAddQuestion(newQuestionText.trim());
      setNewQuestionText('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-950 p-4 overflow-y-auto">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div>
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
            Technical Discussion Questions
          </h3>
          <p className="text-[11px] text-slate-400">
            {completedIndices.size} of {questions.length} questions covered
          </p>
        </div>

        {userRole !== 'candidate' && onAddQuestion && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-400 bg-indigo-950/40 border border-indigo-800/60 rounded hover:bg-indigo-900/50 transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>Add</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-4 space-y-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <textarea
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder="Type a technical question..."
            rows={2}
            className="w-full rounded bg-slate-950 border border-slate-700 p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs font-medium bg-indigo-600 text-white rounded hover:bg-indigo-500"
            >
              Add Question
            </button>
          </div>
        </form>
      )}

      {questions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center text-slate-500 text-xs py-8">
          No custom questions attached to this interview session.
        </div>
      ) : (
        <div className="space-y-2.5">
          {questions.map((q, idx) => {
            const isDone = completedIndices.has(idx);
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-slate-950 border-slate-800/60 opacity-60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => toggleComplete(idx)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-400 transition-colors shrink-0"
                    title={isDone ? 'Mark as pending' : 'Mark as discussed'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-500" />
                    )}
                  </button>

                  <div className="flex-1">
                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
                      Question {idx + 1}
                    </span>
                    <p
                      className={`text-xs leading-relaxed ${
                        isDone ? 'line-through text-slate-400' : 'text-slate-200'
                      }`}
                    >
                      {q}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
