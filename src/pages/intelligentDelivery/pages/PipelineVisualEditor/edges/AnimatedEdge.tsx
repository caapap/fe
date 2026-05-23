import React from 'react';
import { EdgeProps, getBezierPath, BaseEdge } from 'reactflow';

export type EdgeStatus = 'pending' | 'running' | 'success' | 'failed';

interface AnimatedEdgeData {
  status?: EdgeStatus;
}

const STATUS_COLORS: Record<EdgeStatus, string> = {
  pending: 'var(--fc-fill-5)',
  running: 'var(--fc-fill-primary)',
  success: 'var(--fc-fill-success)',
  failed: 'var(--fc-fill-error)',
};

export default function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
}: EdgeProps<AnimatedEdgeData>) {
  const status: EdgeStatus = data?.status || 'pending';
  const color = STATUS_COLORS[status];
  const isRunning = status === 'running';

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ ...style, stroke: color, strokeWidth: 2 }}
      />
      {isRunning && (
        <circle r='4' fill={color}>
          <animateMotion dur='1.5s' repeatCount='indefinite' path={edgePath} />
        </circle>
      )}
    </>
  );
}
