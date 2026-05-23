import React, { useMemo, useState } from 'react';
import { Modal, Tag, Empty, Tooltip, Radio } from 'antd';
import { CheckOutlined, BuildOutlined, FileTextOutlined } from '@ant-design/icons';

import { TEMPLATE_CATEGORIES, PIPELINE_TEMPLATES, PipelineTemplate, TemplateCategory } from './templates';
import './styles.less';

export type CreateMode = 'visual' | 'yaml';

interface PipelineTemplateModalProps {
  open: boolean;
  onCancel: () => void;
  onCreate: (template: PipelineTemplate, mode: CreateMode) => void;
}

export default function PipelineTemplateModal({ open, onCancel, onCreate }: PipelineTemplateModalProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('precheck');
  const [selectedId, setSelectedId] = useState<string>('env-precheck-iptse');
  const [mode, setMode] = useState<CreateMode>('visual');

  const filtered = useMemo(() => {
    if (activeCategory === 'org') return [];
    return PIPELINE_TEMPLATES.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

  const selected = useMemo(() => PIPELINE_TEMPLATES.find((t) => t.id === selectedId), [selectedId]);

  const handleCreate = () => {
    if (!selected) return;
    onCreate(selected, mode);
  };

  return (
    <Modal
      title='选择流水线模板'
      visible={open}
      onCancel={onCancel}
      width={1080}
      okText='创建'
      cancelText='取消'
      onOk={handleCreate}
      okButtonProps={{ disabled: !selected }}
      className='pipeline-template-modal'
      destroyOnClose
    >
      <div className='flex h-[600px]'>
        <aside className='w-[180px] shrink-0 border-r border-fc-200 pr-2'>
          {TEMPLATE_CATEGORIES.map((c) => {
            const isActive = activeCategory === c.key;
            return (
              <div
                key={c.key}
                role='button'
                onClick={() => setActiveCategory(c.key)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--fc-primary-bg)] font-medium text-[var(--fc-fill-primary)]'
                    : 'text-[var(--fc-text-2)] hover:bg-[var(--fc-fill-2-5)]'
                }`}
              >
                <span className='text-base'>{c.icon}</span>
                <span>{c.label}</span>
              </div>
            );
          })}
        </aside>

        <section className='flex flex-1 flex-col gap-4 overflow-hidden pl-4'>
          <div>
            <div className='mb-2 flex items-center gap-1 text-xs text-[var(--fc-text-3)]'>
              创建方式
              <Tooltip title='可视化编排适合多数运维场景；YAML 适合需要批量复制粘贴的高级用户'>
                <span className='cursor-help text-[var(--fc-text-4)]'>ⓘ</span>
              </Tooltip>
            </div>
            <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)} className='create-mode-group flex w-full gap-3'>
              <Radio.Button value='visual' className='!flex flex-1 items-center justify-between !rounded-lg !border !border-fc-200 px-4 py-3'>
                <span className='flex items-center gap-2'>
                  <BuildOutlined />
                  <span>可视化编排</span>
                </span>
                {mode === 'visual' && <CheckOutlined className='text-[var(--fc-fill-primary)]' />}
              </Radio.Button>
              <Radio.Button value='yaml' className='!flex flex-1 items-center justify-between !rounded-lg !border !border-fc-200 px-4 py-3'>
                <span className='flex items-center gap-2'>
                  <FileTextOutlined />
                  <span>YAML 化编排</span>
                </span>
                {mode === 'yaml' && <CheckOutlined className='text-[var(--fc-fill-primary)]' />}
              </Radio.Button>
            </Radio.Group>
          </div>

          <div className='flex-1 overflow-y-auto pr-1'>
            {activeCategory === 'org' ? (
              <div className='flex h-full flex-col items-center justify-center'>
                <Empty description='暂无组织自定义模板' />
                <div className='mt-2 text-xs text-[var(--fc-text-4)]'>可在"组织设置"中新建组织模板</div>
              </div>
            ) : (
              <>
                <div className='mb-3 text-sm font-medium text-[var(--fc-text-2)]'>推荐模板</div>
                <div className='flex flex-col gap-3'>
                  {filtered.map((tpl) => (
                    <TemplateCard
                      key={tpl.id}
                      template={tpl}
                      selected={selectedId === tpl.id}
                      onSelect={() => setSelectedId(tpl.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: PipelineTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      role='button'
      onClick={onSelect}
      className={`relative cursor-pointer rounded-xl border bg-[var(--fc-fill-2)] p-4 transition-all ${
        selected
          ? 'border-[var(--fc-fill-primary)] ring-2 ring-[var(--fc-fill-primary)]/20'
          : 'border-fc-200 hover:border-[var(--fc-fill-primary)]/40'
      }`}
    >
      {selected && (
        <span className='absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--fc-fill-primary)] text-[10px] text-white'>
          <CheckOutlined />
        </span>
      )}
      <div className='mb-2 flex items-center gap-2'>
        <span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--fc-primary-bg)]'>{template.icon}</span>
        <div>
          <div className='flex items-center gap-2 text-sm font-semibold text-[var(--fc-text-1)]'>
            {template.title}
            {template.preset && <Tag color='processing' className='!m-0'>预置</Tag>}
          </div>
          <div className='text-xs text-[var(--fc-text-4)]'>{template.subtitle}</div>
        </div>
      </div>
      <div className='mb-3 text-xs text-[var(--fc-text-3)]'>{template.description}</div>
      <div className='flex flex-wrap items-center gap-x-1 gap-y-2'>
        {template.chips.map((chip, i) => (
          <React.Fragment key={`${chip.label}-${i}`}>
            <span className='inline-flex h-7 items-center rounded-full border border-fc-200 bg-[var(--fc-fill-2-5)] px-3 text-xs text-[var(--fc-text-2)]'>
              {chip.label}
            </span>
            {i !== template.chips.length - 1 && <span className='text-[var(--fc-fill-5)]'>—</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
