import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserButton } from '@clerk/clerk-react';
import {
  Code2,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Shield,
  Briefcase,
  GraduationCap,
  Sparkles,
  Key,
  CheckCircle,
} from 'lucide-react';
import type { UserRole } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
  onOpenClerkConfig?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuthModal,
  onOpenClerkConfig,
}) => {
  const { user, role, logout, quickSwitchUser, setUserRole, isClerkActive } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-left group transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
            <Code2 className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-mono">
            Intervexa
          </span>
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {user ? (
            <>
              {role === 'candidate' && (
                <button
                  onClick={() => onNavigate('candidate-dashboard')}
                  className={`transition-colors ${
                    currentView === 'candidate-dashboard'
                      ? 'text-indigo-400 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Candidate Dashboard
                </button>
              )}

              {role === 'interviewer' && (
                <button
                  onClick={() => onNavigate('interviewer-dashboard')}
                  className={`transition-colors ${
                    currentView === 'interviewer-dashboard'
                      ? 'text-indigo-400 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Interviewer Console
                </button>
              )}

              {role === 'admin' && (
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className={`transition-colors ${
                    currentView === 'admin-dashboard'
                      ? 'text-indigo-400 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Administration
                </button>
              )}

              <button
                onClick={() => onNavigate('question-bank')}
                className={`transition-colors ${
                  currentView === 'question-bank'
                    ? 'text-indigo-400 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Question Bank
              </button>

              <button
                onClick={() => onNavigate('coding-problems')}
                className={`transition-colors ${
                  currentView === 'coding-problems'
                    ? 'text-indigo-400 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Coding Problems
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('landing')}
                className="text-slate-300 hover:text-white transition-colors"
              >
                Platform Overview
              </button>
              <button
                onClick={() => onNavigate('coding-problems')}
                className="text-slate-300 hover:text-white transition-colors"
              >
                Problems
              </button>
              <button
                onClick={() => onNavigate('question-bank')}
                className="text-slate-300 hover:text-white transition-colors"
              >
                Question Bank
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions, Clerk Badge & Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Clerk Status & Config Button */}
          <button
            onClick={onOpenClerkConfig}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isClerkActive
                ? 'bg-purple-950/40 border-purple-700/60 text-purple-200 hover:bg-purple-900/40 shadow-sm shadow-purple-900/20'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
            title="Configure Clerk Authentication & API Key"
          >
            <div
              className={`h-2 w-2 rounded-full ${
                isClerkActive ? 'bg-emerald-400' : 'bg-purple-400'
              }`}
            />
            <span className="font-semibold text-purple-300">Clerk</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              {isClerkActive ? 'Active' : 'Setup'}
            </span>
          </button>

          {/* Quick Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
              title="Fast switch between Candidate, Interviewer, and Admin"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Role Switcher</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showRoleSwitcher && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-xl shadow-black/50 z-50"
                onMouseLeave={() => setShowRoleSwitcher(false)}
              >
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Test Personas & Roles
                </div>
                <button
                  onClick={async () => {
                    if (user) {
                      await setUserRole('candidate');
                    } else {
                      await quickSwitchUser('candidate');
                    }
                    setShowRoleSwitcher(false);
                    onNavigate('candidate-dashboard');
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-left transition-colors ${
                    role === 'candidate'
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <GraduationCap className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-white">Alex Rivera</div>
                    <div className="text-[11px] text-slate-400">Candidate Role</div>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    if (user) {
                      await setUserRole('interviewer');
                    } else {
                      await quickSwitchUser('interviewer');
                    }
                    setShowRoleSwitcher(false);
                    onNavigate('interviewer-dashboard');
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-left transition-colors ${
                    role === 'interviewer'
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Briefcase className="h-4 w-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-white">Sarah Chen</div>
                    <div className="text-[11px] text-slate-400">Staff Interviewer</div>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    if (user) {
                      await setUserRole('admin');
                    } else {
                      await quickSwitchUser('admin');
                    }
                    setShowRoleSwitcher(false);
                    onNavigate('admin-dashboard');
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-left transition-colors ${
                    role === 'admin'
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Shield className="h-4 w-4 text-rose-400 shrink-0" />
                  <div>
                    <div className="text-white">Eleanor Vance</div>
                    <div className="text-[11px] text-slate-400">Platform Admin</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              {/* Optional live Clerk UserButton when live key active */}
              {isClerkActive && (
                <div className="hidden sm:block">
                  <UserButton afterSignOutUrl="/" />
                </div>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-medium text-white truncate max-w-[120px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-xl shadow-black/50 z-50"
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-medium text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/60 border border-indigo-700/60 text-indigo-300 font-mono capitalize">
                          {user.role}
                        </span>
                        {isClerkActive && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 border border-purple-700/60 text-purple-300 font-mono">
                            Clerk Sync
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (role === 'candidate') onNavigate('candidate-dashboard');
                        else if (role === 'interviewer') onNavigate('interviewer-dashboard');
                        else onNavigate('admin-dashboard');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-left"
                    >
                      <UserIcon className="h-3.5 w-3.5" />
                      My Dashboard
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenClerkConfig?.();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-purple-300 hover:bg-purple-900/20 rounded-lg text-left"
                    >
                      <Key className="h-3.5 w-3.5" />
                      Clerk Auth Settings
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        onNavigate('landing');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg text-left mt-1 border-t border-slate-800/80 pt-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal?.('login')}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuthModal?.('register')}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-colors shadow-sm shadow-indigo-600/30"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
