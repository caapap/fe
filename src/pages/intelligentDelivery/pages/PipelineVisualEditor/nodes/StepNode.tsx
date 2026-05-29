import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Tag } from 'antd';
import {
  DesktopOutlined,
  GlobalOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  SafetyCertificateOutlined,
  ApiOutlined,
  DatabaseOutlined,
  RocketOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  CodeOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';

/**
 * 原子能力体系（DeepPipeline 第一流水线）
 * ------------------------------------------------------------------
 * 按「部署生命周期」收敛为 11 个原子能力，节点结构保持 Trigger/Stage/Step 三层不变。
 * 三大公共能力抽象（汇报反馈点名）：
 *   - 授权能力        license-grant：hasp/haspAuthCode/云锁/大模型授权码 → 采集指纹→申请→安装
 *   - 公共组件管理    component   ：MySQL/ES/Redis/ZK… 差异收进 版本包+配置项+单机/集群
 *   - 分发/部署模式   distribute  ：单机 scp / 集群批量(Agent) / 容器镜像 push 统一为「下发」
 * 部署形态（container/hosted/native）作为横切维度，由各原子能力的配置抽屉用参数吸收。
 */
export type StepType =
  | 'env-precheck' // 标准化 · 环境预检 (IPTSE)
  | 'license-grant' // 授权 · 引擎/大模型授权
  | 'component' // 公共组件 · MySQL/ES/Redis/中间件
  | 'distribute' // 分发 · 制品/镜像/模型下发
  | 'app-deploy' // 部署 · 应用部署（原生/托管/容器）
  | 'config-render' // 配置 · SQL/ES字段/nacos/配置项注入
  | 'service-ctl' // 服务 · 启停/注册（systemd/托管/K8s）
  | 'health-check' // 验证 · HTTP/端口/进程/推理实测
  | 'shell-exec' // 通用 · 命令执行（local/ssh）
  | 'manual-gate' // 通用 · 人工卡点
  | 'mcp-call' // 通用 · MCP 调用
  // —— legacy 别名（兼容历史保存的流水线，画布会自动映射到新视觉）——
  | 'shell-local'
  | 'shell-ssh'
  | 'deploy'
  | 'approval';
export type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

interface StepData {
  label: string;
  stepType: StepType;
  status?: StepStatus;
  duration?: string;
}

const STEP_META: Record<StepType, { icon: React.ReactNode; color: string; title: string }> = {
  'env-precheck': { icon: <SafetyOutlined />, color: 'geekblue', title: '环境预检' },
  'license-grant': { icon: <SafetyCertificateOutlined />, color: 'gold', title: '授权' },
  component: { icon: <DatabaseOutlined />, color: 'purple', title: '公共组件' },
  distribute: { icon: <CloudUploadOutlined />, color: 'cyan', title: '分发下发' },
  'app-deploy': { icon: <RocketOutlined />, color: 'blue', title: '应用部署' },
  'config-render': { icon: <FileTextOutlined />, color: 'lime', title: '配置注入' },
  'service-ctl': { icon: <ThunderboltOutlined />, color: 'volcano', title: '服务管控' },
  'health-check': { icon: <HeartOutlined />, color: 'green', title: '健康检查' },
  'shell-exec': { icon: <CodeOutlined />, color: 'default', title: '命令执行' },
  'manual-gate': { icon: <PauseCircleOutlined />, color: 'orange', title: '人工卡点' },
  'mcp-call': { icon: <ApiOutlined />, color: 'magenta', title: 'MCP 调用' },
  // legacy 别名
  'shell-local': { icon: <DesktopOutlined />, color: 'default', title: '命令执行' },
  'shell-ssh': { icon: <GlobalOutlined />, color: 'default', title: '命令执行' },
  deploy: { icon: <RocketOutlined />, color: 'blue', title: '应用部署' },
  approval: { icon: <PauseCircleOutlined />, color: 'orange', title: '人工卡点' },
};

const STATUS_ICON: Record<StepStatus, React.ReactNode> = {
  pending: <ClockCircleOutlined className='text-[var(--fc-text-4)]' />,
  running: <LoadingOutlined spin className='text-[var(--fc-fill-primary)]' />,
  success: <CheckCircleOutlined className='text-[var(--fc-fill-success)]' />,
  failed: <CloseCircleOutlined className='text-[var(--fc-fill-error)]' />,
  skipped: <ClockCircleOutlined className='text-[var(--fc-text-5)]' />,
};

const STATUS_BORDER: Record<StepStatus, string> = {
  pending: 'border-fc-200',
  running: 'border-[var(--fc-fill-primary)] shadow-md shadow-[var(--fc-fill-primary)]/10',
  success: 'border-[var(--fc-fill-success)]',
  failed: 'border-[var(--fc-fill-error)]',
  skipped: 'border-fc-200 opacity-60',
};

function StepNode({ data, selected }: NodeProps<StepData>) {
  const { label, stepType, status = 'pending', duration } = data;
  const meta = STEP_META[stepType] || STEP_META['shell-local'];
  const borderClass = STATUS_BORDER[status];
  const animationClass = status === 'running' ? 'pipeline-step-running' : status === 'success' ? 'pipeline-step-success' : '';

  return (
    <div
      className={`relative min-w-[200px] rounded-lg border bg-[var(--fc-fill-2)] p-3 transition-all ${borderClass} ${animationClass} ${
        selected ? 'ring-2 ring-[var(--fc-fill-primary)]/30' : ''
      }`}
    >
      <Handle type='target' position={Position.Left} className='!h-3 !w-3 !border-2 !border-[var(--fc-fill-primary)] !bg-white' />
      <div className='flex items-center gap-2'>
        <Tag color={meta.color} className='!m-0'>
          {meta.icon} {meta.title}
        </Tag>
        <span className='ml-auto'>{STATUS_ICON[status]}</span>
      </div>
      <div className='mt-2 truncate text-sm font-medium text-[var(--fc-text-1)]'>{label}</div>
      {duration && <div className='mt-1 text-xs text-[var(--fc-text-4)]'>{duration}</div>}
      <Handle type='source' position={Position.Right} className='!h-3 !w-3 !border-2 !border-[var(--fc-fill-primary)] !bg-white' />
    </div>
  );
}

export default memo(StepNode);
