import React, { useState, useEffect } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClerkUserBridge } from './components/ClerkUserBridge';
import { ClerkConfigModal } from './components/ClerkConfigModal';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './features/landing/LandingPage';
import { CandidateDashboard } from './features/candidate/CandidateDashboard';
import { InterviewerDashboard } from './features/interviewer/InterviewerDashboard';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { InterviewRoom } from './features/interview/InterviewRoom';
import { InterviewResultPage } from './features/results/InterviewResultPage';
import { QuestionBankView } from './features/questions/QuestionBankView';
import { CodingProblemsView } from './features/problems/CodingProblemsView';
import { getClerkPublishableKey, isClerkKeyValid } from './services/clerk';
import { Key } from 'lucide-react';

interface AppContentProps {
  onOpenClerkConfig: () => void;
}

function AppContent({ onOpenClerkConfig }: AppContentProps) {
  const { user, role, isClerkActive } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(null);
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    mode: 'login' | 'register';
  }>({
    isOpen: false,
    mode: 'login',
  });

  const handleJoinInterview = (id: string) => {
    setActiveInterviewId(id);
    setCurrentView('interview-room');
  };

  const handleViewResults = (id: string) => {
    setActiveInterviewId(id);
    setCurrentView('results');
  };

  const handleExitRoom = () => {
    if (role === 'candidate') {
      setCurrentView('candidate-dashboard');
    } else if (role === 'interviewer') {
      setCurrentView('interviewer-dashboard');
    } else {
      setCurrentView('landing');
    }
  };

  // If in interview room, hide standard navbar to yield full viewport height to Monaco and video grid
  const isInInterviewRoom = currentView === 'interview-room' && activeInterviewId;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {!isInInterviewRoom && (
        <Navbar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onOpenAuthModal={(mode) => setAuthModalState({ isOpen: true, mode })}
          onOpenClerkConfig={onOpenClerkConfig}
        />
      )}

      {/* Top Notification Strip if Clerk not configured yet */}
      {!isInInterviewRoom && !isClerkActive && !user && (
        <div className="bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-slate-900 border-b border-purple-900/30 px-4 py-2 text-xs text-purple-200 flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-ping" />
            <span className="font-semibold text-purple-300">Clerk Authentication Enabled:</span>
            <span>
              Use the built-in Clerk sandbox with candidate/interviewer personas, or connect your real Clerk Publishable Key.
            </span>
            <button
              onClick={onOpenClerkConfig}
              className="ml-2 font-bold underline text-white hover:text-purple-200 transition-colors inline-flex items-center gap-1"
            >
              <Key className="h-3 w-3" /> Connect Clerk Key
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={(view) => setCurrentView(view)}
            onOpenAuthModal={(mode) => setAuthModalState({ isOpen: true, mode })}
          />
        )}

        {currentView === 'candidate-dashboard' && (
          <CandidateDashboard
            onJoinInterview={handleJoinInterview}
            onViewResults={handleViewResults}
          />
        )}

        {currentView === 'interviewer-dashboard' && (
          <InterviewerDashboard
            onJoinInterview={handleJoinInterview}
            onViewResults={handleViewResults}
          />
        )}

        {currentView === 'admin-dashboard' && <AdminDashboard />}

        {currentView === 'interview-room' && activeInterviewId && (
          <InterviewRoom
            interviewId={activeInterviewId}
            onExit={handleExitRoom}
            onViewResults={handleViewResults}
          />
        )}

        {currentView === 'results' && activeInterviewId && (
          <InterviewResultPage
            interviewId={activeInterviewId}
            onBack={handleExitRoom}
          />
        )}

        {currentView === 'question-bank' && <QuestionBankView />}

        {currentView === 'coding-problems' && <CodingProblemsView />}
      </main>

      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ isOpen: false, mode: 'login' })}
        onOpenClerkConfig={onOpenClerkConfig}
        onSuccess={() => {
          if (role === 'candidate') setCurrentView('candidate-dashboard');
          else if (role === 'interviewer') setCurrentView('interviewer-dashboard');
          else if (role === 'admin') setCurrentView('admin-dashboard');
        }}
      />
    </div>
  );
}

export default function App() {
  const [clerkKey, setClerkKey] = useState<string>(() => getClerkPublishableKey());
  const [isClerkModalOpen, setIsClerkModalOpen] = useState(false);

  const handleKeyUpdated = () => {
    setClerkKey(getClerkPublishableKey());
  };

  const isLive = isClerkKeyValid(clerkKey);

  if (isLive) {
    return (
      <ClerkProvider publishableKey={clerkKey}>
        <AuthProvider>
          <ClerkUserBridge />
          <AppContent onOpenClerkConfig={() => setIsClerkModalOpen(true)} />
          <ClerkConfigModal
            isOpen={isClerkModalOpen}
            onClose={() => setIsClerkModalOpen(false)}
            onKeyUpdated={handleKeyUpdated}
          />
        </AuthProvider>
      </ClerkProvider>
    );
  }

  return (
    <AuthProvider>
      <AppContent onOpenClerkConfig={() => setIsClerkModalOpen(true)} />
      <ClerkConfigModal
        isOpen={isClerkModalOpen}
        onClose={() => setIsClerkModalOpen(false)}
        onKeyUpdated={handleKeyUpdated}
      />
    </AuthProvider>
  );
}
