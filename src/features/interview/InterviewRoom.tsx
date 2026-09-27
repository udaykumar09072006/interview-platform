import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  CheckCircle,
  Clock,
  Wifi,
  Users,
  MessageSquare,
  BookOpen,
  FileText,
  AlertTriangle,
  Award,
  Layers,
  ChevronLeft,
  Settings,
} from 'lucide-react';
import { api } from '../../services/api';
import { getSocket, disconnectSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { VideoGrid } from '../../components/VideoGrid';
import { MonacoEditorPane } from '../../components/MonacoEditorPane';
import { TerminalOutputPane } from '../../components/TerminalOutputPane';
import { ProblemDescriptionPane } from '../../components/ProblemDescriptionPane';
import { QuestionNavigator } from '../../components/QuestionNavigator';
import { ChatPane } from '../../components/ChatPane';
import { EvaluationModal } from '../../components/EvaluationModal';
import type {
  Interview,
  CodingProblem,
  ExecutionResult,
  ChatMessage,
  UserRole,
} from '../../types';

interface InterviewRoomProps {
  interviewId: string;
  onExit: () => void;
  onViewResults: (id: string) => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  interviewId,
  onExit,
  onViewResults,
}) => {
  const { user } = useAuth();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [currentProblemId, setCurrentProblemId] = useState<string>('');

  // Code state
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>('');
  const [remoteEditorName, setRemoteEditorName] = useState<string>('');

  // Terminal & execution state
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [useCustomInput, setUseCustomInput] = useState<boolean>(false);

  // Right sidebar tabs: 'problem' | 'questions' | 'chat' | 'notes'
  const [activeRightTab, setActiveRightTab] = useState<'problem' | 'questions' | 'chat' | 'notes'>('problem');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notes, setNotes] = useState<string>('');

  // Room presence & timer
  const [participants, setParticipants] = useState<any[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(3600);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const socketRef = useRef<any>(null);

  // Load interview details & initial coding problem
  useEffect(() => {
    let isSubscribed = true;

    async function loadInterviewSession() {
      try {
        const data = await api.interviews.get(interviewId);
        if (!isSubscribed) return;

        setInterview(data);
        if (data.populatedProblems && data.populatedProblems.length > 0) {
          setProblems(data.populatedProblems);
          const firstProb = data.populatedProblems[0];
          setCurrentProblemId(firstProb._id);
          const starter = firstProb.starterCode?.javascript || '// Write your solution here';
          setCode(starter);
        }

        // Mark participant joined
        await api.interviews.join(interviewId);
      } catch (err) {
        console.error('Failed to load interview room session', err);
      }
    }

    loadInterviewSession();

    return () => {
      isSubscribed = false;
    };
  }, [interviewId]);

  // Setup Socket.IO real-time connection
  useEffect(() => {
    if (!user || !interviewId) return;

    const socket = getSocket();
    socketRef.current = socket;

    socket.emit('join-room', {
      interviewId,
      userId: user._id,
      userName: user.name,
      userRole: user.role,
    });

    socket.on('room-joined-success', ({ users, codeBuffers, timer, chatHistory }) => {
      setParticipants(users);
      if (chatHistory) setChatMessages(chatHistory);

      // Restore code buffer if peer already wrote something
      if (currentProblemId && codeBuffers[currentProblemId]) {
        setCode(codeBuffers[currentProblemId].code);
        setLanguage(codeBuffers[currentProblemId].language);
      }

      if (timer) {
        const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
        const total = timer.durationMinutes * 60;
        setRemainingSeconds(Math.max(0, total - elapsed));
      }
    });

    socket.on('user-joined', ({ user: newUser, users }) => {
      setParticipants(users);
    });

    socket.on('user-left', ({ users }) => {
      setParticipants(users);
    });

    // Remote code changes
    socket.on('code-update', ({ problemId, code: remoteCode, senderName }) => {
      if (problemId === currentProblemId) {
        setCode(remoteCode);
        setRemoteEditorName(senderName);
        setTimeout(() => setRemoteEditorName(''), 2500);
      }
    });

    socket.on('language-update', ({ problemId, language: newLang, code: newCode }) => {
      if (problemId === currentProblemId) {
        setLanguage(newLang);
        setCode(newCode);
      }
    });

    socket.on('new-chat-message', (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on('notes-synced', ({ notes: newNotes }) => {
      setNotes(newNotes);
    });

    return () => {
      socket.off('room-joined-success');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('code-update');
      socket.off('language-update');
      socket.off('new-chat-message');
      socket.off('notes-synced');
    };
  }, [user, interviewId, currentProblemId]);

  // Timer countdown
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Code change broadcast
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    socketRef.current?.emit('code-change', {
      interviewId,
      problemId: currentProblemId,
      code: newCode,
      language,
    });
  };

  // Language switch
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    const currentProb = problems.find((p) => p._id === currentProblemId);
    const starter = currentProb?.starterCode?.[newLang] || `// Solution in ${newLang}`;
    setCode(starter);

    socketRef.current?.emit('language-change', {
      interviewId,
      problemId: currentProblemId,
      language: newLang,
      starterCode: starter,
    });
  };

  const handleResetStarter = () => {
    const currentProb = problems.find((p) => p._id === currentProblemId);
    const starter = currentProb?.starterCode?.[language] || '// Write your solution here';
    handleCodeChange(starter);
  };

  // Run code against sample/custom inputs
  const handleRunCode = async () => {
    if (!currentProblemId) return;
    setIsRunning(true);
    try {
      const res = await api.submissions.runOrSubmit({
        interviewId,
        problemId: currentProblemId,
        language,
        code,
        customInput: useCustomInput ? customInput : undefined,
        isSubmit: false,
      });
      setExecutionResult(res);
    } catch (err: any) {
      setExecutionResult({
        status: 'Compilation Error',
        output: '',
        runtimeMs: 0,
        memoryKb: 0,
        testCasesPassed: 0,
        totalTestCases: 0,
        testResults: [],
        compilationError: err.message || 'Execution failed.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit code against all test cases
  const handleSubmitCode = async () => {
    if (!currentProblemId) return;
    setIsRunning(true);
    try {
      const res = await api.submissions.runOrSubmit({
        interviewId,
        problemId: currentProblemId,
        language,
        code,
        isSubmit: true,
      });
      setExecutionResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  // Chat message send
  const handleSendMessage = (msg: string) => {
    socketRef.current?.emit('send-chat-message', {
      interviewId,
      message: msg,
    });
  };

  // Notes update
  const handleNotesChange = (text: string) => {
    setNotes(text);
    socketRef.current?.emit('notes-update', {
      interviewId,
      notes: text,
      isShared: true,
    });
  };

  // Evaluation submission
  const handleEvaluationSubmit = async (feedbackData: any) => {
    await api.interviews.submitFeedback(interviewId, feedbackData);
    setIsEvaluationOpen(false);
    onViewResults(interviewId);
  };

  const currentProblem = problems.find((p) => p._id === currentProblemId) || problems[0] || null;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* Top Navigation & Status Bar */}
      <div className="flex h-12 items-center justify-between border-b border-slate-800 bg-slate-950 px-4">
        {/* Left: Breadcrumb & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md">
              {interview?.title || 'Technical Interview Session'}
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950/70 border border-indigo-800 text-indigo-300">
              {interview?.type || 'Technical'}
            </span>
          </div>
        </div>

        {/* Center: Synchronized Timer */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
          <Clock className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-mono text-xs font-bold text-white tabular-nums">
            {formatTimer(remainingSeconds)}
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">remaining</span>
        </div>

        {/* Right: Participants count & End Interview */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] tabular-nums">
              {participants.length} Participant{participants.length === 1 ? '' : 's'}
            </span>
          </div>

          {user?.role !== 'candidate' ? (
            <button
              onClick={() => setIsEvaluationOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white shadow-sm shadow-rose-600/30 transition-colors"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Evaluate & End</span>
            </button>
          ) : (
            <button
              onClick={() => setShowExitConfirm(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 font-semibold text-xs text-slate-300 transition-colors"
            >
              Leave Room
            </button>
          )}
        </div>
      </div>

      {/* Main 3-Column Working Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Video Panel & Participant Cards (Width 22%) */}
        <div className="w-[22%] min-w-[240px] max-w-[320px] h-full hidden md:block">
          {user && (
            <VideoGrid
              currentUserId={user._id}
              currentUserName={user.name}
              currentUserRole={user.role}
              participants={participants}
              socket={socketRef.current}
              interviewId={interviewId}
            />
          )}
        </div>

        {/* CENTER COLUMN: Monaco Code Editor & Terminal Output (Width 48%) */}
        <div className="flex-1 flex flex-col h-full border-r border-slate-800 min-w-0">
          {/* Monaco Editor Upper Half */}
          <div className="flex-1 min-h-0">
            <MonacoEditorPane
              language={language}
              code={code}
              onChange={handleCodeChange}
              onLanguageChange={handleLanguageChange}
              onResetStarter={handleResetStarter}
              remoteEditorName={remoteEditorName}
            />
          </div>

          {/* Terminal / Test Cases Lower Half (fixed height ~230px) */}
          <div className="h-56 min-h-[180px] max-h-72">
            <TerminalOutputPane
              result={executionResult}
              isRunning={isRunning}
              customInput={customInput}
              onCustomInputChange={setCustomInput}
              useCustomInput={useCustomInput}
              onToggleCustomInput={setUseCustomInput}
              sampleTestCases={currentProblem?.testCases?.slice(0, 3) || []}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Tabbed Navigation (Problem Description, Questions, Chat, Notes) (Width 30%) */}
        <div className="w-[30%] min-w-[300px] max-w-[420px] flex flex-col h-full bg-slate-950">
          {/* Tab Selector Header */}
          <div className="flex h-11 items-center justify-around border-b border-slate-800 bg-slate-900/90 px-2 select-none">
            <button
              onClick={() => setActiveRightTab('problem')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                activeRightTab === 'problem'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              <span>Problem</span>
            </button>

            <button
              onClick={() => setActiveRightTab('questions')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                activeRightTab === 'questions'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-emerald-400" />
              <span>Questions</span>
            </button>

            <button
              onClick={() => setActiveRightTab('chat')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                activeRightTab === 'chat'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => setActiveRightTab('notes')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                activeRightTab === 'notes'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-purple-400" />
              <span>Notes</span>
            </button>
          </div>

          {/* Right Pane Active Content */}
          <div className="flex-1 overflow-hidden">
            {activeRightTab === 'problem' && (
              <ProblemDescriptionPane
                problem={currentProblem}
                allProblems={problems}
                selectedProblemId={currentProblemId}
                onSelectProblem={(id) => {
                  setCurrentProblemId(id);
                  const p = problems.find((x) => x._id === id);
                  if (p?.starterCode?.[language]) {
                    handleCodeChange(p.starterCode[language]);
                  }
                }}
              />
            )}

            {activeRightTab === 'questions' && (
              <QuestionNavigator
                questions={interview?.questions || []}
                userRole={user?.role || 'candidate'}
                onAddQuestion={(q) => {
                  setInterview((prev) =>
                    prev ? { ...prev, questions: [...(prev.questions || []), q] } : prev
                  );
                }}
              />
            )}

            {activeRightTab === 'chat' && (
              <ChatPane
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                currentUserId={user?._id || ''}
              />
            )}

            {activeRightTab === 'notes' && (
              <div className="flex h-full flex-col p-4 space-y-2">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Real-time Collaborative Session Notes
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Shared interview notes, architectural trade-offs, follow-ups..."
                  className="w-full flex-1 rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono resize-none leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR (Run Code, Submit Code, Status) */}
      <div className="flex h-14 items-center justify-between border-t border-slate-800 bg-slate-950 px-4 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-mono text-[11px]">Sandboxed Execution Engine Ready</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-xs text-white transition-all disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-white text-white" />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 hover:scale-[1.02]"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Submit Solution</span>
          </button>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Leave Interview Room?</h3>
            <p className="text-xs text-slate-400">
              You can re-enter this interview room at any time while the session is active.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
              >
                Stay
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExit();
                }}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-white"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Modal for Interviewer */}
      {isEvaluationOpen && (
        <EvaluationModal
          isOpen={true}
          onClose={() => setIsEvaluationOpen(false)}
          onSubmit={handleEvaluationSubmit}
          candidateName={interview?.candidateName || 'Candidate'}
          interviewTitle={interview?.title || 'Technical Interview'}
        />
      )}
    </div>
  );
};
