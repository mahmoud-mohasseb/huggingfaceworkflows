'use client';

import React from 'react';
import { BaseNodeCard } from './BaseNodeCard';
import { NodeProps } from '@xyflow/react';
import { NodeData } from '../../../../../packages/shared-types';
import { Film, Zap, Sliders, ExternalLink, ImageIcon } from 'lucide-react';

export const HFVideoGenNode: React.FC<NodeProps> = (props) => {
  const data = props.data as unknown as NodeData;
  const config = data.config || {};
  const modelId = config.model_id || 'zeroscope_v2_576w';
  const prompt = config.user_prompt || 'A cat flying in space';

  const outputImageUrl = data.lastOutput?.preview_image_url || data.lastOutput?.video_url;

  return (
    <BaseNodeCard id={props.id} selected={props.selected} data={data}>
      <div className="space-y-2 text-[11px]">
        {/* Model ID Badge & Cost */}
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-500/30 p-2 rounded-xl text-indigo-300 font-mono text-[10px] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-1.5 truncate">
            <Film className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate font-bold text-slate-200">{modelId}</span>
          </div>
          <span className="bg-indigo-500/20 px-1.5 py-0.5 rounded-lg text-indigo-200 font-bold text-[9px] shrink-0 border border-indigo-500/30">
            20⚡
          </span>
        </div>

        {/* Hyperparameters Summary */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800/80">
          <span>FPS: 24</span>
          <span>Res: 576w</span>
          <span className="text-indigo-400 font-bold">Text-to-Video Scene</span>
        </div>

        {/* Prompt Preview */}
        <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl text-[10px] text-slate-300 space-y-1">
          <div className="text-indigo-400 font-bold flex items-center justify-between text-[9px]">
            <span>SCENE PROMPT</span>
            <Sliders className="w-3 h-3 text-slate-500" />
          </div>
          <p className="line-clamp-2 text-slate-300 font-mono italic">
            &ldquo;{prompt}&rdquo;
          </p>
        </div>

        {/* Live Output Image Link Card */}
        {outputImageUrl && (
          <div className="relative rounded-xl overflow-hidden border border-indigo-500/40 bg-slate-900/90 shadow-lg space-y-2 p-2">
            <div className="relative h-28 w-full rounded-lg overflow-hidden border border-white/10 bg-slate-950">
              <img
                src={outputImageUrl}
                alt={prompt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-1.5">
                <span className="text-[9px] font-mono text-indigo-300 font-bold flex items-center gap-1">
                  <ImageIcon className="w-2.5 h-2.5 text-indigo-400" /> Scene Image Output
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[9px] font-mono text-slate-300 truncate max-w-[160px]">
                  {outputImageUrl}
                </span>
              </div>
              <a
                href={outputImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                <span>View Image</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </BaseNodeCard>
  );
};
