export interface DAGAnalysisResult {
  isValid: boolean;
  hasCycle: boolean;
  topologicalBatches: string[][]; // Node IDs grouped by execution tier
  errors: string[];
  isolatedNodeIds: string[];
}

export function parseAndValidateDAG(nodes: any[], edges: any[]): DAGAnalysisResult {
  const errors: string[] = [];
  const activeNodes = nodes.filter((n) => !n.data?.disabled);
  const nodeMap = new Map<string, any>();
  activeNodes.forEach((n) => nodeMap.set(n.id, n));

  const nodeIds = activeNodes.map((n) => n.id);
  const inDegree: Record<string, number> = {};
  const adjacencyList: Record<string, string[]> = {};

  nodeIds.forEach((id) => {
    inDegree[id] = 0;
    adjacencyList[id] = [];
  });

  edges.forEach((edge) => {
    // Only count edges between active nodes
    if (nodeMap.has(edge.source) && nodeMap.has(edge.target)) {
      adjacencyList[edge.source].push(edge.target);
      inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
    }
  });

  // Kahn's Algorithm for Topological Sort with tier/level tracking
  const queue: string[] = nodeIds.filter((id) => inDegree[id] === 0);
  const topologicalBatches: string[][] = [];
  let processedCount = 0;

  let currentBatch = [...queue];

  while (currentBatch.length > 0) {
    topologicalBatches.push(currentBatch);
    processedCount += currentBatch.length;

    const nextBatch: string[] = [];

    for (const nodeId of currentBatch) {
      for (const neighborId of adjacencyList[nodeId]) {
        inDegree[neighborId]--;
        if (inDegree[neighborId] === 0) {
          nextBatch.push(neighborId);
        }
      }
    }

    currentBatch = nextBatch;
  }

  const hasCycle = processedCount !== nodeIds.length;
  if (hasCycle) {
    errors.push('Cycle detected in workflow graph. Execution cannot proceed in a cyclic loop.');
  }

  const isolatedNodeIds = nodeIds.filter((id) => {
    const isTarget = edges.some((e) => e.target === id);
    const isSource = edges.some((e) => e.source === id);
    const node = nodeMap.get(id);
    const isTrigger = node?.data?.category === 'triggers';
    return !isTrigger && !isTarget && !isSource;
  });

  if (isolatedNodeIds.length > 0) {
    const isolatedNames = isolatedNodeIds.map((id) => nodeMap.get(id)?.data?.label || id).join(', ');
    errors.push(`Isolated unconnected nodes found: ${isolatedNames}`);
  }

  return {
    isValid: !hasCycle,
    hasCycle,
    topologicalBatches,
    errors,
    isolatedNodeIds,
  };
}
