'use client';

import React, { useState, useEffect } from 'react';
import {
  X, BookOpen, Zap, Search, Sparkles, Send, Cpu, ArrowRight,
  Check, Filter, ExternalLink, ChevronDown, ChevronUp, Layers, HelpCircle
} from 'lucide-react';
import { Node, Edge } from '@xyflow/react';
import { WorkflowTemplatesList, WorkflowTemplate } from '../../lib/templates';

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (nodes: Node[], edges: Edge[], name: string) => void;
}

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);

  // Accessible Esc Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'openclaw', label: '🐾 OpenClaw Agents' },
    { id: 'telegram', label: 'Telegram Bots' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'image', label: 'Image Gen' },
    { id: 'video', label: 'Video Gen' },
    { id: 'audio', label: 'Audio & Music' },
    { id: 'reasoning', label: 'Reasoning & Code' },
  ];

  const filteredTemplates = WorkflowTemplatesList.filter((tpl) => {
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.badgeText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tpl.hfGuide?.hfModelSlug && tpl.hfGuide.hfModelSlug.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat =
      selectedCategory === 'all' ||
      (selectedCategory === 'openclaw' && (tpl.id.includes('openclaw') || tpl.name.includes('OpenClaw'))) ||
      (selectedCategory === 'telegram' && tpl.id.includes('telegram')) ||
      (selectedCategory === 'whatsapp' && tpl.id.includes('whatsapp')) ||
      (selectedCategory === 'image' && (tpl.id.includes('image') || tpl.id.includes('flux') || tpl.id.includes('vision'))) ||
      (selectedCategory === 'video' && tpl.id.includes('video')) ||
      (selectedCategory === 'audio' && (tpl.id.includes('music') || tpl.id.includes('whisper'))) ||
      (selectedCategory === 'reasoning' && (tpl.id.includes('reasoning') || tpl.id.includes('code')));

    return matchesSearch && matchesCat;
  });

  const toggleGuide = (tplId: string) => {
    setExpandedGuideId((prev) => (prev === tplId ? null : tplId));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div
        className="bg-slate-900/95 border border-slate-800/90 rounded-3xl p-6 max-w-5xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-violet-500 to-cyan-500 p-[1px] shadow-lg shadow-violet-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Hugging Face Template Library & A-to-Z Step Guides
              </h2>
              <p className="text-xs text-slate-400">Load ready-to-run AI agents, models, and bot pipelines with comprehensive Hugging Face instructions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
            aria-label="Close template library"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Search Input Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search templates (OpenClaw, FLUX.1, Llama 3.3, Whisper)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 font-bold'
                    : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid with A-to-Z Guide Drawers */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((tpl) => {
                const isExpanded = expandedGuideId === tpl.id;
                const guide = tpl.hfGuide;

                return (
                  <div
                    key={tpl.id}
                    className="bg-slate-950/90 border border-slate-800 hover:border-violet-500/50 rounded-2xl p-4 flex flex-col justify-between space-y-3.5 hover:shadow-xl hover:shadow-violet-900/10 transition-all group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-violet-500/15 border border-violet-500/25 text-violet-300 rounded-full text-[10px] font-mono font-bold">
                          {tpl.badgeText}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          <Zap className="w-3 h-3 fill-amber-400" /> Free HF Tier
                        </span>
                      </div>

                      {/* Template Title & Description */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-100 group-hover:text-violet-300 transition-colors">
                          {tpl.name}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mt-1">
                          {tpl.description}
                        </p>
                      </div>

                      {/* Visual Pipeline Flow */}
                      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2 space-y-1 font-mono text-[10px]">
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Pipeline Flow</div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {tpl.nodes.map((n: any, idx: number) => (
                            <React.Fragment key={n.id}>
                              <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-700/80 rounded text-slate-300 font-medium">
                                {n.data.label}
                              </span>
                              {idx < tpl.nodes.length - 1 && (
                                <span className="text-slate-600 font-bold">→</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Hugging Face A-to-Z Guide Button */}
                      {guide && (
                        <button
                          type="button"
                          onClick={() => toggleGuide(tpl.id)}
                          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-[11px] font-semibold transition-all"
                        >
                          <span className="flex items-center gap-1.5">
                            <span>🤗</span>
                            <span>Hugging Face A-to-Z Guide & Instructions</span>
                          </span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {/* Expanded A-to-Z Step-by-Step Box */}
                      {isExpanded && guide && (
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 space-y-2.5 text-xs animate-in fade-in duration-150">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span className="text-amber-300 font-bold">Hardware: {guide.hardwareTier}</span>
                            {guide.docUrl && (
                              <a
                                href={guide.docUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-violet-400 hover:text-violet-200 flex items-center gap-1 font-semibold"
                              >
                                <span>HF Docs</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {guide.summary}
                          </p>

                          {/* Step by Step List */}
                          <div className="space-y-1.5 pt-1 border-t border-white/5">
                            <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                              How to Use from A to Z:
                            </div>
                            <ol className="space-y-1 text-[11px] text-slate-300">
                              {guide.stepByStep.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Button */}
                    <button
                      onClick={() => {
                        onSelectTemplate(tpl.nodes, tpl.edges, tpl.name);
                        onClose();
                      }}
                      className="w-full py-2.5 px-3 bg-slate-900 group-hover:bg-violet-600 border border-slate-800 group-hover:border-violet-500 text-slate-200 group-hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md mt-2"
                    >
                      <span>Load Template into Canvas</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 text-xs">
                No matching workflow templates found for &ldquo;{searchQuery}&rdquo;.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
