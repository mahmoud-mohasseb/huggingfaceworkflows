import { VariableRef } from '../../../../packages/shared-types';

/**
 * Parses and resolves {{ $node["Node Title or ID"].fieldPath }} or {{ $node["Node Title"] }} variable templates with fallback support
 */
export function resolveVariableTemplate(
  template: string,
  stepOutputs: Record<string, any>,
  fallbackValue: string = "Hello! Explain quantum computing in one simple sentence."
): string {
  if (!template || typeof template !== 'string') return template;

  // Matches {{ $node["Node Name"].field }} or {{ $node["Node Name"] }}
  const resolved = template.replace(/\{\{\s*\$node\[["'](.*?)["']\](?:\.([a-zA-Z0-9_]+))?\s*\}\}/g, (match, nodeKey, field) => {
    // 1. Check if node outputs exist by label or node ID
    let nodeOutput = stepOutputs[nodeKey];

    if (!nodeOutput) {
      for (const [id, payload] of Object.entries(stepOutputs)) {
        if (payload?._nodeTitle === nodeKey || payload?._nodeLabel === nodeKey || id === nodeKey) {
          nodeOutput = payload;
          break;
        }
      }
    }

    if (!nodeOutput) return "";

    if (field) {
      const val = nodeOutput[field] ?? nodeOutput.response_text ?? nodeOutput.text ?? nodeOutput.reply ?? nodeOutput.message_body;
      return val !== undefined && val !== null ? String(val) : "";
    }

    if (typeof nodeOutput === "string") return nodeOutput;
    if (nodeOutput.text) return String(nodeOutput.text);
    if (nodeOutput.response_text) return String(nodeOutput.response_text);
    if (nodeOutput.message_body) return String(nodeOutput.message_body);
    if (nodeOutput.reply) return String(nodeOutput.reply);
    return JSON.stringify(nodeOutput);
  });

  // If the resolved output is empty or whitespace only, return fallbackValue
  if (!resolved.trim() || resolved.includes("{{")) {
    return fallbackValue;
  }

  return resolved;
}

export function resolveNodeParameters(
  params: Record<string, any>,
  stepOutputs: Record<string, any>,
  defaultFallbackPrompt: string = "Generate an insightful response."
): Record<string, any> {
  const resolvedParams: Record<string, any> = {};

  for (const [key, value] of Object.entries(params || {})) {
    if (typeof value === "string") {
      resolvedParams[key] = resolveVariableTemplate(
        value,
        stepOutputs,
        params.testFallback || params.prompt || defaultFallbackPrompt
      );
    } else {
      resolvedParams[key] = value;
    }
  }

  return resolvedParams;
}

export function extractAvailableVariables(
  currentNodeId: string,
  nodes: any[],
  edges: any[],
  lastOutputs?: Record<string, any>
): VariableRef[] {
  const variables: VariableRef[] = [];
  const nodeMap = new Map<string, any>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const upstreamNodeIds = new Set<string>();
  const queue = [currentNodeId];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const incomingEdges = edges.filter((e) => e.target === curr);
    for (const edge of incomingEdges) {
      if (!upstreamNodeIds.has(edge.source)) {
        upstreamNodeIds.add(edge.source);
        queue.push(edge.source);
      }
    }
  }

  for (const upstreamId of upstreamNodeIds) {
    const upstreamNode = nodeMap.get(upstreamId);
    if (!upstreamNode) continue;

    const title = upstreamNode.data?.label || upstreamId;
    const outputs = upstreamNode.data?.outputs || [];

    outputs.forEach((port: any) => {
      variables.push({
        raw: `{{ $node["${title}"].${port.id} }}`,
        nodeId: upstreamId,
        nodeTitle: title,
        fieldPath: port.id,
      });
    });
  }

  return variables;
}

export function getAvailableUpstreamVariables(
  currentNodeId: string,
  nodes: any[],
  edges: any[]
): { fullPath: string; nodeTitle: string; outputPort: string }[] {
  const refs = extractAvailableVariables(currentNodeId, nodes, edges);
  return refs.map((r) => ({
    fullPath: `$node["${r.nodeTitle}"].${r.fieldPath}`,
    nodeTitle: r.nodeTitle || 'Node',
    outputPort: r.fieldPath,
  }));
}
