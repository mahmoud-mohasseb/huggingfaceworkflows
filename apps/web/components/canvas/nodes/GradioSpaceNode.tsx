'use client';

import React from 'react';
import { BaseNodeCard } from './BaseNodeCard';
import { NodeProps } from '@xyflow/react';
import { NodeData } from '../../../../../packages/shared-types';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

export const GradioSpaceNode: React.FC<NodeProps> = (props) => {
  const data = props.data as unknown as NodeData;
  const config = data.config || {};
  const spaceSlug = config.space_slug || 'black-forest-labs/FLUX.1-schnell';

  return (
    <BaseNodeCard id={props.id} selected={props.selected} data={data}>
      <div className="space-y-2 text-[11px]">
        <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg text-amber-300 font-mono text-[10px] flex items-center justify-between">
          <span className="truncate">{spaceSlug}</span>
          <span className="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200 font-bold text-[9px]">
            15⚡
          </span>
        </div>

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Steps: {config.num_inference_steps || 4}</span>
          <span>CFG: {config.guidance_scale || 7.5}</span>
          <span>Seed: {config.seed || 42}</span>
        </div>

        {data.lastOutput?.image_url && (
          <div className="relative rounded-lg overflow-hidden border border-slate-700 aspect-video group/img">
            <img
              src={data.lastOutput.image_url}
              alt="Generated Output"
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
            />
            <div className="absolute bottom-1 right-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[9px] text-amber-400 font-mono flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> FLUX.1 Rendered
            </div>
          </div>
        )}
      </div>
    </BaseNodeCard>
  );
};
