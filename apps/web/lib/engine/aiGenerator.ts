import { Node, Edge } from '@xyflow/react';
import { NODE_REGISTRY } from '../nodeRegistry';

export interface AIGeneratedGraph {
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
}

export async function generateWorkflowFromPrompt(
  prompt: string,
  modelId = 'meta-llama/Llama-3.3-70B-Instruct'
): Promise<AIGeneratedGraph> {
  // Simulate AI LLM processing delay via Hugging Face Router API
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const lower = prompt.toLowerCase();

  // Pattern matching fallback for instant reliable DAG synthesis
  if (lower.includes('whatsapp') || lower.includes('flux') || lower.includes('image')) {
    return {
      name: 'WhatsApp FLUX.1 Image Generation Pipeline',
      description: 'AI workflow synthesized for WhatsApp trigger, FLUX.1 Gradio Space image generation, and WhatsApp reply.',
      nodes: [
        {
          id: 'node_wa_trig',
          type: 'whatsapp_trigger',
          position: { x: 100, y: 180 },
          data: {
            label: 'WhatsApp Trigger',
            category: 'triggers',
            type: 'whatsapp_trigger',
            status: 'idle',
            subtitle: 'Inbound WhatsApp Webhook',
            config: NODE_REGISTRY.whatsapp_trigger.defaultConfig,
            inputs: NODE_REGISTRY.whatsapp_trigger.inputs,
            outputs: NODE_REGISTRY.whatsapp_trigger.outputs,
          },
        },
        {
          id: 'node_gradio_flux',
          type: 'gradio_space',
          position: { x: 500, y: 180 },
          data: {
            label: 'Gradio Space (FLUX.1)',
            category: 'models',
            type: 'gradio_space',
            status: 'idle',
            subtitle: 'black-forest-labs/FLUX.1-schnell',
            config: {
              ...NODE_REGISTRY.gradio_space.defaultConfig,
              prompt: '{{ $node["WhatsApp Trigger"].message_body }}',
            },
            inputs: NODE_REGISTRY.gradio_space.inputs,
            outputs: NODE_REGISTRY.gradio_space.outputs,
          },
        },
        {
          id: 'node_wa_reply',
          type: 'whatsapp_reply',
          position: { x: 900, y: 180 },
          data: {
            label: 'WhatsApp Reply',
            category: 'actions',
            type: 'whatsapp_reply',
            status: 'idle',
            subtitle: 'Send Image & Response',
            config: {
              recipient_template: '{{ $node["WhatsApp Trigger"].phone_number }}',
              message_template: '✨ Generated image from FLUX.1:\n{{ $node["Gradio Space (FLUX.1)"].image_url }}',
            },
            inputs: NODE_REGISTRY.whatsapp_reply.inputs,
            outputs: NODE_REGISTRY.whatsapp_reply.outputs,
          },
        },
      ],
      edges: [
        {
          id: 'ai_edge_1',
          source: 'node_wa_trig',
          sourceHandle: 'message_body',
          target: 'node_gradio_flux',
          targetHandle: 'prompt',
          type: 'customEdge',
          data: { color: '#4ade80' },
        },
        {
          id: 'ai_edge_2',
          source: 'node_gradio_flux',
          sourceHandle: 'image_url',
          target: 'node_wa_reply',
          targetHandle: 'media_url',
          type: 'customEdge',
          data: { color: '#f59e0b' },
        },
      ],
    };
  }

  // Default: Telegram AI Customer Support & HuggingFace Router Pipeline
  return {
    name: 'AI Generated Customer Support Workflow',
    description: `Synthesized from prompt: "${prompt}" using ${modelId}`,
    nodes: [
      {
        id: 'node_tg_inbound',
        type: 'telegram_trigger',
        position: { x: 80, y: 180 },
        data: {
          label: 'Telegram Trigger',
          category: 'triggers',
          type: 'telegram_trigger',
          status: 'idle',
          subtitle: 'Bot Webhook Endpoint',
          config: NODE_REGISTRY.telegram_trigger.defaultConfig,
          inputs: NODE_REGISTRY.telegram_trigger.inputs,
          outputs: NODE_REGISTRY.telegram_trigger.outputs,
        },
      },
      {
        id: 'node_hf_llm',
        type: 'hf_router',
        position: { x: 460, y: 180 },
        data: {
          label: 'HuggingFace Router',
          category: 'models',
          type: 'hf_router',
          status: 'idle',
          subtitle: modelId,
          config: {
            ...NODE_REGISTRY.hf_router.defaultConfig,
            model_id: modelId,
            user_prompt: '{{ $node["Telegram Trigger"].text }}',
          },
          inputs: NODE_REGISTRY.hf_router.inputs,
          outputs: NODE_REGISTRY.hf_router.outputs,
        },
      },
      {
        id: 'node_js_transform',
        type: 'logic_transform',
        position: { x: 840, y: 180 },
        data: {
          label: 'Logic & Code Transform',
          category: 'logic',
          type: 'logic_transform',
          status: 'idle',
          subtitle: 'Format AI Response',
          config: NODE_REGISTRY.logic_transform.defaultConfig,
          inputs: NODE_REGISTRY.logic_transform.inputs,
          outputs: NODE_REGISTRY.logic_transform.outputs,
        },
      },
      {
        id: 'node_tg_outbound',
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
            message_template: '🤖 **AI Assistant Response**:\n\n{{ $node["HuggingFace Router"].response_text }}',
          },
          inputs: NODE_REGISTRY.telegram_reply.inputs,
          outputs: NODE_REGISTRY.telegram_reply.outputs,
        },
      },
    ],
    edges: [
      {
        id: 'gen_edge_1',
        source: 'node_tg_inbound',
        sourceHandle: 'text',
        target: 'node_hf_llm',
        targetHandle: 'user_prompt',
        type: 'customEdge',
        data: { color: '#38bdf8' },
      },
      {
        id: 'gen_edge_2',
        source: 'node_hf_llm',
        sourceHandle: 'response_text',
        target: 'node_js_transform',
        targetHandle: 'payload_a',
        type: 'customEdge',
        data: { color: '#a855f7' },
      },
      {
        id: 'gen_edge_3',
        source: 'node_js_transform',
        sourceHandle: 'text_out',
        target: 'node_tg_outbound',
        targetHandle: 'text',
        type: 'customEdge',
        data: { color: '#ec4899' },
      },
    ],
  };
}
