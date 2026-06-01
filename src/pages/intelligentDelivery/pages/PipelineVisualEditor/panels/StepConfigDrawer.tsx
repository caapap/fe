import React, { useState } from 'react';
import { Drawer, Form, Input, Tag, Divider, Button, Radio, Switch, Select, Checkbox, Alert, Tooltip, Segmented } from 'antd';
import { Node } from 'reactflow';
import {
  SafetyOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
  CloudUploadOutlined,
  RocketOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  CodeOutlined,
  PauseCircleOutlined,
  ApiOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { StepType } from '../nodes/StepNode';

/** 部署形态：三大形态横切所有原子能力 */
type DeployForm = 'native' | 'hosted' | 'container';

const DEPLOY_FORM_OPTIONS = [
  { label: '原生', value: 'native' },
  { label: '托管平台', value: 'hosted' },
  { label: '容器化', value: 'container' },
];

const STEP_META: Record<string, { icon: React.ReactNode; color: string; title: string }> = {
  'env-precheck': { icon: <SafetyOutlined />, color: 'geekblue', title: '环境预检（IPTSE）' },
  'license-grant': { icon: <SafetyCertificateOutlined />, color: 'gold', title: '授权' },
  component: { icon: <DatabaseOutlined />, color: 'purple', title: '公共组件' },
  distribute: { icon: <CloudUploadOutlined />, color: 'cyan', title: '分发下发' },
  'app-deploy': { icon: <RocketOutlined />, color: 'blue', title: '应用部署' },
  'config-render': { icon: <FileTextOutlined />, color: 'lime', title: '配置注入' },
  'service-ctl': { icon: <ThunderboltOutlined />, color: 'volcano', title: '服务管控' },
  'health-check': { icon: <HeartOutlined />, color: 'green', title: '健康检查' },
  'shell-exec': { icon: <CodeOutlined />, color: 'default', title: '命令执行' },
  'manual-gate': { icon: <PauseCircleOutlined />, color: 'orange', title: '人工卡点' },
  'mcp-call': { icon: <ApiOutlined />, color: 'magenta', title: 'MCP 调用' },
  // legacy
  'shell-local': { icon: <CodeOutlined />, color: 'default', title: '命令执行' },
  'shell-ssh': { icon: <CodeOutlined />, color: 'default', title: '命令执行' },
  deploy: { icon: <RocketOutlined />, color: 'blue', title: '应用部署' },
  approval: { icon: <PauseCircleOutlined />, color: 'orange', title: '人工卡点' },
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
    ],
  },
  {
    title: '类别（粗粒度）',
    options: [
      { value: 'security', label: 'security（防火墙 + SELinux）' },
      { value: 'kernel', label: 'kernel（swappiness + nofile）' },
      { value: 'ntp', label: 'ntp（时区 + NTP 服务）' },
      { value: 'jdk', label: 'jdk（OpenJDK + JAVA_HOME）' },
      { value: 'hosts', label: 'hosts（主机名 + hosts 文件）' },
    ],
  },
];

const MCP_PROVIDER_OPTIONS = [
  { value: 'ansible-mcp-server', label: 'ansible-mcp-server（运维自动化）' },
  { value: 'k8s-mcp-server', label: 'k8s-mcp-server（待接入）', disabled: true },
];

const MCP_TOOL_OPTIONS: Record<string, { value: string; label: string }[]> = {
  'ansible-mcp-server': [
    { value: 'list_inventory', label: 'list_inventory · 列举资产清单' },
    { value: 'audit_inventory', label: 'audit_inventory · 连通性 / SSH 审计' },
    { value: 'run_playbook', label: 'run_playbook · 执行 Ansible Playbook' },
  ],
};

interface StepConfigDrawerProps {
  node: Node | null;
  onClose: () => void;
}

export default function StepConfigDrawer({ node, onClose }: StepConfigDrawerProps) {
  const initialDeployForm = node?.data?.config?.deployForm || 'native';
  const [deployForm, setDeployForm] = useState<DeployForm>(initialDeployForm);

  if (!node) return null;
  const { label, stepType } = node.data || {};
  const meta = STEP_META[stepType as StepType] || STEP_META['shell-exec'];

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
        {renderConfigByType(stepType as StepType, node.data?.config, deployForm, setDeployForm)}
      </Form>
      <Divider />
      <div className='flex justify-end gap-2'>
        <Button onClick={onClose}>取消</Button>
        <Button type='primary' onClick={onClose}>保存</Button>
      </div>
    </Drawer>
  );
}

