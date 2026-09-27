import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Briefcase,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Unlock,
  BookOpen,
  Code,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../services/api';
import type { User, Interview, PlatformStats, InterviewQuestion } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'interviews' | 'questions'>('overview');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // New question form modal
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [qCategory, setQCategory] = useState<'JavaScript' | 'React' | 'Node.js' | 'Database' | 'DSA' | 'System Design'>('JavaScript');
  const [qTitle, setQTitle] = useState('');
  const [qQuestion, setQQuestion] = useState('');
  const [qAnswerGuide, setQAnswerGuide] = useState('');
  const [qDifficulty, setQDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  const loadAll = async () => {
    try {
      setLoading(true);
      const [st, uList, intList, qList] = await Promise.all([
        api.users.getStats(),
        api.users.list(),
        api.interviews.list(),
        api.questions.list(),
      ]);
      setStats(st);
      setUsers(uList);
      setInterviews(intList);
      setQuestions(qList);
    } catch (err) {
      console.error('Failed to load admin metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const toggleUserStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    try {
      await api.users.update(user._id, { status: newStatus });
      await loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTitle || !qQuestion || !qAnswerGuide) return;
    try {
      await api.questions.create({
        category: qCategory,
        title: qTitle,
        question: qQuestion,
        answerGuide: qAnswerGuide,
        difficulty: qDifficulty,
        tags: [qCategory],
      });
      setShowAddQuestionModal(false);
      setQTitle('');
      setQQuestion('');
      setQAnswerGuide('');
      await loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to remove this question from bank?')) return;
    try {
      await api.questions.delete(id);
      await loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-500 font-mono text-xs">
        Loading platform administrator console...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-rose-400" />
              <h1 className="text-xl font-bold text-white">Platform Administration</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/60 border border-rose-800 text-rose-400">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Global system monitoring, RBAC user lifecycle management, question bank administration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddQuestionModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Question</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Total Users
              </div>
              <div className="text-xl font-bold font-mono text-white tabular-nums mt-1">
                {stats.totalUsers}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Candidates
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums mt-1">
                {stats.totalCandidates}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Interviewers
              </div>
              <div className="text-xl font-bold font-mono text-amber-400 tabular-nums mt-1">
                {stats.totalInterviewers}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Total Interviews
              </div>
              <div className="text-xl font-bold font-mono text-indigo-400 tabular-nums mt-1">
                {stats.totalInterviews}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Completed
              </div>
              <div className="text-xl font-bold font-mono text-teal-400 tabular-nums mt-1">
                {stats.completedInterviews}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Avg Rating
              </div>
              <div className="text-xl font-bold font-mono text-indigo-300 tabular-nums mt-1">
                {stats.globalAverageScore} / 10
              </div>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          {(['overview', 'users', 'interviews', 'questions'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-colors ${
                activeTab === t
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content: Users */}
        {activeTab === 'users' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Registered Accounts & Roles</h2>
              <span className="text-xs text-slate-400">{users.length} Registered Accounts</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-5">User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Title / Org</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 pl-5">
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                            u.role === 'admin'
                              ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                              : u.role === 'interviewer'
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                              : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {u.title || 'N/A'} · {u.company || 'Intervexa'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.status === 'active'
                              ? 'bg-emerald-950/60 text-emerald-400'
                              : 'bg-rose-950/60 text-rose-400'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right pr-5">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => toggleUserStatus(u)}
                            className="flex items-center gap-1 ml-auto text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          >
                            {u.status === 'active' ? (
                              <>
                                <Lock className="h-3 w-3 text-rose-400" />
                                <span>Disable</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="h-3 w-3 text-emerald-400" />
                                <span>Enable</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Interviews */}
        {activeTab === 'interviews' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">All Platform Interviews</h2>
              <span className="text-xs text-slate-400">{interviews.length} Sessions</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {interviews.map((int) => (
                <div key={int._id} className="p-4 flex items-center justify-between hover:bg-slate-800/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{int.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {int.type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Candidate: <span className="text-slate-200">{int.candidateName}</span> · Interviewer:{' '}
                      <span className="text-slate-200">{int.interviewerName}</span> · Date: {int.date}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded text-xs font-semibold capitalize ${
                      int.status === 'completed'
                        ? 'bg-emerald-950/60 text-emerald-400'
                        : 'bg-indigo-950/60 text-indigo-400'
                    }`}
                  >
                    {int.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Questions */}
        {activeTab === 'questions' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Question Bank Repository</h2>
              <span className="text-xs text-slate-400">{questions.length} Questions</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {questions.map((q) => (
                <div key={q._id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-800/30">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                        {q.category}
                      </span>
                      <span className="text-xs font-bold text-white">{q.title}</span>
                    </div>
                    <p className="text-xs text-slate-300">{q.question}</p>
                    <p className="text-[11px] text-slate-500 italic">Guide: {q.answerGuide}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteQuestion(q._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                <span>Platform Operational Breakdown</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Total Coding Problems:</span>
                  <span className="font-mono font-bold text-white tabular-nums">8 Algorithm Challenges</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Question Bank Items:</span>
                  <span className="font-mono font-bold text-white tabular-nums">{questions.length} Items</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Candidate Evaluations Recorded:</span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">
                    {stats?.evaluationsCount || 0} Submissions
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Security & Sandboxing Architecture</span>
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                The execution layer uses a bounded virtual machine sandbox with static pattern filtering against system calls, isolated process timeouts, and synthetic test case verification. User passwords are protected with bcrypt (10 rounds) and access tokens are signed via cryptographically secure JWT keys.
              </p>
            </div>
          </div>
        )}

        {/* Add Question Modal */}
        {showAddQuestionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Add Question to Bank</h3>
                <button
                  onClick={() => setShowAddQuestionModal(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateQuestion} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Category</label>
                    <select
                      value={qCategory}
                      onChange={(e) => setQCategory(e.target.value as any)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2 text-white"
                    >
                      <option value="JavaScript">JavaScript</option>
                      <option value="React">React</option>
                      <option value="Node.js">Node.js</option>
                      <option value="Database">Database</option>
                      <option value="DSA">DSA</option>
                      <option value="System Design">System Design</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Difficulty</label>
                    <select
                      value={qDifficulty}
                      onChange={(e) => setQDifficulty(e.target.value as any)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2 text-white"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={qTitle}
                    onChange={(e) => setQTitle(e.target.value)}
                    placeholder="e.g. React Fiber Reconciliation"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Question Prompt</label>
                  <textarea
                    required
                    rows={2}
                    value={qQuestion}
                    onChange={(e) => setQQuestion(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Answer Guide for Interviewer</label>
                  <textarea
                    required
                    rows={2}
                    value={qAnswerGuide}
                    onChange={(e) => setQAnswerGuide(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddQuestionModal(false)}
                    className="px-3 py-1.5 rounded text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white"
                  >
                    Save Question
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
