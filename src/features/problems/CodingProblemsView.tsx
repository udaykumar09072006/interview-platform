import React, { useState, useEffect } from 'react';
import { Code, BookOpen, Clock, HardDrive, Search, Filter, Play } from 'lucide-react';
import { api } from '../../services/api';
import type { CodingProblem } from '../../types';

interface CodingProblemsViewProps {
  onSelectProblem?: (prob: CodingProblem) => void;
}

export const CodingProblemsView: React.FC<CodingProblemsViewProps> = ({ onSelectProblem }) => {
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedProb, setSelectedProb] = useState<CodingProblem | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.problems.list({ difficulty: difficultyFilter, search });
        setProblems(data);
        if (data.length > 0 && !selectedProb) {
          setSelectedProb(data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [difficultyFilter, search]);

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-950/60 border-emerald-800 text-emerald-400';
      case 'Medium':
        return 'bg-amber-950/60 border-amber-800 text-amber-400';
      case 'Hard':
        return 'bg-rose-950/60 border-rose-800 text-rose-400';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Algorithm & Coding Problem Repository</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Curated LeetCode/HackerRank style technical problems with test cases and starter templates across 5 languages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
              {problems.length} Problems Available
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search problems by name or concept..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-400">Difficulty:</span>
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  difficultyFilter === diff
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Main 2-column browser */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Problem List */}
          <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/80 overflow-hidden max-h-[700px] overflow-y-auto">
            {problems.map((prob) => {
              const isSelected = selectedProb?._id === prob._id;
              return (
                <div
                  key={prob._id}
                  onClick={() => setSelectedProb(prob)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-950/40 border-l-4 border-indigo-500' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white">{prob.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getDifficultyBadge(
                        prob.difficulty
                      )}`}
                    >
                      {prob.difficulty}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {prob.description}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-2">
                    <span>{prob.timeLimitMs}ms limit</span>
                    <span>·</span>
                    <span>{prob.testCases?.length || 0} Test Cases</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Problem Detail View */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            {selectedProb ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white">{selectedProb.title}</h2>
                    <div className="flex items-center gap-3 text-slate-400 mt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getDifficultyBadge(selectedProb.difficulty)}`}>
                        {selectedProb.difficulty}
                      </span>
                      <span>Time Limit: {selectedProb.timeLimitMs}ms</span>
                      <span>Memory: {selectedProb.memoryLimitMb}MB</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[11px] mb-1">
                    Problem Description
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedProb.description}
                  </div>
                </div>

                {selectedProb.examples && (
                  <div>
                    <div className="text-slate-400 font-semibold uppercase text-[11px] mb-1">
                      Examples
                    </div>
                    <div className="space-y-2">
                      {selectedProb.examples.map((ex, i) => (
                        <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                          <div>
                            <span className="text-slate-400">Input: </span>
                            <span className="text-white">{ex.input}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Output: </span>
                            <span className="text-emerald-400">{ex.output}</span>
                          </div>
                          {ex.explanation && (
                            <div className="text-slate-500 font-sans pt-1">
                              Explanation: {ex.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProb.constraints && (
                  <div>
                    <div className="text-slate-400 font-semibold uppercase text-[11px] mb-1">
                      Constraints
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px]">
                      {selectedProb.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                Select a problem to view full specifications.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
