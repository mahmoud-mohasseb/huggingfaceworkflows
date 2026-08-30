'use client';

import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { X } from 'lucide-react';

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  animated,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const strokeColor = (data?.color as string) || '#a855f7';

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#c084fc' : strokeColor,
          strokeWidth: selected ? 3 : 2,
          filter: selected ? 'drop-shadow(0 0 8px rgba(168,85,247,0.6))' : 'drop-shadow(0 0 4px rgba(168,85,247,0.3))',
        }}
      />

      {/* Animated Glowing Trail Dot along edge */}
      {animated && (
        <circle r="4" fill="#a855f7" className="animate-ping">
          <animateMotion path={edgePath} dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Edge Hover Label Renderer (Delete button) */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {selected && (
            <button
              onClick={() => {
                if (data?.onDeleteEdge) {
                  (data.onDeleteEdge as (edgeId: string) => void)(id);
                }
              }}
              title="Delete Edge Connection"
              className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-rose-400 flex items-center justify-center shadow-lg transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