/** 部署形态选择器（公共头部，适用于 distribute/app-deploy/service-ctl/component） */
function DeployFormSelector({ value, onChange }: { value: DeployForm; onChange: (v: DeployForm) => void }) {
  return (
    <Form.Item label={<span>部署形态 <Tooltip title='同一原子能力在不同形态下渲染不同参数'><InfoCircleOutlined className='text-[var(--fc-text-4)]' /></Tooltip></span>}>
      <Segmented options={DEPLOY_FORM_OPTIONS} value={value} onChange={(v) => onChange(v as DeployForm)} />
    </Form.Item>
  );
}

function renderConfigByType(
  stepType: StepType,
  config: Record<string, any> | undefined,
  deployForm: DeployForm,
  setDeployForm: (v: DeployForm) => void,
) {
  switch (stepType) {
    case 'env-precheck':
      return renderEnvPrecheckForm(config);
    case 'license-grant':
      return renderLicenseGrantForm(config, deployForm, setDeployForm);
    case 'component':
      return renderComponentForm(config, deployForm, setDeployForm);
    case 'distribute':
      return renderDistributeForm(config, deployForm, setDeployForm);
    case 'app-deploy':
    case 'deploy':
      return renderAppDeployForm(config, deployForm, setDeployForm);
    case 'config-render':
      return renderConfigRenderForm(config);
    case 'service-ctl':
      return renderServiceCtlForm(config, deployForm, setDeployForm);
    case 'health-check':
      return renderHealthCheckForm(config);
    case 'shell-exec':
    case 'shell-local':
    case 'shell-ssh':
      return renderShellExecForm(config);
    case 'manual-gate':
    case 'approval':
      return renderManualGateForm(config);
    case 'mcp-call':
      return renderMcpCallForm(config);
    default:
      return null;
  }
}

// ── 环境预检 ──────────────────────────────────────────────────────────────
function renderEnvPrecheckForm(config?: Record<string, any>) {
  return (
    <>
      <Alert type='info' showIcon className='mb-3' message='Ansible MCP 驱动'
        description='通过 N9E MCP 网关调用 ansible-mcp-server，按 IPTSE 标准对目标主机进行核查 / 初始化。' />
      <Form.Item label='目标主机组' required>
        <Select defaultValue={config?.target_hosts || 'all'} options={HOST_GROUP_OPTIONS} />
      </Form.Item>
      <Form.Item label={<span>执行模式 <Tooltip title='check：仅核查；init：直接初始化；check-init：核查后卡点再修复'><InfoCircleOutlined className='ml-1 text-[var(--fc-text-4)]' /></Tooltip></span>}>
        <Radio.Group defaultValue={config?.mode || 'check'}>
          <Radio.Button value='check'>仅核查</Radio.Button>
          <Radio.Button value='init'>直接初始化</Radio.Button>
          <Radio.Button value='check-init'>核查 + 卡点 + 修复</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label='IPTSE 范围（Tags）'>
        <div className='rounded-lg border border-fc-200 p-3'>
          {IPTSE_TAG_GROUPS.map((g) => (
            <div key={g.title} className='mb-3 last:mb-0'>
              <div className='mb-1 text-xs text-[var(--fc-text-4)]'>{g.title}</div>
              <Checkbox.Group defaultValue={config?.tags || ['phase1']} options={g.options} />
            </div>
          ))}
        </div>
      </Form.Item>
      <Form.Item label='高级选项'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between'><span className='text-sm'>压缩输出</span><Switch defaultChecked={config?.compress_output ?? true} /></div>
          <div className='flex items-center justify-between'><span className='text-sm'>警告即视为失败</span><Switch defaultChecked={config?.fail_on_warning ?? false} /></div>
        </div>
      </Form.Item>
    </>
  );
}

