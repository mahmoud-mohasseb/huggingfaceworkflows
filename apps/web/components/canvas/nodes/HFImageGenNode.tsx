'use client';

import React from 'react';
import { BaseNodeCard } from './BaseNodeCard';
import { NodeProps } from '@xyflow/react';
import { NodeData } from '../../../../../packages/shared-types';
import { Sparkles, Image as ImageIcon, Zap, Sliders } from 'lucide-react';

export const HFImageGenNode: React.FC<NodeProps> = (props) => {
  const data = props.data as unknown as NodeData;
  const config = data.config || {};
  const modelId = config.model_id || 'black-forest-labs/FLUX.1-schnell';
  const prompt = config.prompt_template || 'Cyberpunk neon city sunset art';

  return (
    <BaseNodeCard id={props.id} selected={props.selected} data={data}>
      <div className="space-y-2 text-[11px]">
        {/* Model ID Badge & Cost */}
        <div className="bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 border border-violet-500/30 p-2 rounded-xl text-violet-300 font-mono text-[10px] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="truncate font-bold text-slate-200">{modelId}</span>
          </div>
          <span className="bg-violet-500/20 px-1.5 py-0.5 rounded-lg text-violet-200 font-bold text-[9px] shrink-0 border border-violet-500/30">
            10⚡
          </span>
        </div>

        {/* Hyperparameters Summary */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800/80">
          <span>Width: 1024px</span>
          <span>Height: 1024px</span>
          <span className="text-violet-400 font-bold">FLUX.1</span>
        </div>

        {/* Prompt Template Preview */}
        <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl text-[10px] text-slate-300 space-y-1">
          <div className="text-violet-400 font-bold flex items-center justify-between text-[9px]">
            <span>PROMPT TEMPLATE</span>
            <Sliders className="w-3 h-3 text-slate-500" />
          </div>
          <p className="line-clamp-2 text-slate-300 font-mono italic">
            "{prompt}"
          </p>
        </div>

        {/* Live Output Render Thumbnail Preview */}
        {data.lastOutput?.image_url && (
          <div className="relative rounded-xl overflow-hidden border border-violet-500/40 aspect-video group/img shadow-lg shadow-violet-950/20">
            <img
              src={data.lastOutput.image_url}
              alt="Generated Image Output"
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-1.5 right-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 px-2 py-0.5 rounded-lg text-[9px] text-violet-300 font-mono font-bold flex items-center gap-1.5 shadow-md">
              <ImageIcon className="w-3 h-3 text-violet-400" /> Generated Art
            </div>
          </div>
        )}
      </div>
    </BaseNodeCard>
  );
};
