import React from 'react';
import { Drawer, Form, Input, Tag, Divider, Button } from 'antd';
import { Node } from 'reactflow';
import { DesktopOutlined, GlobalOutlined, CloudUploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { StepType } from '../nodes/StepNode';

const STEP_META: Record<StepType, { icon: React.ReactNode; color: string; title: string }> = {
  'shell-local': { icon: <DesktopOutlined />, color: 'blue', title: '本地 Shell' },
  'shell-ssh': { icon: <GlobalOutlined />, color: 'cyan', title: 'SSH 远程' },
  deploy: { icon: <CloudUploadOutlined />, color: 'purple', title: '软件包部署' },
  approval: { icon: <CheckCircleOutlined />, color: 'orange', title: '人工审批' },
};

interface StepConfigDrawerProps {
  node: Node | null;
  onClose: () => void;
}

export default function StepConfigDrawer({ node, onClose }: StepConfigDrawerProps) {
  if (!node) return null;
  const { label, stepType, status } = node.data || {};
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
      width={420}
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
    default:
      return null;
  }
}
