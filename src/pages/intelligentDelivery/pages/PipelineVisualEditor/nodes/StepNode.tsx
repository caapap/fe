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
} from '@ant-design/icons';

export type StepType = 'shell-local' | 'shell-ssh' | 'deploy' | 'approval';
export type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

interface StepData {
  label: string;
  stepType: StepType;
  status?: StepStatus;
  duration?: string;
}

const STEP_META: Record<StepType, { icon: React.ReactNode; color: string; title: string }> = {
  'shell-local': { icon: <DesktopOutlined />, color: 'blue', title: '本地 Shell' },
  'shell-ssh': { icon: <GlobalOutlined />, color: 'cyan', title: 'SSH 远程' },
  deploy: { icon: <CloudUploadOutlined />, color: 'purple', title: '软件包部署' },
  approval: { icon: <CheckCircleOutlined />, color: 'orange', title: '人工审批' },
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
