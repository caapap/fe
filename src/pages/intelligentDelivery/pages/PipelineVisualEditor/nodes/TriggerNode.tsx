import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { PlayCircleOutlined, ClockCircleOutlined, ApiOutlined } from '@ant-design/icons';

const TRIGGER_ICONS: Record<string, React.ReactNode> = {
  manual: <PlayCircleOutlined />,
  cron: <ClockCircleOutlined />,
  webhook: <ApiOutlined />,
};

interface TriggerData {
  label: string;
  triggerType?: 'manual' | 'cron' | 'webhook';
}

function TriggerNode({ data }: NodeProps<TriggerData>) {
  const { label, triggerType = 'manual' } = data;
  return (
    <div className='flex items-center gap-2 rounded-full border border-fc-200 bg-[var(--fc-fill-2)] px-5 py-3 shadow-sm'>
      <span className='text-lg text-[var(--fc-fill-primary)]'>{TRIGGER_ICONS[triggerType] || TRIGGER_ICONS.manual}</span>
      <span className='text-sm font-medium text-[var(--fc-text-1)]'>{label}</span>
      <Handle type='source' position={Position.Right} className='!h-3 !w-3 !border-2 !border-[var(--fc-fill-primary)] !bg-white' />
    </div>
  );
}

export default memo(TriggerNode);
