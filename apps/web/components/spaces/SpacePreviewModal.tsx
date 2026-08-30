'use client';

import React, { useState } from 'react';
import { X, ExternalLink, Cpu, Terminal, Plus, Sparkles, Check, Code } from 'lucide-react';
import { HFSpaceInfo } from '../../../../packages/shared-types';

interface SpacePreviewModalProps {
  space: HFSpaceInfo | null;
  onClose: () => void;
  onCreateNode: (space: HFSpaceInfo) => void;
}

export const SpacePreviewModal: React.FC<SpacePreviewModalProps> = ({ space, onClose, onCreateNode }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'endpoints'>('preview');

  if (!space) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Nav Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {space.title}
                <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> {space.hardware}
                </span>
              </h2>
              <p className="text-xs font-mono text-slate-400">{space.id}</p>
            </div>
          </div>

          {/* Action Tabs & Close */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'preview' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Live Preview
              </button>
              <button
                onClick={() => setActiveTab('endpoints')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'endpoints' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> API Endpoints
              </button>
            </div>

            <button
              onClick={() => onCreateNode(space)}
              className="py-1.5 px-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-violet-600/30"
            >
              <Plus className="w-4 h-4" /> Add to Canvas
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 bg-slate-950 overflow-hidden relative">
          {activeTab === 'preview' ? (
            <iframe
              src={space.embedUrl}
              title={space.title}
              className="w-full h-full border-none bg-slate-950"
              allow="accelerometer; ambient-light-sensor; camera; microphone; locate; gpu"
            />
          ) : (
            <div className="p-6 overflow-y-auto h-full space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
                <h3 className="text-sm font-bold text-violet-300 flex items-center gap-2">
                  <Code className="w-4 h-4" /> Gradio API Schema Introspection
                </h3>
                <p className="text-xs text-slate-400">
                  This Space provides ZeroGPU client endpoints. When added to the canvas, inputs and outputs are automatically bound.
                </p>
              </div>

              {space.endpoints?.map((ep, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="font-bold text-violet-400 text-sm">{ep.name}</span>
                    <span className="text-slate-400">{ep.description}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-slate-400 font-bold block">Input Parameters:</span>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-slate-300">
                        {ep.inputs.map((inP, i) => (
                          <div key={i} className="flex justify-between text-[11px]">
                            <span className="text-cyan-400">{inP.name}</span>
                            <span className="text-slate-500">{inP.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-slate-400 font-bold block">Output Payloads:</span>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-slate-300">
                        {ep.outputs.map((outP, i) => (
                          <div key={i} className="flex justify-between text-[11px]">
                            <span className="text-emerald-400">{outP.name}</span>
                            <span className="text-slate-500">{outP.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
