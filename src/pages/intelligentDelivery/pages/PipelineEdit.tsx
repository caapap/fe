import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Tabs,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  ApiOutlined,
  ArrowLeftOutlined,
  CloudUploadOutlined,
  DesktopOutlined,
  GlobalOutlined,
  PlayCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';

import PageLayout from '@/components/pageLayout';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

import { PATHS } from '../constants';
import {
  ArtifactPackage,
  ServiceConnection,
  createPipeline,
  getArtifactPackages,
  getServiceConnections,
  triggerPipelineRun,
} from '../services';
import PipelineVisualEditor from './PipelineVisualEditor';

const DEFAULT_YAML = `name: 部署应用到生产环境
description: 从资源仓库下载软件包并通过 SSH 部署到目标服务器

stages:
  - name: 部署阶段
    jobs:
      - name: 部署任务
        steps:
          - name: 部署软件包
            type: deploy
            with:
              package: my-app
              version: "1.0.0"
              target_path: /opt/apps/my-app
              connection: prod-server-ssh

          - name: 启动服务
            type: shell
            with:
              host: prod-server
              connection: prod-server-ssh
              script: |
                cd /opt/apps/my-app/current
                ./start.sh
                sleep 3
                ./health-check.sh
`;

interface StepFormState {
  open: boolean;
  type: 'shell-local' | 'shell-ssh' | 'deploy';
}

interface ShellLocalForm {
  name: string;
  script: string;
}

interface ShellSSHForm {
  name: string;
  host: string;
  connection: string;
  script: string;
}

interface DeployForm {
  name: string;
  pkg: string;
  version: string;
  target_path: string;
  connection: string;
}

const STEP_TEMPLATES = [
  {
    type: 'shell-local',
    icon: <DesktopOutlined />,
    title: '本地 Shell',
    desc: '在 Nightingale Server 主机上执行 shell 脚本',
    color: 'blue',
  },
  {
    type: 'shell-ssh',
    icon: <GlobalOutlined />,
    title: 'SSH 远程 Shell',
    desc: '通过服务连接登录目标主机执行 shell',
    color: 'cyan',
  },
  {
    type: 'deploy',
    icon: <CloudUploadOutlined />,
    title: '软件包部署',
    desc: '从资源仓库下载软件包并部署到目标主机',
    color: 'purple',
  },
] as const;

