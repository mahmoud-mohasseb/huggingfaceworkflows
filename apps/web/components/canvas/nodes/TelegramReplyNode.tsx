'use client';

import React from 'react';
import { BaseNodeCard } from './BaseNodeCard';
import { NodeProps } from '@xyflow/react';
import { NodeData } from '../../../../../packages/shared-types';
import { MessageCircle, CheckCircle2 } from 'lucide-react';

export const TelegramReplyNode: React.FC<NodeProps> = (props) => {
  const data = props.data as unknown as NodeData;
  const config = data.config || {};

  return (
    <BaseNodeCard id={props.id} selected={props.selected} data={data}>
      <div className="space-y-2 text-[11px]">
        <div className="bg-sky-500/10 border border-sky-500/30 p-2 rounded-lg text-sky-300 font-mono text-[10px] space-y-1">
          <div className="text-slate-400">Target Chat: <span className="text-slate-200">{config.chat_id_template || '{{ chat_id }}'}</span></div>
          <div className="text-slate-400">Template: <span className="text-violet-300 line-clamp-1">{config.message_template || 'Response text'}</span></div>
        </div>

        {data.lastOutput?.sent_status && (
          <div className="flex items-center justify-between text-emerald-400 font-mono text-[10px] bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Delivered
            </span>
            <span>Msg #{data.lastOutput.message_id}</span>
          </div>
        )}
      </div>
    </BaseNodeCard>
  );
};
