import { useCallback, useState } from 'react';
import { Node, Edge, useNodesState, useEdgesState, addEdge, Connection } from 'reactflow';
import { getLayoutedElements } from '../utils/layoutEngine';
import { StepType, StepStatus } from '../nodes/StepNode';
import { EdgeStatus } from '../edges/AnimatedEdge';

let nodeId = 0;
const getNodeId = () => `node_${++nodeId}`;

export interface PipelineStep {
  id: string;
  name: string;
  stepType: StepType;
  status: StepStatus;
  config?: Record<string, any>;
}

export interface PipelineStage {
  id: string;
  name: string;
  steps: PipelineStep[];
}

const DEMO_PIPELINE: { stages: PipelineStage[] } = {
  stages: [
    {
      id: 'stage_1',
      name: '准备阶段',
      steps: [
        { id: 'step_1', name: '挂载 ISO 镜像', stepType: 'shell-ssh', status: 'success', config: { script: 'mount -o loop /data/CentOS-7.9.iso /mnt/iso' } },
      ],
    },
    {
      id: 'stage_2',
      name: '部署阶段',
      steps: [
        { id: 'step_2', name: '配置 yum 源', stepType: 'shell-ssh', status: 'success', config: { script: 'cp /mnt/iso/local.repo /etc/yum.repos.d/' } },
        { id: 'step_3', name: '安装 httpd', stepType: 'deploy', status: 'running', config: { pkg: 'httpd', version: '2.4.6' } },
      ],
    },
    {
      id: 'stage_3',
      name: '验证阶段',
      steps: [
        { id: 'step_4', name: '启动 httpd 服务', stepType: 'shell-ssh', status: 'pending', config: { script: 'systemctl start httpd && systemctl enable httpd' } },
        { id: 'step_5', name: '健康检查', stepType: 'shell-local', status: 'pending', config: { script: 'curl -sf http://target:80/repodata/repomd.xml' } },
      ],
    },
  ],
};

function buildFlowFromPipeline(pipeline: { stages: PipelineStage[] }) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const triggerId = 'trigger_0';
  nodes.push({
    id: triggerId,
    type: 'trigger',
    position: { x: 0, y: 0 },
    data: { label: '手动触发', triggerType: 'manual' },
  });

  let prevNodeId = triggerId;

  pipeline.stages.forEach((stage) => {
    const stageNodeId = `stage_${stage.id}`;
    nodes.push({
      id: stageNodeId,
      type: 'stage',
      position: { x: 0, y: 0 },
      data: { label: stage.name, status: deriveStageStatus(stage.steps), stepCount: stage.steps.length },
    });
    edges.push({
      id: `e_${prevNodeId}_${stageNodeId}`,
      source: prevNodeId,
      target: stageNodeId,
      type: 'animated',
      data: { status: deriveEdgeStatus(stage.steps) },
    });

    let prevStepId = stageNodeId;
    stage.steps.forEach((step) => {
      const stepNodeId = `step_${step.id}`;
      nodes.push({
        id: stepNodeId,
        type: 'step',
        position: { x: 0, y: 0 },
        data: { label: step.name, stepType: step.stepType, status: step.status },
      });
      edges.push({
        id: `e_${prevStepId}_${stepNodeId}`,
        source: prevStepId,
        target: stepNodeId,
        type: 'animated',
        data: { status: step.status === 'success' ? 'success' : step.status === 'running' ? 'running' : 'pending' },
      });
      prevStepId = stepNodeId;
    });

    prevNodeId = `step_${stage.steps[stage.steps.length - 1].id}`;
  });

  return getLayoutedElements(nodes, edges, 'LR');
}

function deriveStageStatus(steps: PipelineStep[]): string {
  if (steps.some((s) => s.status === 'failed')) return 'failed';
  if (steps.some((s) => s.status === 'running')) return 'running';
  if (steps.every((s) => s.status === 'success')) return 'success';
  return 'pending';
}

function deriveEdgeStatus(steps: PipelineStep[]): EdgeStatus {
  if (steps.every((s) => s.status === 'success')) return 'success';
  if (steps.some((s) => s.status === 'running')) return 'running';
  if (steps.some((s) => s.status === 'failed')) return 'failed';
  return 'pending';
}

export function usePipelineFlow() {
  const initial = buildFlowFromPipeline(DEMO_PIPELINE);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'animated' }, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    if (node.type === 'step') setSelectedNode(node);
  }, []);

  const addStepNode = useCallback(
    (stepType: StepType, label: string) => {
      const id = getNodeId();
      const newNode: Node = {
        id,
        type: 'step',
        position: { x: 400, y: 200 },
        data: { label, stepType, status: 'pending' },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes],
  );

  const closeDrawer = useCallback(() => setSelectedNode(null), []);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    selectedNode,
    addStepNode,
    closeDrawer,
  };
}
