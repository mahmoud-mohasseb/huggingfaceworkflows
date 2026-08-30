'use client';

import React from 'react';
import { BaseNodeCard } from './BaseNodeCard';
import { NodeProps } from '@xyflow/react';
import { NodeData } from '../../../../../packages/shared-types';
import { Code2 } from 'lucide-react';

export const LogicTransformNode: React.FC<NodeProps> = (props) => {
  const data = props.data as unknown as NodeData;
  const config = data.config || {};

  return (
    <BaseNodeCard id={props.id} selected={props.selected} data={data}>
      <div className="space-y-2 text-[11px]">
        <div className="bg-pink-500/10 border border-pink-500/30 p-2 rounded-lg text-pink-300 font-mono text-[10px] flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5" /> JS Expression
          </span>
          <span className="text-slate-400 font-normal">{config.output_format || 'json_object'}</span>
        </div>

        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 font-mono text-[9px] text-slate-400 max-h-16 overflow-hidden">
          <pre className="whitespace-pre-wrap">{config.transform_code || '// custom JS transform'}</pre>
        </div>

        {data.lastOutput?.result && (
          <div className="bg-pink-500/5 border border-pink-500/20 p-2 rounded-lg font-mono text-[10px] text-pink-200">
            <span className="text-pink-400 font-bold block">Transformed Result:</span>
            <pre className="text-[9px] line-clamp-2">{JSON.stringify(data.lastOutput.result, null, 2)}</pre>
          </div>
        )}
      </div>
    </BaseNodeCard>
  );
};
