import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ChevronDown, ChevronUp, Layers, Tag, Award } from 'lucide-react';
import { api } from '../../services/api';
import type { InterviewQuestion } from '../../types';

export const QuestionBankView: React.FC = () => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);

  const CATEGORIES = [
    'All',
    'JavaScript',
    'React',
    'Node.js',
    'Database',
    'DSA',
    'System Design',
  ];

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (search) params.search = search;
        const data = await api.questions.list(params);
        setQuestions(data);
      } catch (err) {
        console.error('Failed to load questions', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCategory, search]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
      case 'Medium':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
      case 'Hard':
        return 'text-rose-400 bg-rose-950/60 border-rose-800/60';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Technical Question Bank</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Curated conceptual & architectural interview questions across modern software engineering stacks.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            {questions.length} Questions Cataloged
          </div>
        </div>

        {/* Category Pills & Search */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search topics (closures, fiber, joins)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Question List */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs">
            Loading question repository...
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-slate-900 rounded-2xl border border-slate-800">
            No questions found matching your filter criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => {
              const isExpanded = expandedIds.has(q._id);
              return (
                <div
                  key={q._id}
                  className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden transition-all hover:border-slate-700"
                >
                  <div
                    onClick={() => toggleExpand(q._id)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950/70 border border-indigo-800/60 text-indigo-300">
                          {q.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getDifficultyBadge(
                            q.difficulty
                          )}`}
                        >
                          {q.difficulty}
                        </span>
                        <h3 className="text-xs font-bold text-white">{q.title}</h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{q.question}</p>
                    </div>

                    <div className="text-slate-400 hover:text-white p-1">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {/* Expanded Answer Guide Drawer */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 bg-slate-950/60">
                      <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-2 text-xs">
                        <div className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
                          Interviewer Answer Guide & Key Concepts
                        </div>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {q.answerGuide}
                        </p>
                        {q.tags && q.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
                            <Tag className="h-3 w-3 text-slate-500" />
                            <div className="flex flex-wrap gap-1">
                              {q.tags.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
