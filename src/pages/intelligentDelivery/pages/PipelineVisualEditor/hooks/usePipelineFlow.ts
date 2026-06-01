import { useCallback, useMemo, useRef, useState } from 'react';
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

export interface PipelinePreset {
  id: string;
  title: string;
  triggerLabel: string;
  stages: PipelineStage[];
  durationsMs: Record<string, number>;
}

const DEMO_PIPELINE: PipelinePreset = {
  id: 'deploy-host-iso',
  title: 'ISO 镜像源部署',
  triggerLabel: '手动触发',
  stages: [
    {
      id: 'stage_1',
      name: '准备阶段',
      steps: [
        { id: 'step_1', name: '环境预检', stepType: 'env-precheck', status: 'pending', config: { target_hosts: 'all', mode: 'check', tags: ['phase1'] } },
      ],
    },
    {
      id: 'stage_2',
      name: '部署阶段',
      steps: [
        { id: 'step_2', name: '挂载 ISO / 配置 yum 源', stepType: 'shell-exec', status: 'pending', config: { target: 'ssh', script: 'mount -o loop /data/CentOS-7.9.iso /mnt/iso\ncp /mnt/iso/local.repo /etc/yum.repos.d/' } },
        { id: 'step_3', name: '安装 httpd', stepType: 'app-deploy', status: 'pending', config: { deployForm: 'native', pkg: 'httpd', version: '2.4.6', targetPath: '/etc/httpd' } },
      ],
    },
    {
      id: 'stage_3',
      name: '验证阶段',
      steps: [
        { id: 'step_4', name: '启动 httpd 服务', stepType: 'service-ctl', status: 'pending', config: { deployForm: 'native', action: 'start', serviceName: 'httpd' } },
        { id: 'step_5', name: '健康检查', stepType: 'health-check', status: 'pending', config: { checkType: 'http', target: 'http://localhost:80/repodata/repomd.xml' } },
      ],
    },
  ],
  durationsMs: { step_1: 1500, step_2: 1200, step_3: 2000, step_4: 1500, step_5: 1000 },
};

const ENV_PRECHECK_PIPELINE: PipelinePreset = {
  id: 'env-precheck-iptse',
  title: '环境预检 · IPTSE 标准',
  triggerLabel: '手动触发',
  stages: [
    {
      id: 'pre_stage_1',
      name: '资产探测',
      steps: [
        {
          id: 'pre_step_1',
          name: '拉取 inventory',
          stepType: 'mcp-call',
          status: 'pending',
          config: { provider: 'ansible-mcp-server', tool: 'list_inventory', args: { inventory: 'inventory.ini' } },
        },
        {
          id: 'pre_step_2',
          name: '连通性 / SSH 审计',
          stepType: 'mcp-call',
          status: 'pending',
          config: {
            provider: 'ansible-mcp-server',
            tool: 'audit_inventory',
            args: { inventory: 'inventory.ini', target_group: 'ddp', check_hostname: true, check_latency: true },
          },
        },
      ],
    },
    {
      id: 'pre_stage_2',
      name: '规范核查',
      steps: [
        {
          id: 'pre_step_3',
          name: 'IPTSE 核查（os_check_all）',
          stepType: 'env-precheck',
          status: 'pending',
          config: { target_hosts: 'ddp', mode: 'check', tags: ['phase1', 'ntp', 'jdk'], compress_output: true },
        },
      ],
    },
    {
      id: 'pre_stage_3',
      name: '人工卡点',
      steps: [
        {
          id: 'pre_step_4',
          name: '确认是否自动初始化',
          stepType: 'manual-gate',
          status: 'pending',
          config: { approver: 'ops-admin', timeout: 30 },
        },
      ],
    },
    {
      id: 'pre_stage_4',
      name: '自动初始化',
      steps: [
        {
          id: 'pre_step_5',
          name: 'IPTSE 初始化（os_init_all）',
          stepType: 'env-precheck',
          status: 'pending',
          config: { target_hosts: 'ddp', mode: 'init', tags: ['phase1', 'ntp', 'jdk'] },
        },
      ],
    },
    {
      id: 'pre_stage_5',
      name: '复检',
      steps: [
        {
          id: 'pre_step_6',
          name: 'IPTSE 复核',
          stepType: 'env-precheck',
          status: 'pending',
          config: { target_hosts: 'ddp', mode: 'check', tags: ['phase1', 'ntp', 'jdk'], compress_output: true },
        },
      ],
    },
  ],
  durationsMs: {
    pre_step_1: 800,
    pre_step_2: 1400,
    pre_step_3: 2400,
    pre_step_4: 1000,
    pre_step_5: 2200,
    pre_step_6: 1800,
  },
};

