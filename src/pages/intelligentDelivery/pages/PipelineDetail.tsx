import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Empty, Modal, Space, Statistic, Table, Tabs, Tag, Tooltip, message } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CodeOutlined,
  CloudUploadOutlined,
  DesktopOutlined,
  FileTextOutlined,
  GlobalOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';

import PageLayout from '@/components/pageLayout';

import { PATHS } from '../constants';
import { Pipeline, getPipelineRunDetail, getPipelineRuns, getPipelines, triggerPipelineRun } from '../services';

const STATUS_COLOR: Record<string, string> = {
  SUCCESS: 'green',
  FAILED: 'red',
  RUNNING: 'blue',
  PENDING: 'orange',
  CANCELED: 'gray',
};

const STATUS_LABEL: Record<string, string> = {
  SUCCESS: '运行成功',
  FAILED: '运行失败',
  RUNNING: '运行中',
  PENDING: '排队中',
  CANCELED: '已取消',
};

const TRIGGER_LABEL: Record<string, string> = {
  MANUAL: '页面手动触发',
  WEBHOOK: 'Webhook 触发',
  SCHEDULE: '定时触发',
  ALERT: '告警联动触发',
};

function StatusIcon({ status, className = '' }: { status: string; className?: string }) {
  if (status === 'RUNNING' || status === 'PENDING') {
    return <SyncOutlined spin className={`text-[#1677ff] ${className}`} />;
  }
  if (status === 'SUCCESS') {
    return <CheckCircleOutlined className={`text-[#52c41a] ${className}`} />;
  }
  if (status === 'FAILED') {
    return <CloseCircleOutlined className={`text-[#ff4d4f] ${className}`} />;
  }
  return <span className={`inline-block h-2 w-2 rounded-full bg-gray-400 ${className}`} />;
}

function isRunning(status: string) {
  return status === 'RUNNING' || status === 'PENDING';
}

function isTerminal(status: string) {
  return status === 'SUCCESS' || status === 'FAILED' || status === 'CANCELED';
}

function fmtElapsed(ms: number) {
  if (!ms || ms <= 0) return '-';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}秒`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m}分${s}秒` : `${m}分`;
}

function StepTypeBadge({ step }: { step: any }) {
  const { step_type, log = '' } = step || {};
  if (step_type === 'deploy') {
    return (
      <Tooltip title='软件包部署：从制品仓库下载并通过 SSH 部署到目标服务器'>
        <Tag icon={<CloudUploadOutlined />} color='purple'>
          deploy
        </Tag>
      </Tooltip>
    );
  }
  if (step_type === 'shell') {
    const remote = /executing on remote host/i.test(log) || /SSH connected/i.test(log);
    if (remote) {
      return (
        <Tooltip title='SSH 远程执行：通过服务连接在远程主机上执行 shell'>
          <Tag icon={<GlobalOutlined />} color='cyan'>
            ssh remote
          </Tag>
        </Tooltip>
      );
    }
    return (
      <Tooltip title='本地 shell：在 Nightingale 进程所在主机上执行'>
        <Tag icon={<DesktopOutlined />} color='blue'>
          local shell
        </Tag>
      </Tooltip>
    );
  }
  return <Tag color='default'>{step_type || 'unknown'}</Tag>;
}

interface LogModalState {
  open: boolean;
  job: any | null;
  selectedStepId: number | null;
}

