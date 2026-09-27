import React, { useState } from 'react';
import { Award, Check, X, Star, AlertCircle } from 'lucide-react';
import type { CategoryScores, EvaluationDecision } from '../types';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    scores: CategoryScores;
    finalStatus: EvaluationDecision;
    detailedFeedback: string;
  }) => Promise<void>;
  candidateName: string;
  interviewTitle: string;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  candidateName,
  interviewTitle,
}) => {
  const [scores, setScores] = useState<CategoryScores>({
    dsa: 8,
    problemSolving: 8,
    programming: 8,
    technicalKnowledge: 8,
    communication: 8,
    systemDesign: 7,
    codeQuality: 8,
  });

  const [finalStatus, setFinalStatus] = useState<EvaluationDecision>('Selected');
  const [detailedFeedback, setDetailedFeedback] = useState(
    'Strong analytical capabilities and clean modular coding structure. Communicated time/space complexities accurately with minimal prompting.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const categories = [
    { key: 'dsa', label: 'Data Structures & Algorithms' },
    { key: 'problemSolving', label: 'Problem Solving & Logic' },
    { key: 'programming', label: 'Programming Proficiency' },
    { key: 'technicalKnowledge', label: 'Technical Core Knowledge' },
    { key: 'communication', label: 'Communication & Collaboration' },
    { key: 'systemDesign', label: 'System Design & Scalability' },
    { key: 'codeQuality', label: 'Code Quality & Maintainability' },
  ];

  const totalScore = Object.values(scores).reduce((sum, v) => sum + v, 0);
  const averageScore = Math.round((totalScore / categories.length) * 10) / 10;

  const handleScoreChange = (key: string, val: number) => {
    setScores((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ scores, finalStatus, detailedFeedback });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Candidate Performance Evaluation</h2>
              <p className="text-xs text-slate-400">
                {candidateName} · {interviewTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Score Counter Banner */}
        <div className="my-4 grid grid-cols-2 gap-4 rounded-xl bg-slate-950 border border-slate-800/80 p-3 text-center">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Total Score</div>
            <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
              {totalScore} <span className="text-xs text-slate-500 font-normal">/ 70</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Average Rating</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {averageScore} <span className="text-xs text-slate-500 font-normal">/ 10</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Sliders */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {categories.map((cat) => (
              <div
                key={cat.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60"
              >
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-200">{cat.label}</div>
                  <div className="text-[11px] text-slate-400">Standard criteria (1 - 10)</div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={scores[cat.key]}
                    onChange={(e) => handleScoreChange(cat.key, parseInt(e.target.value, 10))}
                    className="w-32 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="w-8 text-right font-mono text-sm font-bold text-indigo-300 tabular-nums">
                    {scores[cat.key]}/10
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Final Hiring Decision */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Hiring Recommendation
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Selected', 'Further Evaluation', 'Rejected'] as EvaluationDecision[]).map((dec) => (
                <button
                  type="button"
                  key={dec}
                  onClick={() => setFinalStatus(dec)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    finalStatus === dec
                      ? dec === 'Selected'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/30'
                        : dec === 'Rejected'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-sm shadow-rose-500/30'
                        : 'bg-amber-600 text-white border-amber-500 shadow-sm shadow-amber-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {dec}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Feedback Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Detailed Written Feedback
            </label>
            <textarea
              value={detailedFeedback}
              onChange={(e) => setDetailedFeedback(e.target.value)}
              rows={3}
              required
              placeholder="Explain strengths, weaknesses, code efficiency, communication..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? 'Recording...' : 'Submit Evaluation Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