// ── 形态①：容器化部署（舆情平台 V1.4.5 · Docker + Helm）────────────────
const DEPLOY_CONTAINER_PIPELINE: PipelinePreset = {
  id: 'deploy-container-yqpt',
  title: '容器化部署 · 舆情平台',
  triggerLabel: '手动触发',
  stages: [
    {
      id: 'c_stage_1',
      name: '环境预检',
      steps: [
        { id: 'c_step_1', name: '环境预检（IPTSE）', stepType: 'env-precheck', status: 'pending', config: { target_hosts: 'all', mode: 'check', tags: ['phase1', 'security'] } },
      ],
    },
    {
      id: 'c_stage_2',
      name: '配置注入',
      steps: [
        { id: 'c_step_2', name: 'ES 字段映射', stepType: 'config-render', status: 'pending', config: { configType: 'es-mapping', content: 'PUT yq_base_info/_doc/_mapping\n{ "properties": { "element_extract_theme": { "type": "keyword" } } }' } },
        { id: 'c_step_3', name: 'MySQL 数据脚本', stepType: 'config-render', status: 'pending', config: { configType: 'sql', content: '-- 舆情平台初始化数据\nINSERT INTO ...' } },
      ],
    },
    {
      id: 'c_stage_3',
      name: '镜像分发',
      steps: [
        { id: 'c_step_4', name: '上传 Docker 镜像', stepType: 'distribute', status: 'pending', config: { deployForm: 'container', artifact: 'docker.kxdigit.com/yqpt-ui:1.4.5-1001', registry: 'docker.kxdigit.com' } },
      ],
    },
    {
      id: 'c_stage_4',
      name: 'Helm 部署',
      steps: [
        { id: 'c_step_5', name: 'Helm 安装应用', stepType: 'app-deploy', status: 'pending', config: { deployForm: 'container', helmChart: 'yqpt-app-1.4.5-1001.tgz', namespace: 'yqpt' } },
      ],
    },
    {
      id: 'c_stage_5',
      name: '验证',
      steps: [
        { id: 'c_step_6', name: '健康检查', stepType: 'health-check', status: 'pending', config: { checkType: 'http', target: 'http://yqpt.internal/health', timeoutSec: 30 } },
      ],
    },
  ],
  durationsMs: { c_step_1: 2000, c_step_2: 800, c_step_3: 600, c_step_4: 3000, c_step_5: 2500, c_step_6: 800 },
};

