import {
  CodeOutlined,
  DesktopOutlined,
  GlobalOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
  CheckSquareOutlined,
  ApiOutlined,
  FileSearchOutlined,
  ContainerOutlined,
  BugOutlined,
  RocketOutlined,
  SafetyOutlined,
  ToolOutlined,
  MonitorOutlined,
  HddOutlined,
} from '@ant-design/icons';
import React from 'react';

export type TaskCategory = 'test' | 'deploy' | 'tool' | 'cmd' | 'empty';
export type TaskKind =
  | 'shell-local'
  | 'shell-ssh'
  | 'deploy-host'
  | 'deploy-host-script'
  | 'deploy-rolling'
  | 'env-precheck'
  | 'doc-parse'
  | 'unit-test'
  | 'smoke-test'
  | 'regression-test'
  | 'http-probe'
  | 'manual-gate'
  | 'oss-download'
  | 'oss-upload'
  | 'empty-task';

export interface TaskOption {
  kind: TaskKind;
  category: TaskCategory;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

export const TASK_CATEGORIES: { key: TaskCategory; label: string }[] = [
  { key: 'test', label: '测试' },
  { key: 'deploy', label: '部署' },
  { key: 'tool', label: '工具' },
  { key: 'cmd', label: '执行命令' },
  { key: 'empty', label: '空模板' },
];

export const TASK_OPTIONS: TaskOption[] = [
  {
    kind: 'unit-test',
    category: 'test',
    title: '单元测试',
    description: '执行预设的单元测试脚本并收集报告',
    icon: <BugOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'smoke-test',
    category: 'test',
    title: '冒烟测试',
    description: '部署后立即跑核心路径用例',
    icon: <CheckSquareOutlined className='text-[#1677ff]' />,
    highlight: true,
  },
  {
    kind: 'regression-test',
    category: 'test',
    title: '回归测试',
    description: '对发布完成环境跑接口/拨测套件',
    icon: <FileSearchOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'http-probe',
    category: 'test',
    title: 'HTTP 探测',
    description: '对目标 URL 发起健康检查请求',
    icon: <ApiOutlined className='text-[#1677ff]' />,
  },

  {
    kind: 'env-precheck',
    category: 'deploy',
    title: '环境预检',
    description: '部署前检查目标主机连通性、磁盘、依赖',
    icon: <SafetyOutlined className='text-[#1677ff]' />,
    highlight: true,
  },
  {
    kind: 'doc-parse',
    category: 'deploy',
    title: '文档解析',
    description: '从指定 Markdown / 配置文件解析部署清单',
    icon: <FileSearchOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'deploy-host',
    category: 'deploy',
    title: '主机部署',
    description: '从资源仓库下载软件包并部署到目标主机',
    icon: <HddOutlined className='text-[#1677ff]' />,
    highlight: true,
  },
  {
    kind: 'deploy-host-script',
    category: 'deploy',
    title: '主机部署（无构建）',
    description: '使用脚本直接发布到主机',
    icon: <DesktopOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'deploy-rolling',
    category: 'deploy',
    title: '滚动发布',
    description: '分批次滚动发布到主机集群',
    icon: <RocketOutlined className='text-[#1677ff]' />,
  },

  {
    kind: 'manual-gate',
    category: 'tool',
    title: '人工卡点',
    description: '等待人工确认后继续',
    icon: <CheckSquareOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'oss-download',
    category: 'tool',
    title: 'OSS 下载',
    description: '从对象存储下载文件',
    icon: <ContainerOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'oss-upload',
    category: 'tool',
    title: 'OSS 上传',
    description: '上传文件到对象存储',
    icon: <ContainerOutlined className='text-[#1677ff]' />,
  },

  {
    kind: 'shell-local',
    category: 'cmd',
    title: '本地 Shell',
    description: '在 Server 上执行 shell 脚本',
    icon: <CodeOutlined className='text-[#1677ff]' />,
  },
  {
    kind: 'shell-ssh',
    category: 'cmd',
    title: 'SSH 远程',
    description: '通过 SSH 在目标主机上执行命令',
    icon: <GlobalOutlined className='text-[#1677ff]' />,
    highlight: true,
  },

  {
    kind: 'empty-task',
    category: 'empty',
    title: '空任务',
    description: '不配置任何动作的占位任务',
    icon: <AppstoreOutlined className='text-[#1677ff]' />,
  },
];
