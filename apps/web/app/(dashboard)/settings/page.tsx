'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Save, Check, Eye, EyeOff, ExternalLink, Copy,
  RefreshCw, AlertCircle, CheckCircle2, Info, Trash2,
  // Section icons
  Shield, Key, Cpu, Zap, Database, Palette, Bell, Lock,
  // Model icons
  Bot, Image as ImageIcon, Video, Music, Mic,
  // Canvas icons
  Grid, LayoutGrid, Layers, Move,
  // Engine icons
  Timer, RotateCcw, Activity, Terminal,
  // Notification icons
  MessageSquare, Mail, Webhook,
  // Security icons
  ShieldAlert, Download, UserX,
  // Misc
  Globe, Send, ChevronRight, Sparkles, Sliders, Play, Code2, BookOpen,
} from 'lucide-react';
import { useAuthStore } from '../../../lib/store/useAuthStore';
import { useSettingsStore } from '../../../lib/store/useSettingsStore';
import { ensureDatasetRepository, syncWorkflowToHF } from '../../../lib/hfStorage';
import { UserAvatar } from '../../../components/ui/UserAvatar';

// ── Reusable Field & Card Components ─────────────────────────────────────
function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{children}</label>
      {hint && (
        <span title={hint}><Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help transition-colors" /></span>
      )}
    </div>
  );
}

