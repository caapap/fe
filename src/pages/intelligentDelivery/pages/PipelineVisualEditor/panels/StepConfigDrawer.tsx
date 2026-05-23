import React from 'react';
import { Drawer, Form, Input, Tag, Divider, Button, Radio, Switch, Select, Checkbox, Alert, Tooltip } from 'antd';
import { Node } from 'reactflow';
import {
  DesktopOutlined,
  GlobalOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
  ApiOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { StepType } from '../nodes/StepNode';

const STEP_META: Record<StepType, { icon: React.ReactNode; color: string; title: string }> = {
  'shell-local': { icon: <DesktopOutlined />, color: 'blue', title: '本地 Shell' },
  'shell-ssh': { icon: <GlobalOutlined />, color: 'cyan', title: 'SSH 远程' },
  deploy: { icon: <CloudUploadOutlined />, color: 'purple', title: '软件包部署' },
  approval: { icon: <CheckCircleOutlined />, color: 'orange', title: '人工审批' },
  'env-precheck': { icon: <SafetyOutlined />, color: 'geekblue', title: '环境预检（IPTSE）' },
  'mcp-call': { icon: <ApiOutlined />, color: 'magenta', title: 'MCP 调用' },
};

const HOST_GROUP_OPTIONS = [
  { value: 'all', label: 'all（全部主机）' },
  { value: 'ddp', label: 'ddp（5 台）' },
  { value: 'stellar', label: 'stellar（3 台）' },
  { value: 'kafka', label: 'kafka（4 台）' },
];

const IPTSE_TAG_GROUPS = [
  {
    title: '阶段（粗粒度）',
    options: [
      { value: 'phase1', label: 'phase1 系统基线' },
      { value: 'phase2', label: 'phase2 软件源服务端' },
      { value: 'phase3', label: 'phase3 软件源客户端' },
      { value: 'phase4', label: 'phase4 时间同步' },
      { value: 'phase5', label: 'phase5 JDK' },
      { value: 'phase6', label: 'phase6 RAID（仅检查）' },
      { value: 'phase7', label: 'phase7 集群汇总（仅检查）' },
    ],
  },
  {
    title: '类别（粗粒度）',
    options: [
      { value: 'security', label: 'security（防火墙 + SELinux）' },
      { value: 'kernel', label: 'kernel（swappiness + nofile + nproc）' },
      { value: 'repo', label: 'repo（服务端 + 客户端）' },
      { value: 'ntp', label: 'ntp（时区 + NTP 服务）' },
      { value: 'jdk', label: 'jdk（OpenJDK + Java + JAVA_HOME）' },
      { value: 'hosts', label: 'hosts（主机名 + hosts 文件）' },
    ],
  },
  {
    title: '功能（细粒度）',
    options: [
      { value: 'firewalld', label: 'firewalld' },
      { value: 'selinux', label: 'selinux' },
      { value: 'limits_nofile', label: 'limits_nofile' },
      { value: 'limits_nproc', label: 'limits_nproc' },
      { value: 'kernel_swappiness', label: 'kernel_swappiness' },
      { value: 'directory', label: 'directory' },
      { value: 'ops_user', label: 'ops_user' },
      { value: 'timezone', label: 'timezone' },
      { value: 'ntp_service', label: 'ntp_service' },
      { value: 'java_home', label: 'java_home' },
      { value: 'openjdk', label: 'openjdk' },
    ],
  },
];

const MCP_PROVIDER_OPTIONS = [
  { value: 'ansible-mcp-server', label: 'ansible-mcp-server（运维自动化）' },
  { value: 'k8s-mcp-server', label: 'k8s-mcp-server（待接入）', disabled: true },
  { value: 'db-mcp-server', label: 'db-mcp-server（待接入）', disabled: true },
];

const MCP_TOOL_OPTIONS: Record<string, { value: string; label: string }[]> = {
  'ansible-mcp-server': [
    { value: 'list_inventory', label: 'list_inventory · 列举资产清单（含 SN/位置/硬件）' },
    { value: 'list_hosts', label: 'list_hosts · 列举主机' },
    { value: 'audit_inventory', label: 'audit_inventory · 资产连通性 / SSH 审计' },
    { value: 'run_playbook', label: 'run_playbook · 执行 Ansible Playbook' },
  ],
};

interface StepConfigDrawerProps {
  node: Node | null;
  onClose: () => void;
}

export default function StepConfigDrawer({ node, onClose }: StepConfigDrawerProps) {
  if (!node) return null;
  const { label, stepType } = node.data || {};
  const meta = STEP_META[stepType as StepType] || STEP_META['shell-local'];

  return (
    <Drawer
      title={
        <div className='flex items-center gap-2'>
          <Tag color={meta.color}>{meta.icon} {meta.title}</Tag>
          <span>{label}</span>
        </div>
      }
      visible={!!node}
      onClose={onClose}
      width={520}
      destroyOnClose
    >
      <Form layout='vertical'>
        <Form.Item label='步骤名称'>
          <Input defaultValue={label} />
        </Form.Item>
        {renderConfigByType(stepType as StepType, node.data?.config)}
      </Form>
      <Divider />
      <div className='flex justify-end gap-2'>
        <Button onClick={onClose}>取消</Button>
        <Button type='primary' onClick={onClose}>保存</Button>
      </div>
    </Drawer>
  );
}

function renderConfigByType(stepType: StepType, config?: Record<string, any>) {
  switch (stepType) {
    case 'shell-local':
    case 'shell-ssh':
      return (
        <>
          {stepType === 'shell-ssh' && (
            <>
              <Form.Item label='目标主机'>
                <Input defaultValue={config?.host} placeholder='例如：192.168.1.100' />
              </Form.Item>
              <Form.Item label='服务连接'>
                <Input defaultValue={config?.connection} placeholder='选择 SSH 连接' />
              </Form.Item>
            </>
          )}
          <Form.Item label='执行脚本'>
            <Input.TextArea defaultValue={config?.script} rows={6} className='font-mono text-xs' placeholder='#!/bin/bash' />
          </Form.Item>
        </>
      );
    case 'deploy':
      return (
        <>
          <Form.Item label='软件包'>
            <Input defaultValue={config?.pkg} placeholder='包名称' />
          </Form.Item>
          <Form.Item label='版本'>
            <Input defaultValue={config?.version} placeholder='1.0.0' />
          </Form.Item>
          <Form.Item label='部署路径'>
            <Input defaultValue={config?.target_path} placeholder='/opt/apps/my-app' />
          </Form.Item>
          <Form.Item label='服务连接'>
            <Input defaultValue={config?.connection} placeholder='选择 SSH 连接' />
          </Form.Item>
        </>
      );
    case 'approval':
      return (
        <>
          <Form.Item label='审批人'>
            <Input placeholder='输入审批人用户名' />
          </Form.Item>
          <Form.Item label='超时时间（分钟）'>
            <Input type='number' defaultValue={30} />
          </Form.Item>
        </>
      );
    case 'env-precheck':
      return renderEnvPrecheckForm(config);
    case 'mcp-call':
      return renderMcpCallForm(config);
    default:
      return null;
  }
}

function renderEnvPrecheckForm(config?: Record<string, any>) {
  return (
    <>
      <Alert
        type='info'
        showIcon
        className='mb-3'
        message='Ansible MCP 驱动'
        description='通过 N9E MCP 网关调用 ansible-mcp-server，按 IPTSE 标准对目标主机进行核查 / 初始化。'
      />
      <Form.Item label='目标主机组' required>
        <Select
          defaultValue={config?.target_hosts || 'all'}
          options={HOST_GROUP_OPTIONS}
          placeholder='选择业务组或主机'
        />
      </Form.Item>
      <Form.Item
        label={
          <span>
            执行模式
            <Tooltip title='check：仅核查，不修改系统；init：直接初始化；check-init：核查后人工卡点再修复'>
              <InfoCircleOutlined className='ml-1 text-[var(--fc-text-4)]' />
            </Tooltip>
          </span>
        }
      >
        <Radio.Group defaultValue={config?.mode || 'check'}>
          <Radio.Button value='check'>仅核查</Radio.Button>
          <Radio.Button value='init'>直接初始化</Radio.Button>
          <Radio.Button value='check-init'>核查 + 卡点 + 修复</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label='IPTSE 范围（Tags）'>
        <div className='rounded-lg border border-fc-200 p-3'>
          {IPTSE_TAG_GROUPS.map((group) => (
            <div key={group.title} className='mb-3 last:mb-0'>
              <div className='mb-1 text-xs text-[var(--fc-text-4)]'>{group.title}</div>
              <Checkbox.Group defaultValue={config?.tags || ['phase1']} options={group.options} />
            </div>
          ))}
        </div>
      </Form.Item>
      <Form.Item label='高级选项'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <span className='text-sm'>压缩输出（compress_output）</span>
            <Switch defaultChecked={config?.compress_output ?? true} />
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm'>警告即视为失败</span>
            <Switch defaultChecked={config?.fail_on_warning ?? false} />
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm'>自动生成复检 Stage</span>
            <Switch defaultChecked={config?.auto_recheck ?? true} />
          </div>
        </div>
      </Form.Item>
    </>
  );
}

function renderMcpCallForm(config?: Record<string, any>) {
  const provider = config?.provider || 'ansible-mcp-server';
  return (
    <>
      <Alert
        type='info'
        showIcon
        className='mb-3'
        message='通用 MCP 调用'
        description='通过 N9E MCP 网关（/api/n9e-plus/mcp/invoke）调用任意已注册的 MCP 工具。Provider / 工具列表由后端动态返回。'
      />
      <Form.Item label='MCP Provider' required>
        <Select defaultValue={provider} options={MCP_PROVIDER_OPTIONS} />
      </Form.Item>
      <Form.Item label='工具' required>
        <Select
          defaultValue={config?.tool || 'audit_inventory'}
          options={MCP_TOOL_OPTIONS[provider] || []}
          placeholder='选择 MCP 工具'
        />
      </Form.Item>
      <Form.Item label='参数（JSON）'>
        <Input.TextArea
          rows={8}
          className='font-mono text-xs'
          defaultValue={
            config?.argsText ||
            JSON.stringify(
              config?.args || {
                inventory: 'inventory.ini',
                target_group: 'all',
                check_hostname: true,
                check_latency: true,
              },
              null,
              2,
            )
          }
        />
      </Form.Item>
      <Form.Item label='超时（秒）'>
        <Input type='number' defaultValue={config?.timeout_sec ?? 600} />
      </Form.Item>
      <Form.Item label='结果解析（可选）' tooltip='以 jq 表达式从结果中抽取字段写回 runVars'>
        <Input.TextArea
          rows={3}
          className='font-mono text-xs'
          defaultValue={config?.parseText || ''}
          placeholder={'- jq: ".hosts | length"\n  var: HOST_COUNT'}
        />
      </Form.Item>
    </>
  );
}