export default function PipelineDetail() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [latestRun, setLatestRun] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('latest');
  const [loading, setLoading] = useState(false);
  const [logModal, setLogModal] = useState<LogModalState>({ open: false, job: null, selectedStepId: null });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPipeline = async () => {
    const res = await getPipelines({ page: 1, limit: 100, query: undefined });
    const found = res.list?.find((p) => p.id === Number(id));
    if (found) setPipeline(found);
  };

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await getPipelineRuns(Number(id), { limit: 20 });
      setRuns(res.list || []);
      if (res.list?.length) {
        const detail = await getPipelineRunDetail(res.list[0].id);
        setLatestRun(detail);
        if (logModal.open && logModal.job) {
          const updatedJob = detail.jobs?.find((j: any) => j.id === logModal.job.id);
          if (updatedJob) {
            setLogModal((prev) => ({ ...prev, job: updatedJob }));
          }
        }
      } else {
        setLatestRun(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
    fetchRuns();
  }, [id]);

  useEffect(() => {
    if (latestRun && isRunning(latestRun.status)) {
      pollRef.current = setInterval(() => {
        fetchRuns();
        fetchPipeline();
      }, 2000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [latestRun?.status, logModal.open]);

  const handleRun = async () => {
    try {
      await triggerPipelineRun(Number(id));
      message.success('已触发运行');
      setActiveTab('latest');
      fetchRuns();
    } catch {
      /* surfaced */
    }
  };

  const openLogModal = (job: any) => {
    const firstStep = job.steps?.[0];
    setLogModal({ open: true, job, selectedStepId: firstStep?.id ?? null });
  };

  const selectedStep = useMemo(() => {
    if (!logModal.job || logModal.selectedStepId == null) return null;
    return logModal.job.steps?.find((s: any) => s.id === logModal.selectedStepId) ?? null;
  }, [logModal]);

  const totalElapsedMs = useMemo(() => {
    if (!latestRun?.jobs?.length) return 0;
    return latestRun.jobs.reduce((sum: number, j: any) => sum + (j.elapsed_ms || 0), 0);
  }, [latestRun]);

  const renderLatestRun = () => {
    if (!latestRun) {
      return (
        <Card className='rounded-2xl border-fc-200'>
          <Empty description='暂无运行记录，点击右上角运行按钮触发流水线' />
        </Card>
      );
    }
    return (
      <>
        <Card className='mb-4 rounded-2xl border-fc-200'>
          <div className='mb-4 flex flex-wrap items-center gap-x-6 gap-y-2'>
            <Space size={8}>
              <span className='text-base font-semibold text-title'>#{latestRun.run_no}</span>
              <StatusIcon status={latestRun.status} />
              <Tag color={STATUS_COLOR[latestRun.status] || 'default'}>
                {STATUS_LABEL[latestRun.status] || latestRun.status}
              </Tag>
            </Space>
            <Space size={4} className='text-secondary text-sm'>
              <span>{latestRun.operator}</span>
              <span>·</span>
              <span>{TRIGGER_LABEL[latestRun.trigger_type] || latestRun.trigger_type}</span>
            </Space>
            {latestRun.start_at > 0 && (
              <span className='text-secondary text-sm'>
                开始 {moment.unix(latestRun.start_at).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            )}
          </div>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
            <Statistic title='运行编号' value={`#${latestRun.run_no}`} />
            <Statistic title='总耗时' value={fmtElapsed(totalElapsedMs)} />
            <Statistic title='阶段数' value={latestRun.jobs?.length || 0} />
            <Statistic
              title='成功步骤'
              value={`${countStep(latestRun, 'SUCCESS')}/${countStep(latestRun, 'all')}`}
            />
          </div>
        </Card>

        <Card title='阶段执行' className='rounded-2xl border-fc-200'>
          {!latestRun.jobs?.length && <Empty description='无阶段数据' />}
          {latestRun.jobs?.map((job: any) => (
            <div
              key={job.id}
              className='mb-3 flex items-center justify-between rounded-lg border border-fc-200 bg-[var(--fc-fill-1)] p-4 last:mb-0 hover:border-[#1677ff]'
            >
              <Space size={16} className='flex-1'>
                <StatusIcon status={job.status} className='text-lg' />
                <div className='flex flex-col'>
                  <span className='font-medium text-title'>
                    {job.stage_name} / {job.job_name}
                  </span>
                  <span className='mt-0.5 text-xs text-secondary'>
                    {job.steps?.length || 0} 个步骤 · 耗时 {fmtElapsed(job.elapsed_ms)}
                  </span>
                </div>
              </Space>
              <Space>
                <Tag color={STATUS_COLOR[job.status] || 'default'}>
                  {STATUS_LABEL[job.status] || job.status}
                </Tag>
                <Button type='link' icon={<FileTextOutlined />} onClick={() => openLogModal(job)}>
                  日志
                </Button>
              </Space>
            </div>
          ))}
        </Card>
      </>
    );
  };

  const renderHistory = () => (
    <Card className='rounded-2xl border-fc-200'>
      <Table
        rowKey='id'
        size='small'
        dataSource={runs}
        pagination={false}
        columns={[
          {
            title: '运行编号',
            dataIndex: 'run_no',
            width: 100,
            render: (v: number) => <span className='font-medium'>#{v}</span>,
          },
          {
            title: '状态',
            dataIndex: 'status',
            width: 110,
            render: (v: string) => (
              <Space size={6}>
                <StatusIcon status={v} />
                <Tag color={STATUS_COLOR[v] || 'default'}>{STATUS_LABEL[v] || v}</Tag>
              </Space>
            ),
          },
          {
            title: '触发信息',
            width: 240,
            render: (_, r: any) => `${r.operator || '-'} · ${TRIGGER_LABEL[r.trigger_type] || r.trigger_type}`,
          },
          {
            title: '开始时间',
            dataIndex: 'start_at',
            width: 180,
            render: (v: number) => (v ? moment.unix(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
          },
          {
            title: '耗时',
            dataIndex: 'elapsed_ms',
            width: 100,
            render: (v: number) => fmtElapsed(v),
          },
          {
            title: '操作',
            fixed: 'right',
            width: 100,
            render: (_, r: any) => (
              <Button
                type='link'
                size='small'
                onClick={async () => {
                  const detail = await getPipelineRunDetail(r.id);
                  setLatestRun(detail);
                  setActiveTab('latest');
                }}
              >
                查看详情
              </Button>
            ),
          },
        ]}
      />
    </Card>
  );

  return (
    <PageLayout
      title={
        <Space>
          <Button type='text' icon={<ArrowLeftOutlined />} onClick={() => history.push(PATHS.pipelines)} />
          <span>{pipeline?.name || `流水线 #${id}`}</span>
        </Space>
      }
    >
      <div className='fc-page n9e'>
        <Card className='mb-4 rounded-2xl border-fc-200'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <Space size={16}>
              <span className='text-lg font-semibold text-title'>{pipeline?.name}</span>
              {pipeline?.latest_status && (
                <Space size={6}>
                  <StatusIcon status={pipeline.latest_status} />
                  <Tag color={STATUS_COLOR[pipeline.latest_status] || 'default'}>
                    {STATUS_LABEL[pipeline.latest_status] || pipeline.latest_status}
                  </Tag>
                  <span className='text-secondary text-sm'>最近 #{pipeline.latest_run_no}</span>
                </Space>
              )}
              {latestRun && isRunning(latestRun.status) && (
                <Space size={4} className='text-[#1677ff] text-sm'>
                  <LoadingOutlined />
                  <span>实时刷新中</span>
                </Space>
              )}
            </Space>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchRuns} loading={loading}>
                刷新
              </Button>
              <Button icon={<PlayCircleOutlined />} type='primary' onClick={handleRun}>
                运行
              </Button>
              <Button icon={<CodeOutlined />} onClick={() => history.push(`${PATHS.pipelines}/${id}/edit`)}>
                编辑
              </Button>
            </Space>
          </div>
        </Card>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane key='latest' tab='最近运行'>
            {renderLatestRun()}
          </Tabs.TabPane>
          <Tabs.TabPane key='history' tab={`运行历史 (${runs.length})`}>
            {renderHistory()}
          </Tabs.TabPane>
          <Tabs.TabPane key='stats' tab='统计报表'>
            <Card className='rounded-2xl border-fc-200'>
              <Empty description='统计报表正在开发中' />
            </Card>
          </Tabs.TabPane>
        </Tabs>
      </div>

      <Modal
        title={
          <Space>
            <span>{logModal.job ? `${logModal.job.stage_name} / ${logModal.job.job_name}` : '日志'}</span>
            {logModal.job && (
              <Tag color={STATUS_COLOR[logModal.job.status] || 'default'}>
                {STATUS_LABEL[logModal.job.status] || logModal.job.status}
              </Tag>
            )}
          </Space>
        }
        visible={logModal.open}
        onCancel={() => setLogModal({ open: false, job: null, selectedStepId: null })}
        footer={null}
        width={960}
        bodyStyle={{ padding: 0, height: 520 }}
        destroyOnClose
      >
        <div className='flex h-full'>
          <div className='w-60 shrink-0 overflow-auto border-r border-fc-200 bg-[var(--fc-fill-1)] p-2'>
            <div className='mb-2 px-2 pt-1 text-xs uppercase text-secondary'>步骤</div>
            {logModal.job?.steps?.map((step: any) => (
              <div
                key={step.id}
                onClick={() => setLogModal((prev) => ({ ...prev, selectedStepId: step.id }))}
                className={`mb-1 cursor-pointer rounded p-2 text-sm transition-colors ${
                  logModal.selectedStepId === step.id
                    ? 'bg-[#1677ff]/10 text-[#1677ff]'
                    : 'hover:bg-[var(--fc-fill-2)]'
                }`}
              >
                <div className='flex items-center gap-2'>
                  <StatusIcon status={step.status} />
                  <span className='flex-1 truncate font-medium'>{step.step_name}</span>
                </div>
                <div className='mt-1 flex items-center justify-between'>
                  <StepTypeBadge step={step} />
                  <span className='text-xs text-secondary'>{fmtElapsed(step.elapsed_ms)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className='flex flex-1 flex-col overflow-hidden bg-[#1e1e1e]'>
            {selectedStep ? (
              <>
                <div className='flex items-center justify-between border-b border-[#333] px-4 py-2 text-xs text-gray-300'>
                  <Space>
                    <span className='font-medium'>{selectedStep.step_name}</span>
                    <StepTypeBadge step={selectedStep} />
                  </Space>
                  <span>
                    {selectedStep.start_at > 0
                      ? moment.unix(selectedStep.start_at).format('HH:mm:ss')
                      : '-'}
                    {' → '}
                    {selectedStep.end_at > 0
                      ? moment.unix(selectedStep.end_at).format('HH:mm:ss')
                      : isRunning(selectedStep.status)
                      ? '运行中'
                      : '-'}
                  </span>
                </div>
                <pre className='m-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-gray-100'>
                  {selectedStep.log || (isRunning(selectedStep.status) ? '⏳ 等待日志输出...' : '(无日志)')}
                </pre>
              </>
            ) : (
              <div className='flex h-full items-center justify-center text-secondary'>请选择左侧步骤</div>
            )}
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}

function countStep(run: any, target: string) {
  if (!run?.jobs) return 0;
  let n = 0;
  for (const j of run.jobs) {
    for (const s of j.steps || []) {
      if (target === 'all' || s.status === target) n += 1;
    }
  }
  return n;
}
