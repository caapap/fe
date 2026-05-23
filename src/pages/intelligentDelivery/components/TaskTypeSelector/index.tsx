import React, { useMemo, useState } from 'react';
import { Drawer, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { TASK_CATEGORIES, TASK_OPTIONS, TaskCategory, TaskOption } from './options';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (option: TaskOption) => void;
}

export default function TaskTypeSelectorDrawer({ open, onClose, onSelect }: Props) {
  const [activeCategory, setActiveCategory] = useState<TaskCategory>('deploy');
  const [keyword, setKeyword] = useState('');

  const grouped = useMemo(() => {
    const lower = keyword.trim().toLowerCase();
    const filterFn = (opt: TaskOption) =>
      !lower || opt.title.toLowerCase().includes(lower) || opt.description.toLowerCase().includes(lower);
    if (lower) {
      const map = new Map<TaskCategory, TaskOption[]>();
      TASK_OPTIONS.filter(filterFn).forEach((o) => {
        if (!map.has(o.category)) map.set(o.category, []);
        map.get(o.category)!.push(o);
      });
      return map;
    }
    return new Map<TaskCategory, TaskOption[]>([
      [activeCategory, TASK_OPTIONS.filter((o) => o.category === activeCategory)],
    ]);
  }, [activeCategory, keyword]);

  return (
    <Drawer
      title={null}
      visible={open}
      onClose={onClose}
      width={760}
      destroyOnClose
      bodyStyle={{ padding: 0 }}
    >
      <div className='flex h-full flex-col'>
        <div className='border-b border-fc-200 px-4 py-3'>
          <Input
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder='请输入任务名称搜索'
            prefix={<SearchOutlined className='text-[var(--fc-text-4)]' />}
            size='large'
            bordered={false}
          />
        </div>

        <div className='flex flex-1 overflow-hidden'>
          <aside className='w-[140px] shrink-0 border-r border-fc-200 py-3'>
            {TASK_CATEGORIES.map((c) => {
              const isActive = !keyword && activeCategory === c.key;
              return (
                <div
                  key={c.key}
                  role='button'
                  onClick={() => {
                    setKeyword('');
                    setActiveCategory(c.key);
                  }}
                  className={`relative cursor-pointer px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--fc-primary-bg)] font-medium text-[var(--fc-fill-primary)]'
                      : 'text-[var(--fc-text-2)] hover:bg-[var(--fc-fill-2-5)]'
                  }`}
                >
                  {isActive && <span className='absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-[var(--fc-fill-primary)]' />}
                  {c.label}
                </div>
              );
            })}
          </aside>

          <div className='flex-1 overflow-y-auto p-4'>
            {Array.from(grouped.entries()).map(([cat, options]) => (
              <div key={cat} className='mb-5'>
                <div className='mb-2 text-xs text-[var(--fc-text-4)]'>{TASK_CATEGORIES.find((c) => c.key === cat)?.label}</div>
                <div className='grid grid-cols-2 gap-3'>
                  {options.map((opt) => (
                    <TaskCard key={opt.kind} option={opt} onSelect={() => onSelect(opt)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function TaskCard({ option, onSelect }: { option: TaskOption; onSelect: () => void }) {
  return (
    <div
      role='button'
      onClick={onSelect}
      className={`group flex cursor-pointer items-center gap-3 rounded-lg border bg-[var(--fc-fill-2)] p-3 transition-all hover:border-[var(--fc-fill-primary)] hover:shadow-sm ${
        option.highlight ? 'border-[var(--fc-fill-primary)]/30' : 'border-fc-200'
      }`}
    >
      <span className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--fc-primary-bg)] text-base'>
        {option.icon}
      </span>
      <div className='min-w-0 flex-1'>
        <div className='truncate text-sm font-medium text-[var(--fc-text-1)] group-hover:text-[var(--fc-fill-primary)]'>{option.title}</div>
        <div className='truncate text-xs text-[var(--fc-text-4)]'>{option.description}</div>
      </div>
    </div>
  );
}
