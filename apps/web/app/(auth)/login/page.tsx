'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Key, ExternalLink, ShieldCheck, ArrowRight, Database, Zap,
  CheckCircle2, Loader2, Info, Sparkles, BookOpen, Bot, Image as ImageIcon,
  Video, Music, Mic, Layers, Cpu, Code2, HelpCircle
} from 'lucide-react';
import { useAuthStore } from '../../../lib/store/useAuthStore';
import { WorkflowTemplatesList } from '../../../lib/templates';

export default function TokenLoginPage() {
  const { loginWithToken, setAuthUser } = useAuthStore();
  const [tokenInput, setTokenInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTemplateHint, setSelectedTemplateHint] = useState<string | null>('tpl_hf_free_all_ai');

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

  const handleEnterDemoMode = () => {
    // Instantly authenticate with demo user and proceed to canvas
    setAuthUser(
      {
        username: 'mahmoud-mohasseb',
        fullname: 'Mahmoud Mohasseb',
        email: 'user@huggingface.co',
        avatarUrl: 'https://huggingface.co/front/assets/huggingface_logo-noborder.svg',
        creditBalance: 1250,
        datasetPath: 'datasets/mahmoud-mohasseb/hf-workflow-data',
      },
      'hf_demo_token_authenticated'
    );
    window.location.href = '/canvas/wf_telegram_ai_bot';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row items-stretch justify-center p-4 lg:p-10 relative overflow-x-hidden select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 my-auto">
        {/* Left Column: Login Card & Token Instructions (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Header / Brand */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-violet-600 p-[1.5px] shadow-xl shadow-amber-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <span className="text-xl font-black bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                    🤗
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <span>HF WORKFLOW</span>
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    Studio
                  </span>
                </h1>
                <p className="text-xs text-slate-400">Visual AI Canvas & Autonomous OpenClaw Hub</p>
              </div>
            </div>

            {/* Token Sign In Form */}
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" /> Hugging Face Access Token
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Write role required</span>
                </label>
                <input
                  type="password"
                  placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
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
                    <span>Validating Token with Hugging Face...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in with Token & Connect Hub</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>
            </form>

            {/* 1-Click Fast Instant Demo Mode */}
            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleEnterDemoMode}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-violet-500/50 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Try Instant Demo & Explore Canvas Studio</span>
              </button>
            </div>

            {/* Step-by-Step Onboarding Token Guide */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span>How to get your Free Hugging Face Token:</span>
              </div>

              <ol className="space-y-1.5 text-[11px] text-slate-300 list-decimal list-inside leading-relaxed">
                <li>
                  Open{' '}
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1 font-mono"
                  >
                    huggingface.co/settings/tokens <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Click <strong className="text-white">Create new token</strong></li>
                <li>Select token role: <strong className="text-emerald-400">Write</strong> (with Inference & Repo scope)</li>
                <li>Copy and paste your token above (<code className="text-violet-300 font-mono">hf_...</code>)</li>
              </ol>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Zero Hosting Fees • 100% Free AI</span>
            <span>v2.4.0 Production</span>
          </div>
        </div>

        {/* Right Column: Platform Capabilities & Template Hints (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Header: What is HF Workflow? */}
            <div>
              <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-wider bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
                Platform Architecture & Services
              </span>
              <h2 className="text-xl font-bold text-white mt-2">
                What does HF WORKFLOW do?
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                HF WORKFLOW is an open-source visual DAG canvas that connects <strong>Telegram bots, WhatsApp webhooks, free Hugging Face AI models, autonomous OpenClaw agents, and multi-cloud storage buckets</strong> into automated execution pipelines with zero database hosting fees.
              </p>
            </div>

            {/* 3 Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                  🤖
                </div>
                <div className="font-bold text-xs text-slate-200">100% Free AI Models</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Llama 3.3 70B, DeepSeek R1, FLUX.1 image art, ZeroScope video & MusicGen audio.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-xs">
                  🐾
                </div>
                <div className="font-bold text-xs text-slate-200">OpenClaw Agent</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Autonomous ReAct planning with live Web Search, Python sandbox & Hub memory.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  🪣
                </div>
                <div className="font-bold text-xs text-slate-200">Dataset Persistence</div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Workflows commit to <code className="text-emerald-300 font-mono">datasets/username/data</code> with Git history.
                </p>
              </div>
            </div>

            {/* Template Directory & Hints */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ready-to-Use Template Directory & Hints ({WorkflowTemplatesList.length})</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500">Click any card to inspect hint</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
                {WorkflowTemplatesList.map((tpl) => {
                  const isSelected = selectedTemplateHint === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateHint(tpl.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-violet-950/40 border-violet-500/80 shadow-md shadow-violet-950/50'
                          : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded">
                          {tpl.badgeText}
                        </span>
                        <span className="text-[9px] font-mono text-amber-400 font-bold">100% Free</span>
                      </div>
                      <div className="text-xs font-bold text-slate-100 truncate">{tpl.name}</div>
                      <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                        {tpl.description}
                      </p>
                      {isSelected && tpl.hfGuide && (
                        <div className="mt-1 pt-1.5 border-t border-violet-500/20 text-[10px] text-amber-300 font-mono leading-tight">
                          💡 Hint: {tpl.hfGuide.summary}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
            <span>Ready to build your first AI pipeline?</span>
            <button
              onClick={handleEnterDemoMode}
              className="text-violet-400 hover:text-violet-200 font-bold flex items-center gap-1 transition-colors"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
