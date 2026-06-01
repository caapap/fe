import {
  CodeOutlined,
  SafetyOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
  CloudUploadOutlined,
  RocketOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  PauseCircleOutlined,
  ApiOutlined,
  MonitorOutlined,
} from '@ant-design/icons';
import React from 'react';

export type TaskCategory =
  | 'trigger'
  | 'env-prepare'
  | 'distribute-deploy'
  | 'config'
  | 'service'
  | 'verify'
  | 'common';

export type TaskKind =
  // 触发器（3个）
  | 'trigger-manual'
  | 'trigger-cron'
  | 'trigger-webhook'
  // 环境准备（2个）
  | 'env-precheck'
  | 'license-grant'
  // 分发部署（6个）
  | 'distribute-container'
  | 'distribute-hosted'
  | 'distribute-native'
  | 'app-deploy-docker'
  | 'app-deploy-k8s'
  | 'app-deploy-native'
  // 配置管理（3个）
  | 'config-render-container'
  | 'config-render-hosted'
  | 'config-render-native'
  // 服务控制（3个）
  | 'service-ctl-container'
  | 'service-ctl-hosted'
  | 'service-ctl-native'
  // 验证检查（1个）
  | 'health-check'
  // 通用工具（3个）
  | 'shell-exec'
  | 'manual-gate'
  | 'mcp-call'
  | 'agent'
  // 公共组件（保留，不分形态）
  | 'component'
  // legacy 兼容
  | 'mcp-ansible-audit'
  | 'mcp-ansible-playbook';