// ── 形态②：托管平台部署（星云大数据 V1.4.1 · DataSophon）────────────────
const DEPLOY_HOSTED_BIGDATA_PIPELINE: PipelinePreset = {
  id: 'deploy-hosted-bigdata',
  title: '托管平台部署 · 星云大数据',
  triggerLabel: '手动触发',
  stages: [
    {
      id: 'b_stage_1',
      name: '环境预检',
      steps: [
        { id: 'b_step_1', name: '环境预检（IPTSE）', stepType: 'env-precheck', status: 'pending', config: { target_hosts: 'all', mode: 'check', tags: ['phase1', 'ntp', 'jdk'] } },
      ],
    },
    {
      id: 'b_stage_2',
      name: 'Agent 分发',
      steps: [
        { id: 'b_step_2', name: 'Worker Agent 分发', stepType: 'distribute', status: 'pending', config: { deployForm: 'hosted', artifact: 'datasophon-worker-1.4.1.tar.gz', target_hosts: 'all' } },
      ],
    },
    {
      id: 'b_stage_3',
      name: '集群组件安装',
      steps: [
        { id: 'b_step_3', name: 'ZooKeeper 集群', stepType: 'component', status: 'pending', config: { componentType: 'zookeeper', topology: 'cluster', target_hosts: 'all' } },
        { id: 'b_step_4', name: 'HDFS HA 集群', stepType: 'component', status: 'pending', config: { componentType: 'hdfs', topology: 'cluster', target_hosts: 'all' } },
        { id: 'b_step_5', name: 'YARN 集群', stepType: 'component', status: 'pending', config: { componentType: 'yarn', topology: 'cluster', target_hosts: 'all' } },
      ],
    },
    {
      id: 'b_stage_4',
      name: '服务注册',
      steps: [
        { id: 'b_step_6', name: '服务分配启动', stepType: 'service-ctl', status: 'pending', config: { deployForm: 'hosted', action: 'start', serviceName: 'DataSophonApplicationServer' } },
      ],
    },
    {
      id: 'b_stage_5',
      name: '验证',
      steps: [
        { id: 'b_step_7', name: '管理端健康检查', stepType: 'health-check', status: 'pending', config: { checkType: 'http', target: 'http://localhost:8081/ddh/', timeoutSec: 30 } },
      ],
    },
  ],
  durationsMs: { b_step_1: 2000, b_step_2: 1800, b_step_3: 2200, b_step_4: 2800, b_step_5: 2000, b_step_6: 1500, b_step_7: 800 },
};

// ── 形态③：原生 GPU 部署（星火大模型 V1.6 · Skynet + Ascend NPU）────────
const DEPLOY_NATIVE_LLM_PIPELINE: PipelinePreset = {
  id: 'deploy-native-llm',
  title: '原生 GPU 部署 · 星火大模型',
  triggerLabel: '手动触发',
  stages: [
    {
      id: 'l_stage_1',
      name: '环境预检',
      steps: [
        { id: 'l_step_1', name: '环境预检（IPTSE）', stepType: 'env-precheck', status: 'pending', config: { target_hosts: 'all', mode: 'check', tags: ['phase1', 'kernel'] } },
        { id: 'l_step_2', name: 'GPU/NPU 环境检查', stepType: 'shell-exec', status: 'pending', config: { target: 'ssh', script: 'npu-smi info && source /usr/local/Ascend/ascend-toolkit/set_env.sh' } },
      ],
    },
    {
      id: 'l_stage_2',
      name: '授权',
      steps: [
        { id: 'l_step_3', name: '采集授权指纹（c2v）', stepType: 'license-grant', status: 'pending', config: { licenseType: 'haspAuthCode', engineName: 'talker', step: 'collect' } },
        { id: 'l_step_4', name: '安装授权文件（v2c）', stepType: 'license-grant', status: 'pending', config: { licenseType: 'haspAuthCode', engineName: 'talker', step: 'install', licensePath: '/iflytek/engine/bin' } },
      ],
    },
    {
      id: 'l_stage_3',
      name: '模型分发',
      steps: [
        { id: 'l_step_5', name: '大模型资源分发（40GB+）', stepType: 'distribute', status: 'pending', config: { deployForm: 'native', artifact: 'res_0815_8p.zip', targetPath: '/iflytek/engine/res' } },
        { id: 'l_step_6', name: '引擎包分发', stepType: 'distribute', status: 'pending', config: { deployForm: 'native', artifact: 'talker_v1.6.zip', targetPath: '/iflytek/engine/lib' } },
      ],
    },
    {
      id: 'l_stage_4',
      name: '引擎部署',
      steps: [
        { id: 'l_step_7', name: '服务定义导入', stepType: 'app-deploy', status: 'pending', config: { deployForm: 'hosted', platform: 'skynet', zkConfig: 'turing-spark.zk.config', serviceName: 'turing-spark-gpt' } },
      ],
    },
    {
      id: 'l_stage_5',
      name: '服务注册',
      steps: [
        { id: 'l_step_8', name: '推理服务启动', stepType: 'service-ctl', status: 'pending', config: { deployForm: 'hosted', action: 'start', serviceName: 'turing-spark-gpt' } },
      ],
    },
    {
      id: 'l_stage_6',
      name: '推理验证',
      steps: [
        { id: 'l_step_9', name: '推理实测', stepType: 'health-check', status: 'pending', config: { checkType: 'inference', target: 'http://localhost/spark/chat', timeoutSec: 60 } },
      ],
    },
  ],
  durationsMs: { l_step_1: 2000, l_step_2: 1200, l_step_3: 1500, l_step_4: 1000, l_step_5: 4000, l_step_6: 2000, l_step_7: 1800, l_step_8: 1500, l_step_9: 1200 },
};

