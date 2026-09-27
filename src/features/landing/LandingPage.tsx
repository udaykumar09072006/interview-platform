import React from 'react';
import {
  Code2,
  Video,
  Terminal,
  Award,
  BookOpen,
  ArrowRight,
  Shield,
  Briefcase,
  GraduationCap,
  Sparkles,
  Users,
  Cpu,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenAuthModal }) => {
  const { user, quickSwitchUser } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Next-Gen Enterprise Engineering Interviews</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight text-balance">
                Conduct Technical Interviews <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-purple-400">Smarter</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Interview candidates, collaborate in real time, run code, and evaluate technical skills from one unified high-performance platform.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => {
                    if (user) {
                      if (user.role === 'interviewer') onNavigate('interviewer-dashboard');
                      else if (user.role === 'candidate') onNavigate('candidate-dashboard');
                      else onNavigate('admin-dashboard');
                    } else {
                      onOpenAuthModal?.('register');
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  <span>Start Interview</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => onNavigate('coding-problems')}
                  className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-semibold text-sm text-slate-200 transition-all"
                >
                  Explore Platform
                </button>
              </div>

              {/* Live Testing Quick Launcher */}
              <div className="pt-6 border-t border-slate-800/80">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Instant Test Personas (One-Click Sign-In):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={async () => {
                      await quickSwitchUser('candidate');
                      onNavigate('candidate-dashboard');
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 text-left transition-all group"
                  >
                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white group-hover:text-indigo-300">
                        Candidate
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">Alex Rivera</div>
                    </div>
                  </button>

                  <button
                    onClick={async () => {
                      await quickSwitchUser('interviewer');
                      onNavigate('interviewer-dashboard');
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 text-left transition-all group"
                  >
                    <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white group-hover:text-indigo-300">
                        Interviewer
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">Sarah Chen</div>
                    </div>
                  </button>

                  <button
                    onClick={async () => {
                      await quickSwitchUser('admin');
                      onNavigate('admin-dashboard');
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 text-left transition-all group"
                  >
                    <div className="h-8 w-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white group-hover:text-indigo-300">
                        Admin
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">Eleanor Vance</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right preview graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl shadow-indigo-500/10 aspect-[16/10]">
                <img
                  src="/src/assets/images/hero_developer_interview_1790499882984.jpg"
                  alt="Intervexa live coding platform overview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback container if image cannot load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                {/* Floating telemetry pills */}
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-white">Full-Stack Live Room</span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    Latency: 18ms · WebRTC HD
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-16 md:py-24 bg-slate-950/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Engineered for Rigorous Technical Evaluations
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every tool required to run thorough, unbiased, and realistic coding interviews from junior to staff levels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Video className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Real-Time Interview Room</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full WebRTC peer-to-peer video and audio communication, screen sharing, real-time timer sync, and live connection status.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Collaborative Code Editor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Powered by Monaco Editor with syntax highlighting for C++, Java, Python, JavaScript, and TypeScript, synchronized in real time via Socket.IO.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Seeded Question Bank</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Comprehensive technical question bank covering JavaScript, React, Node.js, Databases, Data Structures & Algorithms, and System Design.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Sandboxed Code Execution</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Isolated runner architecture that executes code against hidden and visible test cases without running arbitrary untrusted code on the main server.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Candidate Evaluation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Structured 7-category scoring (DSA, Problem Solving, Programming, Tech Knowledge, Communication, System Design, Code Quality) with auto-averaged ratings.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Platform Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Admin telemetry, user lifecycle controls, scheduled vs completed interview ratios, and overall candidate scoring distribution metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-8 bg-slate-950 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-indigo-400" />
            <span className="font-mono font-bold text-slate-300">Intervexa</span>
            <span>· Production-Ready Online Interview & Coding Platform</span>
          </div>
          <div className="text-slate-500">
            Enterprise technical interview software. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
