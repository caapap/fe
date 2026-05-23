import React, { useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import type { InputRef } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import classNames from 'classnames';

const SEARCH_WIDTH = 264;
const SEARCH_COLLAPSED = 32;
const SEARCH_OFFSET = SEARCH_WIDTH - SEARCH_COLLAPSED;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const DURATION_MS = 520;

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function ArtifactSearchBar({ value, onChange }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputRef>(null);
  const [expanded, setExpanded] = useState(false);

  const collapse = () => setExpanded(false);

  const open = () => {
    setExpanded(true);
    window.setTimeout(() => inputRef.current?.focus(), DURATION_MS * 0.55);
  };

  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      collapse();
    };
    const onTouchStart = (event: TouchEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      collapse();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') collapse();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded]);

  return (
    <div
      ref={rootRef}
      className='artifact-search-bar relative h-8 shrink-0'
      style={{
        // Reserve max width to avoid reflowing sibling elements.
        width: SEARCH_WIDTH,
      }}
    >
      <button
        type='button'
        aria-label={expanded ? undefined : '搜索制品'}
        aria-expanded={expanded}
        className={classNames(
          'absolute right-0 top-0 z-[2] flex h-8 w-8 items-center justify-center border-0 bg-transparent p-0 outline-none',
          'text-secondary transition-opacity duration-300',
          expanded ? 'pointer-events-none opacity-0' : 'cursor-pointer opacity-100 hover:text-[#1677ff]',
        )}
        style={{ transitionTimingFunction: EASE }}
        onClick={open}
        tabIndex={expanded ? -1 : 0}
      >
        <SearchOutlined className='text-base' />
      </button>

      <div
        className='absolute right-0 top-0 overflow-hidden'
        style={{
          width: SEARCH_WIDTH,
          opacity: expanded ? 1 : 0,
          transform: expanded ? 'translateX(0)' : `translateX(${SEARCH_OFFSET}px)`,
          pointerEvents: expanded ? 'auto' : 'none',
          transition: `opacity ${DURATION_MS}ms ${EASE}, transform ${DURATION_MS}ms ${EASE}, filter ${DURATION_MS}ms ${EASE}`,
          filter: expanded ? 'blur(0)' : 'blur(1px)',
          willChange: 'transform, opacity, filter',
        }}
      >
        <Input
          ref={inputRef}
          allowClear
          prefix={<SearchOutlined className='text-secondary' />}
          placeholder='搜索制品'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPressEnter={(e) => (e.target as HTMLInputElement).blur()}
          className='w-full'
        />
      </div>
    </div>
  );
}
