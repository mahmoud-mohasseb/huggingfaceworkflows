'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from '@xyflow/react';
import dynamic from 'next/dynamic';
import { TopNav } from '../../../components/canvas/TopNav';
import { NodeSidebar } from '../../../components/canvas/NodeSidebar';
import { NodeInspector } from '../../../components/canvas/NodeInspector';
import { ExecutionDrawer } from '../../../components/canvas/ExecutionDrawer';
import { CommandPalette } from '../../../components/canvas/CommandPalette';

const WorkflowCanvas = dynamic(
  () => import('../../../components/canvas/WorkflowCanvas').then((mod) => mod.WorkflowCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 h-full flex items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Visual Canvas...</span>
        </div>
      </div>
    ),
  }
);

import { Workflow, NodeData, NodeType, ExecutionResult, RunLog } from '../../../../../packages/shared-types';
import { NODE_REGISTRY } from '../../../lib/nodeRegistry';
import { executeWorkflow } from '../../../lib/engine/executor';
import { syncWorkflowToHF } from '../../../lib/hfStorage';
import { useWorkflowStore } from '../../../lib/store/useWorkflowStore';
import { useAuthStore } from '../../../lib/store/useAuthStore';
import { WorkflowTemplatesList } from '../../../lib/templates';

const INITIAL_WORKFLOW: Workflow = {
  id: 'wf_telegram_ai_bot',
  name: 'Telegram AI Customer Bot Workflow',
  status: 'active',
  updatedAt: '2026-08-30T00:00:00.000Z',
  hfDatasetPath: 'datasets/mahmoud-mohasseb/my-ai-userdata',
  commitHash: '8f3a92b',
  creditBalance: 1250,
  nodes: [],
  edges: [],
};

const INITIAL_NODES: Node[] = [
  {
    id: 'node_tg_trigger',
    type: 'telegram_trigger',
    position: { x: 80, y: 180 },
    data: {
      label: 'Telegram Trigger',
      category: 'triggers',
      type: 'telegram_trigger',
      status: 'idle',
      subtitle: 'Webhook: /api/webhooks/telegram',
      config: NODE_REGISTRY.telegram_trigger.defaultConfig,
      inputs: NODE_REGISTRY.telegram_trigger.inputs,
      outputs: NODE_REGISTRY.telegram_trigger.outputs,
    },
  },
  {
    id: 'node_hf_router',
    type: 'hf_router',
    position: { x: 460, y: 180 },
    data: {
      label: 'HuggingFace Router',
      category: 'models',
      type: 'hf_router',
      status: 'idle',
      subtitle: 'meta-llama/Llama-3.3-70B-Instruct',
      config: {
        ...NODE_REGISTRY.hf_router.defaultConfig,
        user_prompt: '{{ $node["Telegram Trigger"].text }}',
      },
      inputs: NODE_REGISTRY.hf_router.inputs,
      outputs: NODE_REGISTRY.hf_router.outputs,
    },
  },
  {
    id: 'node_logic_transform',
    type: 'logic_transform',
    position: { x: 840, y: 180 },
    data: {
      label: 'Logic & Code Transform',
      category: 'logic',
      type: 'logic_transform',
      status: 'idle',
      subtitle: 'JSON / Text Transformer',
      config: NODE_REGISTRY.logic_transform.defaultConfig,
      inputs: NODE_REGISTRY.logic_transform.inputs,
      outputs: NODE_REGISTRY.logic_transform.outputs,
    },
  },
  {
    id: 'node_tg_reply',
    type: 'telegram_reply',
    position: { x: 1220, y: 180 },
    data: {
      label: 'Telegram Reply',
      category: 'actions',
      type: 'telegram_reply',
      status: 'idle',
      subtitle: 'Send Telegram Response',
      config: {
        chat_id_template: '{{ $node["Telegram Trigger"].chat_id }}',
        message_template: '🤖 **HF Workflow AI Assistant**:\n\n{{ $node["HuggingFace Router"].response_text }}',
      },
      inputs: NODE_REGISTRY.telegram_reply.inputs,
      outputs: NODE_REGISTRY.telegram_reply.outputs,
    },
  },
];

const INITIAL_EDGES: Edge[] = [
  {
    id: 'edge_1',
    source: 'node_tg_trigger',
    sourceHandle: 'text',
    target: 'node_hf_router',
    targetHandle: 'user_prompt',
    type: 'customEdge',
    data: { color: '#38bdf8' },
  },
  {
    id: 'edge_2',
    source: 'node_hf_router',
    sourceHandle: 'response_text',
    target: 'node_logic_transform',
    targetHandle: 'payload_a',
    type: 'customEdge',
    data: { color: '#a855f7' },
  },
  {
    id: 'edge_3',
    source: 'node_logic_transform',
    sourceHandle: 'text_out',
    target: 'node_tg_reply',
    targetHandle: 'text',
    type: 'customEdge',
    data: { color: '#ec4899' },
  },
];

