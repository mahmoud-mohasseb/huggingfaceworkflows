'use client';

import React from 'react';
import { BaseNodeCard } from './BaseNodeCard';
import { NodeProps } from '@xyflow/react';
import { NodeData } from '../../../../../packages/shared-types';
import { Music, Volume2, Zap, Sliders, Activity } from 'lucide-react';

export const HFMusicGenNode: React.FC<NodeProps> = (props) => {
  const data = props.data as unknown as NodeData;
  const config = data.config || {};
  const modelId = config.model_id || 'facebook/musicgen-small';
  const prompt = config.prompt_template || 'Upbeat synthwave background music';
  const duration = config.duration_seconds || 8;

  const audioUrl = data.lastOutput?.audio_url;
  const genre = data.lastOutput?.genre || 'Stereo Audio';
  const bpm = data.lastOutput?.bpm || 120;

  return (
    <BaseNodeCard id={props.id} selected={props.selected} data={data}>
      <div className="space-y-2 text-[11px]">
        {/* Model ID Badge & Cost */}
        <div className="bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10 border border-cyan-500/30 p-2 rounded-xl text-cyan-300 font-mono text-[10px] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-1.5 truncate">
            <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate font-bold text-slate-200">{modelId}</span>
          </div>
          <span className="bg-cyan-500/20 px-1.5 py-0.5 rounded-lg text-cyan-200 font-bold text-[9px] shrink-0 border border-cyan-500/30">
            8⚡
          </span>
        </div>

        {/* Hyperparameters Summary */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800/80">
          <span>Duration: {duration}s</span>
          <span>BPM: {bpm}</span>
          <span className="text-cyan-400 font-bold">{genre}</span>
        </div>

        {/* Prompt Preview */}
        <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl text-[10px] text-slate-300 space-y-1">
          <div className="text-cyan-400 font-bold flex items-center justify-between text-[9px]">
            <span>MUSIC PROMPT</span>
            <Sliders className="w-3 h-3 text-slate-500" />
          </div>
          <p className="line-clamp-2 text-slate-300 font-mono italic">
            &ldquo;{prompt}&rdquo;
          </p>
        </div>

        {/* Live Audio Player Preview */}
        {audioUrl && (
          <div className="relative rounded-xl border border-cyan-500/40 bg-slate-900/90 p-2 space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-200">
              <span className="flex items-center gap-1 text-cyan-300">
                <Volume2 className="w-3.5 h-3.5" /> Generated Audio Beat
              </span>
              <span className="font-mono text-[9px] text-slate-400 flex items-center gap-1">
                <Activity className="w-2.5 h-2.5 text-cyan-400" /> {bpm} BPM
              </span>
            </div>
            <audio controls src={audioUrl} className="w-full h-8 rounded-lg text-xs" />
          </div>
        )}
      </div>
    </BaseNodeCard>
  );
};
