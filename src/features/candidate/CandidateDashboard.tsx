import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronRight,
  ExternalLink,
  Code,
  User as UserIcon,
  Play,
  FileText,
  Mail,
  Edit3,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Interview, NotificationItem } from '../../types';

interface CandidateDashboardProps {
  onJoinInterview: (interviewId: string) => void;
  onViewResults: (interviewId: string) => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  onJoinInterview,
  onViewResults,
}) => {
  const { user, profile, refreshUser } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [skillsInput, setSkillsInput] = useState(profile?.skills?.join(', ') || 'React, TypeScript, Node.js');
  const [experienceYears, setExperienceYears] = useState(profile?.experienceYears || 4);
  const [education, setEducation] = useState(profile?.education || 'B.S. in Computer Science');
  const [bio, setBio] = useState(profile?.bio || '');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [intList, notifs] = await Promise.all([
          api.interviews.list(),
          api.users.getNotifications(),
        ]);
        setInterviews(intList);
        setNotifications(notifs);
      } catch (err) {
        console.error('Failed to load candidate dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const upcomingInterviews = interviews.filter(
    (i) => i.status === 'scheduled' || i.status === 'in_progress'
  );
  const completedInterviews = interviews.filter((i) => i.status === 'completed');

  const pendingInvitations = notifications.filter(
    (n) => n.type === 'interview_invite' && !n.isRead
  );

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const skillsArray = skillsInput
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);

      await api.users.update(user._id, {
        skills: skillsArray,
        experienceYears,
        education,
        bio,
      });

      await refreshUser();
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-slate-500 font-mono text-xs">
        Loading candidate dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header with Candidate Profile Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-indigo-500/40 shrink-0">
              <img
                src="/src/assets/images/avatar_engineer_alex_1790499894893.jpg"
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
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                  Candidate
                </span>
              </div>
              <p className="text-xs text-slate-400">{user?.title || 'Software Developer Candidate'}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-400">
                <span>{profile?.experienceYears || 4} Years Exp</span>
                <span>·</span>
                <span>{profile?.education || 'Computer Science'}</span>
                <span>·</span>
                <span className="text-indigo-400">{profile?.skills?.slice(0, 4).join(', ') || 'React, TS, Node'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditingProfile(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors self-start md:self-auto"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Update Profile</span>
          </button>
        </div>

        {/* Dashboard Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Upcoming Interviews
            </div>
            <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
              {upcomingInterviews.length}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Completed Interviews
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {completedInterviews.length}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Total Sessions
            </div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {interviews.length}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Pending Invites
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {pendingInvitations.length}
            </div>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upcoming & Completed Interviews */}
          <div className="lg:col-span-8 space-y-6">
            {/* Upcoming Interviews Card */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  <h2 className="text-sm font-bold text-white">Upcoming Technical Interviews</h2>
                </div>
                <span className="text-xs text-slate-400">
                  {upcomingInterviews.length} Scheduled
                </span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {upcomingInterviews.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No upcoming interviews scheduled at this time.
                  </div>
                ) : (
                  upcomingInterviews.map((int) => (
                    <div
                      key={int._id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{int.title}</h3>
                          {int.status === 'in_progress' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                              Live Now
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {int.type}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{int.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{int.startTime} ({int.duration}m)</span>
                          </div>
                          <div>Interviewer: <span className="text-slate-300">{int.interviewerName}</span></div>
                        </div>

                        {int.description && (
                          <p className="text-xs text-slate-400 line-clamp-1 pt-1">
                            {int.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => onJoinInterview(int._id)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-md shadow-indigo-600/30 transition-all shrink-0 self-start sm:self-center"
                      >
                        <Play className="h-3.5 w-3.5 fill-white" />
                        <span>Join Room</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Completed Interviews & Evaluation Results Card */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white">Interview History & Evaluations</h2>
                </div>
                <span className="text-xs text-slate-400">
                  {completedInterviews.length} Completed
                </span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {completedInterviews.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No completed interviews yet. Completed sessions with scores will appear here.
                  </div>
                ) : (
                  completedInterviews.map((int) => (
                    <div
                      key={int._id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{int.title}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {int.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>Date: {int.date}</span>
                          <span>·</span>
                          <span>Conducted by: {int.interviewerName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewResults(int._id)}
                          className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-lg hover:bg-emerald-900/50 transition-colors"
                        >
                          <Award className="h-3.5 w-3.5" />
                          <span>View Evaluation</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Invitations & Assigned Problems */}
          <div className="lg:col-span-4 space-y-6">
            {/* Invitations Panel */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Recent Notifications
                  </h3>
                </div>
              </div>

              <div className="space-y-2.5">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3">No notifications right now.</p>
                ) : (
                  notifications.slice(0, 4).map((n) => (
                    <div
                      key={n._id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs"
                    >
                      <div className="font-semibold text-slate-200">{n.title}</div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Preparation Tip Box */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-900/50 p-5 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Code className="h-4 w-4" />
                <span>Interview Day Checklist</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Verify webcam and microphone permissions.</li>
                <li>Review DSA patterns (Two Sum, Kadane, BFS/DFS).</li>
                <li>Communicate time and space trade-offs out loud.</li>
                <li>Run custom test cases prior to submitting.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Profile Update Modal */}
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Update Candidate Profile</h3>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Technical Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Years Experience</label>
                    <input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(parseInt(e.target.value, 10))}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Education</label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Professional Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Short summary of background..."
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3 py-1.5 rounded text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white"
                  >
                    Save Changes
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
