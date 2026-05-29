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
  | 'standard'
  | 'license'
  | 'component'
  | 'distribute'
  | 'deploy'
  | 'config'
  | 'service'
  | 'verify'
  | 'common';

export type TaskKind =
  | 'env-precheck'
  | 'license-grant'
  | 'component'
  | 'distribute'
  | 'app-deploy'
  | 'config-render'
  | 'service-ctl'
  | 'health-check'
  | 'shell-exec'
  | 'manual-gate'
  | 'mcp-call'
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
  { key: 'standard', label: '标准化' },
  { key: 'license', label: '授权' },
  { key: 'component', label: '公共组件' },
  { key: 'distribute', label: '分发' },
  { key: 'deploy', label: '部署' },
  { key: 'config', label: '配置' },
  { key: 'service', label: '服务' },
  { key: 'verify', label: '验证' },
  { key: 'common', label: '通用' },
];

export const TASK_OPTIONS: TaskOption[] = [
  {
    kind: 'env-precheck',
    category: 'standard',
    title: '环境预检（IPTSE）',
    description: '基于 Ansible MCP 对目标主机执行 IPTSE 标准核查与初始化',
    icon: <SafetyOutlined className='text-[#1677ff]' />,
    highlight: true,
  },
  {
    kind: 'license-grant',
    category: 'license',
    title: '授权',
    description: '引擎/大模型授权：hasp 指纹采集→v2c、云锁、大模型授权码统一编排',
    icon: <SafetyCertificateOutlined className='text-[#1677ff]' />,
    highlight: true,
  },
  {
    kind: 'component',
    category: 'component',
    title: '公共组件',
    description: 'MySQL / ES / Redis / ZK 等：版本包 + 配置项 + 单机/集群拓扑',
    icon: <DatabaseOutlined className='text-[#1677ff]' />,
    highlight: true,
  },
  {
    kind: 'distribute',
    category: 'distribute',
    title: '分发下发',
    description: '制品/镜像/模型下发：单机 scp、集群批量、容器镜像 push 统一抽象',
    icon: <CloudUploadOutlined className='text-[#1677ff]' />,
    highlight: true,
  },
  {
    kind: 'app-deploy',
    category: 'deploy',
    title: '应用部署',
    description: '应用部署：原生 tar、托管平台服务分配、容器 Helm 三形态统一',
    icon: <RocketOutlined className='text-[#1677ff]' />,
    highlight: true,
  },
  {
    kind: 'config-render',
    category: 'config',
    title: '配置注入',
    description: 'SQL 脚本 / ES 字段 / nacos / 配置项渲染下发',
    icon: <FileTextOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'service-ctl',
    category: 'service',
    title: '服务管控',
    description: '启停 / 注册：systemd、托管平台、K8s 三形态统一',
    icon: <ThunderboltOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'health-check',
    category: 'verify',
    title: '健康检查',
    description: 'HTTP / 端口 / 进程 / 推理实测，回写结果',
    icon: <HeartOutlined className='text-[#1677ff]' />,
    highlight: true,
  },
  {
    kind: 'shell-exec',
    category: 'common',
    title: '命令执行',
    description: '在 Server 本地或目标主机（SSH）执行 shell 脚本',
    icon: <CodeOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'manual-gate',
    category: 'common',
    title: '人工卡点',
    description: '等待人工确认后继续',
    icon: <PauseCircleOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'mcp-call',
    category: 'common',
    title: 'MCP 通用调用',
    description: '通过 N9E MCP 网关调用任意已注册的 MCP 工具',
    icon: <ApiOutlined className='text-[#1677ff]' />,
  },
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
