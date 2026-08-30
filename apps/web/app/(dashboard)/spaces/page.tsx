'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles, Search, Cpu, Database, Folder, ExternalLink, ArrowLeft,
  CheckCircle2, Bot, Globe, Terminal, Shield, Play, RefreshCw, Copy, Check,
  Layers, Code2, Zap, HelpCircle
} from 'lucide-react';
import { SpaceCard } from '../../../components/spaces/SpaceCard';
import { SpacePreviewModal } from '../../../components/spaces/SpacePreviewModal';
import { HFSpaceInfo } from '../../../../../packages/shared-types';
import { useAuthStore } from '../../../lib/store/useAuthStore';
import { executeOpenClawAgentNode } from '../../../lib/engine/nodes/openclawAgent';
import { HF_MODEL_CATALOG, HFModelGuide } from '../../../lib/huggingface/providers';

export default function SpacesExplorerPage() {
  const [spaces, setSpaces] = useState<HFSpaceInfo[]>([]);
  const [userModels, setUserModels] = useState<any[]>([]);
  const [userDatasets, setUserDatasets] = useState<any[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewSpace, setPreviewSpace] = useState<HFSpaceInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'openclaw' | 'models_guide' | 'all' | 'account_spaces' | 'account_models' | 'account_datasets'>('openclaw');
  const [modelModalityFilter, setModelModalityFilter] = useState<'all' | 'text' | 'image' | 'video' | 'audio' | 'speech' | 'agent'>('all');

  // OpenClaw Interactive Simulator State
  const [simTask, setSimTask] = useState('Search latest AI research in 2025 and write a Python summary script');
  const [simRole, setSimRole] = useState('general_assistant');
  const [simRunning, setSimRunning] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const { hfToken } = useAuthStore();

  useEffect(() => {
    async function loadAssets() {
      try {
        const queryToken = hfToken || '';
        const res = await fetch(`/api/spaces?category=${selectedCategory}&q=${searchQuery}&token=${encodeURIComponent(queryToken)}`);
        const json = await res.json();

        setSpaces(json.spaces || []);
        setUserModels(json.userModels || []);
        setUserDatasets(json.userDatasets || []);
        setUsername(json.username || null);
      } catch (err) {
        console.error('Failed loading HF assets:', err);
      }
    }
    loadAssets();
  }, [selectedCategory, searchQuery, hfToken]);

  const handleCreateNode = (space: HFSpaceInfo) => {
    window.location.href = `/canvas/wf_telegram_ai_bot?add_space=${encodeURIComponent(space.id)}`;
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const runOpenClawSimulation = async () => {
    setSimRunning(true);
    setSimResult(null);
    try {
      const res = await executeOpenClawAgentNode(simTask, {
        agent_role: simRole,
        enable_web_search: true,
        enable_python_interpreter: true,
        enable_dataset_memory: true,
        hf_space_url: 'openclaw/openclaw',
        hf_token: hfToken || undefined,
      });
      setSimResult(res);
    } catch (err: any) {
      setSimResult({ error: err.message || 'Execution error' });
    } finally {
      setSimRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto space-y-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/canvas/wf_telegram_ai_bot"
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
              <span>🐾</span> OpenClaw Free AI Agent & Hugging Face Spaces Hub
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {username ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Logged in as @{username} — Showing OpenClaw Free Agent Runtime & Hub Assets
                </span>
              ) : (
                'Deploy free autonomous AI agents on Hugging Face Spaces (2 vCPU + 16GB RAM) and build visual workflows'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://huggingface.co/spaces/openclaw/openclaw?duplicate=true"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-orange-900/40 transition-all flex items-center gap-1.5"
          >
            <span>🐾 Duplicate OpenClaw Space</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            href="/canvas/wf_telegram_ai_bot"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-violet-600/30 transition-all"
          >
            Open Workflow Studio
          </Link>
        </div>
      </div>

      {/* Main Asset Type Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('openclaw')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'openclaw'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/40 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>🐾</span>
          <span>OpenClaw Free Agent Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('models_guide')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'models_guide'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/40 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>AI Models Setup Guides ({HF_MODEL_CATALOG.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All ZeroGPU Spaces ({spaces.length})</span>
        </button>

        {username && (
          <>
            <button
              onClick={() => setActiveTab('account_models')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'account_models'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>My Account Models ({userModels.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('account_datasets')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'account_datasets'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>My Storage Buckets & Datasets ({userDatasets.length})</span>
            </button>
          </>
        )}
      </div>

      {/* ══ TAB 1: OPENCLAW FREE AI AGENT HUB & STEP-BY-STEP GUIDE ════════ */}
      {activeTab === 'openclaw' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-950/40 via-slate-900/90 to-amber-950/30 p-8 shadow-2xl">
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-mono font-bold">
                <span>🐾 OPENCLAW AUTONOMOUS RUNTIME</span>
                <span>•</span>
                <span>100% FREE ON HUGGING FACE SPACES</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white">
                Autonomous Personal AI Agent with Multi-Step Tool Calling & Hub Memory
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                OpenClaw is an open-source autonomous agent that runs on Hugging Face Spaces (free 2 vCPU + 16 GB RAM). It plans multi-step actions, searches the live web, executes sandboxed Python code, and synchronizes long-term conversation memory directly to your private Hub dataset.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="https://huggingface.co/spaces/openclaw/openclaw?duplicate=true"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-950/60 transition-all flex items-center gap-2"
                >
                  <span>🐾 1-Click Duplicate OpenClaw Space</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => (window.location.href = '/canvas/wf_telegram_ai_bot?add_openclaw=true')}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Bot className="w-3.5 h-3.5 text-orange-400" />
                  <span>Add OpenClaw Node to Canvas</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4-Step User Setup Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Duplicate Free Space',
                desc: 'Click "Duplicate OpenClaw Space" on Hugging Face. Select the Free 2 vCPU + 16 GB RAM tier ($0/month).',
                badge: '100% Free',
                icon: <Sparkles className="w-4 h-4 text-orange-400" />,
              },
              {
                step: '02',
                title: 'Set Environment Secrets',
                desc: 'In Space Settings → Repository Secrets, add HF_TOKEN and optional TELEGRAM_BOT_TOKEN for direct messaging.',
                badge: 'HF Secrets',
                icon: <Shield className="w-4 h-4 text-amber-400" />,
              },
              {
                step: '03',
                title: 'Connect Visual Node',
                desc: 'In HF Workflow Studio, drag the "OpenClaw Autonomous AI Agent" node onto your canvas and link to Telegram/WhatsApp.',
                badge: 'Visual DAG',
                icon: <Layers className="w-4 h-4 text-cyan-400" />,
              },
              {
                step: '04',
                title: 'Autonomous Tool Use',
                desc: 'Incoming prompts trigger ReAct planning, live Web Search, Python execution, and Hub Dataset memory sync.',
                badge: 'Live ReAct',
                icon: <Zap className="w-4 h-4 text-emerald-400" />,
              },
            ].map((s) => (
              <div key={s.step} className="p-5 rounded-2xl bg-slate-900/80 border border-white/[0.08] space-y-2.5 backdrop-blur-xl relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
                    STEP {s.step}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{s.badge}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {s.icon}
                  <h3 className="font-bold text-sm text-white">{s.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Interactive OpenClaw Simulator Terminal */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-orange-500/30 space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🐾</span>
                  <h3 className="font-bold text-base text-white">Interactive OpenClaw ReAct Simulator</h3>
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-mono font-bold border border-orange-500/30">
                    Live Testing
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Test how OpenClaw analyzes tasks, invokes tools (Web Search, Python REPL, Memory), and returns solutions
                </p>
              </div>

              {/* Role Picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Agent Role:</span>
                <select
                  value={simRole}
                  onChange={(e) => setSimRole(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-orange-500"
                >
                  <option value="general_assistant">Personal Assistant</option>
                  <option value="coding_developer">Python & Code Developer</option>
                  <option value="deep_researcher">Autonomous Researcher</option>
                  <option value="customer_support">Customer Support Agent</option>
                </select>
              </div>
            </div>

            {/* Input prompt */}
            <div className="flex gap-2">
              <input
                type="text"
                value={simTask}
                onChange={(e) => setSimTask(e.target.value)}
                placeholder="Assign any task to OpenClaw..."
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={runOpenClawSimulation}
                disabled={simRunning}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-orange-950/60 shrink-0"
              >
                {simRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{simRunning ? 'Executing…' : 'Run Agent Task'}</span>
              </button>
            </div>

            {/* Simulation Results Output */}
            {simResult && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-orange-500/30 space-y-3 text-xs">
                <div className="flex items-center justify-between text-[11px] font-mono text-orange-300">
                  <span>Status: ✅ {simResult.status} ({simResult.spaceUsed})</span>
                  <span>Tool Calls: {simResult.toolCalls?.length || 0}</span>
                </div>

                {/* ReAct Thought Trace */}
                {simResult.thoughtProcess && (
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 font-mono text-[11px] text-amber-200/90 whitespace-pre-wrap leading-relaxed">
                    <span className="font-bold text-amber-300 block mb-1 text-[10px] uppercase">ReAct Thought Trace:</span>
                    {simResult.thoughtProcess}
                  </div>
                )}

                {/* Tool Executions Chips */}
                {simResult.toolCalls && simResult.toolCalls.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Executed Tool Actions:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {simResult.toolCalls.map((tc: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-white/5 space-y-1 font-mono text-[11px]">
                          <div className="flex items-center justify-between text-orange-300 font-bold">
                            <span>🛠️ {tc.tool}</span>
                            <span className="text-[9px] text-slate-500">{tc.timestamp.slice(11, 19)}</span>
                          </div>
                          <div className="text-slate-400 truncate text-[10px]">Input: {tc.input}</div>
                          <div className="text-emerald-300 text-[10px]">Output: {tc.output}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agent Response */}
                {simResult.agentResponse && (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-slate-100 font-sans leading-relaxed">
                    <span className="font-bold text-emerald-300 block mb-1 text-[10px] uppercase">Final Agent Output:</span>
                    <div className="whitespace-pre-wrap">{simResult.agentResponse}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ TAB 2: AI MODELS CONFIGURATION GUIDES (ALL MODALITIES) ══════ */}
      {activeTab === 'models_guide' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-violet-950/30 p-8 shadow-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
              <span>🤗 HUGGING FACE MODEL DIRECTORY & SETUP INSTRUCTIONS</span>
              <span>•</span>
              <span>100% FREE SERVERLESS & ZEROGPU</span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              How to Configure & Use Every AI Model in Your Workflows
            </h2>

            <p className="text-xs lg:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Every model hosted on Hugging Face can be integrated directly into your visual DAG pipelines. Follow the step-by-step instructions below to verify licenses, configure hyperparameters, bind template variables, and deploy multi-modal workflows with zero hosting costs.
            </p>

            {/* Modality Filter Pills */}
            <div className="flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: `All Models (${HF_MODEL_CATALOG.length})`, icon: '🌟' },
                { id: 'text', label: 'Text & LLMs', icon: '💬' },
                { id: 'image', label: 'Image Gen', icon: '🎨' },
                { id: 'video', label: 'Video Gen', icon: '🎥' },
                { id: 'audio', label: 'Music & Audio', icon: '🎵' },
                { id: 'speech', label: 'Speech (Whisper)', icon: '🎙️' },
                { id: 'agent', label: 'Autonomous Agents', icon: '🐾' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setModelModalityFilter(pill.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    modelModalityFilter === pill.id
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  <span>{pill.icon}</span>
                  <span>{pill.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {HF_MODEL_CATALOG.filter((m) =>
              (modelModalityFilter === 'all' || m.modality === modelModalityFilter) &&
              (searchQuery === '' || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.id.toLowerCase().includes(searchQuery.toLowerCase()))
            ).map((model) => (
              <div
                key={model.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-violet-500/50 rounded-3xl p-6 shadow-xl transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                          {model.badge}
                        </span>
                        {model.isGated ? (
                          <span className="text-[10px] font-mono font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                            Gated • Free Acknowledge
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            100% Open Access
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-100 mt-2">{model.name}</h3>
                      <div className="text-xs text-violet-300 font-mono mt-0.5">{model.id}</div>
                    </div>

                    <a
                      href={model.hfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors shrink-0"
                      title="Open on Hugging Face Hub"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Summary & Endpoint */}
                  <p className="text-xs text-slate-300 leading-relaxed">{model.summary}</p>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400 flex items-center justify-between">
                    <span className="truncate">Endpoint: <code className="text-amber-300">{model.apiEndpoint}</code></span>
                    <button
                      onClick={() => copyToClipboard(model.apiEndpoint, `ep_${model.id}`)}
                      className="p-1 text-slate-500 hover:text-slate-200 ml-2"
                      title="Copy Endpoint"
                    >
                      {copied === `ep_${model.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Step-by-Step Instructions */}
                  <div className="space-y-2 pt-1">
                    <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Step-by-Step Configuration Guide:</span>
                    </div>

                    <div className="space-y-2">
                      {model.steps.map((step, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                          <div className="font-bold text-slate-200 text-[11px]">{step.title}</div>
                          <div className="text-[10px] text-slate-400 leading-relaxed">{step.description}</div>
                          {step.codeSnippet && (
                            <div className="mt-1 flex items-center justify-between bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-amber-300">
                              <code>{step.codeSnippet}</code>
                              <button
                                onClick={() => copyToClipboard(step.codeSnippet!, `code_${model.id}_${idx}`)}
                                className="text-slate-500 hover:text-slate-200 ml-2"
                              >
                                {copied === `code_${model.id}_${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Parameter Recommendations */}
                  <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 space-y-1.5 text-[10px] font-mono">
                    <div className="text-violet-300 font-bold uppercase">⚙️ Recommended Parameter Presets:</div>
                    <div className="text-slate-300 grid grid-cols-2 gap-1">
                      {Object.entries(model.recommendedConfig).map(([k, v]) => (
                        <div key={k} className="truncate">
                          <span className="text-slate-500">{k}:</span> <span className="text-amber-300 font-bold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  {model.tips && model.tips.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-200/90 space-y-1">
                      <div className="font-bold text-amber-300">💡 Optimization Tips:</div>
                      <ul className="list-disc list-inside space-y-0.5">
                        {model.tips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Quick Add Button */}
                <button
                  type="button"
                  onClick={() => (window.location.href = `/canvas/wf_telegram_ai_bot?add_model=${encodeURIComponent(model.id)}`)}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-violet-600 hover:from-amber-400 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span>Use {model.name.split(' ')[0]} in Workflow Canvas</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Models Grid Tab */}
      {activeTab === 'account_models' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userModels.length === 0 ? (
            <div className="col-span-full p-12 bg-slate-900/50 border border-slate-800 rounded-2xl text-center space-y-2">
              <Cpu className="w-8 h-8 text-cyan-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No Custom Models Found</div>
              <div className="text-xs text-slate-500">Fine-tune or upload models to your @{username} Hugging Face account to see them here.</div>
            </div>
          ) : (
            userModels.map((m) => (
              <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-violet-500/40 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-bold">
                    {m.pipeline_tag || 'text-generation'}
                  </span>
                  <a href={`https://huggingface.co/${m.id}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{m.id}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Owner: @{username}</p>
                </div>

                <button
                  onClick={() => (window.location.href = `/canvas/wf_telegram_ai_bot?add_model=${encodeURIComponent(m.id)}`)}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-600/20 transition-all"
                >
                  Use Model in Workflow
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Account Storage Buckets / Datasets Grid Tab */}
      {activeTab === 'account_datasets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userDatasets.length === 0 ? (
            <div className="col-span-full p-12 bg-slate-900/50 border border-slate-800 rounded-2xl text-center space-y-2">
              <Database className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">Default Storage Bucket Active</div>
              <div className="text-xs text-slate-500 font-mono">datasets/{username || 'user'}/hf-workflow-data</div>
            </div>
          ) : (
            userDatasets.map((d) => (
              <div key={d.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                    Dataset Storage Bucket
                  </span>
                  <a href={`https://huggingface.co/datasets/${d.id}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{d.id}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Storage Repository</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ZeroGPU Spaces Grid Tab */}
      {(activeTab === 'all' || activeTab === 'account_spaces') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {spaces.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              onPreview={(s) => setPreviewSpace(s)}
              onCreateNode={handleCreateNode}
            />
          ))}
        </div>
      )}

      {/* Live Preview Modal */}
      <SpacePreviewModal
        space={previewSpace}
        onClose={() => setPreviewSpace(null)}
        onCreateNode={handleCreateNode}
      />
    </div>
  );
}
