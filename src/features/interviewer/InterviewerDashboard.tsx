import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Play,
  Award,
  Users,
  Code,
  BookOpen,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { EvaluationModal } from '../../components/EvaluationModal';
import type {
  Interview,
  InterviewType,
  InterviewDifficulty,
  User,
  CodingProblem,
  InterviewQuestion,
} from '../../types';

interface InterviewerDashboardProps {
  onJoinInterview: (interviewId: string) => void;
  onViewResults: (interviewId: string) => void;
}

const INTERVIEW_TYPES: InterviewType[] = [
  'Technical Interview',
  'Coding Interview',
  'HR Interview',
  'System Design Interview',
  'Full Stack Interview',
];

export const InterviewerDashboard: React.FC<InterviewerDashboardProps> = ({
  onJoinInterview,
  onViewResults,
}) => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<User[]>([]);
  const [allProblems, setAllProblems] = useState<CodingProblem[]>([]);
  const [allQuestions, setAllQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('Frontend & Full Stack Technical Assessment');
  const [type, setType] = useState<InterviewType>('Technical Interview');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('14:00');
  const [duration, setDuration] = useState(60);
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('Medium');
  const [description, setDescription] = useState('Evaluation of modern frontend state management, asynchronous control flow, and algorithmic optimization.');
  const [selectedProblems, setSelectedProblems] = useState<string[]>(['prob_two_sum']);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([
    'Explain React Virtual DOM and reconciliation mechanics.',
    'Difference between useMemo and useCallback with referential stability.'
  ]);
  const [customQuestionInput, setCustomQuestionInput] = useState('');

  // Evaluation Modal State
  const [evaluatingInterview, setEvaluatingInterview] = useState<Interview | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ints, usersList, probs, quests] = await Promise.all([
        api.interviews.list(),
        api.users.list({ role: 'candidate' }),
        api.problems.list(),
        api.questions.list(),
      ]);
      setInterviews(ints);
      setCandidates(usersList);
      setAllProblems(probs);
      setAllQuestions(quests);
      if (usersList.length > 0 && !selectedCandidateId) {
        setSelectedCandidateId(usersList[0]._id);
      }
    } catch (err) {
      console.error('Failed to load interviewer dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateId) return;

    try {
      await api.interviews.create({
        title,
        type,
        candidateId: selectedCandidateId,
        date,
        startTime,
        duration,
        difficulty,
        description,
        codingProblems: selectedProblems,
        questions: selectedQuestions,
      });

      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      console.error('Failed to create interview', err);
    }
  };

  const handleDeleteInterview = async (id: string) => {
    if (!confirm('Are you sure you want to cancel and delete this interview?')) return;
    try {
      await api.interviews.delete(id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete interview', err);
    }
  };

  const handleEvaluationSubmit = async (feedbackData: any) => {
    if (!evaluatingInterview) return;
    await api.interviews.submitFeedback(evaluatingInterview._id, feedbackData);
    setEvaluatingInterview(null);
    await loadData();
  };

  const toggleProblemSelection = (probId: string) => {
    setSelectedProblems((prev) =>
      prev.includes(probId) ? prev.filter((p) => p !== probId) : [...prev, probId]
    );
  };

  const addCustomQuestion = () => {
    if (customQuestionInput.trim()) {
      setSelectedQuestions((prev) => [...prev, customQuestionInput.trim()]);
      setCustomQuestionInput('');
    }
  };

  const removeQuestion = (idx: number) => {
    setSelectedQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-slate-500 font-mono text-xs">
        Loading interviewer console...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-indigo-500/40 shrink-0">
              <img
                src="/src/assets/images/avatar_architect_sarah_1790499906226.jpg"
                alt={user?.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{user?.name}</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/60 border border-amber-800 text-amber-400">
                  Interviewer Console
                </span>
              </div>
              <p className="text-xs text-slate-400">{user?.title || 'Staff Software Architect'} · Core Engineering</p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-mono">
                <span>Active Sessions: {interviews.filter((i) => i.status !== 'completed').length}</span>
                <span>·</span>
                <span>Completed: {interviews.filter((i) => i.status === 'completed').length}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-lg shadow-indigo-600/30 transition-all self-start md:self-auto hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Interview</span>
          </button>
        </div>

        {/* Interviews Table / Cards */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Scheduled & Active Technical Interviews</h2>
            <span className="text-xs text-slate-400">{interviews.length} Total Sessions</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {interviews.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No interviews scheduled yet. Click &quot;Create New Interview&quot; above to invite a candidate.
              </div>
            ) : (
              interviews.map((int) => (
                <div
                  key={int._id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">{int.title}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950/60 border border-indigo-800/60 text-indigo-300">
                        {int.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          int.status === 'completed'
                            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                            : int.status === 'in_progress'
                            ? 'bg-amber-950/60 border-amber-800 text-amber-400 animate-pulse'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {int.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <div>
                        Candidate:{' '}
                        <span className="font-semibold text-slate-200">
                          {int.candidateName}
                        </span>{' '}
                        ({int.candidateEmail})
                      </div>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{int.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{int.startTime} ({int.duration} mins)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 font-mono">
                      <span>Problems: {int.codingProblems?.length || 0}</span>
                      <span>·</span>
                      <span>Questions: {int.questions?.length || 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onJoinInterview(int._id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-md shadow-indigo-600/30 transition-all"
                    >
                      <Play className="h-3.5 w-3.5 fill-white" />
                      <span>{int.status === 'completed' ? 'Re-enter Room' : 'Start / Join'}</span>
                    </button>

                    <button
                      onClick={() => setEvaluatingInterview(int)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-300 transition-colors"
                      title="Evaluate candidate performance and submit grade"
                    >
                      <Award className="h-3.5 w-3.5" />
                      <span>Evaluate</span>
                    </button>

                    {int.status === 'completed' && (
                      <button
                        onClick={() => onViewResults(int._id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs font-semibold text-emerald-400 hover:bg-emerald-900/50 transition-colors"
                      >
                        Results
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteInterview(int._id)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors rounded-lg"
                      title="Delete interview schedule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create Interview Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Create Technical Interview</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateInterview} className="space-y-4 text-xs">
                {/* Title & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Interview Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Interview Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as InterviewType)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-indigo-500 font-sans"
                    >
                      {INTERVIEW_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Candidate Selection */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select Candidate</label>
                  <select
                    value={selectedCandidateId}
                    onChange={(e) => setSelectedCandidateId(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {candidates.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.email}) - {c.title || 'Candidate'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date, Start Time, Duration, Difficulty */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Duration (min)</label>
                    <input
                      type="number"
                      min="15"
                      max="180"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as InterviewDifficulty)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Session Description / Goals</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Select Coding Problems */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Select Coding Problems ({selectedProblems.length} selected)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 rounded-lg bg-slate-950 border border-slate-800">
                    {allProblems.map((prob) => {
                      const isSelected = selectedProblems.includes(prob._id);
                      return (
                        <button
                          type="button"
                          key={prob._id}
                          onClick={() => toggleProblemSelection(prob._id)}
                          className={`p-2 rounded text-left border transition-all ${
                            isSelected
                              ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-semibold truncate">{prob.title}</div>
                          <div className="text-[10px] text-slate-500">{prob.difficulty}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Technical Questions */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Discussion Questions ({selectedQuestions.length})
                  </label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto mb-2">
                    {selectedQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                      >
                        <span className="truncate pr-2">{q}</span>
                        <button
                          type="button"
                          onClick={() => removeQuestion(idx)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom question..."
                      value={customQuestionInput}
                      onChange={(e) => setCustomQuestionInput(e.target.value)}
                      className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
                    />
                    <button
                      type="button"
                      onClick={addCustomQuestion}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-1.5 rounded text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-md shadow-indigo-600/30"
                  >
                    Schedule Interview
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Evaluation Modal */}
        {evaluatingInterview && (
          <EvaluationModal
            isOpen={true}
            onClose={() => setEvaluatingInterview(null)}
            onSubmit={handleEvaluationSubmit}
            candidateName={evaluatingInterview.candidateName || 'Candidate'}
            interviewTitle={evaluatingInterview.title}
          />
        )}
      </div>
    </div>
  );
};
