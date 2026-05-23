import React from 'react';
import { Tag, Table, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
  ApiOutlined,
} from '@ant-design/icons';

interface IptseRow {
  category: string;
  pass: number;
  warn: number;
  fail: number;
  failedHosts: string[];
}

const MOCK_REPORT: IptseRow[] = [
  { category: '主机名 / hosts', pass: 5, warn: 0, fail: 0, failedHosts: [] },
  { category: '防火墙 firewalld', pass: 5, warn: 0, fail: 0, failedHosts: [] },
  { category: 'SELinux', pass: 3, warn: 0, fail: 2, failedHosts: ['devops-ddp-172', 'devops-ddp-173'] },
  { category: '内核参数（swappiness/limits）', pass: 4, warn: 1, fail: 0, failedHosts: [] },
  { category: '标准目录 / 运维用户', pass: 5, warn: 0, fail: 0, failedHosts: [] },
  { category: '时区 / NTP 服务', pass: 4, warn: 0, fail: 1, failedHosts: ['devops-ddp-174'] },
  { category: 'JDK 安装 / JAVA_HOME', pass: 2, warn: 0, fail: 3, failedHosts: ['devops-ddp-172', 'devops-ddp-173', 'devops-ddp-175'] },
];

const SUMMARY = {
  totalHosts: 5,
  durationSec: 24.3,
  okCount: 28,
  warnCount: 1,
  failCount: 6,
};

export default function IptseReportPanel() {
  return (
    <div className='flex w-[420px] shrink-0 flex-col gap-3 overflow-y-auto rounded-xl border border-fc-200 bg-[var(--fc-fill-2)] p-4'>
      <div className='flex items-center gap-2'>
        <SafetyOutlined className='text-base text-[var(--fc-fill-primary)]' />
        <span className='font-semibold text-[var(--fc-text-1)]'>IPTSE 巡检报告</span>
        <Tag color='magenta' className='!ml-auto'>
          <ApiOutlined /> Ansible MCP
        </Tag>
      </div>

      <div className='rounded-lg border border-fc-200 bg-white p-3 text-xs'>
        <div className='mb-2 grid grid-cols-2 gap-2 text-[var(--fc-text-3)]'>
          <div>
            <span>执行范围：</span>
            <span className='text-[var(--fc-text-1)]'>ddp 组 · {SUMMARY.totalHosts} 台</span>
          </div>
          <div>
            <span>耗时：</span>
            <span className='text-[var(--fc-text-1)]'>{SUMMARY.durationSec}s</span>
          </div>
          <div>
            <span>Playbook：</span>
            <span className='font-mono text-[var(--fc-text-1)]'>os_check_all.yml</span>
          </div>
          <div>
            <span>Tags：</span>
            <span className='font-mono text-[var(--fc-text-1)]'>phase1, ntp, jdk</span>
          </div>
        </div>
        <div className='flex gap-3 border-t border-fc-200 pt-2'>
          <span className='inline-flex items-center gap-1 text-[var(--fc-fill-success)]'>
            <CheckCircleOutlined /> 通过 {SUMMARY.okCount}
          </span>
          <span className='inline-flex items-center gap-1 text-[#faad14]'>
            <ExclamationCircleOutlined /> 警告 {SUMMARY.warnCount}
          </span>
          <span className='inline-flex items-center gap-1 text-[var(--fc-fill-error)]'>
            <CloseCircleOutlined /> 失败 {SUMMARY.failCount}
          </span>
        </div>
      </div>

      <Table<IptseRow>
        size='small'
        rowKey='category'
        dataSource={MOCK_REPORT}
        pagination={false}
        bordered
        className='iptse-report-table'
        columns={[
          {
            title: '检查项',
            dataIndex: 'category',
            key: 'category',
            width: 160,
          },
          {
            title: '通过',
            dataIndex: 'pass',
            key: 'pass',
            width: 50,
            align: 'center',
            render: (n: number) => <span className='text-[var(--fc-fill-success)]'>{n}</span>,
          },
          {
            title: '警告',
            dataIndex: 'warn',
            key: 'warn',
            width: 50,
            align: 'center',
            render: (n: number) => (n > 0 ? <span className='text-[#faad14]'>{n}</span> : <span className='text-[var(--fc-text-4)]'>0</span>),
          },
          {
            title: '失败',
            dataIndex: 'fail',
            key: 'fail',
            width: 80,
            render: (n: number, row) =>
              n > 0 ? (
                <Tooltip title={row.failedHosts.join(', ')}>
                  <span className='cursor-help text-[var(--fc-fill-error)]'>{n} 台</span>
                </Tooltip>
              ) : (
                <span className='text-[var(--fc-text-4)]'>0</span>
              ),
          },
        ]}
      />

      <div className='rounded-lg border border-dashed border-[var(--fc-fill-primary)]/30 bg-[var(--fc-primary-bg)] p-3 text-xs'>
        <div className='mb-1 font-medium text-[var(--fc-text-1)]'>智能建议</div>
        <div className='text-[var(--fc-text-3)]'>
          检测到 SELinux / NTP / JDK 多项基线缺失。继续向下执行将进入【人工卡点】，确认后由 Stage 4
          自动调用 <span className='font-mono text-[var(--fc-text-1)]'>os_init_all.yml</span> 修复 <span className='text-[var(--fc-fill-error)]'>6 项</span>。
        </div>
      </div>

      <div className='text-[10px] text-[var(--fc-text-4)]'>
        数据来源：mock · 后端 MCP 网关接入后将解析 <span className='font-mono'>###IPTSE-REPORT-BEGIN###</span> 段落渲染。
      </div>
    </div>
  );
}
