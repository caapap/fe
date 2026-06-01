import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Empty,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Switch,
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
import { useHistory, useParams, useLocation } from 'react-router-dom';

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
import StageFlowEditor from './PipelineVisualEditor/StageFlowEditor';
import { getPipelinePreset } from './PipelineVisualEditor/hooks/usePipelineFlow';
import { PIPELINE_TEMPLATES } from '../components/PipelineTemplateModal/templates';

const DEFAULT_YAML = `name: 新建流水线
description: 自定义编排流水线

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
  const location = useLocation();
  const isNew = !id;

  // 从 URL 参数读取模板 ID
  const templateId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('template') || undefined;
  }, [location.search]);

  // 获取模板信息
  const preset = useMemo(() => {
    if (templateId) {
      return getPipelinePreset(templateId);
    }
    return null;
  }, [templateId]);

  const templateMeta = useMemo(
    () => (templateId ? PIPELINE_TEMPLATES.find((t) => t.id === templateId) : undefined),
    [templateId],
  );

  const templateTitle = templateMeta?.title || preset?.title || '';

  const [yaml, setYaml] = useState(DEFAULT_YAML);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [activeTab, setActiveTab] = useState('flow');
  const [triggerSettings, setTriggerSettings] = useState({
    webhook: false,
    cron: false,
    concurrency: false,
  });
  const [activeTrigger, setActiveTrigger] = useState<'webhook' | 'cron' | 'concurrency' | null>(null);
  const [cronConfig, setCronConfig] = useState({
    mode: 'periodic', // periodic | once
    weekdays: [] as number[],
    startTime: '',
    endTime: '',
    interval: '',
    triggerOnCodeChange: false,
  });
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
      if (templateId && templateTitle) {
        setName(templateTitle);
        setDescription(templateMeta?.description || '');
        return;
      }
      try {
        const cfg = parseYAMLLite(DEFAULT_YAML);
        setName(cfg.name || '新建流水线');
        setDescription(cfg.description || '');
      } catch {
        setName('新建流水线');
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
  }, [id, isNew, templateId, templateTitle, templateMeta?.description]);

  const pageTitle = useMemo(() => {
    if (!isNew) return name || `流水线 #${id}`;
    if (templateTitle) return templateTitle;
    return name || '新建流水线';
  }, [isNew, name, id, templateTitle]);

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

  const renderTriggerTab = () => {
    const handleTriggerToggle = (key: 'webhook' | 'cron' | 'concurrency', checked: boolean) => {
      setTriggerSettings((prev) => ({ ...prev, [key]: checked }));
      if (checked) {
        setActiveTrigger(key);
      } else if (activeTrigger === key) {
        setActiveTrigger(null);
      }
    };

    return (
      <div className='flex gap-0' style={{ minHeight: '600px' }}>
        {/* 左侧开关列表 */}
        <div className='w-[280px] border-r border-fc-200 bg-[var(--fc-fill-2)]'>
          <div
            className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
              activeTrigger === 'webhook' ? 'bg-[var(--fc-primary-bg)]' : 'hover:bg-[var(--fc-fill-3)]'
            }`}
            onClick={() => setActiveTrigger('webhook')}
          >
            <span className='text-sm'>Webhook触发</span>
            <Switch checked={triggerSettings.webhook} onChange={(checked) => handleTriggerToggle('webhook', checked)} />
          </div>
          <div
            className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
              activeTrigger === 'cron' ? 'bg-[var(--fc-primary-bg)]' : 'hover:bg-[var(--fc-fill-3)]'
            }`}
            onClick={() => setActiveTrigger('cron')}
          >
            <span className='text-sm'>定时触发</span>
            <Switch checked={triggerSettings.cron} onChange={(checked) => handleTriggerToggle('cron', checked)} />
          </div>
          <div
            className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
              activeTrigger === 'concurrency' ? 'bg-[var(--fc-primary-bg)]' : 'hover:bg-[var(--fc-fill-3)]'
            }`}
            onClick={() => setActiveTrigger('concurrency')}
          >
            <span className='text-sm'>并发度限制</span>
            <Switch checked={triggerSettings.concurrency} onChange={(checked) => handleTriggerToggle('concurrency', checked)} />
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className='flex-1 p-6 bg-[var(--fc-fill-1)]'>
          {activeTrigger === 'webhook' && (
            <div>
              <h3 className='text-base font-medium mb-2'>Webhook触发</h3>
              <p className='text-sm text-[var(--fc-text-3)] mb-4'>
                外部系统通过Webhook将环境参数传给流水线并触发运行，
                <a href='#' className='text-[var(--fc-fill-primary)] ml-1'>查看文档</a>
              </p>

              <div className='mb-4'>
                <div className='text-sm text-[var(--fc-text-2)] mb-2'>通用Webhook （代码源提交触发请勿使用）</div>
                <Input
                  readOnly
                  value='http://flow-openapi.aliyun.com/pipeline/webhook/5zBkGx1JpTGqhLEBsy7z'
                  suffix={<Tooltip title='复制'><Button type='text' size='small' icon={<ApiOutlined />} /></Tooltip>}
                />
              </div>

              <div>
                <div className='text-sm text-[var(--fc-text-2)] mb-2'>流水线源Webhook</div>
                <Input
                  readOnly
                  value='http://flow-openapi.aliyun.com/scm/webhook/5zBkGx1JpTGqhLEBsy7z'
                  suffix={<Tooltip title='复制'><Button type='text' size='small' icon={<ApiOutlined />} /></Tooltip>}
                />
              </div>
            </div>
          )}

          {activeTrigger === 'cron' && (
            <div>
              <h3 className='text-base font-medium mb-2'>定时触发</h3>
              <p className='text-sm text-[var(--fc-text-3)] mb-4'>
                定时单次或周期触发流水线自动运行，
                <a href='#' className='text-[var(--fc-fill-primary)] ml-1'>查看文档</a>
              </p>

              <Form layout='vertical'>
                <Form.Item label='触发方式'>
                  <Radio.Group value={cronConfig.mode} onChange={(e) => setCronConfig({ ...cronConfig, mode: e.target.value })}>
                    <Radio value='periodic'>周期触发</Radio>
                    <Radio value='once'>单次触发</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item label='日期选择'>
                  <Checkbox.Group
                    value={cronConfig.weekdays}
                    onChange={(values) => setCronConfig({ ...cronConfig, weekdays: values as number[] })}
                  >
                    <div className='grid grid-cols-7 gap-2'>
                      {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => (
                        <Checkbox key={index} value={index + 1} className='m-0'>
                          <div className='text-center'>{day}</div>
                        </Checkbox>
                      ))}
                    </div>
                  </Checkbox.Group>
                </Form.Item>

                <Form.Item label='触发时间'>
                  <div className='grid grid-cols-2 gap-4'>
                    <Input
                      placeholder='请选择触发开始时间'
                      value={cronConfig.startTime}
                      onChange={(e) => setCronConfig({ ...cronConfig, startTime: e.target.value })}
                      suffix={<ApiOutlined />}
                    />
                    <Input
                      placeholder='请选择触发结束时间'
                      value={cronConfig.endTime}
                      onChange={(e) => setCronConfig({ ...cronConfig, endTime: e.target.value })}
                      suffix={<ApiOutlined />}
                    />
                  </div>
                </Form.Item>

                <Form.Item label='间隔时间'>
                  <Select
                    placeholder='请选择'
                    value={cronConfig.interval}
                    onChange={(value) => setCronConfig({ ...cronConfig, interval: value })}
                    style={{ width: '100%' }}
                    options={[
                      { value: '5m', label: '每 5 分钟' },
                      { value: '15m', label: '每 15 分钟' },
                      { value: '30m', label: '每 30 分钟' },
                      { value: '1h', label: '每 1 小时' },
                      { value: '2h', label: '每 2 小时' },
                      { value: '6h', label: '每 6 小时' },
                      { value: '12h', label: '每 12 小时' },
                      { value: '1d', label: '每天' },
                    ]}
                  />
                </Form.Item>

                <Form.Item>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm'>代码变更时定时器触发</span>
                    <Tooltip title='仅当代码有变更时才触发定时任务'>
                      <ApiOutlined className='text-[var(--fc-text-4)]' />
                    </Tooltip>
                  </div>
                </Form.Item>
              </Form>
            </div>
          )}

          {activeTrigger === 'concurrency' && (
            <div>
              <h3 className='text-base font-medium mb-2'>并发度限制</h3>
              <p className='text-sm text-[var(--fc-text-3)] mb-4'>
                本条流水线支持的、同时处在运行中或等待中的流水线实例的最大数
              </p>

              <Form layout='vertical'>
                <Form.Item label='并发运行实例数'>
                  <Input type='number' defaultValue={100} style={{ width: '200px' }} />
                </Form.Item>

                <Form.Item label='超过并发实例数行为'>
                  <Radio.Group defaultValue='block'>
                    <Radio value='block'>超过并发实例数时，不允许触发新的运行</Radio>
                    <Radio value='cancel'>超过并发实例数时，触发新运行自动取消前序运行</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item label={
                  <div className='flex items-center gap-2'>
                    <span>多运行实例同一任务并发度</span>
                    <Tooltip title='控制多个运行实例中同一任务的并发执行数量'>
                      <ApiOutlined className='text-[var(--fc-text-4)]' />
                    </Tooltip>
                  </div>
                }>
                  <Input type='number' defaultValue={1} style={{ width: '200px' }} />
                </Form.Item>
              </Form>
            </div>
          )}

          {!activeTrigger && (
            <Empty description='请从左侧选择触发方式' />
          )}
        </div>
      </div>
    );
  };

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
              <span className='text-lg font-semibold text-title'>{pageTitle}</span>
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
          <Tabs.TabPane key='flow' tab='流程配置'>
            <StageFlowEditor />
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
