import React from 'react';
import { Tag } from 'antd';
import { DesktopOutlined, GlobalOutlined, CloudUploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { StepType } from '../nodes/StepNode';

interface PaletteItem {
  type: StepType;
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'shell-local', title: '本地 Shell', desc: '在 Server 上执行脚本', icon: <DesktopOutlined />, color: 'blue' },
  { type: 'shell-ssh', title: 'SSH 远程', desc: '通过 SSH 执行远程命令', icon: <GlobalOutlined />, color: 'cyan' },
  { type: 'deploy', title: '软件包部署', desc: '从资源仓库下载并部署', icon: <CloudUploadOutlined />, color: 'purple' },
  { type: 'approval', title: '人工审批', desc: '等待人工确认后继续', icon: <CheckCircleOutlined />, color: 'orange' },
];

interface NodePaletteProps {
  onAdd: (stepType: StepType, label: string) => void;
}

export default function NodePalette({ onAdd }: NodePaletteProps) {
  const onDragStart = (e: React.DragEvent, item: PaletteItem) => {
    e.dataTransfer.setData('application/pipeline-step-type', item.type);
    e.dataTransfer.setData('application/pipeline-step-label', item.title);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className='flex w-[200px] flex-col gap-2 rounded-xl border border-fc-200 bg-[var(--fc-fill-2)] p-3'>
      <div className='mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--fc-text-4)]'>步骤组件</div>
      {PALETTE_ITEMS.map((item) => (
        <div
          key={item.type}
          draggable
          onDragStart={(e) => onDragStart(e, item)}
          onClick={() => onAdd(item.type, item.title)}
          className='cursor-grab rounded-lg border border-fc-200 p-2.5 transition-all hover:border-[var(--fc-fill-primary)] hover:shadow-sm active:cursor-grabbing'
        >
          <Tag color={item.color} className='!m-0 !mb-1'>
            {item.icon} {item.title}
          </Tag>
          <div className='text-xs text-[var(--fc-text-4)]'>{item.desc}</div>
        </div>
      ))}
    </div>
  );
}
