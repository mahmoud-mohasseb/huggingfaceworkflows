'use client';

import React from 'react';
import { BaseNodeCard } from './BaseNodeCard';
import { NodeProps } from '@xyflow/react';
import { NodeData } from '../../../../../packages/shared-types';
import { Cpu, Zap } from 'lucide-react';

export const HFRouterNode: React.FC<NodeProps> = (props) => {
  const data = props.data as unknown as NodeData;
  const config = data.config || {};
  const modelId = config.model_id || 'meta-llama/Llama-3.3-70B-Instruct';

  return (
    <BaseNodeCard id={props.id} selected={props.selected} data={data}>
      <div className="space-y-2 text-[11px]">
        <div className="bg-purple-500/10 border border-purple-500/30 p-2 rounded-lg text-purple-300 font-mono text-[10px] flex items-center justify-between">
          <span className="truncate max-w-[170px]">{modelId}</span>
          <span className="bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-200 font-bold text-[9px] flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5 fill-purple-300" /> 5⚡
          </span>
        </div>

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Temp: {config.temperature || 0.7}</span>
          <span>Max Tokens: {config.max_new_tokens || 1024}</span>
        </div>

        {data.lastOutput?.response_text && (
          <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg font-mono text-[10px] text-slate-300 space-y-1">
            <div className="text-purple-400 font-bold flex justify-between">
              <span>LLM Output:</span>
              <span className="text-slate-500">{data.lastOutput.token_count || 240} tokens</span>
            </div>
            <p className="line-clamp-2 text-slate-300 italic">{data.lastOutput.response_text}</p>
          </div>
        )}
      </div>
    </BaseNodeCard>
  );
};
