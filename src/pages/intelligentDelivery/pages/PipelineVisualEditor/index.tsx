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

import { StepType } from './nodes/StepNode';

const TASK_KIND_TO_STEP_TYPE: Record<string, StepType> = {
  // 触发器（前端节点，不映射到 Step）
  'trigger-manual': 'shell-exec', // placeholder
  'trigger-cron': 'shell-exec',
  'trigger-webhook': 'shell-exec',
  // 环境准备
  'env-precheck': 'env-precheck',
  'license-grant': 'license-grant',
  // 分发部署（形态细分 → 统一后端 StepType）
  'distribute-container': 'distribute',
  'distribute-hosted': 'distribute',
  'distribute-native': 'distribute',
  'app-deploy-docker': 'app-deploy',
  'app-deploy-k8s': 'app-deploy',
  'app-deploy-native': 'app-deploy',
  // 配置管理
  'config-render-container': 'config-render',
  'config-render-hosted': 'config-render',
  'config-render-native': 'config-render',
  // 服务控制
  'service-ctl-container': 'service-ctl',
  'service-ctl-hosted': 'service-ctl',
  'service-ctl-native': 'service-ctl',
  // 验证检查
  'health-check': 'health-check',
  // 通用工具
  'shell-exec': 'shell-exec',
  'manual-gate': 'manual-gate',
  'mcp-call': 'mcp-call',
  agent: 'agent',
  // 公共组件
  component: 'component',
  // Legacy
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
    const stepType = TASK_KIND_TO_STEP_TYPE[opt.kind] || 'shell-exec';

    // 从 TaskKind 提取形态参数
    let deployForm: 'native' | 'hosted' | 'container' | undefined;
    if (opt.kind.includes('-container')) deployForm = 'container';
    else if (opt.kind.includes('-hosted')) deployForm = 'hosted';
    else if (opt.kind.includes('-native')) deployForm = 'native';
    else if (opt.kind.includes('-docker')) deployForm = 'container';
    else if (opt.kind.includes('-k8s')) deployForm = 'container';

    addStepNode(stepType, opt.title, { deployForm });
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
