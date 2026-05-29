import {
  CloudServerOutlined,
  RocketOutlined,
  CodeOutlined,
  CloudUploadOutlined,
  AppstoreAddOutlined,
  ContainerOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  FileSearchOutlined,
  ApiOutlined,
  PlusSquareOutlined,
  SafetyOutlined,
  MonitorOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import React from 'react';

export type TemplateCategory = 'org' | 'precheck' | 'deploy' | 'test' | 'empty' | 'other';

export interface TemplateChip {
  label: string;
  color?: 'blue' | 'cyan' | 'purple' | 'orange' | 'green';
}

export interface PipelineTemplate {
  id: string;
  category: TemplateCategory;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  chips: TemplateChip[];
  preset?: boolean;
}

export const TEMPLATE_CATEGORIES: { key: TemplateCategory; label: string; icon: React.ReactNode }[] = [
  { key: 'org', label: '组织模板', icon: <AppstoreAddOutlined /> },
  { key: 'precheck', label: '巡检 / 预检', icon: <SafetyOutlined /> },
  { key: 'deploy', label: '部署', icon: <CloudUploadOutlined /> },
  { key: 'test', label: '测试', icon: <ExperimentOutlined /> },
  { key: 'empty', label: '空模板', icon: <PlusSquareOutlined /> },
  { key: 'other', label: '其他', icon: <ApiOutlined /> },
];

export const PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    id: 'env-precheck-iptse',
    category: 'precheck',
    title: '环境预检 · IPTSE 标准',
    subtitle: '星相预置 · MCP 驱动',
    description: '资产探测 → IPTSE 规范核查 → 人工卡点 → 自动初始化 → 复检（驱动方：Ansible MCP Server）',
    icon: <SafetyOutlined className='text-[var(--fc-fill-primary)]' />,
    chips: [
      { label: '资产探测', color: 'cyan' },
      { label: 'IPTSE 核查', color: 'blue' },
      { label: '人工卡点', color: 'orange' },
      { label: '自动初始化', color: 'purple' },
      { label: '复检', color: 'green' },
    ],
    preset: true,
  },
  {
    id: 'env-precheck-quick',
    category: 'precheck',
    title: '环境预检 · 快速连通性',
    subtitle: '星相预置',
    description: '仅执行 audit_inventory，验证主机连通性、SSH 认证与主机名一致性',
    icon: <MonitorOutlined className='text-[var(--fc-fill-primary)]' />,
    chips: [
      { label: 'Ping 连通', color: 'cyan' },
      { label: 'SSH 认证', color: 'blue' },
      { label: '主机名核对', color: 'green' },
    ],
    preset: true,
  },
  {
    id: 'deploy-host-iso',
    category: 'deploy',
    title: '主机部署 · ISO 镜像源',
    subtitle: '星相预置',
    description: '挂载 ISO 镜像 → 配置 yum 源 → 启动 httpd 服务 → 健康检查',
    icon: <CloudServerOutlined className='text-[var(--fc-fill-primary)]' />,
    chips: [
      { label: '挂载镜像', color: 'cyan' },
      { label: '配置仓库', color: 'cyan' },
      { label: '主机部署', color: 'blue' },
      { label: '健康检查', color: 'green' },
    ],
    preset: true,
  },
  {
    id: 'deploy-host-shell',
    category: 'deploy',
    title: '主机部署 · 通过 SSH 发布',
    subtitle: '星相预置',
    description: '从资源仓库下载软件包，通过 SSH 解压并启动服务',
    icon: <CloudUploadOutlined className='text-[var(--fc-fill-primary)]' />,
    chips: [
      { label: 'SSH 远程', color: 'cyan' },
      { label: '主机部署', color: 'blue' },
      { label: '健康检查', color: 'green' },
    ],
    preset: true,
  },
  {
    id: 'deploy-rolling',
    category: 'deploy',
    title: '主机部署 · 滚动发布',
    subtitle: '星相预置',
    description: '分批次滚动发布到主机集群，支持人工卡点与自动回滚',
    icon: <RocketOutlined className='text-[var(--fc-fill-primary)]' />,
    chips: [
      { label: '资源拉取', color: 'cyan' },
      { label: '分批部署', color: 'blue' },
      { label: '人工卡点', color: 'orange' },
      { label: '健康检查', color: 'green' },
    ],
    preset: true,
  },
  {
    id: 'test-smoke',
    category: 'test',
    title: '冒烟测试 · 主机验证',
    subtitle: '星相预置',
    description: '部署后立即在目标主机上跑预置脚本，回写结果到夜莺',
    icon: <ExperimentOutlined className='text-[var(--fc-fill-primary)]' />,
    chips: [
      { label: 'SSH 远程', color: 'cyan' },
      { label: '执行命令', color: 'blue' },
      { label: '结果回写', color: 'green' },
    ],
    preset: true,
  },
  {
    id: 'test-regression',
    category: 'test',
    title: '回归测试 · 接口巡检',
    subtitle: '星相预置',
    description: '对发布完成的环境定时跑接口/拨测套件并产出报告',
    icon: <CheckCircleOutlined className='text-[var(--fc-fill-primary)]' />,
    chips: [
      { label: 'HTTP 探测', color: 'cyan' },
      { label: '接口测试', color: 'blue' },
      { label: '汇总报告', color: 'green' },
    ],
    preset: true,
  },
  {
    id: 'empty',
    category: 'empty',
    title: '空模板 · 空模板',
    subtitle: '星相预置',
    description: '从一个空白阶段开始，自定义编排',
    icon: <PlusSquareOutlined className='text-[var(--fc-fill-primary)]' />,
    chips: [{ label: '空任务' }],
    preset: true,
  },
  {
    id: 'other-shell',
    category: 'other',
    title: '其他 · 执行命令',
    subtitle: '星相预置',
    description: '直接在 Server 或目标主机上执行任意 shell 命令',
    icon: <CodeOutlined className='text-[var(--fc-fill-primary)]' />,
    chips: [{ label: '执行命令', color: 'blue' }],
    preset: true,
  },
  // ── 三形态部署模板（汇报演示）────────────────────────────────────────────
  {
    id: 'deploy-container-yqpt',
    category: 'deploy',
    title: '容器化部署 · 舆情平台',
    subtitle: '星相预置 · Docker + Helm',
    description: '预检 → 配置注入(ES字段/MySQL) → 镜像分发 → Helm 部署 → 健康检查',
    icon: <ContainerOutlined className='text-[var(--fc-fill-primary)]' />,
    chips: [
      { label: '环境预检', color: 'blue' },
      { label: '配置注入', color: 'cyan' },
      { label: '镜像分发', color: 'cyan' },
      { label: 'Helm 部署', color: 'blue' },
      { label: '健康检查', color: 'green' },
    ],
    preset: true,
  },
  {
    id: 'deploy-hosted-bigdata',
    category: 'deploy',
    title: '托管平台部署 · 星云大数据',
    subtitle: '星相预置 · DataSophon',
    description: '预检 → Agent 分发 → 集群组件(ZK/HDFS/YARN) → 服务注册 → 管理端验证',
    icon: <DatabaseOutlined className='text-[var(--fc-fill-primary)]' />,
    chips: [
      { label: '环境预检', color: 'blue' },
      { label: 'Agent 分发', color: 'cyan' },
      { label: '集群组件', color: 'purple' },
      { label: '服务注册', color: 'orange' },
      { label: '健康检查', color: 'green' },
    ],
    preset: true,
  },
  {
    id: 'deploy-native-llm',
    category: 'deploy',
    title: '原生 GPU 部署 · 星火大模型',
    subtitle: '星相预置 · Skynet + Ascend NPU',
    description: '预检 → GPU环境 → 授权(hasp指纹→v2c) → 模型分发(40GB+) → 引擎部署 → 推理验证',
    icon: <SafetyCertificateOutlined className='text-[var(--fc-fill-primary)]' />,
    chips: [
      { label: '环境预检', color: 'blue' },
      { label: '授权', color: 'orange' },
      { label: '模型分发', color: 'cyan' },
      { label: '引擎部署', color: 'blue' },
      { label: '推理验证', color: 'green' },
    ],
    preset: true,
  },
];
