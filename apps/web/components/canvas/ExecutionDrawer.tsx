'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronUp,
  ChevronDown,
  Terminal,
  BarChart3,
  Zap,
  Image as ImageIcon,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  X,
  Trash2,
} from 'lucide-react';
import { ExecutionResult, RunLog, ExecutionStepMetric } from '../../../../packages/shared-types';

interface ExecutionDrawerProps {
  executionResult: ExecutionResult | null;
  isExecuting: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  onClearLogs?: () => void;
}

export const ExecutionDrawer: React.FC<ExecutionDrawerProps> = ({
  executionResult,
  isExecuting,
  isOpen,
  onToggleOpen,
  onClearLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'waterfall' | 'output'>('logs');
  const [logFilter, setLogFilter] = useState<string>('all');
  const [logSearch, setLogSearch] = useState<string>('');
  const [outputViewMode, setOutputViewMode] = useState<'json' | 'raw' | 'media'>('json');
  const [copied, setCopied] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (executionResult?.success) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#a855f7', '#38bdf8', '#34d399', '#f59e0b'],
        });
      } catch (e) {
        // Fallback
      }
    }
  }, [executionResult]);

  const logs = executionResult?.logs || [];
  const waterfall = executionResult?.waterfall || [];
  const totalLatency = executionResult?.totalLatencyMs || 0;
  const totalCredits = executionResult?.totalCredits || 0;
  const outputs = executionResult?.nodeOutputs || {};

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = logFilter === 'all' || log.level === logFilter;
    const matchesSearch =
      !logSearch ||
      log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.nodeTitle && log.nodeTitle.toLowerCase().includes(logSearch.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  const copyPayload = (payload: any) => {
    navigator.clipboard.writeText(typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Find all media URLs across output node payloads
  const mediaOutputs: Array<{ title: string; url: string; type: 'image' | 'audio' }> = [];
  Object.entries(outputs).forEach(([nodeId, payload]: [string, any]) => {
    if (payload?.image_url || payload?.preview_image_url) {
      mediaOutputs.push({ title: payload._nodeTitle || nodeId, url: payload.image_url || payload.preview_image_url, type: 'image' });
    }
    if (payload?.audio_url) {
      mediaOutputs.push({ title: payload._nodeTitle || nodeId, url: payload.audio_url, type: 'audio' });
    }
  });

  const toggleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      onToggleOpen();
      setIsMaximized(true);
    } else {
      setIsMaximized(!isMaximized);
    }
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMaximized(false);
    if (isOpen) onToggleOpen();
  };

  const drawerHeight = !isOpen ? 'h-10' : isMaximized ? 'h-[85vh]' : 'h-72';

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 border-t border-slate-800 transition-all duration-300 backdrop-blur-xl shadow-2xl flex flex-col ${drawerHeight}`}
    >
      {/* Header Bar / Drawer Trigger */}
      <div
        className="h-10 px-4 bg-slate-900/80 flex items-center justify-between border-b border-slate-800 select-none cursor-pointer hover:bg-slate-900 transition-colors"
        onClick={onToggleOpen}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            {isOpen ? <ChevronDown className="w-4 h-4 text-violet-400" /> : <ChevronUp className="w-4 h-4 text-violet-400" />}
            <span className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-violet-400" /> Execution & Debugger Console
            </span>
          </div>

          {/* Quick Metrics Summary */}
          {executionResult && (
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" /> Latency: <strong className="text-slate-200">{totalLatency}ms</strong>
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> Credits: <strong className="text-amber-400">{totalCredits}⚡</strong>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  executionResult.success
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {executionResult.success ? 'SUCCESS' : 'FAILED'}
              </span>
            </div>
          )}

          {isExecuting && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-mono border border-amber-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              Executing Workflow...
            </span>
          )}
        </div>

        {/* Tab Headers & Maximize/Minimize Action Controls inside header */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400" onClick={(e) => e.stopPropagation()}>
          {isOpen && (
            <>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'logs' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> Logs ({logs.length})
              </button>

              <button
                onClick={() => setActiveTab('waterfall')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'waterfall' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> Waterfall ({waterfall.length})
              </button>

              <button
                onClick={() => setActiveTab('output')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'output' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Output Inspection
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1" />
            </>
          )}

          {/* Maximize / Restore Button */}
          <button
            type="button"
            onClick={toggleMaximize}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isMaximized ? 'Restore Default Height' : 'Maximize Console'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5 text-violet-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Minimize / Close Button */}
          <button
            type="button"
            onClick={handleMinimize}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isOpen ? 'Minimize Console' : 'Expand Console'}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Drawer Expanded Content */}
      {isOpen && (
        <div className="flex-1 overflow-hidden bg-slate-950 p-3 font-mono text-xs text-slate-300">
          {/* TAB 1: REAL-TIME LOG STREAM */}
          {activeTab === 'logs' && (
            <div className="h-full flex flex-col space-y-2">
              {/* Log Controls */}
              <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-xl border border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      placeholder="Filter logs..."
                      className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-violet-500/40 w-44"
                    />
                  </div>

                  {['all', 'info', 'success', 'warn', 'error'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLogFilter(lvl)}
                      className={`px-2 py-1 rounded text-[10px] uppercase font-bold transition-all ${
                        logFilter === lvl
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                {onClearLogs && (
                  <button
                    onClick={onClearLogs}
                    className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Logs
                  </button>
                )}
              </div>

              {/* Log Output Console */}
              <div className="flex-1 overflow-y-auto space-y-1 bg-slate-950 p-2 rounded-xl border border-slate-800/80 font-mono text-[11px]">
                {filteredLogs.length === 0 ? (
                  <p className="text-slate-600 italic p-2">No execution logs recorded yet. Click &ldquo;Execute Full Workflow&rdquo; above.</p>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 py-0.5 hover:bg-slate-900/50 rounded px-1">
                      <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 uppercase ${
                          log.level === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : log.level === 'error'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : log.level === 'warn'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}
                      >
                        {log.level}
                      </span>
                      {log.nodeTitle && (
                        <span className="text-violet-300 font-semibold shrink-0">[{log.nodeTitle}]</span>
                      )}
                      <span className="text-slate-300 break-all">{log.message}</span>
                    </div>
                  ))
                )}
              </div>

              {/* 🤗 Hugging Face Diagnostic & Solution Matrix */}
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl space-y-1 text-[10px] shrink-0">
                <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800/60 pb-1">
                  <span className="flex items-center gap-1.5">
                    <span>🤗</span>
                    <span>Hugging Face Diagnostic & Solution Matrix</span>
                  </span>
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-violet-300 underline font-semibold"
                  >
                    Get Write Token ↗
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[9px] leading-relaxed">
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800/60">
                    <span className="text-rose-400 font-bold block mb-0.5">🔴 401 Unauthorized</span>
                    <span className="text-slate-400">Token missing or lacks Write role. Generate a Write Token at <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="text-violet-400 underline">hf.co/settings/tokens</a> and re-login.</span>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800/60">
                    <span className="text-amber-400 font-bold block mb-0.5">🟡 503 Cold Start</span>
                    <span className="text-slate-400">Model hardware is spinning up on HF serverless infrastructure. Wait 10s and re-run workflow.</span>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800/60">
                    <span className="text-emerald-400 font-bold block mb-0.5">🟢 200 Real Response</span>
                    <span className="text-slate-400">Model executed via Hugging Face Router &amp; passed generated payload to downstream nodes.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEP EXECUTION WATERFALL (Gantt Chart Latency) */}
          {activeTab === 'waterfall' && (
            <div className="h-full overflow-y-auto space-y-3 p-1">
              {waterfall.length === 0 ? (
                <p className="text-slate-600 italic p-2">Run workflow to generate step latency waterfall timing metrics.</p>
              ) : (
                <div className="space-y-2">
                  {waterfall.map((step) => {
                    const percentage = Math.min(100, Math.max(8, (step.durationMs / (totalLatency || 1)) * 100));

                    return (
                      <div key={step.nodeId} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-violet-400" />
                            {step.nodeTitle}
                          </span>
                          <div className="flex items-center gap-3 font-mono text-[11px]">
                            <span className="text-cyan-300 font-bold">{step.durationMs}ms</span>
                            {step.creditsConsumed !== undefined && (
                              <span className="text-amber-400">{step.creditsConsumed}⚡</span>
                            )}
                          </div>
                        </div>

                        {/* Gantt Bar Visual */}
                        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OUTPUT INSPECTION PANE */}
          {activeTab === 'output' && (
            <div className="h-full flex flex-col space-y-2">
              <div className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">View Format:</span>
                  <button
                    onClick={() => setOutputViewMode('json')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      outputViewMode === 'json' ? 'bg-violet-600 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    JSON Tree
                  </button>
                  <button
                    onClick={() => setOutputViewMode('raw')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      outputViewMode === 'raw' ? 'bg-violet-600 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    Raw String
                  </button>
                  <button
                    onClick={() => setOutputViewMode('media')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 ${
                      outputViewMode === 'media' ? 'bg-violet-600 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" /> Media Gallery ({mediaOutputs.length})
                  </button>
                </div>

                <button
                  onClick={() => copyPayload(outputs)}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy All'}</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-950 p-3 rounded-xl border border-slate-800">
                {outputViewMode === 'json' && (
                  <pre className="text-cyan-300 font-mono text-[11px]">
                    {JSON.stringify(outputs, null, 2)}
                  </pre>
                )}

                {outputViewMode === 'raw' && (
                  <div className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap">
                    {Object.entries(outputs)
                      .map(([k, v]) => `=== Node: ${k} ===\n${JSON.stringify(v, null, 2)}`)
                      .join('\n\n')}
                  </div>
                )}

                {outputViewMode === 'media' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {mediaOutputs.length === 0 ? (
                      <p className="text-slate-500 italic col-span-3">No media outputs rendered in workflow execution yet.</p>
                    ) : (
                      mediaOutputs.map((item, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-2 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-300 block truncate">{item.title}</span>
                          {item.type === 'image' && (
                            <img src={item.url} alt="Media" className="w-full h-24 object-cover rounded-lg" />
                          )}
                          {item.type === 'audio' && <audio controls src={item.url} className="w-full h-8" />}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </footer>
  );
};
