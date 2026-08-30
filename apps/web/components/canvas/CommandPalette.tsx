'use client';

import React, { useState, useEffect } from 'react';
import { Search, Play, Plus, Download, Upload, Zap, Sparkles, Command } from 'lucide-react';
import { NODE_REGISTRY } from '../../lib/nodeRegistry';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (type: string) => void;
  onExecuteWorkflow: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onToggleStatus: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onAddNode,
  onExecuteWorkflow,
  onExportJSON,
  onImportJSON,
  onToggleStatus,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const nodeActions = Object.values(NODE_REGISTRY).map((def) => ({
    id: `add_${def.type}`,
    title: `Add ${def.title}`,
    category: 'Node Actions',
    icon: Plus,
    action: () => {
      onAddNode(def.type);
      onClose();
    },
  }));

  const globalActions = [
    {
      id: 'execute_wf',
      title: 'Execute Full Workflow',
      category: 'Workflow Controls',
      icon: Play,
      action: () => {
        onExecuteWorkflow();
        onClose();
      },
    },
    {
      id: 'toggle_status',
      title: 'Toggle Active / Draft Status',
      category: 'Workflow Controls',
      icon: Zap,
      action: () => {
        onToggleStatus();
        onClose();
      },
    },
    {
      id: 'export_json',
      title: 'Export Workflow JSON',
      category: 'IO Actions',
      icon: Download,
      action: () => {
        onExportJSON();
        onClose();
      },
    },
    {
      id: 'import_json',
      title: 'Import Workflow JSON',
      category: 'IO Actions',
      icon: Upload,
      action: () => {
        onImportJSON();
        onClose();
      },
    },
  ];

  const allActions = [...globalActions, ...nodeActions];
  const filtered = allActions.filter((act) =>
    act.title.toLowerCase().includes(query.toLowerCase()) ||
    act.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-24 z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="p-3 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-violet-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or node name to insert..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
          />
          <kbd className="px-2 py-0.5 bg-slate-950 text-[10px] text-slate-400 rounded border border-slate-800 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-500 italic">No matching actions or nodes found.</p>
          ) : (
            filtered.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-800 text-left flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-violet-400 group-hover:border-violet-500/50">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-violet-300 block">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{item.category}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-violet-400 opacity-0 group-hover:opacity-100 font-mono transition-opacity">
                    ↵ Run
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
