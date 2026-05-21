import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Space, Tag, Timeline, message } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, PlayCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';

import PageLayout from '@/components/pageLayout';

import { PATHS } from '../constants';
import { Pipeline, getPipelines, getPipelineRunDetail, getPipelineRuns, triggerPipelineRun } from '../services';

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

function StatusIcon({ status }: { status: string }) {
  if (status === 'RUNNING' || status === 'PENDING') {
    return <SyncOutlined spin className='text-[#1677ff]' />;
  }
  if (status === 'SUCCESS') {
    return <CheckCircleOutlined className='text-[#52c41a]' />;
  }
  if (status === 'FAILED') {
    return <CloseCircleOutlined className='text-[#ff4d4f]' />;
  }
  return null;
}

function isRunning(status: string) {
  return status === 'RUNNING' || status === 'PENDING';
}

export default function PipelineDetail() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [latestRun, setLatestRun] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPipeline = async () => {
    const res = await getPipelines({ page: 1, limit: 100, query: undefined });
    const found = res.list?.find((p) => p.id === Number(id));
    if (found) setPipeline(found);
  };

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await getPipelineRuns(Number(id), { limit: 10 });
      setRuns(res.list || []);
      if (res.list?.length) {
        const detail = await getPipelineRunDetail(res.list[0].id);
        setLatestRun(detail);
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
      }, 3000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [latestRun?.status]);

  const handleRun = async () => {
    try {
      await triggerPipelineRun(Number(id));
      message.success('已触发运行');
      fetchRuns();
    } catch {
      /* surfaced by request() */
    }
  };

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
          <div className='flex items-center justify-between'>
            <Space size={16}>
              <span className='text-lg font-semibold text-title'>{pipeline?.name}</span>
              {pipeline?.latest_status && (
                <Space size={6}>
                  <StatusIcon status={pipeline.latest_status} />
                  <Tag color={STATUS_COLOR[pipeline.latest_status] || 'default'}>
                    {STATUS_LABEL[pipeline.latest_status] || pipeline.latest_status}
                  </Tag>
                </Space>
              )}
            </Space>
            <Space>
              <Button icon={<PlayCircleOutlined />} type='primary' onClick={handleRun}>
                运行
              </Button>
              <Button onClick={() => history.push(`${PATHS.pipelines}/${id}/edit`)}>编辑</Button>
            </Space>
          </div>
        </Card>

        {latestRun && (
          <Card
            title={
              <Space>
                <span>最近运行详情</span>
                {isRunning(latestRun.status) && <LoadingOutlined className='text-[#1677ff]' />}
              </Space>
            }
            className='mb-4 rounded-2xl border-fc-200'
            loading={loading && !latestRun}
          >
            <div className='mb-4 flex items-center gap-4 text-sm text-secondary'>
              <span className='font-medium text-title'>Run #{latestRun.run_no}</span>
              <Space size={6}>
                <StatusIcon status={latestRun.status} />
                <Tag color={STATUS_COLOR[latestRun.status] || 'default'}>
                  {STATUS_LABEL[latestRun.status] || latestRun.status}
                </Tag>
              </Space>
              <span>{latestRun.operator} · {latestRun.trigger_type}</span>
              {latestRun.start_at > 0 && (
                <span>{moment.unix(latestRun.start_at).format('YYYY-MM-DD HH:mm:ss')}</span>
              )}
            </div>
            {latestRun.jobs?.map((job: any) => (
              <Card key={job.id} size='small' className='mb-2'
                title={
                  <Space>
                    <StatusIcon status={job.status} />
                    <span>{job.stage_name} / {job.job_name}</span>
                  </Space>
                }
                extra={<Tag color={STATUS_COLOR[job.status] || 'default'}>{STATUS_LABEL[job.status] || job.status}</Tag>}
              >
                {job.steps?.map((step: any) => (
                  <div
                    key={step.id}
                    className={`mb-2 rounded p-2 ${isRunning(step.status) ? 'animate-pulse bg-blue-50 dark:bg-blue-950/20' : ''}`}
                  >
                    <div className='flex items-center gap-2 text-sm'>
                      <StatusIcon status={step.status} />
                      <span className='font-medium'>{step.step_name}</span>
                      <span className='text-secondary'>{step.step_type}</span>
                      {isRunning(step.status) && (
                        <span className='text-xs text-[#1677ff]'>执行中...</span>
                      )}
                    </div>
                    {step.log && (
                      <pre className='mt-1 max-h-48 overflow-auto rounded bg-[var(--fc-fill-2)] p-2 text-xs'>
                        {step.log}
                      </pre>
                    )}
                  </div>
                ))}
              </Card>
            ))}
          </Card>
        )}

        <Card title='运行历史' className='rounded-2xl border-fc-200'>
          <Timeline>
            {runs.map((run: any) => (
              <Timeline.Item key={run.id} color={STATUS_COLOR[run.status] || 'gray'}>
                <Space>
                  <StatusIcon status={run.status} />
                  <span>Run #{run.run_no}</span>
                  <Tag color={STATUS_COLOR[run.status] || 'default'}>{STATUS_LABEL[run.status] || run.status}</Tag>
                  <span className='text-secondary'>{run.operator}</span>
                  {run.start_at > 0 && (
                    <span className='text-secondary'>{moment.unix(run.start_at).format('MM-DD HH:mm')}</span>
                  )}
                </Space>
              </Timeline.Item>
            ))}
            {!runs.length && <Timeline.Item color='gray'>暂无运行记录</Timeline.Item>}
          </Timeline>
        </Card>
      </div>
    </PageLayout>
  );
}
