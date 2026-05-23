/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useContext } from 'react';
import { Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import classNames from 'classnames';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { CommonStateContext } from '@/App';
import { copy2ClipBoard } from '@/utils';

import './index.less';
import './typora-theme-lark.less';

interface IMarkDownPros {
  content: string;
  style?: React.CSSProperties;
  inTooltip?: boolean;
  /** 代码块右上角显示复制按钮 */
  showCodeCopy?: boolean;
}

dark['pre[class*="language-"]'] = {
  ...dark['pre[class*="language-"]'],
  background: '#161b22',
  border: '0 none',
  'box-shadow': 'none',
};

function useAppDarkMode() {
  const { darkMode: appDarkMode } = useContext(CommonStateContext);
  return (
    appDarkMode ||
    (typeof window !== 'undefined' && localStorage.getItem('darkMode') === 'true') ||
    (typeof document !== 'undefined' && document.body.classList.contains('theme-dark'))
  );
}

function CopyCodeButton({ code }: { code: string }) {
  return (
    <Button
      type='text'
      size='small'
      className='absolute right-1 top-1 z-[1] h-7 w-7 min-w-0 border-0 bg-black/5 text-secondary hover:!text-[#1677ff] dark:bg-white/10'
      icon={<CopyOutlined />}
      aria-label='复制代码'
      onClick={(e) => {
        e.stopPropagation();
        if (copy2ClipBoard(code)) {
          message.success('已复制');
        }
      }}
    />
  );
}

// https://github.com/vitejs/vite/issues/3592 bug solve 记录
const Markdown: React.FC<IMarkDownPros> = ({ content, style = {}, inTooltip, showCodeCopy }) => {
  const isDarkMode = useAppDarkMode();
  const useDarkSyntax = Boolean(inTooltip || isDarkMode);

  const renderSyntaxBlock = (text: string, language: string, key?: string) => {
    const block = (
      <SyntaxHighlighter
        key={key}
        language={language}
        PreTag='div'
        style={useDarkSyntax ? dark : undefined}
        customStyle={{
          margin: '1em 0',
          borderRadius: '4px',
          paddingTop: showCodeCopy ? '2rem' : undefined,
          background: useDarkSyntax ? undefined : 'var(--fc-fill-2)',
          border: useDarkSyntax ? undefined : '1px solid var(--fc-border-base)',
        }}
      >
        {text}
      </SyntaxHighlighter>
    );

    if (!showCodeCopy) {
      return block;
    }

    return (
      <div className='relative' key={key}>
        <CopyCodeButton code={text} />
        {block}
      </div>
    );
  };

  return (
    <div className={inTooltip ? 'theme-dark bg-transparent' : ''}>
      <div className='typora-theme-lark markdown-wrapper' style={style}>
        <ReactMarkdown
          remarkPlugins={[gfm]}
          children={content}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const text = String(children).replace(/\n$/, '');
              const match = /language-(\w+)/.exec(className || '');
              const isInlineCode = inline || !text.includes('\n');

              if (!inline && match) {
                return renderSyntaxBlock(text, match[1]);
              }

              if (isInlineCode) {
                return (
                  <span
                    className={classNames({
                      [className || '']: !!className,
                      'base-code': true,
                      'base-code-inline': true,
                    })}
                  >
                    <code {...props}>{children}</code>
                  </span>
                );
              }

              const plainBlock = (
                <div
                  className={classNames({
                    [className || '']: !!className,
                    'base-code': true,
                  })}
                  style={showCodeCopy ? { paddingTop: '1.75rem' } : undefined}
                >
                  <code {...props}>{children}</code>
                </div>
              );

              if (!showCodeCopy) {
                return plainBlock;
              }

              return (
                <div className='relative'>
                  <CopyCodeButton code={text} />
                  {plainBlock}
                </div>
              );
            },
          }}
        />
      </div>
    </div>
  );
};

export default Markdown;
