'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Variable,
  Terminal,
  Trash2,
  Zap,
  Info,
  Layers,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCode,
  Play,
  Eye,
  EyeOff,
  ExternalLink,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { NodeData } from '../../../../packages/shared-types';
import { NODE_REGISTRY } from '../../lib/nodeRegistry';
import { getAvailableUpstreamVariables } from '../../lib/engine/variableResolver';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { HF_MODEL_CATALOG, HFModelGuide } from '../../lib/huggingface/providers';

interface NodeInspectorProps {
  nodeId: string | null;
  nodes: any[];
  edges: any[];
  onUpdateConfig: (nodeId: string, config: Record<string, any>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode?: (nodeId: string) => void;
  onRunSingleNode?: (nodeId: string) => void;
  onClose: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  nodeId,
  nodes,
  edges,
  onUpdateConfig,
  onDeleteNode,
  onDuplicateNode,
  onRunSingleNode,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'params' | 'variables' | 'output'>('params');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [userModels, setUserModels] = useState<any[]>([]);
  const { hfToken } = useAuthStore();

  useEffect(() => {
    if (!hfToken) return;
    fetch(`/api/spaces?token=${encodeURIComponent(hfToken)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.userModels) setUserModels(json.userModels);
      })
      .catch(() => null);
  }, [hfToken]);

  if (!nodeId) return null;

  const targetNode = nodes.find((n) => n.id === nodeId);
  if (!targetNode) return null;

  const data = targetNode.data as NodeData;
  const nodeDef = NODE_REGISTRY[data.type as keyof typeof NODE_REGISTRY];
  const config = data.config || {};

  // Get available upstream variables
  const upstreamVars = getAvailableUpstreamVariables(nodeId, nodes, edges);

  const handleConfigChange = (key: string, value: any) => {
    onUpdateConfig(nodeId, {
      ...config,
      [key]: value,
    });
  };

  const handleInsertVariable = (path: string) => {
    const tag = `{{ ${path} }}`;
    if (activeField) {
      const currentVal = config[activeField] || '';
      handleConfigChange(activeField, currentVal + tag);
    } else {
      navigator.clipboard.writeText(tag);
      setCopiedVar(path);
      setTimeout(() => setCopiedVar(null), 1500);
    }
  };

  const toggleSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const [showHFGuide, setShowHFGuide] = useState(false);

  const currentModelId = config.model_id || config.model || (data.type === 'hf_image_gen' ? 'black-forest-labs/FLUX.1-schnell' : data.type === 'hf_video_gen' ? 'cerspense/zeroscope_v2_576w' : data.type === 'hf_music_gen' ? 'facebook/musicgen-small' : data.type === 'hf_speech_to_text' ? 'openai/whisper-large-v3' : data.type === 'openclaw_agent' ? 'openclaw/openclaw' : 'meta-llama/Llama-3.3-70B-Instruct');

  const matchedModelGuide = HF_MODEL_CATALOG.find(m => m.id === currentModelId || (typeof currentModelId === 'string' && currentModelId.includes(m.id.split('/')[1])));

  return (
    <aside className="w-96 border-l border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl h-full flex flex-col overflow-hidden z-20 shadow-2xl select-none">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>{data.label || 'Node Inspector'}</span>
              <span className="text-[10px] text-slate-500 font-mono">({targetNode.id})</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">Type: {data.type}</p>
          </div>
        </div>

        {/* Header Action Toolbar */}
        <div className="flex items-center gap-1">
          {onRunSingleNode && (
            <button
              onClick={() => onRunSingleNode(nodeId)}
              className="p-2 text-violet-400 hover:text-white hover:bg-violet-600/30 rounded-xl transition-colors flex items-center gap-1 text-[10px] font-bold"
              title="Test Single Node"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {onDuplicateNode && (
            <button
              onClick={() => onDuplicateNode(nodeId)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Duplicate Node"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onDeleteNode(nodeId)}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
            title="Delete Node"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="px-4 pt-3 border-b border-slate-800/80 shrink-0 bg-slate-950/60">
        <div className="bg-slate-900 border border-slate-800 p-0.5 rounded-xl flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('params')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'params'
                ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Parameters</span>
          </button>

          <button
            onClick={() => setActiveTab('variables')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'variables'
                ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Variable className="w-3.5 h-3.5" />
            <span>Variables ({upstreamVars.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('output')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'output'
                ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Output</span>
          </button>
        </div>
      </div>

      {/* Scrollable Tab Contents */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4 pb-28 overscroll-contain">
        {/* Tab 1: Parameters Schema Form */}
        {activeTab === 'params' && (
          <div className="space-y-4">
            {/* HF Model Step-by-Step Guide Drawer */}
            {matchedModelGuide && (
              <div className="bg-slate-900/90 border border-violet-500/30 rounded-2xl p-3.5 space-y-2.5 shadow-md">
                <button
                  type="button"
                  onClick={() => setShowHFGuide(!showHFGuide)}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-violet-300 hover:text-violet-200 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>🤗 HF Setup Guide ({matchedModelGuide.name})</span>
                  </span>
                  {showHFGuide ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {showHFGuide && (
                  <div className="space-y-3 pt-2 border-t border-violet-500/20 text-[11px] text-slate-300 leading-relaxed animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {matchedModelGuide.badge}
                      </span>
                      <a
                        href={matchedModelGuide.hfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-violet-400 hover:underline flex items-center gap-1 font-mono font-bold"
                      >
                        <span>View on Hub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <p className="text-slate-300">{matchedModelGuide.summary}</p>

                    <div className="space-y-2">
                      <div className="font-bold text-slate-200 text-xs">Step-by-Step Setup:</div>
                      {matchedModelGuide.steps.map((st, i) => (
                        <div key={i} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
                          <div className="font-bold text-slate-200 text-[11px]">{st.title}</div>
                          <div className="text-[10px] text-slate-400">{st.description}</div>
                          {st.codeSnippet && (
                            <code className="block bg-slate-900 px-2 py-1 rounded text-[10px] font-mono text-amber-300">
                              {st.codeSnippet}
                            </code>
                          )}
                        </div>
                      ))}
                    </div>

                    {matchedModelGuide.tips.length > 0 && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-[10px] text-amber-300 space-y-1">
                        <span className="font-bold">💡 Optimization Tips:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-amber-200/90">
                          {matchedModelGuide.tips.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 flex items-start gap-2">
              <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <span>
                Configure node parameters below. Updates reflect on canvas and execution in real-time.
              </span>
            </div>

            {/* Dynamic Parameter Fields */}
            {Object.keys(nodeDef?.defaultConfig || {}).map((paramKey) => {
              const val = config[paramKey] ?? nodeDef.defaultConfig[paramKey] ?? '';
              const schemaItem = nodeDef?.schema?.find((s: any) => s.id === paramKey);
              const isLongText = typeof val === 'string' && (val.length > 30 || paramKey.includes('prompt') || paramKey.includes('template') || paramKey.includes('code'));
              const isSecret = schemaItem?.type === 'secret' || paramKey.includes('token') || paramKey.includes('secret') || paramKey.includes('password');
              const isBoolean = schemaItem?.type === 'boolean' || typeof val === 'boolean';
              const isSlider = schemaItem?.type === 'slider' || typeof val === 'number';

              // Merge user personal models into select options if editing model_id
              let selectOptions = schemaItem?.options || [];
              if (paramKey === 'model_id' && userModels.length > 0) {
                const customOpts = userModels.map((m: any) => ({
                  label: `⭐ ${m.id} (My Account Model)`,
                  value: m.id,
                }));
                selectOptions = [...customOpts, ...selectOptions];
              }

              return (
                <div key={paramKey} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 capitalize">
                      {schemaItem?.label || paramKey.replace(/_/g, ' ')}
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">{paramKey}</span>
                  </div>

                  {schemaItem?.description && (
                    <p className="text-[10px] text-slate-400 leading-snug">{schemaItem.description}</p>
                  )}

                  {isBoolean ? (
                    <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                      <span className="text-xs text-slate-300 font-medium">Enabled</span>
                      <button
                        type="button"
                        onClick={() => handleConfigChange(paramKey, !Boolean(val))}
                        className={`relative w-10 h-5 rounded-full transition-all ${
                          Boolean(val) ? 'bg-violet-600' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                            Boolean(val) ? 'left-5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ) : schemaItem?.type === 'select' ? (
                    <select
                      value={val}
                      onChange={(e) => handleConfigChange(paramKey, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/50 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none transition-colors"
                    >
                      {selectOptions.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : isSlider ? (
                    <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Value</span>
                        <span className="text-violet-300 font-bold bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                          {val}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={schemaItem?.min ?? 0}
                        max={schemaItem?.max ?? 100}
                        step={schemaItem?.step ?? 1}
                        value={Number(val) || 0}
                        onChange={(e) => handleConfigChange(paramKey, Number(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none bg-slate-800 accent-violet-500 cursor-pointer"
                      />
                    </div>
                  ) : isSecret ? (
                    <div className="relative">
                      <input
                        type={showSecrets[paramKey] ? 'text' : 'password'}
                        value={val}
                        placeholder={schemaItem?.placeholder || '••••••••'}
                        onFocus={() => setActiveField(paramKey)}
                        onChange={(e) => handleConfigChange(paramKey, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/50 rounded-xl pl-3 pr-9 py-2 text-xs font-mono text-slate-100 focus:outline-none transition-colors placeholder-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret(paramKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showSecrets[paramKey] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : isLongText ? (
                    <div className="space-y-1.5">
                      {/* Prompt Presets */}
                      {paramKey.includes('prompt') && (
                        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                          <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider shrink-0 mr-1">Presets:</span>
                          <button
                            type="button"
                            onClick={() => handleConfigChange(paramKey, 'Cyberpunk neon city sunset 8k resolution photorealistic cinematic digital art')}
                            className="px-2 py-0.5 bg-slate-950 hover:bg-violet-600/30 border border-slate-800 hover:border-violet-500/50 rounded-lg text-[9px] text-slate-300 font-mono whitespace-nowrap transition-colors"
                          >
                            🌆 Cyberpunk
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfigChange(paramKey, 'An upbeat synthwave electronic music track with retro 80s arpeggiated basslines and punchy drums')}
                            className="px-2 py-0.5 bg-slate-950 hover:bg-cyan-600/30 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-[9px] text-slate-300 font-mono whitespace-nowrap transition-colors"
                          >
                            🎵 Synthwave
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfigChange(paramKey, 'A majestic cat flying through a starry space galaxy with nebula lights 4k video animation')}
                            className="px-2 py-0.5 bg-slate-950 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-[9px] text-slate-300 font-mono whitespace-nowrap transition-colors"
                          >
                            🎥 Video Motion
                          </button>
                        </div>
                      )}
                      <textarea
                        rows={4}
                        value={val}
                        placeholder={schemaItem?.placeholder}
                        onFocus={() => setActiveField(paramKey)}
                        onChange={(e) => handleConfigChange(paramKey, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/50 rounded-xl p-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none transition-colors leading-relaxed"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={val}
                      placeholder={schemaItem?.placeholder}
                      onFocus={() => setActiveField(paramKey)}
                      onChange={(e) => handleConfigChange(paramKey, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/50 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none transition-colors"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Available Upstream Variables */}
        {activeTab === 'variables' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
              Click any variable tag below to insert it into the active input field or copy to clipboard:
            </div>

            {upstreamVars.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-mono">
                No upstream connected nodes found yet. Connect edges to access upstream output variables!
              </div>
            ) : (
              <div className="space-y-2">
                {upstreamVars.map((v, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleInsertVariable(v.fullPath)}
                    className="w-full bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-violet-500/40 p-2.5 rounded-xl text-left flex items-center justify-between group transition-all"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-violet-300 font-mono">
                        {`{{ ${v.fullPath} }}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Node: <span className="text-slate-200">{v.nodeTitle}</span> ({v.outputPort})
                      </div>
                    </div>

                    <span className="p-1 bg-violet-500/10 text-violet-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedVar === v.fullPath ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Output Inspector */}
        {activeTab === 'output' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
              Live execution payload inspector for node <code className="text-violet-300 font-mono">{nodeId}</code>:
            </div>

            {data.lastOutput ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-xs text-emerald-300 font-mono">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Status: Success
                  </span>
                  <span>{data.executionTimeMs ? `${data.executionTimeMs}ms` : 'Finished'}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400">Raw JSON Payload Output:</span>
                  <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-80">
                    {JSON.stringify(data.lastOutput, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-2">
                <Terminal className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs text-slate-400">No output payload recorded yet</div>
                <div className="text-[10px] text-slate-500">Click &ldquo;Test Node&rdquo; or &ldquo;Execute Workflow&rdquo; to run this step!</div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