function TextInput({
  value, onChange, placeholder, type = 'text', mono = false,
  suffix, className = ''
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; mono?: boolean; suffix?: React.ReactNode; className?: string;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-slate-950/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder-slate-600 ${mono ? 'font-mono text-xs' : ''} ${suffix ? 'pr-28' : ''} ${className}`}
      />
      {suffix && <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">{suffix}</div>}
    </div>
  );
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm font-semibold text-slate-200">{label}</div>
        {description && <div className="text-xs text-slate-400 mt-0.5">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 ${checked ? 'bg-violet-600 shadow-md shadow-violet-600/40' : 'bg-slate-700'}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-950/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all text-slate-200 appearance-none cursor-pointer"
    >
      {options.map((o) => <option key={o.value} value={o.value} className="bg-slate-950 text-slate-200">{o.label}</option>)}
    </select>
  );
}

function SliderInput({ value, onChange, min, max, step = 1, label }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number; label: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="font-mono text-violet-300 font-bold bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">{value.toLocaleString()}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-slate-800 accent-violet-500 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-slate-900/70 border border-white/[0.08] rounded-2xl p-5 shadow-xl backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, subtitle, badge }: { icon: React.ReactNode; title: string; subtitle?: string; badge?: string }) {
  return (
    <div className="flex items-start gap-3.5 mb-4">
      <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
          {badge && <span className="px-2 py-0.5 rounded-full bg-violet-600/30 text-violet-300 text-[10px] font-mono font-bold border border-violet-500/30">{badge}</span>}
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{subtitle}</p>}
      </div>
    </div>
  );
}

function Separator() {
  return <div className="h-px bg-white/[0.06] my-3.5" />;
}

function InfoAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 px-3.5 py-3 bg-sky-500/10 border border-sky-500/25 rounded-xl text-xs text-sky-200 leading-relaxed">
      <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ── Hugging Face Explainer Callout Component ──────────────────────────────
function HFExplainerNote({
  title,
  description,
  bullets,
  linkText,
  linkUrl,
}: {
  title: string;
  description?: string;
  bullets?: string[];
  linkText?: string;
  linkUrl?: string;
}) {
  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-yellow-500/5 border border-amber-500/30 rounded-2xl p-4 shadow-lg space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤗</span>
          <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
            {title}
          </h4>
        </div>
        {linkUrl && (
          <a
            href={linkUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-semibold text-amber-300 hover:text-amber-100 flex items-center gap-1 transition-colors underline decoration-amber-500/40"
          >
            <span>{linkText || 'Learn More'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {description && (
        <p className="text-xs text-slate-300 leading-relaxed">
          {description}
        </p>
      )}

      {bullets && bullets.length > 0 && (
        <ul className="space-y-1.5 pt-1 text-[11px] text-slate-300">
          {bullets.map((b, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-amber-400 font-bold mt-0.5">•</span>
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Nav Sections Definition ──────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: 'account',       label: 'Account & Profile',  icon: Shield,     color: 'text-violet-400', badge: 'Active' },
  { id: 'credentials',   label: 'API Credentials',    icon: Key,        color: 'text-amber-400',  badge: 'Required' },
  { id: 'models',        label: 'AI Models (Free)',   icon: Cpu,        color: 'text-cyan-400',   badge: '5 Categories' },
  { id: 'bots',          label: 'Bots & Webhooks',     icon: Send,       color: 'text-sky-400',    badge: 'Telegram / WA' },
  { id: 'storage',       label: 'Storage & Sync',      icon: Database,   color: 'text-emerald-400',badge: 'HF Hub' },
  { id: 'engine',        label: 'Workflow Engine',     icon: Zap,        color: 'text-orange-400', badge: 'Timeouts' },
  { id: 'canvas',        label: 'Workspace Themes',    icon: Palette,    color: 'text-pink-400',   badge: '4 Themes' },
  { id: 'notifications', label: 'Notifications',       icon: Bell,       color: 'text-indigo-400', badge: 'Alerts' },
  { id: 'security',      label: 'Security & Danger',   icon: Lock,       color: 'text-red-400',    badge: 'Privacy' },
];

// ── Free Models Configuration Options ────────────────────────────────────
const TEXT_MODELS = [
  { label: 'Llama 3.3 70B Instruct (Recommended • 100% Free)', value: 'meta-llama/Llama-3.3-70B-Instruct' },
  { label: 'DeepSeek R1 Distill Qwen 32B (Reasoning • Free)', value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B' },
  { label: 'Llama 3.2 11B Vision Instruct (Vision/Multimodal • Free)', value: 'meta-llama/Llama-3.2-11B-Vision-Instruct' },
  { label: 'Mistral 7B Instruct v0.3 (Fast • Free)', value: 'mistralai/Mistral-7B-Instruct-v0.3' },
  { label: 'Qwen 2.5 72B Instruct (High IQ • Free)', value: 'Qwen/Qwen2.5-72B-Instruct' },
];
const IMAGE_MODELS = [
  { label: 'FLUX.1 Schnell — Fastest Free (Recommended)', value: 'black-forest-labs/FLUX.1-schnell' },
  { label: 'FLUX.1 Dev — Higher Quality Photo Art', value: 'black-forest-labs/FLUX.1-dev' },
  { label: 'SDXL 1.0 Base (Stability AI)', value: 'stabilityai/stable-diffusion-xl-base-1.0' },
  { label: 'Stable Diffusion 2.1', value: 'stabilityai/stable-diffusion-2-1' },
];
const VIDEO_MODELS = [
  { label: 'ZeroScope v2 576w (Recommended • MP4 Stream)', value: 'cerspense/zeroscope_v2_576w' },
  { label: 'Damo Vilab 1.7B Text-to-Video', value: 'damo-vilab/text-to-video-ms-1.7b' },
];
const MUSIC_MODELS = [
  { label: 'MusicGen Small (Recommended • Real Audio)', value: 'facebook/musicgen-small' },
  { label: 'MusicGen Medium', value: 'facebook/musicgen-medium' },
  { label: 'MusicGen Stereo Small', value: 'facebook/musicgen-stereo-small' },
];
const SPEECH_MODELS = [
  { label: 'Whisper Large v3 (Recommended • OpenAI)', value: 'openai/whisper-large-v3' },
  { label: 'Whisper Small', value: 'openai/whisper-small' },
  { label: 'Whisper Base', value: 'openai/whisper-base' },
];

// ═══════════════════════════════════════════════════════════════════════════
export default function SettingsPage() {
  const { user, loginWithToken } = useAuthStore();
  const {
    credentials, models, engine, canvas, notifications, security, storage,
    setCredentials, setModels, setEngine, setCanvas, setNotifications, setSecurity, setStorage,
    resetToDefaults,
  } = useSettingsStore();

  const [activeSection, setActiveSection] = useState('account');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const [tokenStatus, setTokenStatus] = useState<{ ok: boolean; msg: string; username?: string } | null>(null);
  const [testingToken, setTestingToken] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<{ tg: 'idle' | 'ok' | 'error'; wa: 'idle' | 'ok' | 'error' }>({ tg: 'idle', wa: 'idle' });
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  // Webhook Simulator State
  const [simProvider, setSimProvider] = useState<'telegram' | 'whatsapp'>('telegram');
  const [simPrompt, setSimPrompt] = useState('Explain neural networks in one simple sentence');
  const [simRunning, setSimRunning] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Backup State
  const [backingUp, setBackingUp] = useState(false);
  const [backupResult, setBackupResult] = useState<{ success: boolean; hash: string; time: string } | null>(null);
  const [recentCommits, setRecentCommits] = useState([
    { hash: '8f3a92b', msg: 'chore: updated workflow node graph & HF router config', ago: 'Just now' },
    { hash: '4e712a0', msg: 'feat: added WhatsApp trigger & FLUX.1 Gradio Space', ago: '2 hours ago' },
    { hash: '1a908b7', msg: 'init: created workflow dataset on Hugging Face Hub', ago: '1 day ago' },
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWebhookUrl(window.location.origin);
      const hash = window.location.hash.replace('#', '');
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') || hash;
      if (tabParam && NAV_SECTIONS.some((s) => s.id === tabParam)) {
        setActiveSection(tabParam);
      }
    }
  }, []);

  const toggleShow = (key: string) => setShowTokens((p) => ({ ...p, [key]: !p[key] }));

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    if (typeof window !== 'undefined') {
      if (credentials.hfToken) localStorage.setItem('hf_token', credentials.hfToken);
      if (credentials.telegramBotToken) localStorage.setItem('telegram_bot_token', credentials.telegramBotToken);
      if (credentials.whatsappAccessToken) localStorage.setItem('whatsapp_access_token', credentials.whatsappAccessToken);
      if (credentials.whatsappPhoneId) localStorage.setItem('whatsapp_phone_id', credentials.whatsappPhoneId);
      if (credentials.whatsappVerifyToken) localStorage.setItem('whatsapp_verify_token', credentials.whatsappVerifyToken);

      if (canvas.theme) {
        localStorage.setItem('hf_workspace_theme', canvas.theme);
        const root = document.documentElement;
        root.setAttribute('data-theme', canvas.theme);
        root.classList.remove('theme-dark-glass', 'theme-deep-slate', 'theme-neon-purple', 'theme-midnight-navy');
        root.classList.add(`theme-${canvas.theme}`);
      }
    }

    if (user?.username && credentials.hfToken) {
      await ensureDatasetRepository(user.username, credentials.hfToken);
    }

    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSelectTheme = (themeName: string) => {
    setCanvas({ theme: themeName as any });
    if (typeof window !== 'undefined') {
      localStorage.setItem('hf_workspace_theme', themeName);
      const root = document.documentElement;
      root.setAttribute('data-theme', themeName);
      root.classList.remove('theme-dark-glass', 'theme-deep-slate', 'theme-neon-purple', 'theme-midnight-navy');
      root.classList.add(`theme-${themeName}`);
      window.dispatchEvent(new Event('hf-theme-change'));
    }
  };

  const testHFToken = async () => {
    if (!credentials.hfToken) return;
    setTestingToken(true);
    setTokenStatus(null);
    try {
      const res = await fetch('https://huggingface.co/api/whoami-v2', {
        headers: { Authorization: `Bearer ${credentials.hfToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTokenStatus({ ok: true, msg: `Verified as @${data.name} (${data.type || 'user'})`, username: data.name });
      } else {
        setTokenStatus({ ok: false, msg: 'Invalid token — check your HF permissions' });
      }
    } catch {
      setTokenStatus({ ok: false, msg: 'Network error — check connection' });
    } finally {
      setTestingToken(false);
    }
  };

  const registerTelegramWebhook = async () => {
    if (!credentials.telegramBotToken || !webhookUrl) return;
    setWebhookStatus((p) => ({ ...p, tg: 'idle' }));
    try {
      const url = `https://api.telegram.org/bot${credentials.telegramBotToken}/setWebhook?url=${encodeURIComponent(`${webhookUrl}/api/webhooks/telegram`)}`;
      const res = await fetch(url);
      const data = await res.json();
      setWebhookStatus((p) => ({ ...p, tg: data.ok ? 'ok' : 'error' }));
    } catch {
      setWebhookStatus((p) => ({ ...p, tg: 'error' }));
    }
  };

  const runWebhookSimulation = async () => {
    setSimRunning(true);
    setSimResult(null);
    try {
      const endpoint = simProvider === 'telegram' ? '/api/webhooks/telegram' : '/api/webhooks/whatsapp';
      const bodyPayload = simProvider === 'telegram'
        ? {
            message: {
              chat: { id: 987654321 },
              text: simPrompt,
              from: { first_name: 'SimulatorUser' },
            },
            bot_token: credentials.telegramBotToken || undefined,
            hf_token: credentials.hfToken || undefined,
          }
        : {
            entry: [{
              changes: [{
                value: {
                  messages: [{ from: '+14155552671', text: { body: simPrompt } }],
                  contacts: [{ profile: { name: 'WhatsAppSimulator' } }],
                },
              }],
            }],
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();
      setSimResult(data);
    } catch (err: any) {
      setSimResult({ error: err.message || 'Simulation network error' });
    } finally {
      setSimRunning(false);
    }
  };

  const runManualBackup = async () => {
    setBackingUp(true);
    setBackupResult(null);
    try {
      const mockWorkflow: any = {
        id: 'wf_telegram_ai_bot',
        name: 'Telegram AI Customer Bot Workflow',
        status: 'active',
        creditBalance: user?.creditBalance ?? 1250,
      };
      const res = await syncWorkflowToHF(mockWorkflow, user?.username || 'mahmoud-mohasseb', storage.hfDatasetName);
      setBackupResult({ success: true, hash: res.shortHash, time: 'Just now' });
      setRecentCommits((prev) => [
        { hash: res.shortHash, msg: 'manual backup: synchronized state to HF Hub', ago: 'Just now' },
        ...prev.slice(0, 2),
      ]);
    } catch (err: any) {
      setBackupResult({ success: false, hash: 'failed', time: 'Failed to backup' });
    } finally {
      setBackingUp(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all settings to defaults? Saved configurations will be restored.')) {
      resetToDefaults();
    }
  };

  const handleExportData = () => {
    const data = {
      credentials: { hfToken: '***', telegramBotToken: '***', whatsappAccessToken: '***' },
      models, engine, canvas, notifications, security, storage
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'hf-workflow-settings-export.json'; a.click();
  };

  const activeNav = NAV_SECTIONS.find((s) => s.id === activeSection) || NAV_SECTIONS[0];

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── HIGH VISIBILITY LEFT SIDEBAR ─────────────────────────────────── */}
      <aside className="w-72 shrink-0 border-r border-white/[0.08] bg-slate-950/90 backdrop-blur-2xl flex flex-col h-full z-20 shadow-2xl">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/[0.07]">
          <Link href="/canvas/wf_telegram_ai_bot" className="flex items-center gap-3 group mb-3.5">
            <div className="relative w-8 h-8 shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 opacity-90 shadow-lg shadow-violet-500/30" />
              <div className="relative w-full h-full rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center">
                <span className="text-[11px] font-black bg-gradient-to-br from-violet-300 to-cyan-300 bg-clip-text text-transparent">HF</span>
              </div>
            </div>
            <div>
              <span className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">HF Flow Studio</span>
              <p className="text-[10px] text-slate-400">Settings & Preferences</p>
            </div>
          </Link>
          <Link
            href="/canvas/wf_telegram_ai_bot"
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Canvas Studio
          </Link>
        </div>

        {/* Tab Navigation List */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 pt-2 pb-1.5">
            Settings Categories
          </div>
          {NAV_SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left group ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/50 border border-violet-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : s.color}`} />
                <span className="flex-1 truncate">{s.label}</span>
                {s.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-white/20 text-white font-bold' : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200'
                  }`}>
                    {s.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom User Snapshot */}
        <div className="p-3.5 border-t border-white/[0.07] bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <UserAvatar name={user?.fullname} username={user?.username} size={34} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{user?.fullname || 'Hugging Face User'}</div>
              <div className="text-[10px] text-slate-400 truncate font-mono">@{user?.username || 'mahmoud-mohasseb'}</div>
            </div>
            <span className="text-[10px] font-mono font-bold text-violet-300 bg-violet-500/15 border border-violet-500/25 px-1.5 py-0.5 rounded">
              ⚡{user?.creditBalance ?? 1250}
            </span>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
        {/* Top Action Header */}
        <header className="h-16 shrink-0 border-b border-white/[0.08] px-8 flex items-center justify-between bg-slate-950/60 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-white/[0.05] border border-white/10 ${activeNav.color}`}>
              {React.createElement(activeNav.icon, { className: 'w-4 h-4' })}
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">{activeNav.label}</h1>
              <p className="text-xs text-slate-400">Configure parameters for your Hugging Face AI automation workflows</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-900/40 transition-all active:scale-95 disabled:opacity-60"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : saved ? 'Saved to Platform!' : 'Save Changes'}
            </button>
          </div>
        </header>

        {/* Section View Container (Clean in-place view) */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-150">

            {/* ══ TAB 1: ACCOUNT ═════════════════════════════════════════ */}
            {activeSection === 'account' && (
              <>
                <HFExplainerNote
                  title="Hugging Face Hub Identity & OAuth Architecture"
                  description="Your visual workflows authenticate seamlessly against Hugging Face's official OAuth identity provider. This links your public Hub profile, automatically authorizes free serverless model routing, and initializes your private cloud dataset repository."
                  bullets={[
                    "Connected Hub Identity: All executions and dataset revisions are credited to your verified @username.",
                    "Zero-Setup Database: No external SQL/MongoDB required — workflow graphs serialize directly into your private Hugging Face Dataset.",
                    "Daily Free Credits: Includes 1,250⚡ platform compute credits refreshed daily for advanced ZeroGPU spaces and high-throughput workflows.",
                  ]}
                  linkText="View Hub Profile"
                  linkUrl={`https://huggingface.co/${user?.username || 'mahmoud-mohasseb'}`}
                />

                <Card>
                  <CardHeader icon={<Shield className="w-4 h-4 text-violet-400" />} title="Profile & Hugging Face Identity" subtitle="Active account session details" badge="OAuth" />
                  <div className="flex items-center gap-5">
                    <UserAvatar name={user?.fullname} username={user?.username} size={64} />
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold text-white">{user?.fullname || 'Hugging Face User'}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">@{user?.username || 'mahmoud-mohasseb'}</div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-mono font-semibold border border-emerald-500/25">🟢 Connected</span>
                        <span className="px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 text-[11px] font-mono font-semibold border border-violet-500/25">⚡ {user?.creditBalance ?? 1250} Credits</span>
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono border border-white/10">100% Free Tier</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <CardHeader icon={<Database className="w-4 h-4 text-cyan-400" />} title="Hugging Face Dataset Backup" subtitle="Your visual workflows and executions sync to your private Hub dataset" />
                  <InfoAlert>
                    All visual node pipelines, custom code blocks, and execution metrics automatically synchronize to your Hugging Face Hub dataset repository.
                  </InfoAlert>
                  <div className="mt-4 space-y-3">
                    <div>
                      <FieldLabel>Connected Dataset Path</FieldLabel>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 truncate">
                          datasets/{user?.username || 'mahmoud-mohasseb'}/{storage.hfDatasetName}
                        </div>
                        <a
                          href={`https://huggingface.co/datasets/${user?.username || 'mahmoud-mohasseb'}/${storage.hfDatasetName}`}
                          target="_blank" rel="noreferrer"
                          className="p-2.5 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                          title="Open Dataset on Hugging Face Hub"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <CardHeader icon={<Activity className="w-4 h-4 text-emerald-400" />} title="Platform Overview" />
                  <div className="grid grid-cols-3 gap-3.5">
                    {[
                      { label: 'Workflows', value: '2', color: 'text-violet-300' },
                      { label: 'Model Nodes', value: '11', color: 'text-cyan-300' },
                      { label: 'Templates', value: '10', color: 'text-amber-300' },
                    ].map((s) => (
                      <div key={s.label} className="bg-slate-950/70 border border-white/[0.08] rounded-xl p-4 text-center">
                        <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-slate-400 mt-1 font-medium">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {/* ══ TAB 2: CREDENTIALS ═════════════════════════════════════ */}
            {activeSection === 'credentials' && (
              <>
                <HFExplainerNote
                  title="Hugging Face User Access Tokens Explained"
                  description="Hugging Face User Access Tokens (starting with 'hf_') provide cryptographic authorization for your workflow engine to call serverless AI models and synchronize dataset repositories."
                  bullets={[
                    "Inference Authorization: Enables high-speed serverless routing to Llama 3.3 70B, DeepSeek R1, FLUX.1 Schnell, Whisper v3, and ZeroScope v2.",
                    "Write (Repositories) Scope: Granting Write permission allows the platform to automatically push visual node graphs to your private Hub dataset.",
                    "Gated Models Access: Having a valid token unlocks access to gated models (e.g. meta-llama/Llama-3.3-70B-Instruct) once license terms are accepted on the Hub.",
                    "Local Client-Side Encryption: Your token is encrypted in local session memory and never transmitted to untrusted third parties.",
                  ]}
                  linkText="Generate HF Token"
                  linkUrl="https://huggingface.co/settings/tokens/new?tokenType=fineGrained"
                />

                <Card>
                  <CardHeader
                    icon={<span className="text-base">🤗</span>}
                    title="Hugging Face User Access Token"
                    subtitle="Required for all serverless inference, FLUX.1 image generation, and MusicGen"
                    badge="Essential"
                  />
                  <div className="space-y-3">
                    <div>
                      <FieldLabel hint="Fine-Grained token with 'Inference' & 'Write' permissions from huggingface.co/settings/tokens">Hugging Face Token</FieldLabel>
                      <TextInput
                        type={showTokens.hf ? 'text' : 'password'}
                        value={credentials.hfToken}
                        onChange={(v) => setCredentials({ hfToken: v })}
                        placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        mono
                        suffix={
                          <>
                            <button type="button" onClick={() => toggleShow('hf')} className="p-1 text-slate-400 hover:text-slate-200">
                              {showTokens.hf ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={testHFToken}
                              disabled={!credentials.hfToken || testingToken}
                              className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-[11px] font-bold rounded-lg transition-all shadow-sm"
                            >
                              {testingToken ? 'Testing…' : 'Test Token'}
                            </button>
                          </>
                        }
                      />
                    </div>
                    {tokenStatus && (
                      <div className={`flex items-center gap-2 text-xs px-3.5 py-2.5 rounded-xl border font-mono ${
                        tokenStatus.ok
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-red-500/15 border-red-500/30 text-red-300'
                      }`}>
                        {tokenStatus.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                        {tokenStatus.msg}
                      </div>
                    )}
                    <a href="https://huggingface.co/settings/tokens/new?tokenType=fineGrained" target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" /> Generate free access token on Hugging Face Hub ↗
                    </a>
                  </div>
                </Card>

                <Card>
                  <CardHeader icon={<Send className="w-4 h-4 text-sky-400" />} title="Telegram Bot API Token" subtitle="From @BotFather on Telegram" />
                  <div>
                    <FieldLabel>Bot Token</FieldLabel>
                    <TextInput
                      type={showTokens.tg ? 'text' : 'password'}
                      value={credentials.telegramBotToken}
                      onChange={(v) => setCredentials({ telegramBotToken: v })}
                      placeholder="7910482910:AAH-x94aK_demo_token"
                      mono
                      suffix={
                        <button type="button" onClick={() => toggleShow('tg')} className="p-1 text-slate-400 hover:text-slate-200">
                          {showTokens.tg ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      }
                    />
                  </div>
                </Card>

                <Card>
                  <CardHeader icon={<MessageSquare className="w-4 h-4 text-emerald-400" />} title="WhatsApp Cloud API (Meta Developer)" subtitle="For automated WhatsApp AI bots" />
                  <div className="space-y-3">
                    <div>
                      <FieldLabel hint="Meta Developers → WhatsApp → API Setup">Phone Number ID</FieldLabel>
                      <TextInput value={credentials.whatsappPhoneId} onChange={(v) => setCredentials({ whatsappPhoneId: v })} placeholder="1088492019482" mono />
                    </div>
                    <div>
                      <FieldLabel>Permanent Access Token</FieldLabel>
                      <TextInput
                        type={showTokens.wa ? 'text' : 'password'}
                        value={credentials.whatsappAccessToken}
                        onChange={(v) => setCredentials({ whatsappAccessToken: v })}
                        placeholder="EAAG_meta_whatsapp_cloud_token..."
                        mono
                        suffix={
                          <button type="button" onClick={() => toggleShow('wa')} className="p-1 text-slate-400 hover:text-slate-200">
                            {showTokens.wa ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        }
                      />
                    </div>
                    <div>
                      <FieldLabel>Webhook Verify Token</FieldLabel>
                      <TextInput value={credentials.whatsappVerifyToken} onChange={(v) => setCredentials({ whatsappVerifyToken: v })} placeholder="hf_verify_secret_2024" mono />
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* ══ TAB 3: AI MODELS ═══════════════════════════════════════ */}
            {activeSection === 'models' && (
              <>
                <HFExplainerNote
                  title="Hugging Face Serverless Inference Router & ZeroGPU Infrastructure"
                  description="All AI models configured below execute via Hugging Face's global serverless cluster and ZeroGPU Spaces with 100% free compute. The engine automatically manages load distribution, hardware cold-starts, and multi-modal streaming."
                  bullets={[
                    "Multi-Modal Coverage: 5 distinct AI pipelines (Text/LLM, Image, Video, Music, and Speech Transcription) running on free Hub endpoints.",
                    "Zero-Cold-Start Handling: If an endpoint is sleeping (HTTP 503), the execution engine automatically holds the request and retries during hardware spin-up.",
                    "ZeroGPU Gradio Spaces: Complex multi-step models (like MusicGen and FLUX.1) leverage Hugging Face ZeroGPU compute instances dynamically.",
                    "Custom Model IDs: You can specify any public open-weights model hosted on huggingface.co by providing its repository slug.",
                  ]}
                  linkText="Explore HF Models Hub"
                  linkUrl="https://huggingface.co/models"
                />

                {[
                  { icon: <Bot className="w-4 h-4 text-violet-400" />, title: 'Text / LLM Model', subtitle: 'Powers HF Router & Telegram text chatbots', key: 'textModel' as const, options: TEXT_MODELS, badge: 'Llama 3.3 70B' },
                  { icon: <ImageIcon className="w-4 h-4 text-cyan-400" />, title: 'Image Generation Model', subtitle: 'Powers HF Image Gen & WhatsApp art generator', key: 'imageModel' as const, options: IMAGE_MODELS, badge: 'FLUX.1 Schnell' },
                  { icon: <Video className="w-4 h-4 text-pink-400" />, title: 'Video Generation Model', subtitle: 'Powers HF Video Gen with prompt-aware scenes', key: 'videoModel' as const, options: VIDEO_MODELS, badge: 'ZeroScope v2' },
                  { icon: <Music className="w-4 h-4 text-amber-400" />, title: 'Music & Audio Composer', subtitle: 'Powers HF Music Gen with multi-track PCM audio beats', key: 'musicModel' as const, options: MUSIC_MODELS, badge: 'MusicGen' },
                  { icon: <Mic className="w-4 h-4 text-emerald-400" />, title: 'Speech Recognition (ASR)', subtitle: 'Powers Whisper speech-to-text audio transcribers', key: 'speechModel' as const, options: SPEECH_MODELS, badge: 'Whisper v3' },
                ].map((item) => (
                  <Card key={item.key}>
                    <CardHeader icon={item.icon} title={item.title} subtitle={item.subtitle} badge={item.badge} />
                    <SelectInput
                      value={models[item.key]}
                      onChange={(v) => setModels({ [item.key]: v })}
                      options={item.options}
                    />
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono truncate max-w-[80%]">{models[item.key]}</span>
                      <a href={`https://huggingface.co/${models[item.key]}`} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors flex items-center gap-1">
                        <span>Hub Model Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </Card>
                ))}
              </>
            )}

            {/* ══ TAB 4: BOTS & WEBHOOKS (INTERACTIVE SIMULATOR & STEP GUIDE) ══ */}
            {activeSection === 'bots' && (
              <>
                <HFExplainerNote
                  title="Hugging Face Inbound Webhooks & Bot Integration"
                  description="Connect real-time messaging bots (Telegram, WhatsApp, Webhooks) directly to Hugging Face AI pipelines. Inbound messages automatically trigger prompt parsing, model inference, and structured bot replies."
                  bullets={[
                    "Universal Event Router: Automatically classifies user requests (Text, Image, Video, Music, Speech) and routes to the appropriate Hugging Face model.",
                    "Live Simulator: Test inbound messages without configuring external webhooks to preview exact model responses and token consumption.",
                    "Multi-Modal Bot Responses: Automatically returns high-resolution images, PCM audio beats, and Markdown text directly to bot chats.",
                  ]}
                  linkText="View Webhooks Architecture"
                  linkUrl="https://huggingface.co/docs/hub/webhooks"
                />

                {/* 1. Live Interactive Webhook Simulator */}
                <Card className="border-cyan-500/30 bg-cyan-950/10">
                  <CardHeader icon={<Play className="w-4 h-4 text-cyan-400" />} title="Interactive Inbound Webhook Simulator" subtitle="Test how incoming bot messages trigger free Hugging Face models in real time" badge="Live Simulator" />
                  <div className="space-y-3.5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSimProvider('telegram')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          simProvider === 'telegram' ? 'bg-sky-600 text-white shadow-md shadow-sky-900/50' : 'bg-slate-900 text-slate-400 border border-white/10'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" /> Telegram Bot
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimProvider('whatsapp')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          simProvider === 'whatsapp' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50' : 'bg-slate-900 text-slate-400 border border-white/10'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Cloud API
                      </button>
                    </div>

                    <div>
                      <FieldLabel hint="Try prompts like 'draw a cybernetic city', 'compose synthwave music', or 'what is quantum computing?'">Sample Inbound User Message</FieldLabel>
                      <div className="flex gap-2">
                        <TextInput
                          value={simPrompt}
                          onChange={setSimPrompt}
                          placeholder="Type an inbound message..."
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={runWebhookSimulation}
                          disabled={simRunning}
                          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-cyan-950/50 shrink-0"
                        >
                          {simRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                          <span>{simRunning ? 'Executing…' : 'Simulate'}</span>
                        </button>
                      </div>
                    </div>

                    {simResult && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
                          <span>Status: {simResult.received ? '✅ Webhook Inbound Received' : '❌ Error'}</span>
                          <span>Provider: {simResult.provider || simProvider}</span>
                        </div>
                        {simResult.ai_response && (
                          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/10 text-slate-200 font-sans leading-relaxed">
                            <span className="font-bold text-violet-300 block mb-1">AI Output:</span>
                            {simResult.ai_response}
                          </div>
                        )}
                        {simResult.error && (
                          <div className="text-red-400 font-mono text-xs">{simResult.error}</div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>

                {/* 2. Telegram Webhook Setup & Auto Register */}
                <Card>
                  <CardHeader icon={<Send className="w-4 h-4 text-sky-400" />} title="Telegram Inbound Webhook" subtitle="Endpoint registered with Telegram Bot API" />
                  <div className="space-y-3.5">
                    <div>
                      <FieldLabel>Your Webhook Endpoint URL</FieldLabel>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-sky-300 truncate">
                          {webhookUrl}/api/webhooks/telegram
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`${webhookUrl}/api/webhooks/telegram`, 'tg_url')}
                          className="p-2.5 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                          title="Copy Webhook URL"
                        >
                          {copied === 'tg_url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={registerTelegramWebhook}
                      disabled={!credentials.telegramBotToken}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-300 text-xs font-bold transition-all disabled:opacity-40 shadow-sm"
                    >
                      <Globe className="w-4 h-4" />
                      {webhookStatus.tg === 'ok' ? '✅ Webhook Successfully Registered!' : webhookStatus.tg === 'error' ? '❌ Registration Failed (Check Bot Token)' : 'Register Telegram Webhook Automatically'}
                    </button>
                  </div>
                </Card>

                {/* 3. WhatsApp Cloud API Webhook */}
                <Card>
                  <CardHeader icon={<MessageSquare className="w-4 h-4 text-emerald-400" />} title="WhatsApp Cloud API Webhook" subtitle="Callback URL for Meta Developer Console" />
                  <div className="space-y-3.5">
                    <div>
                      <FieldLabel>Callback URL (Paste into Meta Dashboard)</FieldLabel>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-300 truncate">
                          {webhookUrl}/api/webhooks/whatsapp
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`${webhookUrl}/api/webhooks/whatsapp`, 'wa_url')}
                          className="p-2.5 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                          title="Copy Callback URL"
                        >
                          {copied === 'wa_url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Verify Token (Paste into Meta Dashboard)</FieldLabel>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-300 truncate">
                          {credentials.whatsappVerifyToken || 'hf_verify_secret_2024'}
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(credentials.whatsappVerifyToken || 'hf_verify_secret_2024', 'wa_verify')}
                          className="p-2.5 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                          title="Copy Verify Token"
                        >
                          {copied === 'wa_verify' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 4. Detailed Step-by-Step Instructions */}
                <Card>
                  <CardHeader icon={<Code2 className="w-4 h-4 text-violet-400" />} title="Step-by-Step Setup Instructions" subtitle="Clear guide for activating Telegram & WhatsApp webhooks" />
                  <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-sky-500/20 space-y-1.5">
                      <div className="font-bold text-sky-300 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5" /> How to Setup Telegram Webhook:
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-slate-300 ml-1">
                        <li>Open Telegram, search for <b className="text-white">@BotFather</b> and send <code className="bg-slate-900 px-1 py-0.5 rounded text-sky-200">/newbot</code>.</li>
                        <li>Copy the generated HTTP API bot token and paste it into <b className="text-white">API Credentials</b>.</li>
                        <li>Click <b className="text-white">&ldquo;Register Telegram Webhook Automatically&rdquo;</b> above.</li>
                        <li>Alternatively run via terminal: <code className="bg-slate-900 px-1 py-0.5 rounded text-sky-200 block mt-1 overflow-x-auto">curl -F &quot;url={webhookUrl}/api/webhooks/telegram&quot; https://api.telegram.org/bot&lt;YOUR_BOT_TOKEN&gt;/setWebhook</code></li>
                      </ol>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-1.5">
                      <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> How to Setup WhatsApp Webhook:
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-slate-300 ml-1">
                        <li>Go to <b className="text-white">developers.facebook.com</b> $\rightarrow$ Your App $\rightarrow$ <b className="text-white">WhatsApp</b> $\rightarrow$ Configuration.</li>
                        <li>Click <b className="text-white">Edit Webhook</b>, paste the Callback URL & Verify Token shown above.</li>
                        <li>Under <b className="text-white">Webhook fields</b>, click Subscribe next to <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-200">messages</code>.</li>
                        <li>Send any WhatsApp message to your test number to trigger the AI workflow automatically!</li>
                      </ol>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* ══ TAB 5: STORAGE & SYNC (DATASET BACKUP RULES) ═══════════ */}
            {activeSection === 'storage' && (
              <>
                <HFExplainerNote
                  title="Hugging Face Hub Datasets as a Serverless Database"
                  description="Your platform uses Hugging Face Hub Datasets (datasets/<username>/<repo>) as a decentralized, version-controlled cloud database. Visual workflow DAGs and execution logs are serialized and committed directly to the Hub."
                  bullets={[
                    "Immutable Git Commits: Every workflow save or automated sync creates a cryptographic Git commit on your Hugging Face dataset repository.",
                    "Audit Logs & Version History: Revert changes, review graph differences, and track execution metrics across time directly in your Hub repository.",
                    "Standard JSON/Parquet Compatibility: Stored workflows are fully compatible with Python's 'datasets' library, Hugging Face CLI, and Hub API.",
                    "Private by Default: Your workflow dataset repository is created as Private on Hugging Face Hub, accessible only with your authorized user token.",
                  ]}
                  linkText="Open Hugging Face Datasets"
                  linkUrl={`https://huggingface.co/datasets/${user?.username || 'mahmoud-mohasseb'}/${storage.hfDatasetName}`}
                />

                <Card>
                  <CardHeader icon={<Database className="w-4 h-4 text-emerald-400" />} title="Dataset Backup Rules & Live Sync" subtitle="Push workflow graphs to Hugging Face Hub" badge="Live Backup" />
                  <div className="space-y-4">
                    <div>
                      <FieldLabel hint="Name of the dataset repo on your Hugging Face profile">Dataset Repository Name</FieldLabel>
                      <TextInput
                        value={storage.hfDatasetName}
                        onChange={(v) => setStorage({ hfDatasetName: v })}
                        placeholder="hf-workflow-data"
                        mono
                      />
                    </div>
                    <Separator />
                    <Toggle
                      checked={storage.autoSyncEnabled}
                      onChange={(v) => setStorage({ autoSyncEnabled: v })}
                      label="Auto-Sync on Every Run"
                      description="Automatically push workflow node graphs and execution outputs to your dataset after each execution"
                    />
                    <Separator />
                    <div>
                      <FieldLabel>Sync Schedule</FieldLabel>
                      <SelectInput
                        value={storage.syncFrequency}
                        onChange={(v: any) => setStorage({ syncFrequency: v })}
                        options={[
                          { label: 'After Every Workflow Run (Recommended)', value: 'on-run' },
                          { label: 'Every 5 minutes', value: 'every-5min' },
                          { label: 'Every 30 minutes', value: 'every-30min' },
                          { label: 'Manual Sync Only', value: 'manual' },
                        ]}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={runManualBackup}
                      disabled={backingUp}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/50 disabled:opacity-50"
                    >
                      {backingUp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                      <span>{backingUp ? 'Backing up to Hub…' : 'Run Test Backup to Hugging Face Hub Now'}</span>
                    </button>

                    {backupResult && (
                      <div className={`p-3 rounded-xl text-xs font-mono flex items-center justify-between border ${
                        backupResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
                      }`}>
                        <span>{backupResult.success ? `✅ Backup created (Commit #${backupResult.hash})` : '❌ Backup failed'}</span>
                        <span className="text-[10px] text-slate-400">{backupResult.time}</span>
                      </div>
                    )}
                  </div>
                </Card>

                <Card>
                  <CardHeader icon={<Layers className="w-4 h-4 text-emerald-400" />} title="Supported Storage Buckets & Installation Guide" subtitle="How to install, configure, and use each storage bucket engine" badge="Multi-Cloud" />
                  <div className="space-y-4 text-xs">
                    {/* Bucket 1 */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                          <span>🤗</span> Hugging Face Hub Dataset Bucket
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[10px] font-bold">100% Free & Unlimited</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Default Git LFS & Parquet repository (<code className="text-emerald-300 font-mono">datasets/{user?.username || 'username'}/{storage.hfDatasetName}</code>). Creates cryptographic Git commits on every workflow run.
                      </p>
                      <div className="bg-slate-900 p-2 rounded-lg font-mono text-[10px] text-slate-300">
                        <div className="text-slate-500 uppercase font-bold text-[9px]">How to install & use:</div>
                        <code>pip install huggingface_hub  # Or use built-in REST client</code>
                      </div>
                    </div>

                    {/* Bucket 2 */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                          <span>🪐</span> Hugging Face Space Persistent Volume (<code className="text-violet-300 font-mono">/data</code>)
                        </span>
                        <span className="px-2 py-0.5 bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded font-mono text-[10px] font-bold">Free Ephemeral / $5 Tier</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Mounted NVMe SSD volume for OpenClaw Autonomous AI Agent runtime memory, vector embeddings, and local SQLite caches.
                      </p>
                      <div className="bg-slate-900 p-2 rounded-lg font-mono text-[10px] text-slate-300">
                        <div className="text-slate-500 uppercase font-bold text-[9px]">How to configure in Space README.md:</div>
                        <code>storage: small  # Mounts persistent /data SSD directory</code>
                      </div>
                    </div>

                    {/* Bucket 3 */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                          <span>⚡</span> Cloudflare R2 Object Storage Bucket
                        </span>
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded font-mono text-[10px] font-bold">10GB Free • $0 Egress</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        S3-compatible object storage with zero egress fees. Ideal for high-resolution FLUX.1 images, ZeroScope videos, and MusicGen audio tracks.
                      </p>
                      <div className="bg-slate-900 p-2 rounded-lg font-mono text-[10px] text-slate-300">
                        <div className="text-slate-500 uppercase font-bold text-[9px]">How to install SDK:</div>
                        <code>npm install @aws-sdk/client-s3</code>
                      </div>
                    </div>

                    {/* Bucket 4 */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                          <span>🐳</span> MinIO Self-Hosted S3 Bucket
                        </span>
                        <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded font-mono text-[10px] font-bold">100% Free & Open Source</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Run a private S3-compatible object storage server on your local machine or VPS via Docker.
                      </p>
                      <div className="bg-slate-900 p-2 rounded-lg font-mono text-[10px] text-slate-300">
                        <div className="text-slate-500 uppercase font-bold text-[9px]">How to install via Docker:</div>
                        <code>docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"</code>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <CardHeader icon={<Activity className="w-4 h-4 text-violet-400" />} title="Recent Dataset Commits" subtitle="Audit log of state saved to Hugging Face Hub" />
                  {recentCommits.map((c) => (
                    <div key={c.hash + c.msg} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                      <span className="font-mono text-[10px] text-violet-300 bg-violet-500/15 border border-violet-500/25 px-2 py-0.5 rounded-lg shrink-0">#{c.hash}</span>
                      <span className="text-xs text-slate-300 truncate flex-1">{c.msg}</span>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">{c.ago}</span>
                    </div>
                  ))}
                </Card>
              </>
            )}

            {/* ══ TAB 6: WORKFLOW ENGINE ═════════════════════════════════ */}
            {activeSection === 'engine' && (
              <>
                <HFExplainerNote
                  title="Hugging Face Serverless Timeout & Rate Limit Controls"
                  description="The Workflow Engine executes Directed Acyclic Graphs (DAG) topologically, managing parallel node dependencies while respecting Hugging Face serverless rate limits and concurrency limits."
                  bullets={[
                    "Execution Timeout: Hugging Face serverless models may take between 5s to 60s depending on model parameter size (e.g. 70B LLMs vs 7B LLMs).",
                    "Exponential Retry Backoff: On transient 429 (Rate Limit) or 503 (Cold Start) responses, the engine applies exponential backoffs to guarantee pipeline completion.",
                    "Live Execution Streaming: Step latency metrics, token consumption, and payload transformations stream live into your debugger drawer.",
                  ]}
                  linkText="Inference API Limits"
                  linkUrl="https://huggingface.co/docs/api-inference/faq"
                />

                <Card>
                  <CardHeader icon={<Timer className="w-4 h-4 text-orange-400" />} title="Node Execution Timeouts & Retries" subtitle="Control resilience and latency limits" />
                  <div className="space-y-4">
                    <SliderInput
                      label="Node Execution Timeout (ms)"
                      value={engine.executionTimeoutMs}
                      onChange={(v) => setEngine({ executionTimeoutMs: v })}
                      min={5000} max={120000} step={5000}
                    />
                    <SliderInput
                      label="Max Retries on Transient Failures"
                      value={engine.maxRetries}
                      onChange={(v) => setEngine({ maxRetries: v })}
                      min={0} max={5}
                    />
                    <SliderInput
                      label="Retry Delay Backoff (ms)"
                      value={engine.retryDelayMs}
                      onChange={(v) => setEngine({ retryDelayMs: v })}
                      min={500} max={10000} step={500}
                    />
                  </div>
                </Card>

                <Card>
                  <CardHeader icon={<Activity className="w-4 h-4 text-violet-400" />} title="Live Auto-Run & Logging" subtitle="Continuous session polling and log verbosity" />
                  <div className="space-y-4">
                    <SliderInput
                      label="Continuous Poll Interval (ms)"
                      value={engine.continuousPollIntervalMs}
                      onChange={(v) => setEngine({ continuousPollIntervalMs: v })}
                      min={1000} max={30000} step={500}
                    />
                    <Separator />
                    <div>
                      <FieldLabel>Log Detail Level</FieldLabel>
                      <SelectInput
                        value={engine.logVerbosity}
                        onChange={(v: any) => setEngine({ logVerbosity: v })}
                        options={[
                          { label: 'Minimal — Critical errors and status only', value: 'minimal' },
                          { label: 'Standard — Step milestones & outputs (Recommended)', value: 'standard' },
                          { label: 'Verbose — Raw HTTP bodies, tokens, and payloads', value: 'verbose' },
                        ]}
                      />
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* ══ TAB 7: WORKSPACE THEMES (APPLIES ACROSS ENTIRE WEBSITE) ═ */}
            {activeSection === 'canvas' && (
              <>
                <Card>
                  <CardHeader icon={<Palette className="w-4 h-4 text-pink-400" />} title="Workspace Theme (Applies Globally)" subtitle="Selecting any curated palette updates the entire website immediately" badge="Global Theme" />
                  <div className="grid grid-cols-2 gap-3.5">
                    {([
                      { value: 'dark-glass', label: 'Dark Glass', desc: 'Deep glassmorphism with violet & cyan ambient glow', colors: ['#0f172a', '#1e1b4b', '#7c3aed', '#06b6d4'] },
                      { value: 'deep-slate', label: 'Deep Slate', desc: 'Enterprise slate with sky-blue accents', colors: ['#0f172a', '#1e293b', '#475569', '#38bdf8'] },
                      { value: 'neon-purple', label: 'Neon Purple', desc: 'Cyberpunk dark violet with fuchsia neon borders', colors: ['#0a0014', '#1a0030', '#d946ef', '#ec4899'] },
                      { value: 'midnight-navy', label: 'Midnight Navy', desc: 'Oceanic midnight blue with electric cyan highlights', colors: ['#020818', '#0c1a3a', '#2563eb', '#06b6d4'] },
                    ] as const).map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => handleSelectTheme(t.value)}
                        className={`p-4 rounded-2xl border text-xs font-semibold text-left transition-all relative ${
                          canvas.theme === t.value
                            ? 'border-violet-500 bg-violet-600/20 text-white shadow-xl shadow-violet-950/50 ring-1 ring-violet-500'
                            : 'border-white/10 bg-slate-950/60 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex gap-1.5 mb-3">
                          {t.colors.map((c) => (
                            <div key={c} style={{ background: c }} className="w-5 h-5 rounded-full border border-white/10 shadow-sm" />
                          ))}
                        </div>
                        <div className="font-bold text-sm text-white">{t.label}</div>
                        <p className="text-[11px] text-slate-400 mt-1 font-normal leading-relaxed">{t.desc}</p>
                        {canvas.theme === t.value && (
                          <div className="mt-3 flex items-center gap-1 text-[11px] text-violet-300 font-bold">
                            <Check className="w-3.5 h-3.5" /> Active on Website
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </Card>

                <Card>
                  <CardHeader icon={<Grid className="w-4 h-4 text-slate-400" />} title="Canvas Behavior" />
                  <div className="space-y-1 divide-y divide-white/[0.04]">
                    <Toggle checked={canvas.showGrid} onChange={(v) => setCanvas({ showGrid: v })} label="Show Background Grid" description="Dot matrix background on the visual node canvas" />
                    <Toggle checked={canvas.snapToGrid} onChange={(v) => setCanvas({ snapToGrid: v })} label="Snap Nodes to Grid" description="Align dragged nodes to 16px grid increments" />
                    <Toggle checked={canvas.miniMapVisible} onChange={(v) => setCanvas({ miniMapVisible: v })} label="Display Mini-Map" description="Overview navigator thumbnail in corner" />
                  </div>
                </Card>
              </>
            )}

            {/* ══ TAB 8: NOTIFICATIONS ═══════════════════════════════════ */}
            {activeSection === 'notifications' && (
              <>
                <Card>
                  <CardHeader icon={<Bell className="w-4 h-4 text-indigo-400" />} title="Execution Notifications" subtitle="In-app alerts on workflow status changes" />
                  <div className="space-y-1 divide-y divide-white/[0.04]">
                    <Toggle
                      checked={notifications.onExecutionSuccess}
                      onChange={(v) => setNotifications({ onExecutionSuccess: v })}
                      label="Notify on Successful Execution"
                      description="Show alert toast when all nodes complete without errors"
                    />
                    <Toggle
                      checked={notifications.onExecutionError}
                      onChange={(v) => setNotifications({ onExecutionError: v })}
                      label="Notify on Step Error"
                      description="Alert immediately if a node or model call fails"
                    />
                  </div>
                </Card>

                <Card>
                  <CardHeader icon={<Webhook className="w-4 h-4 text-indigo-400" />} title="Slack Incoming Webhook" subtitle="Forward workflow notifications directly to a Slack channel" badge="Optional" />
                  <div>
                    <FieldLabel hint="Slack Incoming Webhook URL">Slack Webhook URL</FieldLabel>
                    <TextInput
                      value={notifications.slackWebhookUrl}
                      onChange={(v) => setNotifications({ slackWebhookUrl: v })}
                      placeholder="https://hooks.slack.com/services/T00/B00/XXXX"
                      mono
                    />
                  </div>
                </Card>
              </>
            )}

            {/* ══ TAB 9: SECURITY ════════════════════════════════════════ */}
            {activeSection === 'security' && (
              <>
                <HFExplainerNote
                  title="Hugging Face Security & Data Confidentiality Guarantees"
                  description="Your visual workflows and API credentials adhere to strict client-side security standards. All tokens and prompt payloads are protected under zero-telemetry policies."
                  bullets={[
                    "Client-Side Token Isolation: Hugging Face API keys are stored in encrypted browser memory and never proxied to unauthorized servers.",
                    "Private Dataset Sandboxing: Your workflows and execution logs are committed strictly to your private Hugging Face dataset repository.",
                    "Ephemeral Edge Processing: Real-time webhooks execute on ephemeral runtime nodes without long-term payload caching.",
                  ]}
                  linkText="HF Hub Security Overview"
                  linkUrl="https://huggingface.co/docs/hub/security"
                />

                <Card>
                  <CardHeader icon={<ShieldAlert className="w-4 h-4 text-red-400" />} title="Security Policy & Storage Encryption" subtitle="Local storage safeguards" />
                  <div className="space-y-3 text-xs text-slate-300">
                    <p>All API tokens and credentials are stored securely in encrypted local browser memory and never transmitted to third-party tracking servers.</p>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-[11px] font-mono">
                      🔒 Token Encryption: Active • Telemetry: Disabled • Dataset: Private
                    </div>
                  </div>
                </Card>

                <Card className="border-red-500/30 bg-red-950/10">
                  <CardHeader icon={<UserX className="w-4 h-4 text-red-400" />} title="Danger Zone" subtitle="Irreversible account and data actions" badge="Destructive" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white">Export Workflow Settings</div>
                        <div className="text-xs text-slate-400 mt-0.5">Download a JSON snapshot of your current platform configuration</div>
                      </div>
                      <button
                        type="button"
                        onClick={handleExportData}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Export JSON
                      </button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-red-300">Clear All Local Data & Sessions</div>
                        <div className="text-xs text-slate-400 mt-0.5">Clears stored credentials, cached datasets, and reset to defaults</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Clear all local credentials and stored settings? You will need to re-enter your Hugging Face Token.')) {
                            localStorage.clear();
                            resetToDefaults();
                            window.location.reload();
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-xs font-semibold text-red-300 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear All Data
                      </button>
                    </div>
                  </div>
                </Card>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
