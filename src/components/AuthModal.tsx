import React, { useState } from 'react';
import { Lock, Mail, User, X, Briefcase, GraduationCap, Shield, Sparkles, Key, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SignIn, SignUp } from '@clerk/clerk-react';
import type { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
  onOpenClerkConfig?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
  onOpenClerkConfig,
}) => {
  const { login, register, isClerkActive, quickSwitchUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          name,
          email,
          password,
          role,
          title: title || (role === 'candidate' ? 'Full Stack Candidate' : 'Technical Interviewer'),
          company: company || (role === 'candidate' ? 'Open to Work' : 'Intervexa Tech'),
        });
      }
      onClose();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (targetRole: UserRole) => {
    setLoading(true);
    try {
      await quickSwitchUser(targetRole);
      onClose();
      onSuccess?.();
    } catch (err: any) {
      setError('Quick sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-purple-600/30 font-bold text-sm">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {isClerkActive
                    ? mode === 'login'
                      ? 'Clerk Sign In'
                      : 'Clerk Sign Up'
                    : mode === 'login'
                    ? 'Sign In to Intervexa'
                    : 'Create Your Account'}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {isClerkActive ? 'Clerk Live' : 'Clerk Auth Ready'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isClerkActive
                  ? 'Authenticated via official Clerk security services'
                  : 'Fast authentication with role-based candidate & interviewer access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Clerk Mode View */}
        {isClerkActive ? (
          <div className="mt-4 flex flex-col items-center">
            <div className="w-full flex justify-center py-2">
              {mode === 'login' ? (
                <SignIn routing="hash" />
              ) : (
                <SignUp routing="hash" />
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 w-full text-center text-xs text-slate-400">
              {mode === 'login' ? (
                <span>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Switch to Sign Up
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Switch to Sign In
                  </button>
                </span>
              )}
            </div>
          </div>
        ) : (
          /* Sandbox / Hybrid Clerk Mode */
          <div className="mt-4 space-y-4">
            {/* Quick Clerk Key Connect Banner */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-purple-200">
                <Key className="h-4 w-4 text-purple-400 shrink-0" />
                <span>Have a Clerk Publishable Key? Connect it for live Clerk Google/SSO auth.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenClerkConfig?.();
                }}
                className="px-2.5 py-1 text-[11px] font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-md transition-colors shrink-0 shadow-sm"
              >
                Set Key
              </button>
            </div>

            {/* Quick Persona 1-Click Access for Instant Testing */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                1-Click Quick Demo Sign In
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('candidate')}
                  className="flex flex-col items-center p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/50 hover:bg-slate-900 transition-all text-center group"
                >
                  <GraduationCap className="h-5 w-5 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-white">Alex (Candidate)</span>
                  <span className="text-[10px] text-slate-400">Coding interviews</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('interviewer')}
                  className="flex flex-col items-center p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-amber-500/50 hover:bg-slate-900 transition-all text-center group"
                >
                  <Briefcase className="h-5 w-5 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-white">Sarah (Interviewer)</span>
                  <span className="text-[10px] text-slate-400">Host & evaluate</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className="flex flex-col items-center p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-rose-500/50 hover:bg-slate-900 transition-all text-center group"
                >
                  <Shield className="h-5 w-5 text-rose-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-white">Eleanor (Admin)</span>
                  <span className="text-[10px] text-slate-400">Platform control</span>
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider shrink-0 font-medium">
                Or Continue With Credentials
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Rivera"
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Account Role</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('candidate')}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          role === 'candidate'
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <GraduationCap className="h-4 w-4 mx-auto mb-1 text-emerald-400" />
                        <span>Candidate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('interviewer')}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          role === 'interviewer'
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Briefcase className="h-4 w-4 mx-auto mb-1 text-amber-400" />
                        <span>Interviewer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          role === 'admin'
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Shield className="h-4 w-4 mx-auto mb-1 text-rose-400" />
                        <span>Admin</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@intervexa.com"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-white shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In with Intervexa' : 'Create Account'}
              </button>
            </form>

            <div className="mt-3 pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
              {mode === 'login' ? (
                <span>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Sign up
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