export interface TaskOption {
  kind: TaskKind;
  category: TaskCategory;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

export const TASK_CATEGORIES: { key: TaskCategory; label: string }[] = [
  { key: 'trigger', label: '触发器' },
  { key: 'env-prepare', label: '环境准备' },
  { key: 'distribute-deploy', label: '分发部署' },
  { key: 'config', label: '配置管理' },
  { key: 'service', label: '服务控制' },
  { key: 'verify', label: '验证检查' },
  { key: 'common', label: '通用工具' },
];

export const TASK_OPTIONS: TaskOption[] = [
  // ========== 触发器（3个）==========
  {
    kind: 'trigger-manual',
    category: 'trigger',
    title: '手动触发',
    description: '点击运行按钮手动触发流水线',
    icon: <CodeOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'trigger-cron',
    category: 'trigger',
    title: '定时触发',
    description: '按 Cron 表达式定时触发流水线',
    icon: <CodeOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'trigger-webhook',
    category: 'trigger',
    title: 'Webhook 触发',
    description: '外部系统通过 Webhook 触发流水线',
    icon: <CodeOutlined className='text-[#1677ff]' />,
  },

  // ========== 环境准备（2个）==========
  {
    kind: 'env-precheck',
    category: 'env-prepare',
    title: '环境预检',
    description: '基于 Ansible MCP 对目标主机执行 IPTSE 标准核查与初始化',
    icon: <SafetyOutlined className='text-[#1677ff]' />,
    highlight: true,
  },
  {
    kind: 'license-grant',
    category: 'env-prepare',
    title: '授权管理',
    description: '引擎/大模型授权：hasp 指纹采集→v2c、云锁、大模型授权码统一编排',
    icon: <SafetyCertificateOutlined className='text-[#1677ff]' />,
    highlight: true,
  },

  // ========== 分发部署（6个）==========
  {
    kind: 'distribute-container',
    category: 'distribute-deploy',
    title: '容器镜像分发',
    description: '镜像 push 到容器仓库（Docker Registry / Harbor）',
    icon: <CloudUploadOutlined className='text-[#1677ff]' />,
    highlight: true,
  },
  {
    kind: 'distribute-hosted',
    category: 'distribute-deploy',
    title: '托管服务分发',
    description: 'Agent 批量分发到托管平台节点（DataSophon / Skynet）',
    icon: <CloudUploadOutlined className='text-[#1677ff]' />,
    highlight: true,
  },
  {
    kind: 'distribute-native',
    category: 'distribute-deploy',
    title: '原生包分发',
    description: '单机 scp / 大模型 jar 解压 / 断点续传',
    icon: <CloudUploadOutlined className='text-[#1677ff]' />,
    highlight: true,
  },
  {
    kind: 'app-deploy-docker',
    category: 'distribute-deploy',
    title: 'Docker 部署',
    description: '单机 docker run / docker-compose up',
    icon: <RocketOutlined className='text-[#1677ff]' />,
    highlight: true,
  },
  {
    kind: 'app-deploy-k8s',
    category: 'distribute-deploy',
    title: 'K8s 部署',
    description: 'Helm install / kubectl apply / KubeSphere',
    icon: <RocketOutlined className='text-[#1677ff]' />,
    highlight: true,
  },
  {
    kind: 'app-deploy-native',
    category: 'distribute-deploy',
    title: '原生部署',
    description: 'tar 解压 + 启动脚本 / systemd / 裸机 GPU',
    icon: <RocketOutlined className='text-[#1677ff]' />,
    highlight: true,
  },

  // ========== 配置管理（3个）==========
  {
    kind: 'config-render-container',
    category: 'config',
    title: '容器配置',
    description: 'ES mapping / MySQL 脚本 / ConfigMap',
    icon: <FileTextOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'config-render-hosted',
    category: 'config',
    title: '托管配置',
    description: 'nacos / ZK 配置项 / Skynet 服务定义',
    icon: <FileTextOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'config-render-native',
    category: 'config',
    title: '原生配置',
    description: 'ini / properties / yaml 文件渲染',
    icon: <FileTextOutlined className='text-[#1677ff]' />,
  },

  // ========== 服务控制（3个）==========
  {
    kind: 'service-ctl-container',
    category: 'service',
    title: '容器服务',
    description: 'K8s rollout / docker restart / 镜像升级',
    icon: <ThunderboltOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'service-ctl-hosted',
    category: 'service',
    title: '托管服务',
    description: '托管平台服务启停 / 分配 / 建集群 / 纳管主机',
    icon: <ThunderboltOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'service-ctl-native',
    category: 'service',
    title: '原生服务',
    description: 'systemd start/stop/enable / 进程管理',
    icon: <ThunderboltOutlined className='text-[#1677ff]' />,
  },

  // ========== 验证检查（1个）==========
  {
    kind: 'health-check',
    category: 'verify',
    title: '健康检查',
    description: 'HTTP / 端口 / 进程 / 推理实测，回写结果',
    icon: <HeartOutlined className='text-[#1677ff]' />,
    highlight: true,
  },

  // ========== 通用工具（4个）==========
  {
    kind: 'shell-exec',
    category: 'common',
    title: 'Shell 执行',
    description: '在 Server 本地或目标主机（SSH）执行 shell 脚本',
    icon: <CodeOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'mcp-call',
    category: 'common',
    title: 'MCP 调用',
    description: '通过 N9E MCP 网关调用任意已注册的 MCP 工具',
    icon: <ApiOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'manual-gate',
    category: 'common',
    title: '人工卡点',
    description: '等待人工确认后继续（审批人 / 会签 / 超时 / 通知）',
    icon: <PauseCircleOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'agent',
    category: 'common',
    title: 'AI Agent',
    description: 'LLM 驱动的智能体，支持 Prompt + MCP + Skill + 多轮推理，兜底复杂场景',
    icon: <ApiOutlined className='text-[#722ed1]' />,
    highlight: true,
  },

  // ========== 公共组件（不分形态）==========
  {
    kind: 'component',
    category: 'distribute-deploy',
    title: '公共组件',
    description: 'MySQL / ES / Redis / ZK 等：版本包 + 配置项 + 单机/集群拓扑',
    icon: <DatabaseOutlined className='text-[#1677ff]' />,
    highlight: true,
  },

  // ========== Legacy 兼容（MCP 快捷方式）==========
  {
    kind: 'mcp-ansible-audit',
    category: 'common',
    title: 'Ansible · 资产审计',
    description: '调用 ansible-mcp-server 的 audit_inventory（连通性 / SSH / 主机名）',
    icon: <MonitorOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'mcp-ansible-playbook',
    category: 'common',
    title: 'Ansible · Playbook 执行',
    description: '调用 ansible-mcp-server 的 run_playbook（os_check_all / os_init_all）',
    icon: <ThunderboltOutlined className='text-[#1677ff]' />,
  },
];
