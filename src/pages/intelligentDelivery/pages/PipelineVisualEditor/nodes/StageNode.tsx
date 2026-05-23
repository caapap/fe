import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Tag } from 'antd';
import { AppstoreOutlined, CheckCircleOutlined, LoadingOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

export type StageStatus = 'pending' | 'running' | 'success' | 'failed';

interface StageData {
  label: string;
  status?: StageStatus;
  stepCount?: number;
}

const STATUS_CONFIG: Record<StageStatus, { icon: React.ReactNode; color: string; borderClass: string }> = {
  pending: { icon: <ClockCircleOutlined />, color: 'default', borderClass: 'border-fc-200' },
  running: { icon: <LoadingOutlined spin />, color: 'processing', borderClass: 'border-[var(--fc-fill-primary)]' },
  success: { icon: <CheckCircleOutlined />, color: 'success', borderClass: 'border-[var(--fc-fill-success)]' },
  failed: { icon: <CloseCircleOutlined />, color: 'error', borderClass: 'border-[var(--fc-fill-error)]' },
};

function StageNode({ data, selected }: NodeProps<StageData>) {
  const { label, status = 'pending', stepCount } = data;
  const cfg = STATUS_CONFIG[status];

  return (
    <div
      className={`min-w-[200px] rounded-xl border-2 bg-[var(--fc-fill-2-5)] p-4 transition-all ${cfg.borderClass} ${
        selected ? 'ring-2 ring-[var(--fc-fill-primary)]/30' : ''
      }`}
    >
      <Handle type='target' position={Position.Left} className='!h-3 !w-3 !border-2 !border-[var(--fc-fill-primary)] !bg-white' />
      <div className='flex items-center gap-2'>
        <AppstoreOutlined className='text-[var(--fc-fill-primary)]' />
        <span className='text-sm font-semibold text-[var(--fc-text-1)]'>{label}</span>
        <Tag color={cfg.color} className='!m-0 ml-auto'>
          {cfg.icon}
        </Tag>
      </div>
      {stepCount !== undefined && (
        <div className='mt-2 text-xs text-[var(--fc-text-4)]'>{stepCount} 个步骤</div>
      )}
      <Handle type='source' position={Position.Right} className='!h-3 !w-3 !border-2 !border-[var(--fc-fill-primary)] !bg-white' />
    </div>
  );
}

export default memo(StageNode);
