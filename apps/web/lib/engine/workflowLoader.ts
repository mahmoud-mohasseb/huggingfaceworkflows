import { WorkflowTemplatesList, WorkflowTemplate } from '../templates';
import { Node, Edge } from '@xyflow/react';
import { NODE_REGISTRY } from '../nodeRegistry';

export interface ResolvedWorkflowGraph {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  source: 'template' | 'custom' | 'canvas';
}

// In-memory / runtime cache for user customized workflows
const CUSTOM_WORKFLOW_CACHE: Map<string, ResolvedWorkflowGraph> = new Map();

// Active globally assigned workflow ID for bot listeners
let ACTIVE_ASSIGNED_WORKFLOW_ID = 'wf_telegram_ai_bot';

/**
 * Set the currently assigned bot workflow ID
 */
export function setAssignedBotWorkflowId(workflowId: string) {
  ACTIVE_ASSIGNED_WORKFLOW_ID = workflowId;
}

/**
 * Get the currently assigned bot workflow ID
 */
export function getAssignedBotWorkflowId(): string {
  return ACTIVE_ASSIGNED_WORKFLOW_ID;
}

/**
 * Register or update a custom user workflow in the runtime cache
 */
export function saveWorkflowToCache(id: string, name: string, nodes: Node[], edges: Edge[]) {
  CUSTOM_WORKFLOW_CACHE.set(id, {
    id,
    name,
    nodes,
    edges,
    source: 'custom',
  });
}

/**
 * Load all available workflows (both templates and custom workflows)
 */
export function getAllAvailableWorkflows(): Array<{ id: string; name: string; nodeCount: number; category: string; isAssigned: boolean }> {
  const result: Array<{ id: string; name: string; nodeCount: number; category: string; isAssigned: boolean }> = [];
  const assigned = getAssignedBotWorkflowId();

  // 1. Templates
  WorkflowTemplatesList.forEach((tpl) => {
    result.push({
      id: tpl.id,
      name: tpl.name,
      nodeCount: tpl.nodes.length,
      category: tpl.category,
      isAssigned: assigned === tpl.id || (assigned === 'wf_telegram_ai_bot' && tpl.id === 'tpl_hf_free_all_ai'),
    });
  });

  // 2. Custom cached workflows
  CUSTOM_WORKFLOW_CACHE.forEach((wf, id) => {
    if (!result.some((r) => r.id === id)) {
      result.push({
        id,
        name: wf.name,
        nodeCount: wf.nodes.length,
        category: 'Custom Workflow',
        isAssigned: assigned === id,
      });
    }
  });

  return result;
}

/**
 * Load a workflow's exact graph by its ID
 */
export function loadWorkflowGraphById(workflowId: string): ResolvedWorkflowGraph | null {
  // 1. Check custom user cache
  if (CUSTOM_WORKFLOW_CACHE.has(workflowId)) {
    const cached = CUSTOM_WORKFLOW_CACHE.get(workflowId)!;
    return {
      id: cached.id,
      name: cached.name,
      nodes: JSON.parse(JSON.stringify(cached.nodes)),
      edges: JSON.parse(JSON.stringify(cached.edges)),
      source: 'custom',
    };
  }

  // 2. Check direct template match
  const tpl = WorkflowTemplatesList.find((t) => t.id === workflowId);
  if (tpl) {
    return {
      id: tpl.id,
      name: tpl.name,
      nodes: JSON.parse(JSON.stringify(tpl.nodes)),
      edges: JSON.parse(JSON.stringify(tpl.edges)),
      source: 'template',
    };
  }

  // 3. Check aliases mapping
  const aliasMap: Record<string, string> = {
    wf_telegram_ai_bot: 'tpl_hf_free_all_ai',
    wf_telegram_image_gen: 'tpl_whatsapp_flux_pipeline',
    wf_telegram_video_gen: 'tpl_telegram_video_gen',
    wf_telegram_music_gen: 'tpl_hf_free_all_ai',
    wf_whatsapp_multimodal_bot: 'tpl_openclaw_whatsapp',
    wf_telegram_whisper: 'tpl_whisper_voice_pipeline',
    wf_telegram_code_assistant: 'tpl_deepseek_code_assistant',
    wf_telegram_customer_support: 'tpl_llama_customer_support',
    wf_telegram_image_to_caption: 'tpl_llama_vision_captioner',
    wf_whatsapp_image_gen: 'tpl_whatsapp_image_gen',
    wf_zero_shot_router: 'tpl_zero_shot_router',
    wf_zero_shot_vision: 'tpl_zero_shot_vision_clip',
    wf_openclaw_agent: 'tpl_openclaw_telegram',
  };

  const mappedId = aliasMap[workflowId];
  if (mappedId) {
    const mappedTpl = WorkflowTemplatesList.find((t) => t.id === mappedId);
    if (mappedTpl) {
      return {
        id: workflowId,
        name: mappedTpl.name,
        nodes: JSON.parse(JSON.stringify(mappedTpl.nodes)),
        edges: JSON.parse(JSON.stringify(mappedTpl.edges)),
        source: 'template',
      };
    }
  }

  return null;
}

