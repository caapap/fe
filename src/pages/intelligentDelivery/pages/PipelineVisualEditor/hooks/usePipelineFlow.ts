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

// ========== 三形态 Demo 模板（基于真实文档）==========

// 1. 舆情平台 V1.4.5（容器化形态）
const YUQING_CONTAINER_PIPELINE: PipelinePreset = {
  id: 'yuqing-container',
  title: '舆情平台 V1.4.5（容器化）',
  triggerLabel: '手动触发',
  stages: [
    {
      id: 'yq_stage_1',
      name: '环境准备',
      steps: [
        {
          id: 'yq_step_1',
          name: '环境预检（IPTSE）',
          stepType: 'env-precheck',
          status: 'pending',
          config: { target_hosts: 'yuqing-cluster', mode: 'check', tags: ['docker', 'k8s', 'network'] },
        },
      ],
    },
    {
      id: 'yq_stage_2',
      name: '配置初始化',
      steps: [
        {
          id: 'yq_step_2',
          name: 'ES 字段映射',
          stepType: 'config-render',
          status: 'pending',
          config: { deployForm: 'container', engine: 'es', configPath: '/config/es-mapping.json' },
        },
        {
          id: 'yq_step_3',
          name: 'MySQL 初始化脚本',
          stepType: 'config-render',
          status: 'pending',
          config: { deployForm: 'container', engine: 'sql', configPath: '/config/init.sql' },
        },
      ],
    },
    {
      id: 'yq_stage_3',
      name: '镜像分发',
      steps: [
        {
          id: 'yq_step_4',
          name: '推送镜像到 Harbor',
          stepType: 'distribute',
          status: 'pending',
          config: { deployForm: 'container', source: 'artifact-repo', pkg: 'yuqing-app', version: '1.4.5', registry: 'harbor.iflytek.com' },
        },
      ],
    },
    {
      id: 'yq_stage_4',
      name: '应用部署',
      steps: [
        {
          id: 'yq_step_5',
          name: 'Helm 部署舆情应用',
          stepType: 'app-deploy',
          status: 'pending',
          config: { deployForm: 'container', mode: 'k8s', chart: 'yuqing-app', namespace: 'yuqing-prod', replicas: 3 },
        },
      ],
    },
    {
      id: 'yq_stage_5',
      name: '验证',
      steps: [
        {
          id: 'yq_step_6',
          name: '健康检查',
          stepType: 'health-check',
          status: 'pending',
          config: { checkType: 'http', target: 'http://yuqing-api.iflytek.com/health', expectedStatus: 200 },
        },
      ],
    },
  ],
  durationsMs: { yq_step_1: 2000, yq_step_2: 1500, yq_step_3: 1500, yq_step_4: 3000, yq_step_5: 4000, yq_step_6: 1000 },
};

// 2. 星云大数据 V1.4.1（托管平台 DataSophon）
const XINGYUN_HOSTED_PIPELINE: PipelinePreset = {
  id: 'xingyun-hosted',
  title: '星云大数据 V1.4.1（托管平台）',
  triggerLabel: '手动触发',
  stages: [
    {
      id: 'xy_stage_1',
      name: '环境准备',
      steps: [
        {
          id: 'xy_step_1',
          name: '环境预检（IPTSE）',
          stepType: 'env-precheck',
          status: 'pending',
          config: { target_hosts: 'bigdata-cluster', mode: 'check', tags: ['os', 'jdk', 'network'] },
        },
      ],
    },
    {
      id: 'xy_stage_2',
      name: '制品分发',
      steps: [
        {
          id: 'xy_step_2',
          name: 'Agent 批量分发',
          stepType: 'distribute',
          status: 'pending',
          config: { deployForm: 'hosted', source: 'artifact-repo', pkg: 'datasophon-agent', version: '1.4.1-arm', executor: 'm2-agent' },
        },
      ],
    },
    {
      id: 'xy_stage_3',
      name: '集群组件部署',
      steps: [
        {
          id: 'xy_step_3',
          name: 'ZooKeeper 集群',
          stepType: 'component',
          status: 'pending',
          config: { deployForm: 'hosted', componentType: 'zookeeper', topology: { mode: 'cluster', nodes: 3 } },
        },
        {
          id: 'xy_step_4',
          name: 'HDFS 集群',
          stepType: 'component',
          status: 'pending',
          config: { deployForm: 'hosted', componentType: 'hdfs', topology: { mode: 'cluster', namenode: 2, datanode: 5 } },
        },
        {
          id: 'xy_step_5',
          name: 'YARN 集群',
          stepType: 'component',
          status: 'pending',
          config: { deployForm: 'hosted', componentType: 'yarn', topology: { mode: 'cluster', resourcemanager: 2, nodemanager: 5 } },
        },
      ],
    },
    {
      id: 'xy_stage_4',
      name: '服务注册',
      steps: [
        {
          id: 'xy_step_6',
          name: '注册到 DataSophon',
          stepType: 'service-ctl',
          status: 'pending',
          config: { deployForm: 'hosted', action: 'register', platform: 'datasophon' },
        },
      ],
    },
    {
      id: 'xy_stage_5',
      name: '验证',
      steps: [
        {
          id: 'xy_step_7',
          name: '健康检查',
          stepType: 'health-check',
          status: 'pending',
          config: { checkType: 'http', target: 'http://datasophon-manager:8081/api/cluster/status' },
        },
      ],
    },
  ],
  durationsMs: { xy_step_1: 2500, xy_step_2: 3500, xy_step_3: 4000, xy_step_4: 4000, xy_step_5: 4000, xy_step_6: 2000, xy_step_7: 1500 },
};