export default function CanvasStudioPage({ params }: { params: { workflowId: string } }) {
  const { workflowId } = params;

  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  const {
    workflow,
    selectedNodeId,
    isExecuting,
    executionResult,
    isDrawerOpen,
    setWorkflow,
    setSelectedNodeId,
    setIsExecuting,
    setExecutionResult,
    updateNodeConfig,
    deleteNode,
    deleteEdge,
    setIsDrawerOpen,
  } = useWorkflowStore();

  const [activeTab, setActiveTab] = useState<'editor' | 'executions' | 'settings'>('editor');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isContinuousLive, setIsContinuousLive] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle custom template initialization for all 5 pre-built templates
  useEffect(() => {
    if (workflowId === 'wf_telegram_image_gen') {
      const imageGenNodes: Node[] = [
        {
          id: 'node_tg_trigger',
          type: 'telegram_trigger',
          position: { x: 80, y: 180 },
          data: {
            label: 'Telegram Trigger',
            category: 'triggers',
            type: 'telegram_trigger',
            status: 'idle',
            subtitle: 'Webhook: /api/webhooks/telegram',
            config: NODE_REGISTRY.telegram_trigger.defaultConfig,
            inputs: NODE_REGISTRY.telegram_trigger.inputs,
            outputs: NODE_REGISTRY.telegram_trigger.outputs,
          },
        },
        {
          id: 'node_hf_image',
          type: 'hf_image_gen',
          position: { x: 480, y: 180 },
          data: {
            label: 'HF Free Image Gen',
            category: 'models',
            type: 'hf_image_gen',
            status: 'idle',
            subtitle: 'black-forest-labs/FLUX.1-schnell',
            config: {
              ...NODE_REGISTRY.hf_image_gen.defaultConfig,
              prompt_template: '{{ $node["Telegram Trigger"].text }}',
            },
            inputs: NODE_REGISTRY.hf_image_gen.inputs,
            outputs: NODE_REGISTRY.hf_image_gen.outputs,
          },
        },
        {
          id: 'node_tg_reply',
          type: 'telegram_reply',
          position: { x: 880, y: 180 },
          data: {
            label: 'Telegram Reply',
            category: 'actions',
            type: 'telegram_reply',
            status: 'idle',
            subtitle: 'Send Generated Image',
            config: {
              chat_id_template: '{{ $node["Telegram Trigger"].chat_id }}',
              message_template: '🎨 **[FLUX.1 Photorealistic Image Generator]**:\n\nGenerated Image for prompt: "{{ $node["Telegram Trigger"].text }}"!\n\n🖼️ View Image: {{ $node["HF Free Image Gen"].image_url }}',
            },
            inputs: NODE_REGISTRY.telegram_reply.inputs,
            outputs: NODE_REGISTRY.telegram_reply.outputs,
          },
        },
      ];

      const imageGenEdges: Edge[] = [
        { id: 'edge_img_1', source: 'node_tg_trigger', sourceHandle: 'text', target: 'node_hf_image', targetHandle: 'user_prompt', type: 'customEdge', data: { color: '#38bdf8' } },
        { id: 'edge_img_2', source: 'node_hf_image', sourceHandle: 'image_url', target: 'node_tg_reply', targetHandle: 'text', type: 'customEdge', data: { color: '#a855f7' } },
      ];

      setNodes(imageGenNodes);
      setEdges(imageGenEdges);
      setWorkflow({ id: 'wf_telegram_image_gen', name: 'Telegram AI Image Generator Workflow' });
    } else if (workflowId === 'wf_telegram_video_gen') {
      const videoGenNodes: Node[] = [
        {
          id: 'node_tg_trigger',
          type: 'telegram_trigger',
          position: { x: 80, y: 180 },
          data: {
            label: 'Telegram Trigger',
            category: 'triggers',
            type: 'telegram_trigger',
            status: 'idle',
            subtitle: 'Webhook: /api/webhooks/telegram',
            config: NODE_REGISTRY.telegram_trigger.defaultConfig,
            inputs: NODE_REGISTRY.telegram_trigger.inputs,
            outputs: NODE_REGISTRY.telegram_trigger.outputs,
          },
        },
        {
          id: 'node_hf_video',
          type: 'hf_video_gen',
          position: { x: 480, y: 180 },
          data: {
            label: 'HF Free Video Gen',
            category: 'models',
            type: 'hf_video_gen',
            status: 'idle',
            subtitle: 'zeroscope_v2_576w',
            config: NODE_REGISTRY.hf_video_gen.defaultConfig,
            inputs: NODE_REGISTRY.hf_video_gen.inputs,
            outputs: NODE_REGISTRY.hf_video_gen.outputs,
          },
        },
        {
          id: 'node_tg_reply',
          type: 'telegram_reply',
          position: { x: 880, y: 180 },
          data: {
            label: 'Telegram Reply',
            category: 'actions',
            type: 'telegram_reply',
            status: 'idle',
            subtitle: 'Send Generated Video',
            config: {
              chat_id_template: '{{ $node["Telegram Trigger"].chat_id }}',
              message_template: '🎥 **[ZeroScope v2 Text-to-Video Generator]**:\n\nGenerated Video for prompt: "{{ $node["Telegram Trigger"].text }}"!\n\n🎬 View Video: {{ $node["HF Free Video Gen"].video_url }}',
            },
            inputs: NODE_REGISTRY.telegram_reply.inputs,
            outputs: NODE_REGISTRY.telegram_reply.outputs,
          },
        },
      ];

      const videoGenEdges: Edge[] = [
        { id: 'edge_vid_1', source: 'node_tg_trigger', sourceHandle: 'text', target: 'node_hf_video', targetHandle: 'user_prompt', type: 'customEdge', data: { color: '#38bdf8' } },
        { id: 'edge_vid_2', source: 'node_hf_video', sourceHandle: 'video_url', target: 'node_tg_reply', targetHandle: 'text', type: 'customEdge', data: { color: '#8b5cf6' } },
      ];

      setNodes(videoGenNodes);
      setEdges(videoGenEdges);
      setWorkflow({ id: 'wf_telegram_video_gen', name: 'Telegram AI Video Generator Workflow' });
    } else if (workflowId === 'wf_telegram_music_gen') {
      const musicGenNodes: Node[] = [
        {
          id: 'node_tg_trigger',
          type: 'telegram_trigger',
          position: { x: 80, y: 180 },
          data: {
            label: 'Telegram Trigger',
            category: 'triggers',
            type: 'telegram_trigger',
            status: 'idle',
            subtitle: 'Webhook: /api/webhooks/telegram',
            config: NODE_REGISTRY.telegram_trigger.defaultConfig,
            inputs: NODE_REGISTRY.telegram_trigger.inputs,
            outputs: NODE_REGISTRY.telegram_trigger.outputs,
          },
        },
        {
          id: 'node_hf_music',
          type: 'hf_music_gen',
          position: { x: 480, y: 180 },
          data: {
            label: 'HF Free Music & Audio',
            category: 'models',
            type: 'hf_music_gen',
            status: 'idle',
            subtitle: 'facebook/musicgen-small',
            config: NODE_REGISTRY.hf_music_gen.defaultConfig,
            inputs: NODE_REGISTRY.hf_music_gen.inputs,
            outputs: NODE_REGISTRY.hf_music_gen.outputs,
          },
        },
        {
          id: 'node_tg_reply',
          type: 'telegram_reply',
          position: { x: 880, y: 180 },
          data: {
            label: 'Telegram Reply',
            category: 'actions',
            type: 'telegram_reply',
            status: 'idle',
            subtitle: 'Send Audio Track',
            config: {
              chat_id_template: '{{ $node["Telegram Trigger"].chat_id }}',
              message_template: '🎵 **[MusicGen Stereo Audio Composer]**:\n\nGenerated 10s audio track for prompt: "{{ $node["Telegram Trigger"].text }}"!\n\n🎶 Listen Audio: {{ $node["HF Free Music & Audio"].audio_url }}',
            },
            inputs: NODE_REGISTRY.telegram_reply.inputs,
            outputs: NODE_REGISTRY.telegram_reply.outputs,
          },
        },
      ];

      const musicGenEdges: Edge[] = [
        { id: 'edge_mus_1', source: 'node_tg_trigger', sourceHandle: 'text', target: 'node_hf_music', targetHandle: 'prompt', type: 'customEdge', data: { color: '#38bdf8' } },
        { id: 'edge_mus_2', source: 'node_hf_music', sourceHandle: 'audio_url', target: 'node_tg_reply', targetHandle: 'text', type: 'customEdge', data: { color: '#06b6d4' } },
      ];

      setNodes(musicGenNodes);
      setEdges(musicGenEdges);
      setWorkflow({ id: 'wf_telegram_music_gen', name: 'Telegram AI Music Composer Workflow' });
    } else if (workflowId === 'wf_whatsapp_multimodal_bot') {
      const waNodes: Node[] = [
        {
          id: 'node_wa_trigger',
          type: 'whatsapp_trigger',
          position: { x: 80, y: 180 },
          data: {
            label: 'WhatsApp Trigger',
            category: 'triggers',
            type: 'whatsapp_trigger',
            status: 'idle',
            subtitle: 'Webhook: /api/webhooks/whatsapp',
            config: NODE_REGISTRY.whatsapp_trigger.defaultConfig,
            inputs: NODE_REGISTRY.whatsapp_trigger.inputs,
            outputs: NODE_REGISTRY.whatsapp_trigger.outputs,
          },
        },
        {
          id: 'node_hf_router',
          type: 'hf_router',
          position: { x: 480, y: 180 },
          data: {
            label: 'HuggingFace Router',
            category: 'models',
            type: 'hf_router',
            status: 'idle',
            subtitle: 'meta-llama/Llama-3.3-70B-Instruct',
            config: NODE_REGISTRY.hf_router.defaultConfig,
            inputs: NODE_REGISTRY.hf_router.inputs,
            outputs: NODE_REGISTRY.hf_router.outputs,
          },
        },
        {
          id: 'node_wa_reply',
          type: 'whatsapp_reply',
          position: { x: 880, y: 180 },
          data: {
            label: 'WhatsApp Reply',
            category: 'actions',
            type: 'whatsapp_reply',
            status: 'idle',
            subtitle: 'Send WhatsApp Reply',
            config: NODE_REGISTRY.whatsapp_reply.defaultConfig,
            inputs: NODE_REGISTRY.whatsapp_reply.inputs,
            outputs: NODE_REGISTRY.whatsapp_reply.outputs,
          },
        },
      ];

      const waEdges: Edge[] = [
        { id: 'edge_wa_1', source: 'node_wa_trigger', sourceHandle: 'message_body', target: 'node_hf_router', targetHandle: 'user_prompt', type: 'customEdge', data: { color: '#25d366' } },
        { id: 'edge_wa_2', source: 'node_hf_router', sourceHandle: 'response_text', target: 'node_wa_reply', targetHandle: 'text', type: 'customEdge', data: { color: '#a855f7' } },
      ];

      setNodes(waNodes);
      setEdges(waEdges);
      setWorkflow({ id: 'wf_whatsapp_multimodal_bot', name: 'WhatsApp Multi-Modal AI Bot Workflow' });
    } else if (workflowId === 'wf_telegram_whisper') {
      const whisperNodes: Node[] = [
        { id: 'node_tg_trigger', type: 'telegram_trigger', position: { x: 80, y: 180 }, data: { label: 'Telegram Trigger', category: 'triggers', type: 'telegram_trigger', status: 'idle', subtitle: 'Receives voice messages', config: NODE_REGISTRY.telegram_trigger.defaultConfig, inputs: NODE_REGISTRY.telegram_trigger.inputs, outputs: NODE_REGISTRY.telegram_trigger.outputs } },
        { id: 'node_hf_whisper', type: 'hf_router', position: { x: 480, y: 180 }, data: { label: 'Whisper v3 ASR', category: 'models', type: 'hf_router', status: 'idle', subtitle: 'openai/whisper-large-v3', config: { ...NODE_REGISTRY.hf_router.defaultConfig, model_id: 'openai/whisper-large-v3', system_prompt: 'Transcribe the following audio accurately.', user_prompt: '{{ $node["Telegram Trigger"].text }}' }, inputs: NODE_REGISTRY.hf_router.inputs, outputs: NODE_REGISTRY.hf_router.outputs } },
        { id: 'node_tg_reply', type: 'telegram_reply', position: { x: 880, y: 180 }, data: { label: 'Telegram Reply', category: 'actions', type: 'telegram_reply', status: 'idle', subtitle: 'Send Transcription', config: { chat_id_template: '{{ $node["Telegram Trigger"].chat_id }}', message_template: '🎙️ **Whisper Transcription**:\n\n{{ $node["Whisper v3 ASR"].response_text }}' }, inputs: NODE_REGISTRY.telegram_reply.inputs, outputs: NODE_REGISTRY.telegram_reply.outputs } },
      ];
      setNodes(whisperNodes);
      setEdges([ { id: 'e1', source: 'node_tg_trigger', sourceHandle: 'text', target: 'node_hf_whisper', targetHandle: 'user_prompt', type: 'customEdge', data: { color: '#38bdf8' } }, { id: 'e2', source: 'node_hf_whisper', sourceHandle: 'response_text', target: 'node_tg_reply', targetHandle: 'text', type: 'customEdge', data: { color: '#8b5cf6' } } ]);
      setWorkflow({ id: 'wf_telegram_whisper', name: 'Telegram Whisper Transcription Bot' });
    } else if (workflowId === 'wf_telegram_code_assistant') {
      const codeNodes: Node[] = [
        { id: 'node_tg_trigger', type: 'telegram_trigger', position: { x: 80, y: 180 }, data: { label: 'Telegram Trigger', category: 'triggers', type: 'telegram_trigger', status: 'idle', subtitle: 'Code questions from user', config: NODE_REGISTRY.telegram_trigger.defaultConfig, inputs: NODE_REGISTRY.telegram_trigger.inputs, outputs: NODE_REGISTRY.telegram_trigger.outputs } },
        { id: 'node_hf_coder', type: 'hf_router', position: { x: 480, y: 180 }, data: { label: 'DeepSeek Coder', category: 'models', type: 'hf_router', status: 'idle', subtitle: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B', config: { ...NODE_REGISTRY.hf_router.defaultConfig, model_id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B', system_prompt: 'You are an expert software engineer. Provide clean, well-commented code solutions.', user_prompt: '{{ $node["Telegram Trigger"].text }}' }, inputs: NODE_REGISTRY.hf_router.inputs, outputs: NODE_REGISTRY.hf_router.outputs } },
        { id: 'node_tg_reply', type: 'telegram_reply', position: { x: 880, y: 180 }, data: { label: 'Telegram Reply', category: 'actions', type: 'telegram_reply', status: 'idle', subtitle: 'Send Code Answer', config: { chat_id_template: '{{ $node["Telegram Trigger"].chat_id }}', message_template: '💻 **DeepSeek Code Assistant**:\n\n{{ $node["DeepSeek Coder"].response_text }}' }, inputs: NODE_REGISTRY.telegram_reply.inputs, outputs: NODE_REGISTRY.telegram_reply.outputs } },
      ];
      setNodes(codeNodes);
      setEdges([ { id: 'e1', source: 'node_tg_trigger', sourceHandle: 'text', target: 'node_hf_coder', targetHandle: 'user_prompt', type: 'customEdge', data: { color: '#38bdf8' } }, { id: 'e2', source: 'node_hf_coder', sourceHandle: 'response_text', target: 'node_tg_reply', targetHandle: 'text', type: 'customEdge', data: { color: '#f59e0b' } } ]);
      setWorkflow({ id: 'wf_telegram_code_assistant', name: 'Telegram DeepSeek Code Assistant' });
    } else if (workflowId === 'wf_telegram_customer_support') {
      const csNodes: Node[] = [
        { id: 'node_tg_trigger', type: 'telegram_trigger', position: { x: 80, y: 180 }, data: { label: 'Telegram Trigger', category: 'triggers', type: 'telegram_trigger', status: 'idle', subtitle: 'Customer support messages', config: NODE_REGISTRY.telegram_trigger.defaultConfig, inputs: NODE_REGISTRY.telegram_trigger.inputs, outputs: NODE_REGISTRY.telegram_trigger.outputs } },
        { id: 'node_hf_llm', type: 'hf_router', position: { x: 480, y: 180 }, data: { label: 'Llama Support Agent', category: 'models', type: 'hf_router', status: 'idle', subtitle: 'meta-llama/Llama-3.3-70B-Instruct', config: { ...NODE_REGISTRY.hf_router.defaultConfig, system_prompt: 'You are a professional, empathetic customer support agent. Resolve issues politely and helpfully.', user_prompt: '{{ $node["Telegram Trigger"].text }}' }, inputs: NODE_REGISTRY.hf_router.inputs, outputs: NODE_REGISTRY.hf_router.outputs } },
        { id: 'node_tg_reply', type: 'telegram_reply', position: { x: 880, y: 180 }, data: { label: 'Telegram Reply', category: 'actions', type: 'telegram_reply', status: 'idle', subtitle: 'Send Support Response', config: { chat_id_template: '{{ $node["Telegram Trigger"].chat_id }}', message_template: '🤝 **Support Team**:\n\n{{ $node["Llama Support Agent"].response_text }}' }, inputs: NODE_REGISTRY.telegram_reply.inputs, outputs: NODE_REGISTRY.telegram_reply.outputs } },
      ];
      setNodes(csNodes);
      setEdges([ { id: 'e1', source: 'node_tg_trigger', sourceHandle: 'text', target: 'node_hf_llm', targetHandle: 'user_prompt', type: 'customEdge', data: { color: '#38bdf8' } }, { id: 'e2', source: 'node_hf_llm', sourceHandle: 'response_text', target: 'node_tg_reply', targetHandle: 'text', type: 'customEdge', data: { color: '#10b981' } } ]);
      setWorkflow({ id: 'wf_telegram_customer_support', name: 'Telegram Customer Support Bot' });
    } else if (workflowId === 'wf_telegram_image_to_caption') {
      const captionNodes: Node[] = [
        { id: 'node_tg_trigger', type: 'telegram_trigger', position: { x: 80, y: 180 }, data: { label: 'Telegram Trigger', category: 'triggers', type: 'telegram_trigger', status: 'idle', subtitle: 'Receives image + prompt', config: NODE_REGISTRY.telegram_trigger.defaultConfig, inputs: NODE_REGISTRY.telegram_trigger.inputs, outputs: NODE_REGISTRY.telegram_trigger.outputs } },
        { id: 'node_hf_vision', type: 'hf_router', position: { x: 480, y: 180 }, data: { label: 'Llama Vision', category: 'models', type: 'hf_router', status: 'idle', subtitle: 'meta-llama/Llama-3.2-11B-Vision-Instruct', config: { ...NODE_REGISTRY.hf_router.defaultConfig, model_id: 'meta-llama/Llama-3.2-11B-Vision-Instruct', system_prompt: 'You are a creative image captioner and analyst.', user_prompt: '{{ $node["Telegram Trigger"].text }}' }, inputs: NODE_REGISTRY.hf_router.inputs, outputs: NODE_REGISTRY.hf_router.outputs } },
        { id: 'node_tg_reply', type: 'telegram_reply', position: { x: 880, y: 180 }, data: { label: 'Telegram Reply', category: 'actions', type: 'telegram_reply', status: 'idle', subtitle: 'Send Image Caption', config: { chat_id_template: '{{ $node["Telegram Trigger"].chat_id }}', message_template: '👁️ **Image Analysis**:\n\n{{ $node["Llama Vision"].response_text }}' }, inputs: NODE_REGISTRY.telegram_reply.inputs, outputs: NODE_REGISTRY.telegram_reply.outputs } },
      ];
      setNodes(captionNodes);
      setEdges([ { id: 'e1', source: 'node_tg_trigger', sourceHandle: 'text', target: 'node_hf_vision', targetHandle: 'user_prompt', type: 'customEdge', data: { color: '#38bdf8' } }, { id: 'e2', source: 'node_hf_vision', sourceHandle: 'response_text', target: 'node_tg_reply', targetHandle: 'text', type: 'customEdge', data: { color: '#ec4899' } } ]);
      setWorkflow({ id: 'wf_telegram_image_to_caption', name: 'Telegram Vision & Image Caption Bot' });
    } else if (workflowId === 'wf_whatsapp_image_gen') {
      const waImgNodes: Node[] = [
        { id: 'node_wa_trigger', type: 'whatsapp_trigger', position: { x: 80, y: 180 }, data: { label: 'WhatsApp Trigger', category: 'triggers', type: 'whatsapp_trigger', status: 'idle', subtitle: 'Receives image prompt', config: NODE_REGISTRY.whatsapp_trigger.defaultConfig, inputs: NODE_REGISTRY.whatsapp_trigger.inputs, outputs: NODE_REGISTRY.whatsapp_trigger.outputs } },
        { id: 'node_hf_image', type: 'hf_image_gen', position: { x: 480, y: 180 }, data: { label: 'FLUX.1 Schnell', category: 'models', type: 'hf_image_gen', status: 'idle', subtitle: 'black-forest-labs/FLUX.1-schnell', config: { ...NODE_REGISTRY.hf_image_gen.defaultConfig, prompt_template: '{{ $node["WhatsApp Trigger"].message_body }}' }, inputs: NODE_REGISTRY.hf_image_gen.inputs, outputs: NODE_REGISTRY.hf_image_gen.outputs } },
        { id: 'node_wa_reply', type: 'whatsapp_reply', position: { x: 880, y: 180 }, data: { label: 'WhatsApp Reply', category: 'actions', type: 'whatsapp_reply', status: 'idle', subtitle: 'Send Generated Image', config: { ...NODE_REGISTRY.whatsapp_reply.defaultConfig }, inputs: NODE_REGISTRY.whatsapp_reply.inputs, outputs: NODE_REGISTRY.whatsapp_reply.outputs } },
      ];
      setNodes(waImgNodes);
      setEdges([ { id: 'e1', source: 'node_wa_trigger', sourceHandle: 'message_body', target: 'node_hf_image', targetHandle: 'user_prompt', type: 'customEdge', data: { color: '#25d366' } }, { id: 'e2', source: 'node_hf_image', sourceHandle: 'image_url', target: 'node_wa_reply', targetHandle: 'text', type: 'customEdge', data: { color: '#a855f7' } } ]);
      setWorkflow({ id: 'wf_whatsapp_image_gen', name: 'WhatsApp FLUX Image Generator' });
    }

    // Check URL query parameters for dynamic template / openclaw insertion
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tplParam = urlParams.get('template');
      if (tplParam) {
        const foundTpl = WorkflowTemplatesList.find((t) => t.id === tplParam);
        if (foundTpl) {
          setNodes(foundTpl.nodes);
          setEdges(foundTpl.edges);
          setWorkflow({ id: foundTpl.id, name: foundTpl.name });
        }
      }

      const addOpenClaw = urlParams.get('add_openclaw');
      if (addOpenClaw) {
        const openClawNode: Node = {
          id: `node_openclaw_${Date.now().toString().slice(-4)}`,
          type: 'openclaw_agent',
          position: { x: 300, y: 150 },
          data: {
            label: 'OpenClaw Autonomous AI Agent',
            category: 'models',
            type: 'openclaw_agent',
            status: 'idle',
            subtitle: 'openclaw/openclaw (Free HF Space)',
            config: { ...NODE_REGISTRY.openclaw_agent.defaultConfig },
            inputs: NODE_REGISTRY.openclaw_agent.inputs,
            outputs: NODE_REGISTRY.openclaw_agent.outputs,
          },
        };
        setNodes((nds) => [...nds, openClawNode]);
      }
    }
  }, [workflowId, setNodes, setEdges, setWorkflow]);

  // Continuous Background Workflow Execution Loop
  useEffect(() => {
    if (!isContinuousLive) return;

    let isSubscribed = true;

    const runContinuousLoop = async () => {
      if (!isExecuting && isSubscribed) {
        await handleExecuteWorkflow();
      }
    };

    const interval = setInterval(runContinuousLoop, 3500);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [isContinuousLive, isExecuting]);

  const updateWorkflowState = (updated: Partial<Workflow>) => {
    setWorkflow(updated);
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: 'customEdge',
        data: { color: '#a855f7' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const handleAddNode = (typeStr: string, customPosition?: { x: number; y: number }) => {
    const type = typeStr as NodeType;
    const nodeDef = NODE_REGISTRY[type];
    if (!nodeDef) return;

    const newId = `node_${type}_${Date.now().toString().slice(-4)}`;
    const position = customPosition || {
      x: 250 + Math.random() * 200,
      y: 200 + Math.random() * 150,
    };

    const newNode: Node = {
      id: newId,
      type,
      position,
      data: {
        label: nodeDef.title,
        category: nodeDef.category,
        type: nodeDef.type,
        status: 'idle',
        subtitle: nodeDef.defaultSubtitle,
        config: { ...nodeDef.defaultConfig },
        inputs: nodeDef.inputs,
        outputs: nodeDef.outputs,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(newId);
  };

  const handleUpdateNodeConfig = (nodeId: string, updatedConfig: Record<string, any>) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          const newSubtitle = updatedConfig.model_id || updatedConfig.space_slug || (n.data as any).subtitle;
          return {
            ...n,
            data: {
              ...n.data,
              config: updatedConfig,
              subtitle: newSubtitle,
            },
          };
        }
        return n;
      })
    );
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
  };

  const handleDuplicateNode = (nodeId: string) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;

    const newId = `node_${targetNode.type}_${Date.now().toString().slice(-4)}`;
    const newNode: Node = {
      ...targetNode,
      id: newId,
      position: { x: targetNode.position.x + 40, y: targetNode.position.y + 40 },
      data: {
        ...targetNode.data,
        label: `${(targetNode.data as any).label} (Copy)`,
        status: 'idle',
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(newId);
  };

  const handleToggleDisableNode = (nodeId: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          const currDisabled = (n.data as any).disabled;
          return {
            ...n,
            data: { ...n.data, disabled: !currDisabled },
          };
        }
        return n;
      })
    );
  };

  const handleExecuteWorkflow = async () => {
    if (isExecuting) return;

    setIsExecuting(true);

    // Reset node status to idle
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, status: 'idle', executionTimeMs: undefined },
      }))
    );

    const hfToken = useAuthStore.getState().hfToken;

    const result = await executeWorkflow({
      nodes,
      edges,
      hfToken,
      userInputs: { hfToken },
      onStepStart: (nodeId) => {
        setNodes((nds) =>
          nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, status: 'running' } } : n))
        );
      },
      onStepComplete: (nodeId, output, metric) => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    status: 'success',
                    lastOutput: output,
                    executionTimeMs: metric.durationMs,
                  },
                }
              : n
          )
        );
      },
      onStepError: (nodeId, error) => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, status: 'failed', error } } : n
          )
        );
      },
    });

    setExecutionResult(result);
    setIsExecuting(false);

    // Deduct credits from balance
    if (result.success && result.totalCredits > 0) {
      updateWorkflowState({ creditBalance: Math.max(0, workflow.creditBalance - result.totalCredits) });
    }
  };

  const handleTestSingleNode = async (nodeId: string) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target || isExecuting) return;

    setIsExecuting(true);

    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, status: 'running' } } : n))
    );

    const result = await executeWorkflow({
      nodes: [target],
      edges: [],
      onStepStart: (id) => {
        setNodes((nds) =>
          nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, status: 'running' } } : n))
        );
      },
      onStepComplete: (id, output, metric) => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    status: 'success',
                    lastOutput: output,
                    executionTimeMs: metric.durationMs,
                  },
                }
              : n
          )
        );
      },
    });

    setExecutionResult(result);
    setIsExecuting(false);
  };

  const handleTestSelectedNode = async () => {
    const targetId = selectedNodeId || nodes[0]?.id;
    if (targetId) handleTestSingleNode(targetId);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ workflow, nodes, edges }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${workflow.id}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.nodes && parsed.edges) {
            setNodes(parsed.nodes);
            setEdges(parsed.edges);
            if (parsed.workflow) setWorkflow(parsed.workflow);
          }
        } catch (err) {
          alert('Invalid workflow JSON structure');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950">
      {/* Top Navigation Bar */}
      <TopNav
        workflow={workflow}
        onUpdateWorkflow={updateWorkflowState}
        onExecuteWorkflow={handleExecuteWorkflow}
        onTestSelectedNode={handleTestSelectedNode}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onApplyAIGeneratedGraph={(newNodes, newEdges, name) => {
          setNodes(newNodes);
          setEdges(newEdges);
          useWorkflowStore.getState().setNodes(newNodes);
          useWorkflowStore.getState().setEdges(newEdges);
          updateWorkflowState({ name });
          setSelectedNodeId(null);
        }}
        isExecuting={isExecuting}
        isContinuousLive={isContinuousLive}
        onToggleContinuousLive={() => setIsContinuousLive(!isContinuousLive)}
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'executions') {
            setIsDrawerOpen(true);
          }
          if (tab === 'settings') {
            router.push('/settings');
          }
        }}
      />

      {/* Canvas Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Node Drawer */}
        <NodeSidebar onAddNode={(type) => handleAddNode(type)} />

        {/* Main Visual Flow Canvas */}
        <main className="flex-1 h-full relative">
          {isMounted ? (
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeSelect={(id) => setSelectedNodeId(id)}
              onAddNodeAtPosition={(type, pos) => handleAddNode(type, pos)}
              onDeleteEdge={handleDeleteEdge}
              onRunSingleNode={handleTestSingleNode}
              onDuplicateNode={handleDuplicateNode}
              onToggleDisableNode={handleToggleDisableNode}
              onDeleteNode={handleDeleteNode}
              isExecuting={isExecuting}
            />
          ) : (
            <div className="flex-1 h-full flex items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs select-none">
              <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-2xl">
                <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-200 font-semibold">Initializing Canvas Studio...</span>
              </div>
            </div>
          )}
        </main>

        {/* Right Node Inspector Panel */}
        {selectedNodeId && (
          <NodeInspector
            nodeId={selectedNodeId}
            nodes={nodes}
            edges={edges}
            onUpdateConfig={handleUpdateNodeConfig}
            onDeleteNode={handleDeleteNode}
            onDuplicateNode={handleDuplicateNode}
            onRunSingleNode={handleTestSingleNode}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>

      {/* Bottom Execution & Debugger Drawer */}
      <ExecutionDrawer
        executionResult={executionResult}
        isExecuting={isExecuting}
        isOpen={isDrawerOpen}
        onToggleOpen={() => setIsDrawerOpen(!isDrawerOpen)}
        onClearLogs={() => setExecutionResult(null)}
      />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onAddNode={(type) => handleAddNode(type)}
        onExecuteWorkflow={handleExecuteWorkflow}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onToggleStatus={() => updateWorkflowState({ status: workflow.status === 'active' ? 'draft' : 'active' })}
      />
    </div>
  );
}
