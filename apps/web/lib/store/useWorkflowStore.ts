import { create } from 'zustand';
import { Node, Edge, Connection, addEdge } from '@xyflow/react';
import { Workflow, NodeData, ExecutionResult } from '../../../../packages/shared-types';

interface WorkflowState {
  workflow: Workflow;
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isExecuting: boolean;
  executionResult: ExecutionResult | null;
  isDrawerOpen: boolean;

  setWorkflow: (wf: Partial<Workflow>) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setIsExecuting: (executing: boolean) => void;
  setExecutionResult: (result: ExecutionResult | null) => void;
  setIsDrawerOpen: (open: boolean) => void;
  onConnect: (connection: Connection) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, any>) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  loadGeneratedWorkflow: (nodes: Node[], edges: Edge[], name: string) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflow: {
    id: 'wf_telegram_ai_bot',
    name: 'Telegram AI Customer Bot Workflow',
    status: 'active',
    updatedAt: new Date().toISOString(),
    hfDatasetPath: 'datasets/mahmoud-mohasseb/hf-workflow-data',
    commitHash: '8f3a92b',
    creditBalance: 1250,
    nodes: [],
    edges: [],
  },
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isExecuting: false,
  executionResult: null,
  isDrawerOpen: false,

  setWorkflow: (wf) =>
    set((state) => ({
      workflow: { ...state.workflow, ...wf, updatedAt: new Date().toISOString() },
    })),

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  setExecutionResult: (executionResult) => set({ executionResult }),
  setIsDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),

  onConnect: (connection) => {
    const newEdge: Edge = {
      ...connection,
      id: `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: 'customEdge',
      data: { color: '#a855f7' },
    };
    set((state) => ({ edges: addEdge(newEdge, state.edges) }));
  },

  updateNodeConfig: (nodeId, config) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                config,
                subtitle: config.model_id || config.space_slug || (n.data as any).subtitle,
              },
            }
          : n
      ),
    }));
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }));
  },

  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
    }));
  },

  loadGeneratedWorkflow: (nodes, edges, name) => {
    set((state) => ({
      nodes,
      edges,
      selectedNodeId: null,
      workflow: { ...state.workflow, name, updatedAt: new Date().toISOString() },
    }));
  },
}));
