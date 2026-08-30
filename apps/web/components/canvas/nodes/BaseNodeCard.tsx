'use client';

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Play,
  Square,
  Copy,
  Ban,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  MessageSquare,
  Sparkles,
  Cpu,
  Code2,
  MessageCircle,
  SendHorizontal,
} from 'lucide-react';
import { NodeData, NodeExecutionStatus, PortDefinition } from '../../../../../packages/shared-types';
import { NODE_REGISTRY } from '../../../lib/nodeRegistry';

const ICON_MAP: Record<string, React.ElementType> = {
  Send,
  MessageSquare,
  Sparkles,
  Cpu,
  Code2,
  MessageCircle,
  SendHorizontal,
};

interface BaseNodeCardProps {
  id: string;
  selected?: boolean;
  data: NodeData;
  children?: React.ReactNode;
  onRunNode?: (id: string) => void;
  onDuplicateNode?: (id: string) => void;
  onToggleDisableNode?: (id: string) => void;
  onDeleteNode?: (id: string) => void;
}

export const BaseNodeCard: React.FC<BaseNodeCardProps> = ({
  id,
  selected = false,
  data,
  children,
  onRunNode,
  onDuplicateNode,
  onToggleDisableNode,
  onDeleteNode,
}) => {
  const [hoveredPort, setHoveredPort] = useState<string | null>(null);

  const nodeDef = NODE_REGISTRY[data.type];
  const accentColor = nodeDef?.accentColor || '#a855f7';
  const IconComponent = ICON_MAP[nodeDef?.iconName || 'Sparkles'] || Sparkles;

  const handleRunClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.status === 'running') {
      // If running, clicking Stop cancels / resets
      const toggleFn = onToggleDisableNode || (data as any)?.onToggleDisableNode;
      if (toggleFn) toggleFn(id);
    } else {
      const runFn = onRunNode || (data as any)?.onRunNode;
      if (runFn) runFn(id);
    }
  };

  const handleDuplicateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const dupFn = onDuplicateNode || (data as any)?.onDuplicateNode;
    if (dupFn) dupFn(id);
  };

  const handleToggleDisableClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const toggleFn = onToggleDisableNode || (data as any)?.onToggleDisableNode;
    if (toggleFn) toggleFn(id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const delFn = onDeleteNode || (data as any)?.onDeleteNode;
    if (delFn) delFn(id);
  };

  const renderStatusPill = (status: NodeExecutionStatus) => {
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
            <span>Running...</span>
          </span>
        );
      case 'success':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Success</span>
            {data.executionTimeMs && <span className="font-mono text-[9px] text-emerald-500">({data.executionTimeMs}ms)</span>}
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
            Idle
          </span>
        );
    }
  };

  return (
    <div className="relative group select-none">
      {/* Floating Hover & Selected Toolbar */}
      <div className={`absolute -top-10 left-1/2 -translate-x-1/2 ${selected ? 'flex' : 'hidden group-hover:flex'} items-center gap-1 bg-slate-900/95 border border-slate-700/80 rounded-xl p-1 shadow-2xl z-50 backdrop-blur-md transition-all animate-in fade-in zoom-in-95`}>
        <button
          type="button"
          onClick={handleRunClick}
          title={data.status === 'running' ? 'Stop Execution' : 'Run Node'}
          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold ${
            data.status === 'running'
              ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
              : 'hover:bg-violet-600/30 text-violet-300'
          }`}
        >
          {data.status === 'running' ? (
            <><Square className="w-3 h-3 fill-rose-300 text-rose-300" /> Stop</>
          ) : (
            <><Play className="w-3 h-3 fill-violet-300 text-violet-300" /> Run</>
          )}
        </button>
        <div className="h-3 w-[1px] bg-slate-700" />
        <button
          type="button"
          onClick={handleDuplicateClick}
          title="Duplicate Node"
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-medium"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleToggleDisableClick}
          title={data.disabled ? 'Enable Node' : 'Disable / Stop Node'}
          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-medium ${
            data.disabled ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Ban className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          title="Delete Node"
          className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Node Card Shell */}
      <div
        className={`w-72 rounded-xl bg-slate-950/90 border transition-all shadow-xl backdrop-blur-md overflow-hidden ${
          data.disabled ? 'opacity-50 grayscale' : ''
        } ${
          selected
            ? 'ring-2 ring-violet-500 shadow-violet-500/20 shadow-2xl border-violet-400'
            : 'border-slate-800/90 hover:border-violet-500/50 hover:shadow-violet-500/10'
        }`}
        style={{
          boxShadow: selected
            ? `0 0 20px ${accentColor}25, 0 10px 25px rgba(0,0,0,0.8)`
            : '0 10px 25px rgba(0,0,0,0.5)',
        }}
      >
        {/* Accent Glow Strip */}
        <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />

        {/* Card Header */}
        <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center border shadow-sm"
              style={{
                backgroundColor: `${accentColor}20`,
                borderColor: `${accentColor}50`,
                color: accentColor,
              }}
            >
              <IconComponent className="w-4 h-4" />
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                {data.label}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono line-clamp-1">
                {data.subtitle || nodeDef?.defaultSubtitle || nodeDef?.categoryLabel}
              </p>
            </div>
          </div>

          {/* Execution Status Pill */}
          {renderStatusPill(data.status)}
        </div>

        {/* Card Body / Controls Snippet */}
        {children && <div className="p-3 bg-slate-950/60 text-xs text-slate-300">{children}</div>}

        {/* Footer Port Labels Info */}
        <div className="px-3.5 py-2 bg-slate-900/30 border-t border-slate-900 flex justify-between text-[10px] font-mono text-slate-500">
          <span>{data.inputs?.length || 0} In</span>
          <span>{data.outputs?.length || 0} Out</span>
        </div>
      </div>

      {/* Target Input Ports (Left) */}
      {data.inputs?.map((port: PortDefinition, index: number) => {
        const topOffset = 60 + index * 26;
        const portColor = port.color || '#38bdf8';

        return (
          <React.Fragment key={`in_${port.id}`}>
            <Handle
              type="target"
              position={Position.Left}
              id={port.id}
              style={{
                top: `${topOffset}px`,
                left: '-8px',
                width: '14px',
                height: '14px',
                backgroundColor: '#020617',
                borderColor: portColor,
                borderWidth: '2.5px',
                borderRadius: '50%',
              }}
              onMouseEnter={() => setHoveredPort(`in_${port.id}`)}
              onMouseLeave={() => setHoveredPort(null)}
            />
            {/* Input Tooltip */}
            {hoveredPort === `in_${port.id}` && (
              <div className="absolute left-[-160px] z-50 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-200 shadow-xl" style={{ top: `${topOffset - 10}px` }}>
                In: <span style={{ color: portColor }}>{port.label}</span> ({port.type})
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Source Output Ports (Right) */}
      {data.outputs?.map((port: PortDefinition, index: number) => {
        const topOffset = 60 + index * 26;
        const portColor = port.color || '#a855f7';

        return (
          <React.Fragment key={`out_${port.id}`}>
            <Handle
              type="source"
              position={Position.Right}
              id={port.id}
              style={{
                top: `${topOffset}px`,
                right: '-8px',
                width: '14px',
                height: '14px',
                backgroundColor: '#020617',
                borderColor: portColor,
                borderWidth: '2.5px',
                borderRadius: '50%',
              }}
              onMouseEnter={() => setHoveredPort(`out_${port.id}`)}
              onMouseLeave={() => setHoveredPort(null)}
            />
            {/* Output Tooltip */}
            {hoveredPort === `out_${port.id}` && (
              <div className="absolute right-[-160px] z-50 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-200 shadow-xl" style={{ top: `${topOffset - 10}px` }}>
                Out: <span style={{ color: portColor }}>{port.label}</span> ({port.type})
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
