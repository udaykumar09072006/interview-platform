import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Share2,
  Download,
  Code,
  User as UserIcon,
  Briefcase,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import type { InterviewFeedback, Interview } from '../../types';

interface InterviewResultPageProps {
  interviewId: string;
  onBack: () => void;
}

export const InterviewResultPage: React.FC<InterviewResultPageProps> = ({
  interviewId,
  onBack,
}) => {
  const [data, setData] = useState<{
    feedback: InterviewFeedback;
    interview: Interview;
    candidate: any;
    interviewer: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeedback() {
      try {
        setLoading(true);
        const res = await api.interviews.getFeedback(interviewId);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Evaluation report is not ready yet.');
      } finally {
        setLoading(false);
      }
    }
    loadFeedback();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-500 font-mono text-xs">
        Loading candidate performance evaluation report...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6 text-amber-400" />
        </div>
        <h2 className="text-lg font-bold text-white">Evaluation Not Ready</h2>
        <p className="text-xs text-slate-400">
          {error || 'The interviewer has not submitted the final evaluation report for this session yet.'}
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-white hover:bg-slate-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { feedback, interview, candidate, interviewer } = data;
  const percentage = Math.round((feedback.totalScore / 70) * 100);

  const categoryLabels: Record<string, string> = {
    dsa: 'Data Structures & Algorithms',
    problemSolving: 'Problem Solving & Logic',
    programming: 'Programming Proficiency',
    technicalKnowledge: 'Technical Core Knowledge',
    communication: 'Communication & Collaboration',
    systemDesign: 'System Design & Architecture',
    codeQuality: 'Code Quality & Maintainability',
  };

  const getDecisionBadge = (status: string) => {
    switch (status) {
      case 'Selected':
        return 'bg-emerald-950/70 border-emerald-600 text-emerald-400';
      case 'Rejected':
        return 'bg-rose-950/70 border-rose-600 text-rose-400';
      default:
        return 'bg-amber-950/70 border-amber-600 text-amber-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top bar with back button */}
        <div className="flex items-center justify-between pb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>

        {/* Hero Scorecard */}
        <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${getDecisionBadge(
                    feedback.finalStatus
                  )}`}
                >
                  Decision: {feedback.finalStatus}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(feedback.submittedAt).toLocaleDateString()}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {candidate?.name || 'Candidate Evaluation'}
              </h1>
              <p className="text-xs text-slate-400">
                Assessment: <span className="text-slate-200 font-semibold">{interview.title}</span> ({interview.type})
              </p>
            </div>

            {/* Score Ring / Pill */}
            <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl shrink-0">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-indigo-400 tabular-nums">
                  {percentage}%
                </div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Performance Index
                </div>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div className="text-center">
                <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                  {feedback.averageScore}
                  <span className="text-xs text-slate-500 font-normal">/10</span>
                </div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Avg Rating
                </div>
              </div>
            </div>
          </div>

          {/* Interviewer Metadata */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-400" />
              <span>
                Evaluated by <strong className="text-slate-200">{interviewer?.name || 'Staff Interviewer'}</strong> (
                {interviewer?.title || 'Lead Architect'})
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Raw Total: {feedback.totalScore} / 70 Points
            </div>
          </div>
        </div>

        {/* 7 Categories Grid */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="h-4 w-4 text-indigo-400" />
            <span>Core Evaluation Dimensions</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Object.entries(feedback.scores).map(([key, score]) => {
              const label = categoryLabels[key] || key;
              const ratio = (score / 10) * 100;
              return (
                <div
                  key={key}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{label}</span>
                    <span className="font-mono font-bold text-indigo-300 tabular-nums">
                      {score} <span className="text-[10px] text-slate-500 font-normal">/ 10</span>
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 8
                          ? 'bg-emerald-500'
                          : score >= 6
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coding Performance Summary & Written Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Coding Performance */}
          <div className="md:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Code className="h-4 w-4 text-emerald-400" />
              <span>Coding Execution</span>
            </h2>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-sans">Problems Assigned:</span>
                <span className="text-white font-bold tabular-nums">
                  {feedback.problemsTotalCount || interview.codingProblems?.length || 2}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-sans">Problems Solved:</span>
                <span className="text-emerald-400 font-bold tabular-nums">
                  {feedback.problemsSolvedCount ?? 2}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-sans">Automated Test Cases:</span>
                <span className="text-indigo-300 font-bold tabular-nums">
                  {feedback.testCasesPassedCount ?? 7} / {feedback.testCasesTotalCount ?? 7} Passed
                </span>
              </div>
            </div>
          </div>

          {/* Written Feedback Block */}
          <div className="md:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-3 flex flex-col">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-purple-400" />
              <span>Interviewer Written Remarks</span>
            </h2>

            <div className="flex-1 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs leading-relaxed text-slate-300 italic whitespace-pre-wrap">
              &quot;{feedback.detailedFeedback}&quot;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