const PRESETS: Record<string, PipelinePreset> = {
  'deploy-host-iso': DEMO_PIPELINE,
  'env-precheck-iptse': ENV_PRECHECK_PIPELINE,
  'deploy-container-yqpt': DEPLOY_CONTAINER_PIPELINE,
  'deploy-hosted-bigdata': DEPLOY_HOSTED_BIGDATA_PIPELINE,
  'deploy-native-llm': DEPLOY_NATIVE_LLM_PIPELINE,
};

export function getPipelinePreset(id?: string): PipelinePreset {
  if (id && PRESETS[id]) return PRESETS[id];
  return DEMO_PIPELINE;
}

function buildFlowFromPipeline(pipeline: PipelinePreset) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const triggerId = 'trigger_0';
  nodes.push({
    id: triggerId,
    type: 'trigger',
    position: { x: 0, y: 0 },
    data: { label: pipeline.triggerLabel, triggerType: 'manual' },
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
        data: { label: step.name, stepType: step.stepType, status: step.status, stepId: step.id, config: step.config },
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

export function usePipelineFlow(presetId?: string) {
  const preset = useMemo(() => getPipelinePreset(presetId), [presetId]);
  const initial = useMemo(() => buildFlowFromPipeline(preset), [preset]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stepOrder = useMemo(() => preset.stages.flatMap((s) => s.steps.map((st) => st.id)), [preset]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'animated' }, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    if (node.type === 'step') setSelectedNode(node);
  }, []);

  const addStepNode = useCallback(
    (stepType: StepType, label: string, config?: Record<string, any>) => {
      const id = getNodeId();
      const newNode: Node = {
        id,
        type: 'step',
        position: { x: 400, y: 200 },
        data: { label, stepType, status: 'pending', config },
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
      const stageSteps = preset.stages.find((s) => s.id === stageId)?.steps || [];
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
    [preset, setNodes],
  );

  const resetPipeline = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setIsRunning(false);
    setCompletedAt(null);
    const fresh = buildFlowFromPipeline(preset);
    setNodes(fresh.nodes);
    setEdges(fresh.edges);
  }, [preset, setNodes, setEdges]);

  const runPipeline = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    setCompletedAt(null);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    let elapsedMs = 0;
    stepOrder.forEach((stepId, idx) => {
      const duration = preset.durationsMs[stepId] ?? 1500;
      const stage = preset.stages.find((s) => s.steps.some((step) => step.id === stepId));

      const startTimer = setTimeout(() => {
        updateStepStatus(stepId, 'running');
        if (stage) updateStageStatus(`stage_${stage.id}`, stage.id);
      }, elapsedMs);
      timersRef.current.push(startTimer);

      const endTimer = setTimeout(() => {
        const seconds = (duration / 1000).toFixed(1);
        updateStepStatus(stepId, 'success', `${seconds}s`);
        if (stage) updateStageStatus(`stage_${stage.id}`, stage.id);
        if (idx === stepOrder.length - 1) {
          setIsRunning(false);
          setCompletedAt(Date.now());
        }
      }, elapsedMs + duration);
      timersRef.current.push(endTimer);

      elapsedMs += duration + 200;
    });
  }, [isRunning, preset, stepOrder, updateStepStatus, updateStageStatus]);

  return {
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
  };
}
