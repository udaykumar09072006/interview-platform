import React, { useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { RotateCcw, ZoomIn, ZoomOut, Check, Sparkles } from 'lucide-react';

interface MonacoEditorPaneProps {
  language: string;
  code: string;
  onChange: (value: string) => void;
  onLanguageChange: (language: string) => void;
  onResetStarter: () => void;
  remoteEditorName?: string;
  isReadOnly?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
];

export const MonacoEditorPane: React.FC<MonacoEditorPaneProps> = ({
  language,
  code,
  onChange,
  onLanguageChange,
  onResetStarter,
  remoteEditorName,
  isReadOnly = false,
}) => {
  const [fontSize, setFontSize] = useState<number>(14);
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const monacoLanguage = language === 'cpp' ? 'cpp' : language;

  return (
    <div className="flex h-full flex-col bg-slate-950 overflow-hidden">
      {/* Editor Control Toolbar */}
      <div className="flex h-11 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-3 py-1.5 select-none">
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-medium text-slate-400">Language:</label>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-mono font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Remote collaboration indicator */}
          {remoteEditorName && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[11px] text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
              <span>{remoteEditorName} is coding</span>
            </div>
          )}
        </div>

        {/* Right tools: Font sizing & reset */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFontSize((s) => Math.max(11, s - 1))}
            className="h-7 w-7 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Decrease font size"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 w-6 text-center tabular-nums">
            {fontSize}
          </span>
          <button
            onClick={() => setFontSize((s) => Math.min(22, s + 1))}
            className="h-7 w-7 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Increase font size"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={onResetStarter}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Reset code to initial boilerplate"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full relative">
        <Editor
          height="100%"
          language={monacoLanguage}
          value={code}
          theme="vs-dark"
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          options={{
            readOnly: isReadOnly,
            fontSize,
            fontFamily: "'JetBrains Mono', Consolas, monospace",
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            renderLineHighlight: 'all',
            padding: { top: 12, bottom: 12 },
            cursorBlinking: 'smooth',
            smoothScrolling: true,
          }}
          loading={
            <div className="h-full w-full flex items-center justify-center bg-slate-950 text-slate-500 text-xs font-mono">
              Loading Monaco Editor environment...
            </div>
          }
        />
      </div>
    </div>
  );
};
