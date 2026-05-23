import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Card, Drawer, Progress, Radio, Space, Table, Tag, Timeline, Tooltip, message } from 'antd';
import {
  ApiOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  HistoryOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';

import PageLayout from '@/components/pageLayout';

import './Tests.less';

type TestMode = 'acceptance' | 'ops' | 'baseline';
type CaseStatus = 'passed' | 'warning' | 'failed' | 'running' | 'pending';

interface TestCase {
  key: string;
  suite: string;
  name: string;
  target: string;
  source: string;
  status: CaseStatus;
  duration: string;
  command: string;
  expected: string;
  evidence: string;
  owner: string;
}

interface TestRun {
  key: string;
  name: string;
  trigger: string;
  pipeline: string;
  result: CaseStatus;
  startedAt: string;
  duration: string;
}

const MODE_COPY: Record<TestMode, { label: string; title: string; desc: string }> = {
  acceptance: {
    label: '交付验收',
    title: 'ES 部署后验收',
    desc: '部署完成后立即执行，确认服务、端口、配置、数据和基础性能满足交付条件。',
  },
  ops: {
    label: '运维巡检',
    title: 'ES 运维期间巡检',
    desc: '按周期或告警触发执行，确认系统没有因为环境漂移、磁盘水位或集群状态退化。',
  },
  baseline: {
    label: '回归基线',
    title: '版本回归基线',
    desc: '对比上一次成功交付的关键指标，判断升级或配置变更后是否出现质量回退。',
  },
};

const BASE_CASES: TestCase[] = [
  {
    key: 'health',
    suite: '服务健康',
    name: 'ES 集群健康检查',
    target: 'http://10.3.164.28:9200/_cluster/health',
    source: 'ES 部署流水线 / 启动与验证',
    status: 'passed',
    duration: '4.2s',
    command: 'curl -s http://10.3.164.28:9200/_cluster/health',
    expected: 'status 为 green 或 yellow，number_of_nodes >= 1',
    evidence: '{"status":"yellow","number_of_nodes":1,"active_shards":1}',
    owner: '交付测试',
  },
  {
    key: 'port',
    suite: '连通性',
    name: '9200 / 9300 端口探测',
    target: '10.3.164.28',
    source: '服务连接 svc-es-master-01-root',
    status: 'passed',
    duration: '1.8s',
    command: 'nc -vz 10.3.164.28 9200 && nc -vz 10.3.164.28 9300',
    expected: 'HTTP 和 transport 端口均可达',
    evidence: '9200 succeeded, 9300 succeeded',
    owner: '交付测试',
  },
  {
    key: 'config',
    suite: '配置一致性',
    name: 'elasticsearch.yml 配置核对',
    target: '/iflytek/server/elasticsearch-7.16.2/config/elasticsearch.yml',
    source: '文档解析 / 原文映射',
    status: 'warning',
    duration: '2.6s',
    command: 'grep -E "cluster.name|path.data|discovery.seed_hosts" elasticsearch.yml',
    expected: 'cluster.name、path.data、discovery.seed_hosts 与解析模板一致',
    evidence: 'cluster.name 已匹配；discovery.seed_hosts 仅 1 个节点，建议人工确认',
    owner: '交付测试',
  },
  {
    key: 'data',
    suite: '数据可用性',
    name: 'esdump 导入抽样验证',
    target: 'yq_account_related',
    source: '资源仓库 / elasticdump-6.113.0.tgz',
    status: 'passed',
    duration: '9.7s',
    command:
      'elasticdump --input=backup.json --output=http://10.3.164.28:9200/yq_account_related --type=data --limit=10000',
    expected: '导入任务返回 0 错误，抽样查询命中记录',
    evidence: 'imported 10000 docs, sample query returned 20 docs',
    owner: '交付测试',
  },
  {
    key: 'resource',
    suite: '运行水位',
    name: '磁盘与 JVM 水位',
    target: 'es-master-01',
    source: 'CMDB / es-master-01',
    status: 'failed',
    duration: '3.9s',
    command: 'df -h /iflytek && curl -s :9200/_nodes/stats/jvm',
    expected: '数据盘使用率 < 80%，JVM heap 使用率 < 75%',
    evidence: 'data disk 83%，超过验收阈值',
    owner: '运维测试',
  },
];

const RECENT_RUNS: TestRun[] = [
  {
    key: 'run-184',
    name: 'ES 部署后验收 #184',
    trigger: '流水线完成后自动触发',
    pipeline: 'ES 7.16.2 ARM64 部署',
    result: 'failed',
    startedAt: '2026-05-23 10:42:18',
    duration: '02m 31s',
  },
  {
    key: 'run-183',
    name: 'ES 夜间巡检 #183',
    trigger: '定时触发',
    pipeline: 'ES 运维巡检',
    result: 'warning',
    startedAt: '2026-05-23 02:00:00',
    duration: '01m 48s',
  },
  {
    key: 'run-182',
    name: 'ES 回归基线 #182',
    trigger: '人工触发',
    pipeline: 'ES 7.16.2 ARM64 部署',
    result: 'passed',
    startedAt: '2026-05-22 18:12:55',
    duration: '03m 05s',
  },
];

const RUN_LOGS = [
  '读取流水线运行上下文：ES 7.16.2 ARM64 部署 / run #184',
  '绑定资源仓库制品：elasticsearch-7.16.2-linux-aarch64.tar.gz、elasticdump-6.113.0.tgz',
  '通过服务连接 svc-es-master-01-root 连接 es-master-01',
  '执行服务健康与端口连通性测试',
  '执行文档解析配置映射核对',
  '执行 esdump 导入抽样验证',
  '运行水位检查失败：/iflytek/data 使用率 83%，超过 80% 阈值',
];

const STATUS_META: Record<CaseStatus, { color: string; label: string; icon: React.ReactNode }> = {
  passed: { color: 'success', label: '通过', icon: <CheckCircleOutlined /> },
  warning: { color: 'warning', label: '需确认', icon: <WarningOutlined /> },
  failed: { color: 'error', label: '阻断', icon: <ExclamationCircleOutlined /> },
  running: { color: 'processing', label: '运行中', icon: <LoadingOutlined /> },
  pending: { color: 'default', label: '待执行', icon: <ClockCircleOutlined /> },
};

export default function Tests() {
  const [mode, setMode] = useState<TestMode>('acceptance');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(100);
  const [activeCase, setActiveCase] = useState<TestCase | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  const cases = useMemo(() => {
    if (mode === 'ops') {
      return BASE_CASES.map((item) =>
        item.key === 'data'
          ? {
              ...item,
              suite: '业务探测',
              name: '索引读写抽样',
              source: '运维巡检模板',
              expected: '核心索引读写延迟在基线范围内',
            }
          : item,
      );
    }
    if (mode === 'baseline') {
      return BASE_CASES.map((item) =>
        item.key === 'resource'
          ? {
              ...item,
              suite: '基线对比',
              name: '资源水位基线偏差',
              expected: '磁盘、JVM、查询延迟不高于上一次成功交付基线 15%',
            }
          : item,
      );
    }
    return BASE_CASES;
  }, [mode]);

  const failedCount = cases.filter((item) => item.status === 'failed').length;
  const warningCount = cases.filter((item) => item.status === 'warning').length;
  const passedCount = cases.filter((item) => item.status === 'passed').length;
  const passRate = Math.round((passedCount / cases.length) * 100);

  const activeLogIndex = running
    ? Math.min(RUN_LOGS.length - 1, Math.floor((progress / 100) * RUN_LOGS.length))
    : -1;

  const verdictTone: 'error' | 'warning' | 'success' =
    failedCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'success';
  const verdictText = failedCount > 0 ? '阻断交付' : warningCount > 0 ? '人工确认' : '允许交付';

  useEffect(() => {
    if (running && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [progress, running]);

  const runTest = () => {
    setRunning(true);
    setProgress(12);
    const steps = [28, 45, 64, 82, 100];
    steps.forEach((value, index) => {
      window.setTimeout(() => {
        setProgress(value);
        if (index === steps.length - 1) {
          setRunning(false);
          message.warning('测试完成：1 个阻断项，需处理后再交付');
        }
      }, (index + 1) * 620);
    });
  };

  const caseColumns: ColumnsType<TestCase> = [
    {
      title: '测试项',
      dataIndex: 'name',
      key: 'name',
      width: 230,
      render: (name: string, record) => (
        <div className='flex flex-col gap-0.5'>
          <button type='button' className='delivery-tests-link' onClick={() => setActiveCase(record)}>
            {name}
          </button>
          <span className='text-xs text-secondary'>{record.source}</span>
        </div>
      ),
    },
    {
      title: '测试集',
      dataIndex: 'suite',
      key: 'suite',
      width: 110,
      render: (suite: string) => <Tag color='blue'>{suite}</Tag>,
    },
    {
      title: '目标',
      dataIndex: 'target',
      key: 'target',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 96,
      render: (status: CaseStatus) => {
        const meta = STATUS_META[status];
        return (
          <Tag color={meta.color} icon={meta.icon}>
            {meta.label}
          </Tag>
        );
      },
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      width: 96,
    },
  ];

  const runColumns: ColumnsType<TestRun> = [
    {
      title: '执行记录',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div className='flex flex-col gap-0.5'>
          <span className='font-medium text-title'>{name}</span>
          <span className='text-xs text-secondary'>{record.trigger}</span>
        </div>
      ),
    },
    {
      title: '关联流水线',
      dataIndex: 'pipeline',
      key: 'pipeline',
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      width: 92,
      render: (status: CaseStatus) => {
        const meta = STATUS_META[status];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startedAt',
      key: 'startedAt',
      width: 170,
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 90,
    },
  ];

  return (
    <PageLayout title='测试管理'>
      <div className='fc-page n9e delivery-tests-page'>
        <Card className='delivery-tests-section delivery-tests-hero' bodyStyle={{ padding: 16 }}>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2 text-xs text-secondary'>
                <span>智能交付 / 测试管理</span>
                <span className='text-[var(--fc-fill-4)]'>·</span>
                <span>{MODE_COPY[mode].label}</span>
              </div>
              <div className='mt-1 flex flex-wrap items-center gap-2'>
                <SafetyCertificateOutlined className='text-base text-[var(--fc-fill-primary)]' />
                <h2 className='m-0 text-[18px] font-semibold leading-7 text-title'>{MODE_COPY[mode].title}</h2>
                <Tag color={verdictTone === 'error' ? 'error' : verdictTone === 'warning' ? 'warning' : 'success'} className='!m-0'>
                  {verdictText}
                </Tag>
              </div>
              <p className='mt-1 max-w-[760px] text-xs text-secondary leading-5'>{MODE_COPY[mode].desc}</p>
            </div>
            <Space wrap size={8}>
              <Radio.Group value={mode} onChange={(event) => setMode(event.target.value)} optionType='button' buttonStyle='solid' size='small'>
                <Radio.Button value='acceptance'>{MODE_COPY.acceptance.label}</Radio.Button>
                <Radio.Button value='ops'>{MODE_COPY.ops.label}</Radio.Button>
                <Radio.Button value='baseline'>{MODE_COPY.baseline.label}</Radio.Button>
              </Radio.Group>
              <Button type='primary' icon={running ? <SyncOutlined spin /> : <PlayCircleOutlined />} onClick={runTest} disabled={running}>
                {running ? '执行中…' : '运行测试'}
              </Button>
            </Space>
          </div>
          {(running || progress < 100) && (
            <div className='mt-3 flex items-center gap-3'>
              <Progress
                percent={progress}
                size='small'
                status={running ? 'active' : failedCount > 0 ? 'exception' : 'success'}
                className='flex-1 !m-0'
              />
              <span className='text-xs text-secondary whitespace-nowrap'>
                {running ? `执行中 · ${progress}%` : '最近一次执行'}
              </span>
            </div>
          )}
        </Card>

        <div className='delivery-tests-grid'>
          <div className='delivery-tests-main'>
            <Card className='delivery-tests-section'>
              <div className='delivery-tests-card-title'>
                <Space size={6}>
                  <SafetyCertificateOutlined />
                  <span>测试用例</span>
                  <Tag className='!ml-1 !m-0'>共 {cases.length} 项</Tag>
                </Space>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-secondary'>通过率</span>
                  <Progress
                    type='circle'
                    width={28}
                    percent={passRate}
                    status={failedCount > 0 ? 'exception' : 'success'}
                    format={(p) => <span className='text-[10px]'>{p}</span>}
                  />
                </div>
              </div>
              <Table<TestCase>
                rowKey='key'
                size='small'
                columns={caseColumns}
                dataSource={cases}
                pagination={false}
                scroll={{ x: 920 }}
              />
            </Card>

            <Card className='delivery-tests-section delivery-tests-log-card'>
              <div className='delivery-tests-card-title'>
                <Space size={6}>
                  <DatabaseOutlined />
                  <span>执行日志</span>
                  <Tag color={running ? 'processing' : 'default'} className='!m-0'>
                    {running ? '运行中' : '最近一次'}
                  </Tag>
                </Space>
                <span className='text-xs text-secondary'>
                  跟随测试用例执行实时输出 · {RUN_LOGS.length} 条
                </span>
              </div>
              <div className='delivery-tests-log'>
                {RUN_LOGS.map((log, index) => (
                  <div key={log} className={index === activeLogIndex ? 'active' : undefined}>
                    <span>T+{String(index * 4).padStart(2, '0')}s</span>
                    <p>{log}</p>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </Card>

            <Card className='delivery-tests-section'>
              <div className='delivery-tests-card-title'>
                <Space size={6}>
                  <HistoryOutlined />
                  <span>最近执行</span>
                </Space>
                <Button size='small' icon={<FileDoneOutlined />} onClick={() => message.success('已生成测试报告草稿')}>
                  生成报告
                </Button>
              </div>
              <Table<TestRun> rowKey='key' size='small' columns={runColumns} dataSource={RECENT_RUNS} pagination={false} />
            </Card>
          </div>

          <div className='delivery-tests-side'>
            <Card className='delivery-tests-section'>
              <div className='delivery-tests-card-title'>
                <Space size={6}>
                  <FileSearchOutlined />
                  <span>门禁结论</span>
                </Space>
              </div>
              <div className='delivery-tests-metrics'>
                <div className='delivery-tests-metric'>
                  <span>通过</span>
                  <strong>{passedCount}</strong>
                </div>
                <div className='delivery-tests-metric warn'>
                  <span>确认</span>
                  <strong>{warningCount}</strong>
                </div>
                <div className='delivery-tests-metric danger'>
                  <span>阻断</span>
                  <strong>{failedCount}</strong>
                </div>
                <div className='delivery-tests-metric'>
                  <span>耗时</span>
                  <strong>02m</strong>
                </div>
              </div>
              <Alert
                type={verdictTone}
                showIcon
                message={failedCount > 0 ? '暂不建议交付' : warningCount > 0 ? '需人工确认后再交付' : '满足交付条件'}
                description={
                  failedCount > 0
                    ? '运行水位检查失败，需要扩容、清理数据盘或调整交付窗口后复测。'
                    : warningCount > 0
                    ? '配置一致性存在差异，请人工确认后回填或复测。'
                    : '所有阻断项已通过，可进入交付确认。'
                }
                className='!mb-3'
              />
              <div className='flex flex-col gap-2'>
                <Tooltip title='把当前结果写回流水线运行详情，形成交付审计记录'>
                  <Button block icon={<FileDoneOutlined />} onClick={() => message.success('已回填到流水线运行详情')}>
                    回填流水线
                  </Button>
                </Tooltip>
                <Button block icon={<ApiOutlined />} onClick={() => message.success('已创建 1 条复测任务')}>
                  创建复测任务
                </Button>
              </div>
            </Card>

            <Card className='delivery-tests-section'>
              <div className='delivery-tests-card-title'>
                <Space size={6}>
                  <CloudServerOutlined />
                  <span>关联对象</span>
                </Space>
              </div>
              <div className='delivery-tests-object-list'>
                <div>
                  <span>流水线</span>
                  <strong>ES 7.16.2 ARM64 部署</strong>
                </div>
                <div>
                  <span>制品</span>
                  <strong>elasticsearch-7.16.2-linux-aarch64.tar.gz</strong>
                </div>
                <div>
                  <span>服务连接</span>
                  <strong>svc-es-master-01-root</strong>
                </div>
                <div>
                  <span>部署视图</span>
                  <strong>es-master-01 / 10.3.164.28</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Drawer title='测试项详情' width={560} visible={!!activeCase} onClose={() => setActiveCase(null)}>
        {activeCase && (
          <div className='delivery-tests-drawer'>
            <div className='delivery-tests-drawer-title'>
              <h3>{activeCase.name}</h3>
              <Tag color={STATUS_META[activeCase.status].color}>{STATUS_META[activeCase.status].label}</Tag>
            </div>
            <Timeline>
              <Timeline.Item color='blue' dot={<FileSearchOutlined />}>
                <strong>来源</strong>
                <p>{activeCase.source}</p>
              </Timeline.Item>
              <Timeline.Item color='blue' dot={<ApiOutlined />}>
                <strong>执行命令</strong>
                <pre>{activeCase.command}</pre>
              </Timeline.Item>
              <Timeline.Item color='green' dot={<CheckCircleOutlined />}>
                <strong>期望结果</strong>
                <p>{activeCase.expected}</p>
              </Timeline.Item>
              <Timeline.Item color={activeCase.status === 'failed' ? 'red' : 'green'} dot={STATUS_META[activeCase.status].icon}>
                <strong>证据</strong>
                <p>{activeCase.evidence}</p>
              </Timeline.Item>
            </Timeline>
          </div>
        )}
      </Drawer>
    </PageLayout>
  );
}
