import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Drawer, Progress, Radio, Space, Table, Tag, Timeline, Tooltip, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import {
  ApartmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  ImportOutlined,
  KeyOutlined,
  LoadingOutlined,
  ReloadOutlined,
  UploadOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';
import { useHistory } from 'react-router-dom';

import PageLayout from '@/components/pageLayout';

import { PATHS } from '../constants';
import './DocumentParsing.less';

type ParseStatus = 'idle' | 'processing' | 'ready';
type ResultTab = 'pipeline' | 'cmdb' | 'connections' | 'mapping';

interface DraftStage {
  key: string;
  stage: string;
  confidence: number;
  source: string;
  tasks: string[];
  risk?: string;
}

interface CmdbHost {
  key: string;
  hostname: string;
  ip: string;
  role: string;
  os: string;
  location: string;
  credential: string;
}

interface ServiceConnectionCandidate {
  key: string;
  name: string;
  type: string;
  host: string;
  account: string;
  status: string;
}

interface SourceMapping {
  key: string;
  target: string;
  source: string;
  extracted: string;
}

const PROCESS_LOGS = [
  { title: '读取 ES部署文档.docx', detail: '解析 69 段正文、1 个配置表格，识别 ES 7.16.2 部署意图' },
  { title: '抽取部署动作', detail: '命中 groupadd、useradd、mkdir、tar、chown、chmod、启动命令等 13 条动作' },
  { title: '识别配置变量', detail: '抽取 cluster.name、node.name、path.data、path.logs、network.host、discovery.seed_hosts' },
  { title: '匹配调试架构', detail: '当前环境默认 ARM64，发现 soft 目录 x86_64 包，生成 aarch64 替换建议' },
  { title: '生成流水线草稿', detail: '输出 4 个阶段、12 个步骤、6 个变量，并保留源文档映射' },
  { title: '生成导入候选项', detail: '从部署视图抽取 1 台主机、1 个服务连接候选项，等待人工确认' },
];

const draftStages: DraftStage[] = [
  {
    key: 'prepare',
    stage: '环境检查与准备',
    confidence: 94,
    source: 'ES部署文档.docx / 安装包解压前置步骤',
    tasks: ['检查 CPU 架构与 OS 版本', '创建 elsearch 用户组和用户', '创建 /iflytek/data/es/data1 与 /iflytek/logs/es/node-1'],
  },
  {
    key: 'artifact',
    stage: '部署包上传',
    confidence: 87,
    source: 'ES部署文档.docx / 上传安装包、解压安装包',
    tasks: ['选择 elasticsearch-7.16.2-linux-aarch64.tar.gz', '解压到 /iflytek/server', '修正目录属主为 elsearch:elsearch'],
    risk: '源目录现有 x86_64 包，已按 ARM64 调试环境给出替换建议',
  },
  {
    key: 'config',
    stage: '配置文件修改',
    confidence: 91,
    source: 'ES部署文档.docx / elasticsearch.yml 表格',
    tasks: ['生成 elasticsearch.yml', '写入 cluster.name 与 node.name', '映射 discovery.seed_hosts 与 initial_master_nodes'],
  },
  {
    key: 'verify',
    stage: '启动与验证',
    confidence: 89,
    source: 'ES部署文档.docx / 启动服务、FAQ',
    tasks: ['切换 elsearch 用户后台启动', '检查 9200/9300 端口', 'tail -f logs/gs-swk-application.log'],
  },
];

const cmdbHosts: CmdbHost[] = [
  {
    key: 'es-master-01',
    hostname: 'es-master-01',
    ip: '10.3.164.28',
    role: 'es/master,data',
    os: 'CentOS 7.x',
    location: '默认部署视图',
    credential: 'root / ******',
  },
];

const serviceConnections: ServiceConnectionCandidate[] = [
  {
    key: 'svc-es-master',
    name: 'svc-es-master-01-root',
    type: 'SSH 用户密码',
    host: '10.3.164.28:22',
    account: 'root / ******',
    status: '待导入',
  },
];

const sourceMappings: SourceMapping[] = [
  {
    key: 'pkg',
    target: '部署包上传 / 解压 ES 包',
    source: 'ES部署文档.docx 第 2 节',
    extracted: 'tar -zxvf elasticsearch-7.16.2.tar.gz -C /iflytek/server',
  },
  {
    key: 'config',
    target: '配置文件修改 / elasticsearch.yml',
    source: 'ES部署文档.docx 配置表格',
    extracted: 'cluster.name、node.name、path.data、path.logs、http.port、discovery.seed_hosts',
  },
  {
    key: 'start',
    target: '启动与验证 / 后台启动',
    source: 'ES部署文档.docx 启动服务',
    extracted: '/iflytek/server/elasticsearch-7.16.2/bin/elasticsearch -d',
  },
];

const initialLogs = PROCESS_LOGS.map((item) => `${item.title}：${item.detail}`);

export default function Knowledge() {
  const history = useHistory();
  const [status, setStatus] = useState<ParseStatus>('ready');
  const [progress, setProgress] = useState(100);
  const [activeStep, setActiveStep] = useState(PROCESS_LOGS.length - 1);
  const [logs, setLogs] = useState<string[]>(initialLogs);
  const [tab, setTab] = useState<ResultTab>('pipeline');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (status !== 'processing') return undefined;

    setProgress(8);
    setActiveStep(0);
    setLogs([`开始解析：ES部署文档.docx`]);

    let index = 0;
    const timer = window.setInterval(() => {
      const current = PROCESS_LOGS[index];
      if (!current) {
        window.clearInterval(timer);
        setProgress(100);
        setActiveStep(PROCESS_LOGS.length - 1);
        setStatus('ready');
        message.success('文档解析完成，已生成流水线草稿和导入候选项');
        return;
      }

      setActiveStep(index);
      setProgress(Math.min(96, Math.round(((index + 1) / PROCESS_LOGS.length) * 100)));
      setLogs((prev) => [...prev, `${current.title}：${current.detail}`]);
      index += 1;
    }, 760);

    return () => window.clearInterval(timer);
  }, [status]);

  const uploadProps: UploadProps = {
    accept: '.doc,.docx,.md,.pdf,.xlsx',
    showUploadList: false,
    beforeUpload: () => {
      setStatus('processing');
      return false;
    },
  };

  const stageColumns: ColumnsType<DraftStage> = [
    {
      title: '阶段',
      dataIndex: 'stage',
      key: 'stage',
      width: 150,
      render: (stage: string, record) => (
        <Space direction='vertical' size={2}>
          <span className='font-medium text-title'>{stage}</span>
          <span className='text-xs text-secondary'>{record.source}</span>
        </Space>
      ),
    },
    {
      title: '解析任务',
      dataIndex: 'tasks',
      key: 'tasks',
      render: (tasks: string[], record) => (
        <Space direction='vertical' size={4}>
          {tasks.map((task) => (
            <span key={task}>{task}</span>
          ))}
          {record.risk && (
            <Tag color='warning' icon={<WarningOutlined />}>
              {record.risk}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      width: 120,
      render: (confidence: number) => <Progress percent={confidence} size='small' strokeColor='#1677ff' />,
    },
  ];

  const cmdbColumns: ColumnsType<CmdbHost> = [
    { title: '主机名', dataIndex: 'hostname', key: 'hostname' },
    { title: 'SSH IP', dataIndex: 'ip', key: 'ip' },
    { title: '角色', dataIndex: 'role', key: 'role', render: (role: string) => <Tag color='blue'>{role}</Tag> },
    { title: 'OS', dataIndex: 'os', key: 'os' },
    { title: '位置', dataIndex: 'location', key: 'location' },
    { title: '凭据引用', dataIndex: 'credential', key: 'credential' },
  ];

  const connectionColumns: ColumnsType<ServiceConnectionCandidate> = [
    { title: '连接名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (type: string) => <Tag>{type}</Tag> },
    { title: '目标', dataIndex: 'host', key: 'host' },
    { title: '账号', dataIndex: 'account', key: 'account' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (value: string) => <Tag color='processing'>{value}</Tag> },
  ];

  const mappingColumns: ColumnsType<SourceMapping> = [
    { title: '生成对象', dataIndex: 'target', key: 'target', width: 220 },
    { title: '来源', dataIndex: 'source', key: 'source', width: 180 },
    { title: '抽取内容', dataIndex: 'extracted', key: 'extracted' },
  ];

  const timelineItems = useMemo(
    () =>
      PROCESS_LOGS.map((item, index) => {
        const done = status === 'ready' || activeStep > index;
        const active = status === 'processing' && activeStep === index;
        return (
          <Timeline.Item
            key={item.title}
            color={done ? 'green' : active ? 'blue' : 'gray'}
            dot={active ? <LoadingOutlined /> : done ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          >
            <div className={active ? 'document-parser-step-active' : undefined}>
              <div className='document-parser-step-title'>{item.title}</div>
              <div className='text-secondary'>{item.detail}</div>
            </div>
          </Timeline.Item>
        );
      }),
    [activeStep, status],
  );

  const handleImportPipeline = () => {
    message.success('已导入为流水线草稿：ES 7.16.2 ARM64 部署');
    history.push(`${PATHS.pipelines}/new?template=document-parser-es&mode=draft`);
  };

  const handleImportConnections = () => {
    message.success('已生成 1 个服务连接候选项，待在服务连接模块确认入库');
  };

  const renderResult = () => {
    if (tab === 'pipeline') {
      return <Table<DraftStage> rowKey='key' size='small' columns={stageColumns} dataSource={draftStages} pagination={false} />;
    }
    if (tab === 'cmdb') {
      return <Table<CmdbHost> rowKey='key' size='small' columns={cmdbColumns} dataSource={cmdbHosts} pagination={false} />;
    }
    if (tab === 'connections') {
      return <Table<ServiceConnectionCandidate> rowKey='key' size='small' columns={connectionColumns} dataSource={serviceConnections} pagination={false} />;
    }
    return <Table<SourceMapping> rowKey='key' size='small' columns={mappingColumns} dataSource={sourceMappings} pagination={false} />;
  };

  return (
    <PageLayout title='文档解析'>
      <div className='fc-page n9e document-parser-page'>
        <Card className='document-parser-section'>
          <div className='document-parser-header'>
            <div className='document-parser-title-block'>
              <div className='document-parser-eyebrow'>智能交付 / 文档解析</div>
              <h2>部署文档转流水线草稿</h2>
              <p>上传传统部署文档或部署视图，系统解析流程、命令、变量、主机和凭据，生成可审阅的导入结果。</p>
            </div>
            <Space wrap>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />} type='primary' loading={status === 'processing'}>
                  上传文档
                </Button>
              </Upload>
              <Button icon={<ReloadOutlined />} onClick={() => setStatus('processing')} disabled={status === 'processing'}>
                重新解析 ES 示例
              </Button>
              <Button icon={<ImportOutlined />} onClick={handleImportPipeline} disabled={status !== 'ready'}>
                导入流水线草稿
              </Button>
            </Space>
          </div>
        </Card>

        <div className='document-parser-grid'>
          <div className='document-parser-main'>
            <Card className='document-parser-section'>
              <div className='document-parser-card-title'>
                <Space>
                  <FileTextOutlined />
                  <span>解析过程</span>
                </Space>
                <Tag color={status === 'processing' ? 'processing' : 'success'}>{status === 'processing' ? '解析中' : '已完成'}</Tag>
              </div>
              <Progress percent={progress} status={status === 'processing' ? 'active' : 'success'} />
              <div className='document-parser-process'>
                <Timeline>{timelineItems}</Timeline>
                <div className='document-parser-log-panel'>
                  {logs.map((log, index) => (
                    <div key={`${log}-${index}`} className={index === logs.length - 1 && status === 'processing' ? 'document-parser-log-row active' : 'document-parser-log-row'}>
                      <span className='document-parser-log-time'>T+{String(index * 2).padStart(2, '0')}s</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className='document-parser-section'>
              <div className='document-parser-result-head'>
                <div className='document-parser-card-title'>
                  <Space>
                    <ApartmentOutlined />
                    <span>解析结果</span>
                  </Space>
                </div>
                <Radio.Group value={tab} onChange={(event) => setTab(event.target.value)} optionType='button' buttonStyle='solid'>
                  <Radio.Button value='pipeline'>流水线草稿</Radio.Button>
                  <Radio.Button value='cmdb'>CMDB 资产</Radio.Button>
                  <Radio.Button value='connections'>服务连接</Radio.Button>
                  <Radio.Button value='mapping'>原文映射</Radio.Button>
                </Radio.Group>
              </div>
              {renderResult()}
            </Card>
          </div>

          <div className='document-parser-side'>
            <Card className='document-parser-section'>
              <div className='document-parser-card-title'>
                <Space>
                  <DatabaseOutlined />
                  <span>导入摘要</span>
                </Space>
              </div>
              <div className='document-parser-metrics'>
                <div className='document-parser-metric'>
                  <span>阶段</span>
                  <strong>4</strong>
                </div>
                <div className='document-parser-metric'>
                  <span>步骤</span>
                  <strong>12</strong>
                </div>
                <div className='document-parser-metric'>
                  <span>主机</span>
                  <strong>1</strong>
                </div>
                <div className='document-parser-metric'>
                  <span>连接</span>
                  <strong>1</strong>
                </div>
              </div>
              <Alert type='warning' showIcon message='架构提醒' description='soft 目录存在 x86_64 ES 包；当前演示按 ARM64 调试环境生成 aarch64 包建议。' />
              <div className='document-parser-actions'>
                <Tooltip title='导入后进入流水线编辑页继续校验变量与步骤'>
                  <Button block type='primary' icon={<ImportOutlined />} onClick={handleImportPipeline} disabled={status !== 'ready'}>
                    导入流水线草稿
                  </Button>
                </Tooltip>
                <Button block icon={<KeyOutlined />} onClick={handleImportConnections} disabled={status !== 'ready'}>
                  导入服务连接候选项
                </Button>
                <Button block onClick={() => setDrawerOpen(true)}>
                  查看导入策略
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Drawer title='导入策略' width={520} visible={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className='document-parser-drawer'>
          <h3>流水线草稿</h3>
          <p>导入到流水线模板，默认保持草稿状态，不自动运行。用户需要在流水线编辑页确认变量、目标主机和服务连接。</p>
          <h3>CMDB 资产</h3>
          <p>以 SSH IP 去重，空值、nan、-、无 不导入。冲突字段进入人工确认队列。</p>
          <h3>服务连接</h3>
          <p>只展示脱敏密码，确认导入后复用现有服务连接加密存储。导入记录关联源文件、解析任务和操作人。</p>
        </div>
      </Drawer>
    </PageLayout>
  );
}
