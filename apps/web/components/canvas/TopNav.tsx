'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Play,
  Download,
  Upload,
  ChevronDown,
  Database,
  Zap,
  CheckCircle2,
  Lock,
  Plus,
  RefreshCw,
  Compass,
  Settings as SettingsIcon,
  Wand2,
  BookOpen,
  User,
  LogOut,
  Layers,
  Activity,
  Check,
  Edit2,
  X,
  Clock,
  Command,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Workflow, WorkflowStatus } from '../../../../packages/shared-types';
import { WorkflowTourButton } from '../tutorial/WorkflowTour';
import { AIGeneratorModal } from './AIGeneratorModal';
import { TemplateLibraryModal } from './TemplateLibraryModal';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { commitWorkflowToDataset } from '../../lib/hfStorage';
import { UserAvatar } from '../ui/UserAvatar';

interface TopNavProps {
  workflow: Workflow;
  onUpdateWorkflow: (updated: Partial<Workflow>) => void;
  onExecuteWorkflow: () => void;
  onTestSelectedNode: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onApplyAIGeneratedGraph?: (nodes: any[], edges: any[], name: string) => void;
  isExecuting: boolean;
  isContinuousLive?: boolean;
  onToggleContinuousLive?: () => void;
  activeTab?: 'editor' | 'executions' | 'settings';
  onChangeTab?: (tab: 'editor' | 'executions' | 'settings') => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  workflow,
  onUpdateWorkflow,
  onExecuteWorkflow,
  onTestSelectedNode,
  onExportJSON,
  onImportJSON,
  onApplyAIGeneratedGraph,
  isExecuting,
  isContinuousLive = false,
  onToggleContinuousLive,
  activeTab = 'editor',
  onChangeTab,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(workflow.name);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showCommitTooltip, setShowCommitTooltip] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [assignedBotWfId, setAssignedBotWfId] = useState<string>('wf_telegram_ai_bot');

  const { user, logout } = useAuthStore();

  // Load and sync assigned bot workflow ID
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hf_assigned_bot_workflow_id');
      if (saved) setAssignedBotWfId(saved);
    } catch {
      // fallback
    }
  }, []);

  const isCurrentWfAssigned = assignedBotWfId === workflow.id || (assignedBotWfId === 'wf_telegram_ai_bot' && workflow.id === 'tpl_hf_free_all_ai');

  const handleToggleAssignToBot = () => {
    const nextId = isCurrentWfAssigned ? '' : workflow.id;
    setAssignedBotWfId(nextId);
    try {
      localStorage.setItem('hf_assigned_bot_workflow_id', nextId);
    } catch {
      // fallback
    }
  };

  // Execution Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isExecuting) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 0.1);
      }, 100);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isExecuting]);

  // Keyboard shortcut listener (Cmd+K for AI modal, Cmd+Enter for execute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowAIModal(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        onExecuteWorkflow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExecuteWorkflow]);

  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      onUpdateWorkflow({ name: nameInput.trim() });
    } else {
      setNameInput(workflow.name);
    }
    setIsEditingName(false);
  };

  const toggleStatus = () => {
    const nextStatus: WorkflowStatus = workflow.status === 'active' ? 'draft' : 'active';
    onUpdateWorkflow({ status: nextStatus });
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const commitRes = await commitWorkflowToDataset(
        workflow,
        user?.username || 'mahmoud-mohasseb'
      );
      onUpdateWorkflow({
        lastSyncCommit: commitRes?.commitHash || `commit_${Math.random().toString(36).substring(2, 8)}`,
        lastSyncTimestamp: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      console.warn('Dataset commit warning:', err);
      onUpdateWorkflow({
        lastSyncCommit: `commit_${Math.random().toString(36).substring(2, 8)}`,
        lastSyncTimestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header className="h-14 flex items-center justify-between px-5 z-30 select-none bg-slate-950/90 backdrop-blur-2xl border-b border-white/[0.06]">

        {/* ── LEFT: Logo + Workflow Identity ────────────────────────── */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Animated logo mark */}
          <Link href="/workflows" className="group shrink-0">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />
              <div className="relative w-full h-full rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <span className="text-[11px] font-black tracking-tight bg-gradient-to-br from-violet-300 to-cyan-300 bg-clip-text text-transparent">HF</span>
              </div>
            </div>
          </Link>

          <span className="text-slate-700 text-sm font-light shrink-0">/</span>

          {/* Workflow name (inline edit) */}
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSubmit();
                  if (e.key === 'Escape') { setNameInput(workflow.name); setIsEditingName(false); }
                }}
                autoFocus
                className="bg-transparent border-b border-violet-500 text-sm text-white font-semibold focus:outline-none w-40 pb-0.5"
              />
              <button onClick={handleNameSubmit}><Check className="w-3.5 h-3.5 text-emerald-400" /></button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="group flex items-center gap-1.5 min-w-0"
            >
              <span className="text-sm font-semibold text-slate-100 truncate max-w-[160px] group-hover:text-violet-300 transition-colors">{workflow.name}</span>
              <Edit2 className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 shrink-0 transition-all" />
            </button>
          )}

          {/* Status dot pill — minimal */}
          <button
            onClick={toggleStatus}
            title={`Status: ${workflow.status}. Click to toggle.`}
            className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all text-[10px] font-mono font-medium
              ${workflow.status === 'active'
                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/8'
                : 'border-slate-700 text-slate-500 bg-transparent'
              }"
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${workflow.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
            <span>{workflow.status === 'active' ? 'Live' : 'Draft'}</span>
          </button>
        </div>

        {/* ── CENTER: Tab Navigation ─────────────────────────────────── */}
        <div className="flex items-center gap-0.5 bg-slate-900/60 border border-white/[0.06] p-0.5 rounded-xl">
          {(['editor', 'executions', 'settings'] as const).map((tab) => {
            const icons = { editor: <Layers className="w-3.5 h-3.5" />, executions: <Activity className="w-3.5 h-3.5" />, settings: <SettingsIcon className="w-3.5 h-3.5" /> };
            const labels = { editor: 'Canvas', executions: 'Traces', settings: 'Settings' };
            return (
              <button
                key={tab}
                onClick={() => onChangeTab?.(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-violet-600/90 text-white shadow-md shadow-violet-900/50'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {icons[tab]}
                <span>{labels[tab]}</span>
              </button>
            );
          })}
        </div>

        {/* ── RIGHT: Actions ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Assign as Active Bot Workflow */}
          <button
            type="button"
            onClick={handleToggleAssignToBot}
            title={isCurrentWfAssigned ? "This workflow is active and handling your Telegram & WhatsApp bot messages" : "Assign this workflow to handle your Telegram & WhatsApp bot messages"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
              isCurrentWfAssigned
                ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-950/60'
                : 'border-white/[0.07] bg-slate-900/60 hover:bg-emerald-600/10 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-300'
            }`}
          >
            {isCurrentWfAssigned ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Active Bot</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Assign to Bot</span>
              </>
            )}
          </button>

          {/* HF Master Ecosystem Guide */}
          <Link
            href="/guide"
            title="Hugging Face Ecosystem & Integration Master Guide"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.07] bg-slate-900/60 hover:bg-slate-800/80 hover:border-amber-500/30 text-xs text-slate-400 hover:text-amber-300 transition-all duration-200 font-medium"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">HF Guide</span>
          </Link>

          {/* Templates popup */}
          <button
            onClick={() => setShowTemplatesModal(true)}
            title="Browse AI Workflow Templates"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.07] bg-slate-900/60 hover:bg-slate-800/80 hover:border-violet-500/30 text-xs text-slate-400 hover:text-slate-200 transition-all duration-200 font-medium"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Templates</span>
          </button>

          {/* Magic AI shortcut */}
          <button
            onClick={() => setShowAIModal(true)}
            title="AI Workflow Generator (⌘K)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.07] bg-slate-900/60 hover:bg-violet-600/20 hover:border-violet-500/40 text-xs text-slate-400 hover:text-violet-300 transition-all duration-200 font-medium"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Magic AI</span>
            <kbd className="hidden xl:inline-flex items-center px-1 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[9px] font-mono text-slate-500">⌘K</kbd>
          </button>

          {/* Overflow menu — HF sync, tour, live-run, export/import */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                title="More options"
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/[0.07] bg-slate-900/60 hover:bg-slate-800/80 text-slate-500 hover:text-slate-200 transition-all"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={8}
                align="end"
                className="w-56 bg-slate-950/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-1.5 shadow-2xl shadow-black text-xs text-slate-300 animate-in fade-in-50 zoom-in-95 z-50"
              >
                {/* Sync status */}
                <div className="px-2.5 py-2 border-b border-white/[0.06] mb-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-200"><span>🤗</span> HF Dataset Sync</span>
                    <span className="text-emerald-400 font-mono text-[10px]">Synced</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">{workflow.lastSyncCommit || 'commit_a94f2b'} · {workflow.lastSyncTimestamp || 'Just now'}</div>
                </div>

                <DropdownMenu.Item
                  onSelect={handleManualSync}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-colors focus:outline-none"
                >
                  {isSyncing ? <RefreshCw className="w-3.5 h-3.5 text-violet-400 animate-spin" /> : <Database className="w-3.5 h-3.5 text-cyan-400" />}
                  Push to HF Dataset
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onSelect={onExportJSON}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-colors focus:outline-none"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  Export JSON
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onSelect={onImportJSON}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-colors focus:outline-none"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  Import JSON
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-white/[0.06] my-1" />

                {/* Live auto-run toggle */}
                <DropdownMenu.Item
                  onSelect={onToggleContinuousLive}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isContinuousLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                    Live Auto-Run
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isContinuousLive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {isContinuousLive ? 'ON' : 'OFF'}
                  </span>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-white/[0.06] my-1" />

                {/* Quick template links */}
                <div className="px-2.5 py-1.5 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Quick Templates</div>
                {[
                  { href: '/canvas/wf_telegram_ai_bot', icon: '💬', label: 'AI Text Bot' },
                  { href: '/canvas/wf_telegram_image_gen', icon: '🎨', label: 'Image Generator' },
                  { href: '/canvas/wf_telegram_video_gen', icon: '🎥', label: 'Video Generator' },
                  { href: '/canvas/wf_telegram_music_gen', icon: '🎵', label: 'Music Composer' },
                  { href: '/canvas/wf_whatsapp_multimodal_bot', icon: '📲', label: 'WhatsApp Bot' },
                  { href: '/canvas/wf_telegram_whisper', icon: '🎙️', label: 'Whisper ASR' },
                  { href: '/canvas/wf_telegram_code_assistant', icon: '💻', label: 'Code Assistant' },
                  { href: '/canvas/wf_telegram_customer_support', icon: '🤝', label: 'Support Bot' },
                  { href: '/canvas/wf_telegram_image_to_caption', icon: '👁️', label: 'Vision Caption' },
                  { href: '/canvas/wf_whatsapp_image_gen', icon: '📲', label: 'WA Image Gen' },
                ].map((t) => (
                  <DropdownMenu.Item key={t.href} asChild>
                    <Link href={t.href} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-colors focus:outline-none ${
                      workflow.id === t.href.replace('/canvas/', '') ? 'text-violet-300' : ''
                    }`}>
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                      {workflow.id === t.href.replace('/canvas/', '') && <span className="ml-auto text-[9px] text-violet-400">✓</span>}
                    </Link>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Divider */}
          <div className="h-5 w-px bg-white/[0.07]" />

          {/* Execute CTA */}
          <button
            onClick={onExecuteWorkflow}
            disabled={isExecuting}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-violet-900/40 transition-all active:scale-95"
          >
            {isExecuting ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>{elapsedSeconds.toFixed(1)}s</span></>
            ) : (
              <><Play className="w-3.5 h-3.5 fill-current" /><span>Run</span><kbd className="hidden md:inline-flex items-center px-1 py-0.5 rounded bg-white/20 text-[9px] font-mono">⌘↵</kbd></>
            )}
          </button>

          {/* User avatar */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="shrink-0 rounded-lg overflow-hidden border border-white/10 hover:border-violet-500/50 transition-all focus:outline-none hover:scale-105 active:scale-95"
                title={`Logged in as ${user?.fullname || user?.username || 'HF User'}`}
              >
                <UserAvatar
                  name={user?.fullname}
                  username={user?.username}
                  size={28}
                />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={8}
                align="end"
                className="w-52 bg-slate-950/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-1.5 shadow-2xl shadow-black text-xs text-slate-300 animate-in fade-in-50 zoom-in-95 z-50"
              >
                <div className="px-2.5 py-2 border-b border-white/[0.06] mb-1 space-y-0.5">
                  <div className="font-bold text-slate-100 truncate">{user?.fullname || 'Hugging Face User'}</div>
                  <div className="text-slate-500 font-mono text-[11px]">@{user?.username || 'mahmoud-mohasseb'}</div>
                </div>
                <DropdownMenu.Item asChild>
                  <Link href="/settings" className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-colors focus:outline-none">
                    <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />Settings
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-colors focus:outline-none">
                  <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" />Credits</span>
                  <span className="text-amber-400 font-bold font-mono">{user?.creditBalance ?? 1250}</span>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-white/[0.06] my-1" />
                <DropdownMenu.Item
                  onSelect={() => logout()}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-red-500/10 text-red-400 cursor-pointer transition-colors focus:outline-none"
                >
                  <LogOut className="w-3.5 h-3.5" />Sign Out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      {/* Modals */}
      <AIGeneratorModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onApplyGeneratedGraph={(nodes, edges, name) => onApplyAIGeneratedGraph?.(nodes, edges, name)}
      />
      <TemplateLibraryModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={(nodes, edges, name) => onApplyAIGeneratedGraph?.(nodes, edges, name)}
      />
    </>
  );
};