/**
 * Resolve which workflow to execute for an inbound event:
 * - If explicit workflowId passed, use it.
 * - If command prefix matches (e.g. /image, /video, /zero, /agent, /code, /music, /transcribe), route to that specialized workflow.
 * - Otherwise, use the globally assigned active workflow.
 */
export function resolveWorkflowForEvent(text: string, explicitWorkflowId?: string): ResolvedWorkflowGraph {
  const trimmed = (text || '').trim();
  const lower = trimmed.toLowerCase();

  // 1. Explicit workflow requested
  if (explicitWorkflowId) {
    const graph = loadWorkflowGraphById(explicitWorkflowId);
    if (graph) return graph;
  }

  // 2. Command-based workflow routing
  if (lower.startsWith('/zero') || lower.startsWith('/classify') || lower.startsWith('/intent')) {
    const graph = loadWorkflowGraphById('tpl_zero_shot_router');
    if (graph) return graph;
  }

  if (lower.startsWith('/vision') || lower.startsWith('/clip') || lower.startsWith('/photo')) {
    const graph = loadWorkflowGraphById('tpl_zero_shot_vision_clip');
    if (graph) return graph;
  }

  if (lower.startsWith('/image') || lower.startsWith('/draw') || lower.startsWith('/flux') || lower.startsWith('/art')) {
    const graph = loadWorkflowGraphById('wf_telegram_image_gen') || loadWorkflowGraphById('tpl_whatsapp_image_gen');
    if (graph) return graph;
  }

  if (lower.startsWith('/video') || lower.startsWith('/movie') || lower.startsWith('/zeroscope') || lower.startsWith('/animate')) {
    const graph = loadWorkflowGraphById('tpl_telegram_video_gen');
    if (graph) return graph;
  }

  if (lower.startsWith('/agent') || lower.startsWith('/openclaw') || lower.startsWith('/search') || lower.startsWith('/research')) {
    const graph = loadWorkflowGraphById('tpl_openclaw_telegram');
    if (graph) return graph;
  }

  if (lower.startsWith('/code') || lower.startsWith('/dev') || lower.startsWith('/python')) {
    const graph = loadWorkflowGraphById('tpl_deepseek_code_assistant');
    if (graph) return graph;
  }

  if (lower.startsWith('/voice') || lower.startsWith('/transcribe') || lower.startsWith('/whisper')) {
    const graph = loadWorkflowGraphById('tpl_whisper_voice_pipeline');
    if (graph) return graph;
  }

  // 3. Fallback to active assigned workflow
  const assignedId = getAssignedBotWorkflowId();
  const assignedGraph = loadWorkflowGraphById(assignedId);
  if (assignedGraph) return assignedGraph;

  // 4. Default baseline template
  return loadWorkflowGraphById('tpl_hf_free_all_ai') || {
    id: 'default_workflow',
    name: 'Default Bot Workflow',
    nodes: WorkflowTemplatesList[0]?.nodes || [],
    edges: WorkflowTemplatesList[0]?.edges || [],
    source: 'template',
  };
}
