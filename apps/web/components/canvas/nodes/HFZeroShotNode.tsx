'use client';

import React from 'react';
import { BaseNodeCard } from './BaseNodeCard';
import { NodeProps } from '@xyflow/react';
import { NodeData } from '../../../../../packages/shared-types';
import { Zap, CheckCircle2, Sliders, Tag, BarChart3, Layers } from 'lucide-react';

export const HFZeroShotNode: React.FC<NodeProps> = (props) => {
  const data = props.data as unknown as NodeData;
  const config = data.config || {};
  const modelId = config.model_id || 'facebook/bart-large-mnli';
  const modality = config.modality || 'text_intent';
  const candidateLabelsStr = config.candidate_labels || 'customer_support, sales, billing, technical_issue, spam';
  const candidateLabels = candidateLabelsStr.split(',').map((s: string) => s.trim()).filter(Boolean);
  const textPrompt = config.text || '{{ $node["Trigger"].text }}';

  const lastOut = data.lastOutput;
  const topLabel = lastOut?.top_label;
  const confidence = typeof lastOut?.confidence === 'number' ? lastOut.confidence : null;
  const scores = lastOut?.scores as Record<string, number> | undefined;

  // Modality display metadata
  const modalityMeta: Record<string, { label: string; icon: string; color: string }> = {
    text_intent: { label: 'Zero-Shot Text NLI', icon: '⚡', color: 'emerald' },
    vision_clip: { label: 'Zero-Shot Vision CLIP', icon: '👁️', color: 'cyan' },
    object_detection: { label: 'Zero-Shot Object Detection', icon: '🎯', color: 'amber' },
    audio_clap: { label: 'Zero-Shot Audio CLAP', icon: '🎙️', color: 'purple' },
  };

  const currentMod = modalityMeta[modality] || modalityMeta.text_intent;

  return (
    <BaseNodeCard id={props.id} selected={props.selected} data={data}>
      <div className="space-y-2.5 text-[11px]">
        {/* Model ID & Modality Banner */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 p-2 rounded-xl text-emerald-300 font-mono text-[10px] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-1.5 truncate">
            <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate font-bold text-slate-200">{modelId}</span>
          </div>
          <span className="bg-emerald-500/20 px-1.5 py-0.5 rounded-lg text-emerald-200 font-bold text-[9px] shrink-0 border border-emerald-500/30">
            0-Shot
          </span>
        </div>

        {/* Modality & Schema Indicator */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800/80">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span>{currentMod.icon}</span>
            <span>{currentMod.label}</span>
          </span>
          <span className="text-slate-500">{candidateLabels.length} Labels</span>
        </div>

        {/* Candidate Labels Tag Pills */}
        <div className="bg-slate-950/80 border border-slate-800/90 p-2 rounded-xl space-y-1.5">
          <div className="text-emerald-400 font-bold flex items-center justify-between text-[9px]">
            <span className="flex items-center gap-1">
              <Tag className="w-2.5 h-2.5 text-emerald-400" />
              <span>CANDIDATE LABELS</span>
            </span>
            <Sliders className="w-2.5 h-2.5 text-slate-500" />
          </div>
          <div className="flex flex-wrap gap-1">
            {candidateLabels.slice(0, 5).map((label: string, idx: number) => (
              <span
                key={idx}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-all ${
                  topLabel === label
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/60 font-bold shadow-sm'
                    : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'
                }`}
              >
                {label}
              </span>
            ))}
            {candidateLabels.length > 5 && (
              <span className="px-1 py-0.5 text-[9px] font-mono text-slate-500">
                +{candidateLabels.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Execution Live Result Card */}
        {topLabel && confidence !== null ? (
          <div className="p-2.5 rounded-xl bg-slate-900/95 border border-emerald-500/40 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Top Detected:</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-[10px]">
                🎯 {topLabel}
              </span>
            </div>

            {/* Confidence Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-mono">
                <span className="text-slate-400">Confidence Score:</span>
                <span className="text-emerald-300 font-bold">{(confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(6, confidence * 100)}%` }}
                />
              </div>
            </div>

            {/* Top 3 Scores Distribution */}
            {scores && Object.keys(scores).length > 0 && (
              <div className="pt-1 border-t border-white/5 space-y-1 text-[9px] font-mono">
                <span className="text-slate-500 flex items-center gap-1">
                  <BarChart3 className="w-2.5 h-2.5" /> Probability Breakdown
                </span>
                {Object.entries(scores)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([lbl, score]) => (
                    <div key={lbl} className="flex justify-between items-center text-slate-400">
                      <span className={`truncate max-w-[110px] ${lbl === topLabel ? 'text-emerald-300 font-semibold' : ''}`}>
                        {lbl}
                      </span>
                      <span className="text-slate-300">{(score * 100).toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
          /* Idle State Prompt Helper */
          <div className="px-2 py-1 rounded-lg bg-slate-950/60 border border-slate-900 text-[9px] font-mono text-slate-500 flex items-center justify-between">
            <span className="truncate italic">Ready to classify on execute</span>
            <span className="text-emerald-500/70">● Idle</span>
          </div>
        )}
      </div>
    </BaseNodeCard>
  );
};
