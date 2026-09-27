import React, { useState } from 'react';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  Layers,
  ChevronRight,
} from 'lucide-react';
import type { ExecutionResult } from '../types';

interface TerminalOutputPaneProps {
  result: ExecutionResult | null;
  isRunning: boolean;
  customInput: string;
  onCustomInputChange: (val: string) => void;
  useCustomInput: boolean;
  onToggleCustomInput: (val: boolean) => void;
  sampleTestCases: { input: string; expectedOutput: string }[];
}

export const TerminalOutputPane: React.FC<TerminalOutputPaneProps> = ({
  result,
  isRunning,
  customInput,
  onCustomInputChange,
  useCustomInput,
  onToggleCustomInput,
  sampleTestCases,
}) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'custom' | 'console'>('tests');
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);

  return (
    <div className="flex h-full flex-col bg-slate-950 border-t border-slate-800 select-none text-xs">
      {/* Tab Header & Telemetry Bar */}
      <div className="flex h-10 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'tests'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span>Test Cases</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'custom'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5 text-amber-400" />
            <span>Custom Input</span>
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'console'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Raw Console</span>
          </button>
        </div>

        {/* Execution Metrics */}
        {result && !isRunning && (
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-1">
              {result.status === 'Accepted' ? (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Accepted
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-400 font-semibold">
                  <XCircle className="h-3.5 w-3.5" />
                  {result.status}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="h-3 w-3" />
              <span className="tabular-nums">{result.runtimeMs} ms</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <Cpu className="h-3 w-3" />
              <span className="tabular-nums">{(result.memoryKb / 1024).toFixed(1)} MB</span>
            </div>

            <div className="text-slate-300">
              Passed:{' '}
              <span className="font-semibold text-white tabular-nums">
                {result.testCasesPassed} / {result.totalTestCases}
              </span>
            </div>
          </div>
        )}

        {isRunning && (
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
            <span>Compiling & executing sandboxed runner...</span>
          </div>
        )}
      </div>

      {/* Main Tab Body */}
      <div className="flex-1 overflow-y-auto p-3 font-mono">
        {activeTab === 'tests' && (
          <div className="h-full flex flex-col gap-2">
            {/* Test Case Selector Buttons */}
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800/80">
              {(result?.testResults && result.testResults.length > 0
                ? result.testResults
                : sampleTestCases
              ).map((tc, idx) => {
                const isPassed = 'passed' in tc ? tc.passed : null;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCaseIdx(idx)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
                      selectedCaseIdx === idx
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {isPassed === true && <CheckCircle2 className="h-3 w-3 text-emerald-300" />}
                    {isPassed === false && <XCircle className="h-3 w-3 text-rose-300" />}
                    <span>Case {idx + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Test Case Details */}
            {result?.testResults && result.testResults[selectedCaseIdx] ? (
              <div className="space-y-2 mt-1">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Input
                  </div>
                  <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 text-xs overflow-x-auto">
                    {result.testResults[selectedCaseIdx].input}
                  </pre>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                      Expected Output
                    </div>
                    <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-400 text-xs overflow-x-auto">
                      {result.testResults[selectedCaseIdx].expectedOutput || 'N/A'}
                    </pre>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                      Actual Output
                    </div>
                    <pre
                      className={`p-2 rounded border text-xs overflow-x-auto ${
                        result.testResults[selectedCaseIdx].passed
                          ? 'bg-slate-900 border-slate-800 text-emerald-400'
                          : 'bg-rose-950/30 border-rose-900 text-rose-300'
                      }`}
                    >
                      {result.testResults[selectedCaseIdx].actualOutput}
                    </pre>
                  </div>
                </div>

                {result.testResults[selectedCaseIdx].error && (
                  <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                    <div className="font-semibold flex items-center gap-1.5 mb-1 text-rose-200">
                      <AlertTriangle className="h-4 w-4" />
                      Runtime Exception
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-[11px]">
                      {result.testResults[selectedCaseIdx].error}
                    </pre>
                  </div>
                )}
              </div>
            ) : sampleTestCases[selectedCaseIdx] ? (
              <div className="space-y-2 mt-1">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Sample Input
                  </div>
                  <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 text-xs overflow-x-auto">
                    {sampleTestCases[selectedCaseIdx].input}
                  </pre>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Expected Output
                  </div>
                  <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-400 text-xs overflow-x-auto">
                    {sampleTestCases[selectedCaseIdx].expectedOutput}
                  </pre>
                </div>
                <div className="text-slate-500 text-[11px] italic mt-2">
                  Click &quot;Run Code&quot; below to execute your code against these test inputs.
                </div>
              </div>
            ) : (
              <div className="text-slate-500 p-4">No test cases configured for this problem.</div>
            )}
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="h-full flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                Custom Execution Arguments (JSON or Newline Separated)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableCustom"
                  checked={useCustomInput}
                  onChange={(e) => onToggleCustomInput(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="enableCustom" className="text-slate-300 text-[11px] cursor-pointer">
                  Use for &quot;Run Code&quot;
                </label>
              </div>
            </div>
            <textarea
              value={customInput}
              onChange={(e) => onCustomInputChange(e.target.value)}
              placeholder="e.g.&#10;[2, 7, 11, 15]&#10;9"
              rows={4}
              className="w-full flex-1 rounded bg-slate-900 border border-slate-800 p-2.5 font-mono text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}

        {activeTab === 'console' && (
          <div className="h-full">
            <pre className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono h-full overflow-y-auto whitespace-pre-wrap">
              {result?.output ||
                (result?.compilationError && `Compilation Error:\n${result.compilationError}`) ||
                'Standard stdout console is clear. Call console.log(...) or print(...) to view outputs here.'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
