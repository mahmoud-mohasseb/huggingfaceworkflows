'use client';

import React from 'react';
import { Heart, Sparkles, ExternalLink, Play, Cpu, Zap, Shield, Plus } from 'lucide-react';
import { HFSpaceInfo } from '../../../../packages/shared-types';

interface SpaceCardProps {
  space: HFSpaceInfo;
  onPreview: (space: HFSpaceInfo) => void;
  onCreateNode: (space: HFSpaceInfo) => void;
}

export const SpaceCard: React.FC<SpaceCardProps> = ({ space, onPreview, onCreateNode }) => {
  const isZeroGPU = space.hardware === 'ZeroGPU';

  return (
    <div className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-violet-500/50 rounded-2xl p-5 transition-all shadow-xl flex flex-col justify-between space-y-4 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1">
      {/* Top Meta Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
              {space.author}
            </span>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                isZeroGPU
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              <Cpu className="w-3 h-3" /> {space.hardware}
            </span>
          </div>

          <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
            <Heart className="w-3 h-3 fill-rose-400" /> {space.likes.toLocaleString()}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-100 group-hover:text-violet-300 transition-colors">
          {space.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
          {space.description}
        </p>
      </div>

      {/* Endpoints Snippet & Action Buttons */}
      <div className="pt-3 border-t border-slate-800/80 space-y-3">
        {space.endpoints && space.endpoints.length > 0 && (
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 font-mono text-[10px] text-slate-400 flex items-center justify-between">
            <span className="text-violet-400 font-bold">{space.endpoints[0].name}</span>
            <span className="text-slate-500">{space.endpoints[0].inputs.length} Inputs → {space.endpoints[0].outputs.length} Output</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => onPreview(space)}
            className="flex-1 py-2 px-3 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" /> Live Preview
          </button>

          <button
            onClick={() => onCreateNode(space)}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-600/20 border border-violet-400/30 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Use as Node
          </button>
        </div>
      </div>
    </div>
  );
};
