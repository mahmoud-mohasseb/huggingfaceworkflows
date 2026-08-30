'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TelegramTriggerNode } from './nodes/TelegramTriggerNode';
import { WhatsAppTriggerNode } from './nodes/WhatsAppTriggerNode';
import { GradioSpaceNode } from './nodes/GradioSpaceNode';
import { HFRouterNode } from './nodes/HFRouterNode';
import { HFImageGenNode } from './nodes/HFImageGenNode';
import { HFVideoGenNode } from './nodes/HFVideoGenNode';
import { HFMusicGenNode } from './nodes/HFMusicGenNode';
import { LogicTransformNode } from './nodes/LogicTransformNode';
import { TelegramReplyNode } from './nodes/TelegramReplyNode';
import { WhatsAppReplyNode } from './nodes/WhatsAppReplyNode';
import { OpenClawAgentNode } from './nodes/OpenClawAgentNode';
import { CustomEdge } from './CustomEdge';

import { NODE_REGISTRY } from '../../lib/nodeRegistry';
import { NodeData, NodeType } from '../../../../packages/shared-types';

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (connection: Connection) => void;
  onNodeSelect: (nodeId: string | null) => void;
  onAddNodeAtPosition: (type: string, position: { x: number; y: number }) => void;
  onDeleteEdge: (edgeId: string) => void;
  onRunSingleNode?: (nodeId: string) => void;
  onDuplicateNode?: (nodeId: string) => void;
  onToggleDisableNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  isExecuting: boolean;
}

const nodeTypesMap = {
  telegram_trigger: TelegramTriggerNode,
  whatsapp_trigger: WhatsAppTriggerNode,
  gradio_space: GradioSpaceNode,
  hf_router: HFRouterNode,
  hf_image_gen: HFImageGenNode,
  hf_video_gen: HFVideoGenNode,
  hf_music_gen: HFMusicGenNode,
  hf_speech_to_text: HFRouterNode,
  openclaw_agent: OpenClawAgentNode,
  logic_transform: LogicTransformNode,
  telegram_reply: TelegramReplyNode,
  whatsapp_reply: WhatsAppReplyNode,
};

const edgeTypesMap = {
  customEdge: CustomEdge,
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeSelect,
  onAddNodeAtPosition,
  onDeleteEdge,
  onRunSingleNode,
  onDuplicateNode,
  onToggleDisableNode,
  onDeleteNode,
  isExecuting,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const decoratedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onRunNode: onRunSingleNode,
        onDuplicateNode: onDuplicateNode,
        onToggleDisableNode: onToggleDisableNode,
        onDeleteNode: onDeleteNode,
      },
    }));
  }, [nodes, onRunSingleNode, onDuplicateNode, onToggleDisableNode, onDeleteNode]);

  const decoratedEdges = useMemo(() => {
    return edges.map((e) => ({
      ...e,
      type: 'customEdge',
      animated: isExecuting,
      data: {
        ...e.data,
        onDeleteEdge,
      },
    }));
  }, [edges, isExecuting, onDeleteEdge]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type');
      if (!type || !rfInstance || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = rfInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      onAddNodeAtPosition(type, position);
    },
    [rfInstance, onAddNodeAtPosition]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative bg-slate-950">
      <ReactFlowProvider>
        <ReactFlow
          nodes={decoratedNodes}
          edges={decoratedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setRfInstance}
          onNodeClick={(_, node) => onNodeSelect(node.id)}
          onPaneClick={() => onNodeSelect(null)}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypesMap}
          edgeTypes={edgeTypesMap}
          defaultEdgeOptions={{ type: 'customEdge' }}
          fitView
          className="bg-slate-950"
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#334155" />
          <Controls className="bg-slate-900 border-slate-800 text-slate-200 fill-slate-200 shadow-xl rounded-xl" />
          <MiniMap
            nodeColor={(node) => {
              const nodeData = node.data as unknown as NodeData;
              const nodeDef = NODE_REGISTRY[nodeData?.type];
              return nodeDef?.accentColor || '#8b5cf6';
            }}
            className="bg-slate-900 border-slate-800 rounded-xl shadow-xl overflow-hidden"
            maskColor="rgba(2, 6, 23, 0.7)"
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};