// ── 授权 ──────────────────────────────────────────────────────────────────
function renderLicenseGrantForm(config?: Record<string, any>, deployForm?: DeployForm, setDeployForm?: (v: DeployForm) => void) {
  return (
    <>
      <Alert type='warning' showIcon className='mb-3' message='授权能力（公共抽象）'
        description='统一编排 hasp/haspAuthCode 指纹采集→v2c 安装、云锁单机、大模型授权码三种授权方式。' />
      <Form.Item label='授权类型' required>
        <Select defaultValue={config?.licenseType || 'hasp'} options={[
          { value: 'hasp', label: 'hasp（Web 应用网关）' },
          { value: 'haspAuthCode', label: 'haspAuthCode（引擎/大模型）' },
          { value: 'cloud-lock', label: '云锁单机（DocQA/星球）' },
          { value: 'model-code', label: '大模型授权码' },
        ]} />
      </Form.Item>
      <Form.Item label='引擎名称'>
        <Input defaultValue={config?.engineName} placeholder='如：talker / michael / skybox-sln' />
      </Form.Item>
      <Form.Item label='授权步骤'>
        <Radio.Group defaultValue={config?.step || 'collect'}>
          <Radio.Button value='collect'>采集指纹（c2v）</Radio.Button>
          <Radio.Button value='install'>安装授权（v2c/dongle）</Radio.Button>
          <Radio.Button value='verify'>验证授权</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label='授权文件路径'>
        <Input defaultValue={config?.licensePath} placeholder='如：/iflytek/engine/bin/dongle' />
      </Form.Item>
      <Form.Item label='目标主机'>
        <Select defaultValue={config?.target_hosts || 'all'} options={HOST_GROUP_OPTIONS} />
      </Form.Item>
    </>
  );
}

// ── 公共组件 ──────────────────────────────────────────────────────────────
function renderComponentForm(config?: Record<string, any>, deployForm?: DeployForm, setDeployForm?: (v: DeployForm) => void) {
  return (
    <>
      <Alert type='info' showIcon className='mb-3' message='公共组件管理（公共抽象）'
        description='MySQL / ES / Redis / ZK 等中间件：版本包 + 配置项 + 单机/集群拓扑差异统一编排。' />
      <Form.Item label='组件类型' required>
        <Select defaultValue={config?.componentType || 'mysql'} options={[
          { value: 'mysql', label: 'MySQL' },
          { value: 'elasticsearch', label: 'Elasticsearch' },
          { value: 'redis', label: 'Redis' },
          { value: 'zookeeper', label: 'ZooKeeper' },
          { value: 'kafka', label: 'Kafka' },
          { value: 'minio', label: 'MinIO' },
          { value: 'nginx', label: 'Nginx' },
        ]} />
      </Form.Item>
      <Form.Item label='版本'>
        <Input defaultValue={config?.version} placeholder='如：5.7.30 / 8.4.1' />
      </Form.Item>
      <Form.Item label='拓扑'>
        <Radio.Group defaultValue={config?.topology || 'standalone'}>
          <Radio.Button value='standalone'>单机</Radio.Button>
          <Radio.Button value='cluster'>集群</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label='配置项（JSON）'>
        <Input.TextArea rows={5} className='font-mono text-xs'
          defaultValue={config?.configJson || JSON.stringify({ dataDir: '/iflytek/data', port: 3306 }, null, 2)} />
      </Form.Item>
      <Form.Item label='目标主机'>
        <Select defaultValue={config?.target_hosts || 'all'} options={HOST_GROUP_OPTIONS} />
      </Form.Item>
    </>
  );
}

// ── 分发下发 ──────────────────────────────────────────────────────────────
function renderDistributeForm(config?: Record<string, any>, deployForm?: DeployForm, setDeployForm?: (v: DeployForm) => void) {
  return (
    <>
      <Alert type='info' showIcon className='mb-3' message='分发能力（公共抽象）'
        description='单机 scp、集群批量（Agent 分发）、容器镜像 push 统一为「下发」动作，用部署形态参数区分。' />
      {setDeployForm && <DeployFormSelector value={deployForm || 'native'} onChange={setDeployForm} />}
      <Form.Item label='制品/镜像名称' required>
        <Input defaultValue={config?.artifact} placeholder='如：spark-platform_V1.3.tar.gz / docker.kxdigit.com/yqpt-ui:1.4.5' />
      </Form.Item>
      {deployForm === 'native' && (
        <Form.Item label='目标路径'>
          <Input defaultValue={config?.targetPath || '/iflytek'} />
        </Form.Item>
      )}
      {deployForm === 'hosted' && (
        <Form.Item label='Agent 分发目标'>
          <Select defaultValue={config?.target_hosts || 'all'} options={HOST_GROUP_OPTIONS} />
        </Form.Item>
      )}
      {deployForm === 'container' && (
        <Form.Item label='镜像仓库'>
          <Input defaultValue={config?.registry || 'docker.kxdigit.com'} />
        </Form.Item>
      )}
      <Form.Item label='服务连接'>
        <Input defaultValue={config?.connection} placeholder='选择 SSH 连接' />
      </Form.Item>
    </>
  );
}

