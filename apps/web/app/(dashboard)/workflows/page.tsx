'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, Plus, Play, Database, Zap, ArrowRight, ShieldCheck,
  BookOpen, ExternalLink, ChevronDown, ChevronUp, Bot, Image as ImageIcon,
  Video, Music, Mic, Layers, CheckCircle2
} from 'lucide-react';
import { WorkflowTemplatesList } from '../../../lib/templates';

export default function WorkflowsDashboard() {
  const [expandedTplId, setExpandedTplId] = useState<string | null>(null);

  const workflows = [
    {
      id: 'wf_telegram_ai_bot',
      name: 'Telegram AI Customer Bot Workflow',
      status: 'active',
      dataset: 'datasets/mahmoud-mohasseb/hf-workflow-data',
      commitHash: '8f3a92b',
      nodeCount: 4,
      updatedAt: '10 mins ago',
      category: 'Customer Support',
    },
    {
      id: 'wf_whatsapp_flux',
      name: 'WhatsApp FLUX.1 Image Gen Bot',
      status: 'active',
      dataset: 'datasets/mahmoud-mohasseb/hf-workflow-data',
      commitHash: '4e712a0',
      nodeCount: 3,
      updatedAt: '2 hours ago',
      category: 'Media Generation',
    },
  ];

  const toggleTpl = (id: string) => {
    setExpandedTplId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-8 max-w-7xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Workflows Studio & Template Hub</h1>
            <p className="text-xs text-slate-400">Manage Hugging Face connected AI workflow pipelines with step-by-step A-to-Z instructions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/guide"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold rounded-xl text-sm flex items-center gap-2 transition-all"
          >
            <BookOpen className="w-4 h-4 text-amber-400" /> HF Master Guide
          </Link>

          <Link
            href="/canvas/wf_telegram_ai_bot"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Open Canvas Studio
          </Link>
        </div>
      </div>

      {/* Section 1: Active Saved Workflows */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <span>Active Saved Workflows</span>
          <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
            {workflows.length}
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-violet-500/50 rounded-2xl p-6 transition-all shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-wider bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                    {wf.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-violet-300 transition-colors mt-2">
                    {wf.name}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {wf.status}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Database className="w-3.5 h-3.5 text-violet-400" /> Hugging Face Dataset Sync
                  </span>
                  <span className="text-violet-300 font-semibold">#{wf.commitHash}</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{wf.dataset}</p>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                <span>{wf.nodeCount} active nodes • Updated {wf.updatedAt}</span>
                <Link
                  href={`/canvas/${wf.id}`}
                  className="text-violet-400 group-hover:text-violet-300 font-semibold flex items-center gap-1 hover:underline"
                >
                  Launch Visual Editor <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Ready-to-Use Templates with A-to-Z Guides */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Hugging Face Ready-to-Use Templates & A-to-Z Step Guides</span>
            </h2>
            <p className="text-xs text-slate-400">
              Each template contains full multi-modal Hugging Face instructions for deployment, webhook registration, and dataset sync
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-bold">
            {WorkflowTemplatesList.length} Templates Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {WorkflowTemplatesList.map((tpl) => {
            const isExpanded = expandedTplId === tpl.id;
            const guide = tpl.hfGuide;

            return (
              <div
                key={tpl.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-violet-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-violet-500/15 border border-violet-500/25 text-violet-300 rounded-full text-[10px] font-mono font-bold">
                      {tpl.badgeText}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      <Zap className="w-3 h-3 fill-amber-400" /> Free Tier
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100">{tpl.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{tpl.description}</p>

                  {/* Hugging Face A-to-Z Guide Button */}
                  {guide && (
                    <button
                      type="button"
                      onClick={() => toggleTpl(tpl.id)}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-[11px] font-semibold transition-all"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>🤗</span>
                        <span>HF A-to-Z Instructions</span>
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}

                  {/* Expanded Instructions Box */}
                  {isExpanded && guide && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2 text-xs animate-in fade-in duration-150">
                      <div className="text-[10px] font-mono text-amber-300 font-bold">
                        Hardware: {guide.hardwareTier}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{guide.summary}</p>
                      <div className="space-y-1 pt-1 border-t border-white/5">
                        <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                          Step-by-Step Instructions:
                        </div>
                        <ol className="space-y-1 text-[10px] text-slate-300">
                          {guide.stepByStep.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-1 leading-relaxed">
                              <span className="text-amber-400 font-bold mt-0.5">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href={`/canvas/wf_telegram_ai_bot?template=${encodeURIComponent(tpl.id)}`}
                  className="w-full py-2 px-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-violet-950/50"
                >
                  <span>Load into Canvas Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
