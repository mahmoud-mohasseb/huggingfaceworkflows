'use client';

import React from 'react';
import { BaseNodeCard } from './BaseNodeCard';
import { NodeProps } from '@xyflow/react';
import { NodeData } from '../../../../../packages/shared-types';
import { Bot, Globe, Terminal, Database, Sparkles, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

export const OpenClawAgentNode: React.FC<NodeProps> = (props) => {
  const data = props.data as unknown as NodeData;
  const config = data.config || {};
  const role = config.agent_role || 'general_assistant';
  const spaceUrl = config.hf_space_url || 'openclaw/openclaw';
  const webSearch = config.enable_web_search !== false;
  const pythonRepl = config.enable_python_interpreter !== false;
  const datasetMemory = config.enable_dataset_memory !== false;

  const agentResponse = data.lastOutput?.agent_response || data.lastOutput?.response_text;
  const thoughtTrace = data.lastOutput?.thought_process;
  const toolCalls = data.lastOutput?.tool_calls as any[] | undefined;

  const roleLabelMap: Record<string, string> = {
    general_assistant: 'Personal Assistant',
    coding_developer: 'Python & Code Dev',
    deep_researcher: 'Web Researcher',
    customer_support: 'Support Specialist',
  };

  return (
    <BaseNodeCard id={props.id} selected={props.selected} data={data}>
      <div className="space-y-2.5 text-[11px]">
        {/* OpenClaw Space Badge */}
        <div className="bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-yellow-500/10 border border-orange-500/30 p-2 rounded-xl text-orange-300 font-mono text-[10px] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-sm">🐾</span>
            <span className="truncate font-bold text-slate-100">{spaceUrl}</span>
          </div>
          <span className="bg-orange-500/20 px-1.5 py-0.5 rounded-lg text-orange-200 font-bold text-[9px] shrink-0 border border-orange-500/30">
            Free 2 vCPU
          </span>
        </div>

        {/* Persona & Status */}
        <div className="flex justify-between items-center text-[10px] text-slate-300 font-mono bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
          <span className="text-slate-400">Role:</span>
          <span className="text-orange-300 font-bold">{roleLabelMap[role] || role}</span>
        </div>

        {/* Active Tools Matrix */}
        <div className="space-y-1">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Autonomous Tools</span>
            <span className="text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" /> ReAct Ready
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {webSearch && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[9px] font-mono">
                <Globe className="w-2.5 h-2.5" /> Web Search
              </span>
            )}
            {pythonRepl && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] font-mono">
                <Terminal className="w-2.5 h-2.5" /> Python REPL
              </span>
            )}
            {datasetMemory && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[9px] font-mono">
                <Database className="w-2.5 h-2.5" /> Hub Memory
              </span>
            )}
          </div>
        </div>

        {/* Executed Tools & Thought Trace Preview */}
        {toolCalls && toolCalls.length > 0 && (
          <div className="bg-slate-950/90 border border-orange-500/30 p-2 rounded-xl text-[10px] space-y-1">
            <div className="text-orange-300 font-bold flex items-center justify-between text-[9px]">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-orange-400" /> Tool Calls ({toolCalls.length})
              </span>
              <span className="font-mono text-slate-500">Autonomous</span>
            </div>
            <div className="space-y-1 pt-0.5">
              {toolCalls.map((tc, idx) => (
                <div key={idx} className="flex items-center justify-between text-[9px] font-mono text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-white/5">
                  <span className="text-orange-400 font-bold">`{tc.tool}`</span>
                  <span className="truncate max-w-[120px] text-slate-400">{tc.output}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent Response Output */}
        {agentResponse && (
          <div className="bg-slate-900/90 border border-emerald-500/30 p-2 rounded-xl text-[10px] text-slate-200 space-y-1">
            <div className="text-emerald-400 font-bold flex items-center justify-between text-[9px]">
              <span>AGENT OUTPUT</span>
              <Sparkles className="w-3 h-3" />
            </div>
            <p className="line-clamp-3 text-slate-300 font-sans leading-relaxed">
              {agentResponse}
            </p>
          </div>
        )}
      </div>
    </BaseNodeCard>
  );
};
