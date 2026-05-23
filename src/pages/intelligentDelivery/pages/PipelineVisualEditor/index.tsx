import React, { useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider, Panel } from 'reactflow';
import 'reactflow/dist/style.css';

import TriggerNode from './nodes/TriggerNode';
import StageNode from './nodes/StageNode';
import StepNode from './nodes/StepNode';
import AnimatedEdge from './edges/AnimatedEdge';
import NodePalette from './panels/NodePalette';
import StepConfigDrawer from './panels/StepConfigDrawer';
import { usePipelineFlow } from './hooks/usePipelineFlow';
import './styles.less';

const nodeTypes = {
  trigger: TriggerNode,
  stage: StageNode,
  step: StepNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

function PipelineVisualEditorInner() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    selectedNode,
    addStepNode,
    closeDrawer,
  } = usePipelineFlow();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const stepType = e.dataTransfer.getData('application/pipeline-step-type');
      const label = e.dataTransfer.getData('application/pipeline-step-label');
      if (stepType && label) {
        addStepNode(stepType as any, label);
      }
    },
    [addStepNode],
  );

  return (
    <div className='pipeline-visual-editor flex h-[calc(100vh-260px)] min-h-[500px] gap-3'>
      <NodePalette onAdd={addStepNode} />
      <div className='flex-1 overflow-hidden rounded-xl border border-fc-200'>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.5, maxZoom: 1, minZoom: 0.5 }}
          defaultEdgeOptions={{ type: 'animated' }}
        >
          <Background color='var(--fc-fill-4)' gap={20} size={1} />
          <Controls className='!rounded-lg !border-fc-200 !shadow-sm' />
          <MiniMap
            nodeColor={(n) => {
              if (n.type === 'trigger') return 'var(--fc-fill-primary)';
              if (n.type === 'stage') return 'var(--fc-fill-4)';
              const status = n.data?.status;
              if (status === 'success') return 'var(--fc-fill-success)';
              if (status === 'running') return 'var(--fc-fill-primary)';
              if (status === 'failed') return 'var(--fc-fill-error)';
              return 'var(--fc-fill-5)';
            }}
            className='!rounded-lg !border-fc-200'
          />
          <Panel position='top-right'>
            <div className='rounded-lg border border-fc-200 bg-[var(--fc-fill-2)] px-3 py-1.5 text-xs text-[var(--fc-text-4)]'>
              ISO 镜像源部署 · 演示流水线
            </div>
          </Panel>
        </ReactFlow>
      </div>
      <StepConfigDrawer node={selectedNode} onClose={closeDrawer} />
    </div>
  );
}

export default function PipelineVisualEditor() {
  return (
    <ReactFlowProvider>
      <PipelineVisualEditorInner />
    </ReactFlowProvider>
  );
}