// ── 应用部署 ──────────────────────────────────────────────────────────────
function renderAppDeployForm(config?: Record<string, any>, deployForm?: DeployForm, setDeployForm?: (v: DeployForm) => void) {
  return (
    <>
      {setDeployForm && <DeployFormSelector value={deployForm || 'native'} onChange={setDeployForm} />}
      {deployForm === 'native' && (
        <>
          <Form.Item label='软件包'><Input defaultValue={config?.pkg} placeholder='包名称' /></Form.Item>
          <Form.Item label='版本'><Input defaultValue={config?.version} placeholder='1.0.0' /></Form.Item>
          <Form.Item label='部署路径'><Input defaultValue={config?.targetPath || '/iflytek/server'} /></Form.Item>
          <Form.Item label='启动脚本'><Input defaultValue={config?.startScript || 'sh bin/start.sh'} /></Form.Item>
        </>
      )}
      {deployForm === 'hosted' && (
        <>
          <Form.Item label='服务定义（zk.config）'><Input defaultValue={config?.zkConfig} placeholder='turing-spark.zk.config' /></Form.Item>
          <Form.Item label='服务名称'><Input defaultValue={config?.serviceName} placeholder='如：turing-spark-gpt' /></Form.Item>
          <Form.Item label='托管平台'><Select defaultValue={config?.platform || 'skynet'} options={[
            { value: 'skynet', label: 'Skynet（星火大模型）' },
            { value: 'datasophon', label: 'DataSophon（星云大数据）' },
          ]} /></Form.Item>
        </>
      )}
      {deployForm === 'container' && (
        <>
          <Form.Item label='Helm Chart'><Input defaultValue={config?.helmChart} placeholder='yqpt-app-1.4.5-1001.tgz' /></Form.Item>
          <Form.Item label='Namespace'><Input defaultValue={config?.namespace || 'default'} /></Form.Item>
          <Form.Item label='Values（JSON）'><Input.TextArea rows={4} className='font-mono text-xs' defaultValue={config?.valuesJson || '{}'} /></Form.Item>
        </>
      )}
      <Form.Item label='目标主机'>
        <Select defaultValue={config?.target_hosts || 'all'} options={HOST_GROUP_OPTIONS} />
      </Form.Item>
    </>
  );
}

// ── 配置注入 ──────────────────────────────────────────────────────────────
function renderConfigRenderForm(config?: Record<string, any>) {
  return (
    <>
      <Form.Item label='配置类型' required>
        <Select defaultValue={config?.configType || 'sql'} options={[
          { value: 'sql', label: 'SQL 脚本' },
          { value: 'es-mapping', label: 'ES 字段映射' },
          { value: 'nacos', label: 'Nacos 配置项' },
          { value: 'file', label: '配置文件渲染' },
        ]} />
      </Form.Item>
      <Form.Item label='内容'>
        <Input.TextArea rows={8} className='font-mono text-xs' defaultValue={config?.content}
          placeholder='SQL / ES mapping JSON / nacos key=value / 模板内容' />
      </Form.Item>
      <Form.Item label='目标主机'>
        <Select defaultValue={config?.target_hosts || 'all'} options={HOST_GROUP_OPTIONS} />
      </Form.Item>
    </>
  );
}

// ── 服务管控 ──────────────────────────────────────────────────────────────
function renderServiceCtlForm(config?: Record<string, any>, deployForm?: DeployForm, setDeployForm?: (v: DeployForm) => void) {
  return (
    <>
      {setDeployForm && <DeployFormSelector value={deployForm || 'native'} onChange={setDeployForm} />}
      <Form.Item label='操作' required>
        <Radio.Group defaultValue={config?.action || 'start'}>
          <Radio.Button value='start'>启动</Radio.Button>
          <Radio.Button value='stop'>停止</Radio.Button>
          <Radio.Button value='restart'>重启</Radio.Button>
          <Radio.Button value='register'>注册</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label='服务名称'>
        <Input defaultValue={config?.serviceName} placeholder={deployForm === 'native' ? 'skynet_xmanager' : deployForm === 'hosted' ? 'turing-spark-gpt' : 'deployment/my-app'} />
      </Form.Item>
      <Form.Item label='目标主机'>
        <Select defaultValue={config?.target_hosts || 'all'} options={HOST_GROUP_OPTIONS} />
      </Form.Item>
    </>
  );
}

