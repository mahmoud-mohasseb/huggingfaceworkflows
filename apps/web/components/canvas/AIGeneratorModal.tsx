'use client';

import React, { useState } from 'react';
import { X, Sparkles, Wand2, Loader2, ArrowRight, Bot, Cpu } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGeneratedGraph: (nodes: Node[], edges: Edge[], name: string) => void;
}

const PRESET_PROMPTS = [
  'Listen for Telegram messages, answer with HuggingFace Llama 3.3 70B, and reply back to chat.',
  'Receive WhatsApp image prompts, generate images with FLUX.1 Gradio Space, and send to recipient.',
  'Transcribe inbound WhatsApp voice notes with Whisper Large v3 and reply with summary.',
];

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyGeneratedGraph,
}) => {
  const [prompt, setPrompt] = useState('');
  const [modelId, setModelId] = useState('meta-llama/Llama-3.3-70B-Instruct');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, modelId }),
      });

      const data = await res.json();
      if (data.nodes && data.edges) {
        onApplyGeneratedGraph(data.nodes, data.edges, data.name || 'AI Generated Workflow');
        onClose();
      }
    } catch (err) {
      alert('AI Workflow generation error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-violet-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                Natural Language AI Workflow Generator
              </h2>
              <p className="text-xs text-slate-400">Describe what you want to automate in plain English</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Model Selector */}
        <div className="space-y-1.5 text-xs">
          <label className="text-slate-300 font-bold flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-violet-400" /> Hugging Face LLM Generator Model:
          </label>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-violet-300 font-mono focus:outline-none focus:border-violet-500/40"
          >
            <option value="meta-llama/Llama-3.3-70B-Instruct">meta-llama/Llama-3.3-70B-Instruct (Recommended)</option>
            <option value="deepseek-ai/DeepSeek-R1">deepseek-ai/DeepSeek-R1 (Reasoning Engine)</option>
            <option value="Qwen/Qwen2.5-72B-Instruct">Qwen/Qwen2.5-72B-Instruct</option>
          </select>
        </div>

        {/* Textarea Prompt Input */}
        <div className="space-y-2">
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Listen for Telegram messages, process with Llama 3, and reply back to the user..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-2xl p-4 text-xs font-sans text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 shadow-inner resize-none"
          />

          {/* Quick Preset Prompt Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-bold block">Preset Prompt Templates:</span>
            <div className="flex flex-col gap-1.5">
              {PRESET_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p)}
                  className="text-left p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-[11px] text-slate-300 hover:text-violet-300 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate max-w-[500px]">{p}</span>
                  <span className="text-[10px] text-violet-400 opacity-0 group-hover:opacity-100 font-bold">Use →</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <span className="text-[11px] font-mono text-slate-500">HF Router API Serverless Inference</span>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Synthesizing DAG Graph...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Synthesize Workflow Graph</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
