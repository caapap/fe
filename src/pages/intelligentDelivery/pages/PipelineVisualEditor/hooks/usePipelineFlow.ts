import { useCallback, useRef, useState } from 'react';
import { Node, Edge, useNodesState, useEdgesState, addEdge, Connection } from 'reactflow';
import { getLayoutedElements } from '../utils/layoutEngine';
import { StepType, StepStatus } from '../nodes/StepNode';
import { EdgeStatus } from '../edges/AnimatedEdge';

let nodeCounter = 0;
const getNodeId = () => `node_${++nodeCounter}`;

export interface PipelineStep {
  id: string;
  name: string;
  stepType: StepType;
  status: StepStatus;
  duration?: string;
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
        { id: 'step_1', name: '挂载 ISO 镜像', stepType: 'shell-ssh', status: 'pending', config: { script: 'mount -o loop /data/CentOS-7.9.iso /mnt/iso' } },
      ],
    },
    {
      id: 'stage_2',
      name: '部署阶段',
      steps: [
        { id: 'step_2', name: '配置 yum 源', stepType: 'shell-ssh', status: 'pending', config: { script: 'cp /mnt/iso/local.repo /etc/yum.repos.d/' } },
        { id: 'step_3', name: '安装 httpd', stepType: 'deploy', status: 'pending', config: { pkg: 'httpd', version: '2.4.6' } },
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
      data: { label: stage.name, status: deriveStageStatus(stage.steps), stepCount: stage.steps.length, stageId: stage.id },
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
        data: { label: step.name, stepType: step.stepType, status: step.status, stepId: step.id },
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

const STEP_EXECUTION_ORDER = ['step_1', 'step_2', 'step_3', 'step_4', 'step_5'];
const STEP_DURATIONS_MS = [1500, 1200, 2000, 1500, 1000];

export function usePipelineFlow() {
  const initial = buildFlowFromPipeline(DEMO_PIPELINE);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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

  const updateStepStatus = useCallback(
    (stepId: string, status: StepStatus, duration?: string) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.data?.stepId === stepId) {
            return { ...n, data: { ...n.data, status, duration } };
          }
          return n;
        }),
      );
      setEdges((eds) =>
        eds.map((e) => {
          if (e.target === `step_${stepId}` || e.source === `step_${stepId}`) {
            const edgeStatus: EdgeStatus = status === 'success' ? 'success' : status === 'running' ? 'running' : status === 'failed' ? 'failed' : 'pending';
            return { ...e, data: { ...e.data, status: edgeStatus } };
          }
          return e;
        }),
      );
    },
    [setNodes, setEdges],
  );

  const updateStageStatus = useCallback(
    (stageNodeId: string, stageId: string) => {
      const stageSteps = DEMO_PIPELINE.stages.find((s) => s.id === stageId)?.steps || [];
      const stageStepIds = stageSteps.map((s) => s.id);
      setNodes((nds) => {
        const myStepStatuses = nds
          .filter((node) => node.type === 'step' && stageStepIds.includes(node.data?.stepId))
          .map((node) => node.data?.status as StepStatus);
        let newStatus: string = 'pending';
        if (myStepStatuses.some((s) => s === 'failed')) newStatus = 'failed';
        else if (myStepStatuses.some((s) => s === 'running')) newStatus = 'running';
        else if (myStepStatuses.every((s) => s === 'success') && myStepStatuses.length > 0) newStatus = 'success';
        return nds.map((n) => (n.id === stageNodeId ? { ...n, data: { ...n.data, status: newStatus } } : n));
      });
    },
    [setNodes],
  );

  const resetPipeline = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setIsRunning(false);
    const fresh = buildFlowFromPipeline(DEMO_PIPELINE);
    setNodes(fresh.nodes);
    setEdges(fresh.edges);
  }, [setNodes, setEdges]);

  const runPipeline = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    let elapsedMs = 0;
    STEP_EXECUTION_ORDER.forEach((stepId, idx) => {
      const duration = STEP_DURATIONS_MS[idx];
      const stage = DEMO_PIPELINE.stages.find((s) => s.steps.some((step) => step.id === stepId));

      const startTimer = setTimeout(() => {
        updateStepStatus(stepId, 'running');
        if (stage) updateStageStatus(`stage_${stage.id}`, stage.id);
      }, elapsedMs);
      timersRef.current.push(startTimer);

      const endTimer = setTimeout(() => {
        const seconds = (duration / 1000).toFixed(1);
        updateStepStatus(stepId, 'success', `${seconds}s`);
        if (stage) updateStageStatus(`stage_${stage.id}`, stage.id);
        if (idx === STEP_EXECUTION_ORDER.length - 1) {
          setIsRunning(false);
        }
      }, elapsedMs + duration);
      timersRef.current.push(endTimer);

      elapsedMs += duration + 200;
    });
  }, [isRunning, updateStepStatus, updateStageStatus]);

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
    isRunning,
    runPipeline,
    resetPipeline,
  };
}