// ── 健康检查 ──────────────────────────────────────────────────────────────
function renderHealthCheckForm(config?: Record<string, any>) {
  return (
    <>
      <Form.Item label='检查方式' required>
        <Radio.Group defaultValue={config?.checkType || 'http'}>
          <Radio.Button value='http'>HTTP</Radio.Button>
          <Radio.Button value='port'>端口</Radio.Button>
          <Radio.Button value='process'>进程</Radio.Button>
          <Radio.Button value='inference'>推理实测</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label='目标 URL / 端口 / 进程名'>
        <Input defaultValue={config?.target} placeholder='如：http://localhost:8081/ddh/ 或 :3306 或 DataSophonApplicationServer' />
      </Form.Item>
      <Form.Item label='超时（秒）'>
        <Input type='number' defaultValue={config?.timeoutSec ?? 30} />
      </Form.Item>
      <Form.Item label='重试次数'>
        <Input type='number' defaultValue={config?.retries ?? 3} />
      </Form.Item>
    </>
  );
}

// ── 命令执行 ──────────────────────────────────────────────────────────────
function renderShellExecForm(config?: Record<string, any>) {
  return (
    <>
      <Form.Item label='执行目标'>
        <Radio.Group defaultValue={config?.target === 'ssh' ? 'ssh' : 'local'}>
          <Radio.Button value='local'>本地（Server）</Radio.Button>
          <Radio.Button value='ssh'>SSH 远程</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label='目标主机'>
        <Select defaultValue={config?.target_hosts || 'all'} options={HOST_GROUP_OPTIONS} />
      </Form.Item>
      <Form.Item label='服务连接'>
        <Input defaultValue={config?.connection} placeholder='选择 SSH 连接' />
      </Form.Item>
      <Form.Item label='执行脚本'>
        <Input.TextArea rows={6} className='font-mono text-xs' defaultValue={config?.script} placeholder='#!/bin/bash' />
      </Form.Item>
    </>
  );
}

// ── 人工卡点 ──────────────────────────────────────────────────────────────
function renderManualGateForm(config?: Record<string, any>) {
  return (
    <>
      <Form.Item label='审批人'>
        <Input defaultValue={config?.approver} placeholder='输入审批人用户名' />
      </Form.Item>
      <Form.Item label='超时时间（分钟）'>
        <Input type='number' defaultValue={config?.timeout ?? 30} />
      </Form.Item>
      <Form.Item label='提示信息'>
        <Input.TextArea rows={3} defaultValue={config?.message} placeholder='请确认后继续...' />
      </Form.Item>
    </>
  );
}

// ── MCP 调用 ──────────────────────────────────────────────────────────────
function renderMcpCallForm(config?: Record<string, any>) {
  const provider = config?.provider || 'ansible-mcp-server';
  return (
    <>
      <Alert type='info' showIcon className='mb-3' message='通用 MCP 调用'
        description='通过 N9E MCP 网关（/api/n9e-plus/mcp/invoke）调用任意已注册的 MCP 工具。' />
      <Form.Item label='MCP Provider' required>
        <Select defaultValue={provider} options={MCP_PROVIDER_OPTIONS} />
      </Form.Item>
      <Form.Item label='工具' required>
        <Select defaultValue={config?.tool || 'audit_inventory'} options={MCP_TOOL_OPTIONS[provider] || []} />
      </Form.Item>
      <Form.Item label='参数（JSON）'>
        <Input.TextArea rows={6} className='font-mono text-xs'
          defaultValue={JSON.stringify(config?.args || { inventory: 'inventory.ini', target_group: 'all' }, null, 2)} />
      </Form.Item>
      <Form.Item label='超时（秒）'>
        <Input type='number' defaultValue={config?.timeout_sec ?? 600} />
      </Form.Item>
    </>
  );
}
