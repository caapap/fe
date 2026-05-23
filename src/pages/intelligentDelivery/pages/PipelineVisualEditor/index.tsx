import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider, Panel } from 'reactflow';
import { Button, Space, Tag } from 'antd';
import { PlayCircleOutlined, ReloadOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import 'reactflow/dist/style.css';

import TriggerNode from './nodes/TriggerNode';
import StageNode from './nodes/StageNode';
import StepNode from './nodes/StepNode';
import AnimatedEdge from './edges/AnimatedEdge';
import StepConfigDrawer from './panels/StepConfigDrawer';
import IptseReportPanel from './panels/IptseReportPanel';
import { usePipelineFlow } from './hooks/usePipelineFlow';
import TaskTypeSelectorDrawer from '../../components/TaskTypeSelector';
import { TaskOption } from '../../components/TaskTypeSelector/options';
import './styles.less';

const nodeTypes = {
  trigger: TriggerNode,
  stage: StageNode,
  step: StepNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

const TASK_KIND_TO_STEP_TYPE: Record<string, 'shell-local' | 'shell-ssh' | 'deploy' | 'approval' | 'env-precheck' | 'mcp-call'> = {
  'shell-local': 'shell-local',
  'shell-ssh': 'shell-ssh',
  'deploy-host': 'deploy',
  'deploy-host-script': 'deploy',
  'deploy-rolling': 'deploy',
  'env-precheck': 'env-precheck',
  'doc-parse': 'shell-local',
  'unit-test': 'shell-local',
  'smoke-test': 'shell-ssh',
  'regression-test': 'shell-local',
  'http-probe': 'shell-local',
  'manual-gate': 'approval',
  'oss-download': 'shell-local',
  'oss-upload': 'shell-local',
  'empty-task': 'shell-local',
  'mcp-call': 'mcp-call',
  'mcp-ansible-audit': 'mcp-call',
  'mcp-ansible-playbook': 'mcp-call',
};

function PipelineVisualEditorInner() {
  const location = useLocation();
  const presetId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('template') || undefined;
  }, [location.search]);

  const {
    preset,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    selectedNode,
    addStepNode,
    closeDrawer,
    isRunning,
    completedAt,
    runPipeline,
    resetPipeline,
  } = usePipelineFlow(presetId);

  const [taskSelectorOpen, setTaskSelectorOpen] = useState(false);
  const showIptseReport = preset.id === 'env-precheck-iptse' && completedAt !== null;

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

  const handleTaskSelect = (opt: TaskOption) => {
    const stepType = TASK_KIND_TO_STEP_TYPE[opt.kind] || 'shell-local';
    addStepNode(stepType, opt.title);
    setTaskSelectorOpen(false);
  };

  return (
    <div className='pipeline-visual-editor flex h-[calc(100vh-260px)] min-h-[500px] gap-3'>
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
          <Panel position='top-left'>
            <Space>
              <Button
                icon={<PlusOutlined />}
                onClick={() => setTaskSelectorOpen(true)}
              >
                添加任务
              </Button>
              <Button
                type='primary'
                icon={isRunning ? <LoadingOutlined /> : <PlayCircleOutlined />}
                loading={isRunning}
                onClick={runPipeline}
                disabled={isRunning}
              >
                {isRunning ? '执行中...' : '运行流水线'}
              </Button>
              <Button icon={<ReloadOutlined />} onClick={resetPipeline} disabled={isRunning}>
                重置
              </Button>
            </Space>
          </Panel>
          <Panel position='top-right'>
            <div className='flex items-center gap-2 rounded-lg border border-fc-200 bg-[var(--fc-fill-2)] px-3 py-1.5 text-xs'>
              <Tag color='purple' className='!m-0'>演示</Tag>
              <span className='text-[var(--fc-text-2)]'>{preset.title}</span>
            </div>
          </Panel>
        </ReactFlow>
      </div>
      {showIptseReport && <IptseReportPanel />}
      <StepConfigDrawer node={selectedNode} onClose={closeDrawer} />
      <TaskTypeSelectorDrawer
        open={taskSelectorOpen}
        onClose={() => setTaskSelectorOpen(false)}
        onSelect={handleTaskSelect}
      />
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
