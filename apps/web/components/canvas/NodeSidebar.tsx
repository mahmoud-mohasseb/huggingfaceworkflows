'use client';

import React, { useState } from 'react';
import {
  Search,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Send,
  MessageSquare,
  Bot,
  Code,
  Zap,
  Layers,
  ChevronLeft,
  X,
  Cpu,
  Shield,
  Sliders,
  Image as ImageIcon,
  Video,
  Music,
  Mic,
  Plus,
} from 'lucide-react';
import { NodeCategory } from '../../../../packages/shared-types';
import { NODE_REGISTRY } from '../../lib/nodeRegistry';

interface NodeSidebarProps {
  onAddNode?: (nodeType: string) => void;
}

const CATEGORY_META: Record<NodeCategory, { title: string; icon: any; color: string; ringColor: string }> = {
  triggers: {
    title: 'Inbound Triggers',
    icon: Send,
    color: 'text-emerald-400',
    ringColor: 'ring-emerald-500/30 bg-emerald-500/10',
  },
  models: {
    title: 'Hugging Face Models',
    icon: Bot,
    color: 'text-violet-400',
    ringColor: 'ring-violet-500/30 bg-violet-500/10',
  },
  logic: {
    title: 'Logic & Code',
    icon: Code,
    color: 'text-amber-400',
    ringColor: 'ring-amber-500/30 bg-amber-500/10',
  },
  actions: {
    title: 'Messaging Actions',
    icon: MessageSquare,
    color: 'text-sky-400',
    ringColor: 'ring-sky-500/30 bg-sky-500/10',
  },
};

