'use client';

import React from 'react';
import { BaseNodeCard } from './BaseNodeCard';
import { NodeProps } from '@xyflow/react';
import { NodeData } from '../../../../../packages/shared-types';
import { MessageSquare, CheckCircle2 } from 'lucide-react';

export const WhatsAppTriggerNode: React.FC<NodeProps> = (props) => {
  const data = props.data as unknown as NodeData;
  const config = data.config || {};

  return (
    <BaseNodeCard id={props.id} selected={props.selected} data={data}>
      <div className="space-y-2 text-[11px]">
        <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 font-mono">Meta Webhook:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Listening
          </span>
        </div>

        <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/60 font-mono text-[10px] space-y-1">
          <div className="text-slate-400">Phone ID: <span className="text-slate-200">{config.phone_number_id || '10884920'}</span></div>
          <div className="text-slate-400">Mode: <span className="text-emerald-300">{config.event_filter || 'messages_and_media'}</span></div>
        </div>

        {data.lastOutput?.message_body && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg text-emerald-200 font-mono text-[10px]">
            <span className="text-emerald-400 font-bold block">Inbound Body:</span>
            "{data.lastOutput.message_body}"
          </div>
        )}
      </div>
    </BaseNodeCard>
  );
};