// 3. 星火大模型平台 V1.3（原生+GPU+托管混合）
const XINGHUO_NATIVE_PIPELINE: PipelinePreset = {
  id: 'xinghuo-native',
  title: '星火大模型平台 V1.3（原生+GPU）',
  triggerLabel: '手动触发',
  stages: [
    {
      id: 'xh_stage_1',
      name: '环境准备',
      steps: [
        {
          id: 'xh_step_1',
          name: '环境预检（IPTSE）',
          stepType: 'env-precheck',
          status: 'pending',
          config: { target_hosts: 'llm-gpu-cluster', mode: 'check', tags: ['os', 'driver', 'cuda'] },
        },
        {
          id: 'xh_step_2',
          name: 'GPU 检查',
          stepType: 'shell-exec',
          status: 'pending',
          config: { target: 'ssh', script: 'nvidia-smi\nnpu-smi info' },
        },
      ],
    },
    {
      id: 'xh_stage_2',
      name: '授权管理',
      steps: [
        {
          id: 'xh_step_3',
          name: 'HASP 指纹采集',
          stepType: 'license-grant',
          status: 'pending',
          config: { licenseType: 'hasp', action: 'collect-fingerprint', targetHosts: 'llm-gpu-cluster' },
        },
        {
          id: 'xh_step_4',
          name: '导入 v2c 授权文件',
          stepType: 'license-grant',
          status: 'pending',
          config: { licenseType: 'hasp', action: 'import-v2c', licenseFile: '/licenses/xinghuo.v2c' },
        },
      ],
    },
    {
      id: 'xh_stage_3',
      name: '制品分发',
      steps: [
        {
          id: 'xh_step_5',
          name: '分发推理引擎（40GB）',
          stepType: 'distribute',
          status: 'pending',
          config: { deployForm: 'native', source: 'artifact-repo', pkg: 'xinghuo-engine', version: '1.3.0', targetPath: '/opt/xinghuo' },
        },
        {
          id: 'xh_step_6',
          name: '分发模型文件',
          stepType: 'distribute',
          status: 'pending',
          config: { deployForm: 'native', source: 'artifact-repo', pkg: 'xinghuo-model-v3', version: '3.5', targetPath: '/data/models' },
        },
      ],
    },
    {
      id: 'xh_stage_4',
      name: '应用部署',
      steps: [
        {
          id: 'xh_step_7',
          name: '部署推理引擎',
          stepType: 'app-deploy',
          status: 'pending',
          config: { deployForm: 'native', pkg: 'xinghuo-engine', targetPath: '/opt/xinghuo', startMode: 'systemd' },
        },
      ],
    },
    {
      id: 'xh_stage_5',
      name: '服务注册',
      steps: [
        {
          id: 'xh_step_8',
          name: '注册到 Skynet',
          stepType: 'service-ctl',
          status: 'pending',
          config: { deployForm: 'hosted', action: 'register', platform: 'skynet', serviceName: 'xinghuo-inference' },
        },
      ],
    },
    {
      id: 'xh_stage_6',
      name: '验证',
      steps: [
        {
          id: 'xh_step_9',
          name: '推理实测',
          stepType: 'health-check',
          status: 'pending',
          config: { checkType: 'inference', target: 'http://xinghuo-api:8080/v1/chat/completions', prompt: '你好，请介绍一下自己' },
        },
      ],
    },
  ],
  durationsMs: {
    xh_step_1: 2500, xh_step_2: 1500, xh_step_3: 2000, xh_step_4: 1500,
    xh_step_5: 8000, xh_step_6: 6000, xh_step_7: 5000, xh_step_8: 2000, xh_step_9: 3000
  },
};

const DEMO_PIPELINE: PipelinePreset = YUQING_CONTAINER_PIPELINE; // 默认使用舆情平台模板

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
  'yuqing-container': YUQING_CONTAINER_PIPELINE,
  'xingyun-hosted': XINGYUN_HOSTED_PIPELINE,
  'xinghuo-native': XINGHUO_NATIVE_PIPELINE,
  'env-precheck-iptse': ENV_PRECHECK_PIPELINE,
  'deploy-host-iso': DEMO_PIPELINE, // legacy
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
