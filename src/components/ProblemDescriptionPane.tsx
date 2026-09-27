import React from 'react';
import { BookOpen, AlertCircle, CheckCircle, Tag, Clock, HardDrive } from 'lucide-react';
import type { CodingProblem } from '../types';

interface ProblemDescriptionPaneProps {
  problem: CodingProblem | null;
  allProblems?: CodingProblem[];
  selectedProblemId?: string;
  onSelectProblem?: (id: string) => void;
}

export const ProblemDescriptionPane: React.FC<ProblemDescriptionPaneProps> = ({
  problem,
  allProblems,
  selectedProblemId,
  onSelectProblem,
}) => {
  if (!problem) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-slate-500 text-xs">
        No coding problem selected.
      </div>
    );
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
      case 'Medium':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      case 'Hard':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-200 overflow-y-auto p-4 select-text">
      {/* Problem Switcher if multiple problems assigned to interview */}
      {allProblems && allProblems.length > 1 && onSelectProblem && (
        <div className="mb-4 flex items-center gap-1.5 pb-3 border-b border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Problems:</span>
          {allProblems.map((p, idx) => (
            <button
              key={p._id}
              onClick={() => onSelectProblem(p._id)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                selectedProblemId === p._id
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {idx + 1}. {p.title}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-white tracking-tight">{problem.title}</h2>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getDifficultyColor(
              problem.difficulty
            )}`}
          >
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>Time Limit: {problem.timeLimitMs}ms</span>
          </div>
          <div className="flex items-center gap-1">
            <HardDrive className="h-3.5 w-3.5 text-slate-500" />
            <span>Memory: {problem.memoryLimitMb}MB</span>
          </div>
        </div>
      </div>

      {/* Description Content */}
      <div className="my-4 text-xs leading-relaxed text-slate-300 space-y-4">
        <div className="whitespace-pre-wrap">{problem.description}</div>

        {/* Examples */}
        {problem.examples && problem.examples.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-white uppercase tracking-wider">Examples</div>
            {problem.examples.map((ex, i) => (
              <div
                key={i}
                className="rounded-lg bg-slate-900 border border-slate-800/80 p-3 space-y-1.5 font-mono text-[11px]"
              >
                <div className="text-slate-400 font-semibold">Example {i + 1}:</div>
                <div>
                  <span className="text-slate-400">Input: </span>
                  <span className="text-slate-200">{ex.input}</span>
                </div>
                <div>
                  <span className="text-slate-400">Output: </span>
                  <span className="text-emerald-400">{ex.output}</span>
                </div>
                {ex.explanation && (
                  <div className="text-slate-400 font-sans text-xs pt-1">
                    <span className="font-semibold text-slate-300">Explanation: </span>
                    {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Constraints */}
        {problem.constraints && problem.constraints.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-white uppercase tracking-wider">
              Constraints
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px]">
              {problem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