const HARDWARE_BADGES: Record<string, { text: string; bg: string; border: string; color: string }> = {
  telegram_trigger: { text: 'Telegram Webhook', bg: 'bg-sky-500/10', border: 'border-sky-500/30', color: 'text-sky-400' },
  whatsapp_trigger: { text: 'WhatsApp Cloud API', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', color: 'text-emerald-400' },
  gradio_space: { text: 'ZeroGPU Space', bg: 'bg-amber-500/10', border: 'border-amber-500/30', color: 'text-amber-400' },
  hf_router: { text: 'Serverless LLM', bg: 'bg-violet-500/10', border: 'border-violet-500/30', color: 'text-violet-400' },
  hf_image_gen: { text: 'FLUX.1 Free', bg: 'bg-pink-500/10', border: 'border-pink-500/30', color: 'text-pink-400' },
  hf_video_gen: { text: 'ZeroScope Free', bg: 'bg-purple-500/10', border: 'border-purple-500/30', color: 'text-purple-400' },
  hf_music_gen: { text: 'MusicGen Free', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', color: 'text-cyan-400' },
  hf_speech_to_text: { text: 'Whisper v3 Free', bg: 'bg-blue-500/10', border: 'border-blue-500/30', color: 'text-blue-400' },
  openclaw_agent: { text: 'OpenClaw Agent', bg: 'bg-orange-500/10', border: 'border-orange-500/30', color: 'text-orange-400' },
  logic_transform: { text: 'JS Transform', bg: 'bg-amber-500/10', border: 'border-amber-500/30', color: 'text-amber-400' },
  telegram_reply: { text: 'Telegram Send', bg: 'bg-sky-500/10', border: 'border-sky-500/30', color: 'text-sky-400' },
  whatsapp_reply: { text: 'WhatsApp Send', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', color: 'text-emerald-400' },
};

export const NodeSidebar: React.FC<NodeSidebarProps> = ({ onAddNode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [collapsed, setCollapsed] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    triggers: true,
    models: true,
    logic: true,
    actions: true,
  });

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const allNodeTypes = Object.entries(NODE_REGISTRY);

  const q = searchQuery.toLowerCase().trim();

  const filteredNodes = allNodeTypes.filter(([type, nodeDef]) => {
    if (!q) {
      if (selectedTag === 'All') return true;
      if (selectedTag === 'Triggers') return nodeDef.category === 'triggers';
      if (selectedTag === 'Models') return nodeDef.category === 'models';
      if (selectedTag === 'Logic') return nodeDef.category === 'logic';
      if (selectedTag === 'Actions') return nodeDef.category === 'actions';
      return true;
    }

    const matchesSearch =
      nodeDef.title.toLowerCase().includes(q) ||
      nodeDef.description.toLowerCase().includes(q) ||
      (nodeDef.defaultSubtitle && nodeDef.defaultSubtitle.toLowerCase().includes(q)) ||
      (nodeDef.categoryLabel && nodeDef.categoryLabel.toLowerCase().includes(q)) ||
      type.toLowerCase().includes(q) ||
      (nodeDef.outputs && nodeDef.outputs.some((o: any) => o.label?.toLowerCase().includes(q)));

    if (selectedTag === 'All') return matchesSearch;
    if (selectedTag === 'Triggers') return matchesSearch && nodeDef.category === 'triggers';
    if (selectedTag === 'Models') return matchesSearch && nodeDef.category === 'models';
    if (selectedTag === 'Logic') return matchesSearch && nodeDef.category === 'logic';
    if (selectedTag === 'Actions') return matchesSearch && nodeDef.category === 'actions';
    return matchesSearch;
  });

  const categories: NodeCategory[] = ['triggers', 'models', 'logic', 'actions'];

  return (
    <aside
      className={`bg-slate-950/90 border-r border-slate-800/80 backdrop-blur-xl flex flex-col h-full z-20 transition-all duration-300 select-none ${
        collapsed ? 'w-14' : 'w-72'
      }`}
    >
      {/* Sidebar Header & Collapse Toggle */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="p-1 bg-violet-500/10 rounded-lg text-violet-400 border border-violet-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Node Palette
              </h2>
              <p className="text-[9px] text-slate-400 font-mono">11 AI & Bot Nodes</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors mx-auto"
          title={collapsed ? 'Expand Palette' : 'Collapse Palette'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Search Header */}
          <div className="p-3 space-y-2 border-b border-slate-800/60 bg-slate-900/30">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search 11 node components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchQuery('');
                }}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-violet-500 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Match Summary */}
            {searchQuery && (
              <div className="flex items-center justify-between text-[10px] font-mono px-1 text-slate-400">
                <span>Results: <b className="text-violet-300">{filteredNodes.length}</b> nodes</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-violet-400 hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
              {['All', 'Triggers', 'Models', 'Logic', 'Actions'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-all whitespace-nowrap ${
                    selectedTag === tag
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Node Category List & Results */}
          <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-4 pb-24 overscroll-contain">
            {filteredNodes.length === 0 ? (
              <div className="text-center py-8 px-4 space-y-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Search className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-400 font-medium">No nodes match &ldquo;{searchQuery}&rdquo;</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedTag('All'); }}
                  className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              categories.map((cat) => {
                const categoryNodes = filteredNodes.filter(([_, def]) => def.category === cat);
                if (categoryNodes.length === 0) return null;

                const meta = CATEGORY_META[cat];
                const Icon = meta.icon;
                const isOpen = q.length > 0 ? true : openCategories[cat];

                return (
                  <div key={cat} className="space-y-2">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-lg ring-1 ${meta.ringColor}`}>
                          <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                        </div>
                        <span className="uppercase text-[11px] tracking-wide">{meta.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({categoryNodes.length})</span>
                      </div>
                      {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                    </button>

                    {/* Category Node Cards */}
                    {isOpen && (
                      <div className="space-y-2 pl-1">
                        {categoryNodes.map(([type, nodeDef]) => {
                          const badge = HARDWARE_BADGES[type] || {
                            text: 'Free',
                            bg: 'bg-slate-800',
                            border: 'border-slate-700',
                            color: 'text-slate-300',
                          };

                          return (
                            <div
                              key={type}
                              draggable
                              onDragStart={(e) => handleDragStart(e, type)}
                              onClick={() => onAddNode?.(type)}
                              className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-violet-500/60 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg hover:shadow-violet-500/10 space-y-1.5"
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={`p-1.5 rounded-lg ring-1 ${meta.ringColor} group-hover:scale-105 transition-transform shrink-0`}>
                                    <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="text-xs font-bold text-slate-100 group-hover:text-violet-300 transition-colors truncate">
                                      {nodeDef.title}
                                    </h3>
                                    {nodeDef.defaultSubtitle && (
                                      <span className="text-[9px] font-mono text-slate-400 block truncate">
                                        {nodeDef.defaultSubtitle}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <span className={`px-1.5 py-0.5 border text-[9px] font-mono font-bold rounded-md ${badge.bg} ${badge.border} ${badge.color}`}>
                                    {badge.text}
                                  </span>
                                  <div className="opacity-0 group-hover:opacity-100 p-0.5 text-violet-400 transition-opacity">
                                    <Plus className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                              </div>

                              <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                                {nodeDef.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Collapsed Icons Column */}
      {collapsed && (
        <div className="flex-1 py-4 flex flex-col items-center gap-4">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            return (
              <div
                key={cat}
                className={`p-2.5 rounded-xl ring-1 ${meta.ringColor} hover:scale-110 transition-transform cursor-pointer`}
                title={meta.title}
                onClick={() => setCollapsed(false)}
              >
                <Icon className={`w-4 h-4 ${meta.color}`} />
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
};
