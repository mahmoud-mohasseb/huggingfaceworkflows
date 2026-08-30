'use client';

import React, { useState } from 'react';
import { Key, ExternalLink, ShieldCheck, ArrowRight, Database, Zap, CheckCircle2, Loader2, Info } from 'lucide-react';
import { useAuthStore } from '../../../lib/store/useAuthStore';

export default function TokenLoginPage() {
  const { loginWithToken } = useAuthStore();
  const [tokenInput, setTokenInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    const result = await loginWithToken(tokenInput.trim());

    setIsLoading(false);

    if (result.success) {
      window.location.href = '/canvas/wf_telegram_ai_bot';
    } else {
      setErrorMessage(result.error || 'Invalid Hugging Face Token');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-7">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-violet-600 p-[1.5px] shadow-xl shadow-amber-500/20 mx-auto">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="text-xl font-black bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                HF
              </span>
            </div>
          </div>

          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 via-slate-200 to-violet-300 bg-clip-text text-transparent">
            Hugging Face Access Token Login
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Connect your Hugging Face account to persist private workflow datasets and execute ZeroGPU Spaces.
          </p>
        </div>

        {/* Step-by-Step Onboarding Guide */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
          <div className="font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
            <Info className="w-4 h-4 text-amber-400" />
            <span>How to get your Hugging Face Token:</span>
          </div>

          <ol className="space-y-2 text-[11px] text-slate-300 list-decimal list-inside leading-relaxed">
            <li>
              Open <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1 font-mono"
              >
                huggingface.co/settings/tokens <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>Click <strong className="text-white">Create new token</strong></li>
            <li>Select token role: <strong className="text-emerald-400">Write</strong> (or Repo write access)</li>
            <li>Copy and paste your token below (<code className="text-violet-300 font-mono">hf_...</code>)</li>
          </ol>
        </div>

        {/* Token Input Form */}
        <form onSubmit={handleTokenSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-violet-400" /> User Access Token
              </span>
              <span className="text-[10px] text-slate-500 font-mono">write permission required</span>
            </label>
            <input
              type="password"
              placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              autoFocus
              className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/60 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none transition-colors shadow-inner"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 font-mono leading-tight">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !tokenInput.trim()}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-violet-600 hover:from-amber-400 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Validating with Hugging Face API...</span>
              </>
            ) : (
              <>
                <span>Sign in & Auto-Provision Dataset</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </form>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
            <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Zero-DB Storage</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>ZeroGPU Execution</span>
          </div>
        </div>
      </div>
    </div>
  );
}