export default function PipelineEdit() {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const isNew = !id;
  const [yaml, setYaml] = useState(DEFAULT_YAML);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState<ServiceConnection[]>([]);
  const [packages, setPackages] = useState<ArtifactPackage[]>([]);
  const [stepFormState, setStepFormState] = useState<StepFormState>({ open: false, type: 'shell-local' });
  const [stepForm] = Form.useForm();

  useEffect(() => {
    void getServiceConnections({ limit: 200 }).then((res) => setConnections(res.list || []));
    void getArtifactPackages().then(setPackages).catch(() => setPackages([]));
  }, []);

  useEffect(() => {
    if (isNew) {
      try {
        const cfg = parseYAMLLite(DEFAULT_YAML);
        setName(cfg.name || '');
        setDescription(cfg.description || '');
      } catch {
        /* ignore */
      }
      return;
    }
    setLoading(true);
    request(`/api/n9e-plus/delivery/pipelines/${id}`, { method: RequestMethod.Get })
      .then((res) => {
        const dat = res?.dat || {};
        const flowYaml = dat?.latest_config?.flow_yaml || dat?.flow_yaml || DEFAULT_YAML;
        setYaml(flowYaml);
        setName(dat?.name || '');
        setDescription(dat?.description || '');
        setStatus(dat?.status === 'OFFLINE' ? 'OFFLINE' : 'ONLINE');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const sshConnections = useMemo(
    () => connections.filter((c) => c.type === 'SSH_KEY' || c.type === 'USERNAME_PASSWORD'),
    [connections],
  );

  const packageOptions = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const p of packages) {
      if (!map.has(p.name)) map.set(p.name, []);
      map.get(p.name)!.push(p.version);
    }
    return Array.from(map.entries()).map(([name, versions]) => ({ name, versions }));
  }, [packages]);

  const validateYAML = () => {
    if (!yaml.trim()) {
      message.warning('YAML 内容不能为空');
      return false;
    }
    try {
      parseYAMLLite(yaml);
      return true;
    } catch (e: any) {
      message.error(`YAML 解析失败：${e?.message || String(e)}`);
      return false;
    }
  };

  const handleSave = async (runAfterSave = false): Promise<number | null> => {
    if (!validateYAML()) return null;
    setSaving(true);
    try {
      if (isNew) {
        const newId = await createPipeline({
          flow_yaml: yaml,
          name: name || undefined,
          description: description || undefined,
          status,
        } as any);
        message.success('流水线创建成功');
        if (runAfterSave) {
          await triggerPipelineRun(newId);
          message.success('已触发首次运行');
          history.replace(`${PATHS.pipelines}/${newId}`);
        } else {
          history.replace(`${PATHS.pipelines}/${newId}/edit`);
        }
        return newId;
      }
      await request(`/api/n9e-plus/delivery/pipelines/${id}`, {
        method: RequestMethod.Put,
        data: { flow_yaml: yaml, name, description, status, change_log: '页面编辑' },
      });
      message.success('流水线已保存');
      if (runAfterSave) {
        await triggerPipelineRun(Number(id));
        message.success('已触发运行');
        history.push(`${PATHS.pipelines}/${id}`);
      }
      return Number(id);
    } catch {
      return null;
    } finally {
      setSaving(false);
    }
  };

  const openStepForm = (type: StepFormState['type']) => {
    stepForm.resetFields();
    setStepFormState({ open: true, type });
  };

  const handleStepSubmit = async () => {
    const v = await stepForm.validateFields();
    let snippet = '';
    if (stepFormState.type === 'shell-local') {
      const f = v as ShellLocalForm;
      snippet = [
        `          - name: ${f.name}`,
        `            type: shell`,
        `            with:`,
        `              script: |`,
        ...f.script.split('\n').map((l) => `                ${l}`),
      ].join('\n');
    } else if (stepFormState.type === 'shell-ssh') {
      const f = v as ShellSSHForm;
      snippet = [
        `          - name: ${f.name}`,
        `            type: shell`,
        `            with:`,
        `              host: ${f.host}`,
        `              connection: ${f.connection}`,
        `              script: |`,
        ...f.script.split('\n').map((l) => `                ${l}`),
      ].join('\n');
    } else {
      const f = v as DeployForm;
      snippet = [
        `          - name: ${f.name}`,
        `            type: deploy`,
        `            with:`,
        `              package: ${f.pkg}`,
        `              version: "${f.version}"`,
        `              target_path: ${f.target_path}`,
        `              connection: ${f.connection}`,
      ].join('\n');
    }
    setYaml((prev) => `${prev.trimEnd()}\n${snippet}\n`);
    setStepFormState({ open: false, type: stepFormState.type });
    setActiveTab('flow');
    message.success('已插入步骤到 YAML 末尾，请检查缩进');
  };

  const renderBasicTab = () => (
    <Card className='rounded-2xl border-fc-200' loading={loading}>
      <Form layout='vertical'>
        <Form.Item label='流水线名称' required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder='例如：生产环境部署' />
        </Form.Item>
        <Form.Item label='描述'>
          <Input.TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder='可选'
          />
        </Form.Item>
        <Form.Item label='状态'>
          <Radio.Group value={status} onChange={(e) => setStatus(e.target.value)}>
            <Radio.Button value='ONLINE'>启用</Radio.Button>
            <Radio.Button value='OFFLINE'>停用</Radio.Button>
          </Radio.Group>
          <span className='ml-3 text-xs text-secondary'>停用后无法手动触发运行</span>
        </Form.Item>
      </Form>
    </Card>
  );

  const renderFlowTab = () => (
    <div className='grid grid-cols-12 gap-4'>
      <Card title='步骤目录' className='col-span-3 rounded-2xl border-fc-200'>
        <div className='flex flex-col gap-3'>
          {STEP_TEMPLATES.map((t) => (
            <div
              key={t.type}
              role='button'
              onClick={() => openStepForm(t.type)}
              className='cursor-pointer rounded-lg border border-fc-200 p-3 transition-colors hover:border-[#1677ff] hover:bg-[#1677ff]/5'
            >
              <div className='mb-1 flex items-center gap-2'>
                <Tag color={t.color}>{t.icon} {t.title}</Tag>
              </div>
              <div className='text-xs text-secondary'>{t.desc}</div>
            </div>
          ))}
          <Alert
            type='info'
            showIcon
            message='提示'
            description='点击步骤会弹出表单，填写后会以正确格式追加到右侧 YAML 末尾。请检查缩进或自行调整 stage/job 归属。'
          />
        </div>
      </Card>

      <Card
        title={
          <Space>
            <span>流程配置（YAML）</span>
            <Tag color='default'>schema: stages &gt; jobs &gt; steps</Tag>
          </Space>
        }
        className='col-span-9 rounded-2xl border-fc-200'
        bodyStyle={{ padding: 0 }}
      >
        <Input.TextArea
          value={yaml}
          onChange={(e) => setYaml(e.target.value)}
          autoSize={{ minRows: 24, maxRows: 40 }}
          className='font-mono text-sm'
          style={{ border: 0, borderRadius: 0, padding: 16 }}
          placeholder='输入流水线 YAML 配置...'
        />
      </Card>
    </div>
  );

  const renderTriggerTab = () => (
    <Card className='rounded-2xl border-fc-200'>
      <Alert
        type='info'
        showIcon
        message='触发设置'
        description={
          <div>
            <p className='m-0'>当前 MVP 仅支持手动触发。后续将开放：</p>
            <ul className='m-0 mt-2 pl-4'>
              <li>定时触发：cron 表达式</li>
              <li>Webhook 触发：每条流水线分配独立 token，外部系统 POST 触发</li>
              <li>告警联动：与夜莺告警引擎对接，告警发生时自动触发部署/回滚</li>
            </ul>
          </div>
        }
      />
    </Card>
  );

  const renderVarsTab = () => (
    <Card className='rounded-2xl border-fc-200'>
      <Alert
        type='info'
        showIcon
        message='变量与缓存'
        description='当前 MVP 已注入 PIPELINE_ID/PIPELINE_NAME/RUN_NO/TIMESTAMP 等内置变量，可在 shell script 中通过环境变量引用。运行时还可在“运行”按钮弹窗里传入临时 variables JSON。完整的全局变量组管理与构建缓存目录配置将在 Phase 4 开放。'
      />
    </Card>
  );

  return (
    <PageLayout
      title={
        <Space>
          <Button type='text' icon={<ArrowLeftOutlined />} onClick={() => history.push(PATHS.pipelines)} />
          <span>{isNew ? '新建流水线' : '编辑流水线'}</span>
        </Space>
      }
    >
      <div className='fc-page n9e'>
        <Card className='mb-4 rounded-2xl border-fc-200'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <Space size={12}>
              <span className='text-lg font-semibold text-title'>{name || (isNew ? '新建流水线' : `流水线 #${id}`)}</span>
              <Tag color={status === 'ONLINE' ? 'success' : 'default'}>{status === 'ONLINE' ? '启用' : '停用'}</Tag>
              <Tooltip title='SSH 凭证、密码等通过服务连接管理'>
                <Button type='link' size='small' icon={<ApiOutlined />} onClick={() => history.push(PATHS.serviceConnections)}>
                  服务连接
                </Button>
              </Tooltip>
            </Space>
            <Space>
              <Button icon={<SaveOutlined />} loading={saving} onClick={() => handleSave(false)}>
                仅保存
              </Button>
              <Button icon={<PlayCircleOutlined />} type='primary' loading={saving} onClick={() => handleSave(true)}>
                保存并运行
              </Button>
            </Space>
          </div>
        </Card>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane key='basic' tab='基本信息'>
            {renderBasicTab()}
          </Tabs.TabPane>
          <Tabs.TabPane key='visual' tab='可视化编排'>
            <PipelineVisualEditor />
          </Tabs.TabPane>
          <Tabs.TabPane key='flow' tab='流程配置（YAML）'>
            {renderFlowTab()}
          </Tabs.TabPane>
          <Tabs.TabPane key='trigger' tab='触发设置'>
            {renderTriggerTab()}
          </Tabs.TabPane>
          <Tabs.TabPane key='vars' tab='变量和缓存'>
            {renderVarsTab()}
          </Tabs.TabPane>
        </Tabs>
      </div>

      <Modal
        title={STEP_TEMPLATES.find((t) => t.type === stepFormState.type)?.title || '新建步骤'}
        visible={stepFormState.open}
        onCancel={() => setStepFormState({ ...stepFormState, open: false })}
        onOk={handleStepSubmit}
        okText='插入到 YAML'
        cancelText='取消'
        destroyOnClose
        width={640}
      >
        <Form form={stepForm} layout='vertical' preserve={false}>
          <Form.Item name='name' label='步骤名称' rules={[{ required: true }]}>
            <Input placeholder='例如：部署应用' />
          </Form.Item>

          {stepFormState.type === 'shell-local' && (
            <Form.Item name='script' label='Shell 脚本' rules={[{ required: true }]}>
              <Input.TextArea
                rows={8}
                className='font-mono text-xs'
                placeholder={'echo "hello"\nls -la'}
              />
            </Form.Item>
          )}

          {stepFormState.type === 'shell-ssh' && (
            <>
              <Alert
                type='info'
                showIcon
                className='mb-4'
                message={connections.length === 0
                  ? '尚未配置任何服务连接，请先到“服务连接”页面创建 SSH 凭证'
                  : '将通过下面选择的连接登录目标主机执行 shell'}
              />
              <Form.Item name='host' label='目标主机标识' rules={[{ required: true }]}>
                <Input placeholder='与 connection 中的 host 对应或自定义标识' />
              </Form.Item>
              <Form.Item name='connection' label='服务连接' rules={[{ required: true }]}>
                <Select
                  placeholder='选择 SSH 连接'
                  options={sshConnections.map((c) => ({ value: c.name, label: `${c.name} (${c.type})` }))}
                  notFoundContent={<Empty description='请先创建 SSH 连接' />}
                />
              </Form.Item>
              <Form.Item name='script' label='Shell 脚本' rules={[{ required: true }]}>
                <Input.TextArea rows={8} className='font-mono text-xs' placeholder={'systemctl restart myapp'} />
              </Form.Item>
            </>
          )}

          {stepFormState.type === 'deploy' && (
            <>
              <Alert
                type='info'
                showIcon
                className='mb-4'
                message='软件包部署：从资源仓库下载并通过 SSH 解压到目标路径，自动备份 current 目录'
              />
              <Form.Item name='pkg' label='软件包' rules={[{ required: true }]}>
                <Select
                  placeholder='选择制品包'
                  showSearch
                  options={packageOptions.map((p) => ({ value: p.name, label: p.name }))}
                  notFoundContent={<Empty description='请先到”资源仓库”上传软件包' />}
                />
              </Form.Item>
              <Form.Item name='version' label='版本' rules={[{ required: true }]}>
                <Input placeholder='例如：1.0.0' />
              </Form.Item>
              <Form.Item name='target_path' label='目标路径' rules={[{ required: true }]}>
                <Input placeholder='例如：/opt/apps/my-app' />
              </Form.Item>
              <Form.Item name='connection' label='服务连接' rules={[{ required: true }]}>
                <Select
                  placeholder='选择 SSH 连接'
                  options={sshConnections.map((c) => ({ value: c.name, label: `${c.name} (${c.type})` }))}
                  notFoundContent={<Empty description='请先创建 SSH 连接' />}
                />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </PageLayout>
  );
}

// 极简 YAML 解析（仅用于本地校验是否包含必要顶层字段）
function parseYAMLLite(text: string): { name?: string; description?: string } {
  const lines = text.split('\n');
  const out: { name?: string; description?: string } = {};
  for (const ln of lines) {
    const m = ln.match(/^(name|description)\s*:\s*(.*)$/);
    if (m && out[m[1] as 'name' | 'description'] == null) {
      out[m[1] as 'name' | 'description'] = m[2].trim().replace(/^['"]|['"]$/g, '');
    }
    if (ln.startsWith('stages:')) break;
  }
  if (!/\bstages\s*:/.test(text) && !/\bjobs\s*:/.test(text)) {
    throw new Error('缺少 stages 顶层字段');
  }
  return out;
}
