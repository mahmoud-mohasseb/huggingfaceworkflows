import { executeWorkflow } from '../engine/executor';
import { resolveWorkflowForEvent, getAssignedBotWorkflowId, loadWorkflowGraphById } from '../engine/workflowLoader';
import { Node, Edge } from '@xyflow/react';

export interface MessageEventPayload {
  provider: 'telegram' | 'whatsapp' | 'webhook';
  chatId: string;
  senderName: string;
  text: string;
  mediaUrl?: string;
  botToken?: string;
  hfToken?: string;
  workflowId?: string;
}

export async function processInboundEvent(event: MessageEventPayload) {
  // 1. Resolve which separate workflow is assigned to process this inbound event (including Telegram /model session)
  const resolvedWorkflow = resolveWorkflowForEvent(event.text, event.workflowId, event.chatId);

  // Clean prompt without command prefix (e.g. "/image a cat in space" -> "a cat in space" or "/model zero")
  let cleanText = event.text.trim();
  const commandMatch = cleanText.match(/^(\/[a-zA-Z0-9_]+)\s*(.*)/s);
  const command = commandMatch ? commandMatch[1] : null;
  const promptBody = commandMatch && commandMatch[2] ? commandMatch[2].trim() : cleanText;

  // 2. Clone the workflow's graph to avoid mutation
  const nodes: Node[] = JSON.parse(JSON.stringify(resolvedWorkflow.nodes));
  const edges: Edge[] = JSON.parse(JSON.stringify(resolvedWorkflow.edges));

  // 3. Inject event data into trigger and reply nodes
  nodes.forEach((node) => {
    const nodeType = (node.data as any)?.type || node.type;

    // Inject into Trigger node
    if (nodeType === 'telegram_trigger' || nodeType === 'whatsapp_trigger') {
      node.data = {
        ...node.data,
        config: {
          ...(node.data as any)?.config,
          chat_id: event.chatId,
          bot_token: event.botToken || (node.data as any)?.config?.bot_token,
        },
        lastOutput: {
          chat_id: event.chatId,
          text: promptBody,
          raw_text: event.text,
          command: command || '',
          sender_name: event.senderName,
          media_url: event.mediaUrl || (node.data as any)?.lastOutput?.media_url,
          phone_number: event.chatId,
          message_body: promptBody,
        },
      };
    }

    // Inject into Reply node
    if (nodeType === 'telegram_reply' || nodeType === 'whatsapp_reply') {
      node.data = {
        ...node.data,
        config: {
          ...(node.data as any)?.config,
          bot_token: event.botToken || (node.data as any)?.config?.bot_token,
          chat_id_template: event.chatId,
          phone_number_template: event.chatId,
        },
      };
    }

    // Inject prompt and tokens into model nodes if configured with dynamic variables
    if (
      nodeType === 'hf_router' ||
      nodeType === 'hf_image_gen' ||
      nodeType === 'hf_video_gen' ||
      nodeType === 'hf_music_gen' ||
      nodeType === 'hf_zero_shot' ||
      nodeType === 'openclaw_agent'
    ) {
      const cfg = (node.data as any)?.config || {};
      if (event.hfToken && !cfg.hf_token) {
        cfg.hf_token = event.hfToken;
      }
    }
  });

  // 4. Execute the exact isolated workflow DAG
  const execResult = await executeWorkflow({
    nodes,
    edges,
    hfToken: event.hfToken,
    userInputs: {
      chat_id: event.chatId,
      text: promptBody,
      prompt: promptBody,
      sender_name: event.senderName,
      media_url: event.mediaUrl,
      image: event.mediaUrl,
      bot_token: event.botToken,
      hfToken: event.hfToken,
    },
  });

  return {
    ...execResult,
    executedWorkflowId: resolvedWorkflow.id,
    executedWorkflowName: resolvedWorkflow.name,
  };
}
