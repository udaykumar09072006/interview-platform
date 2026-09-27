import React, { useState } from 'react';
import { Key, ShieldCheck, AlertCircle, ExternalLink, X, Check, Copy } from 'lucide-react';
import { getClerkPublishableKey, setClerkPublishableKey, clearClerkPublishableKey, isClerkKeyValid } from '../services/clerk';

interface ClerkConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const ClerkConfigModal: React.FC<ClerkConfigModalProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const currentKey = getClerkPublishableKey();
  const [inputKey, setInputKey] = useState(currentKey);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = inputKey.trim();
    if (!trimmed) {
      clearClerkPublishableKey();
      setSaveSuccess(true);
      setTimeout(() => {
        onKeyUpdated();
        onClose();
      }, 600);
      return;
    }

    if (!isClerkKeyValid(trimmed)) {
      setError('Invalid Clerk Publishable Key format. It should start with "pk_test_" or "pk_live_".');
      return;
    }

    setClerkPublishableKey(trimmed);
    setSaveSuccess(true);
    setTimeout(() => {
      onKeyUpdated();
      onClose();
    }, 600);
  };

  const handleClear = () => {
    clearClerkPublishableKey();
    setInputKey('');
    setSaveSuccess(true);
    setTimeout(() => {
      onKeyUpdated();
      onClose();
    }, 600);
  };

  const handleCopyEnv = () => {
    const text = `VITE_CLERK_PUBLISHABLE_KEY=${inputKey || 'pk_test_...'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLive = isClerkKeyValid(currentKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Clerk Authentication Settings</h2>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isLive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {isLive ? 'Live Clerk Mode' : 'Sandbox Ready'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your Clerk publishable key for user authentication and session management.
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

        {saveSuccess && (
          <div className="my-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Clerk configuration updated successfully! Refreshing session...</span>
          </div>
        )}

        {error && (
          <div className="my-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Clerk Publishable Key (<code className="text-indigo-400">VITE_CLERK_PUBLISHABLE_KEY</code>)
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="pk_test_... or pk_live_..."
                className="w-full font-mono text-xs rounded-lg bg-slate-950 border border-slate-800 px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
              <span>You can get this from your Clerk Dashboard under API Keys.</span>
              <a
                href="https://dashboard.clerk.com"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-medium"
              >
                Clerk Dashboard <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                How Intervexa + Clerk Works:
              </span>
              <button
                type="button"
                onClick={handleCopyEnv}
                className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 font-mono transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied .env' : 'Copy for .env'}
              </button>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
              <li>
                Supports <strong className="text-slate-200">Google SSO, GitHub, Email Magic Links, Passwords</strong> via Clerk.
              </li>
              <li>
                Syncs candidate and interviewer profiles into Intervexa with role-based routing.
              </li>
              <li>
                Allows quick persona switching so you can test interview rooms, submissions, and feedback effortlessly.
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-2">
            {isLive ? (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-colors"
              >
                Disconnect Clerk Key
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                Save & Connect
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
