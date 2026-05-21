import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Modal, Space, Table, Tag, Tooltip, Input, message } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

import PageLayout from '@/components/pageLayout';

import { PATHS } from '../constants';
import { Pipeline, deletePipeline, getPipelines, triggerPipelineRun } from '../services';

const STATUS_TAG_MAP: Record<string, { color: string; label: string }> = {
  SUCCESS: { color: 'success', label: '成功' },
  FAILED: { color: 'error', label: '失败' },
  RUNNING: { color: 'processing', label: '运行中' },
  PENDING: { color: 'warning', label: '排队中' },
  CANCELED: { color: 'default', label: '已取消' },
};

const TRIGGER_LABEL: Record<string, string> = {
  MANUAL: '手动触发',
  WEBHOOK: 'Webhook',
  SCHEDULE: '定时触发',
  ALERT: '告警联动',
};

export default function Pipelines() {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Pipeline[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchData = async (p = page, query = searchKeyword) => {
    setLoading(true);
    try {
      const res = await getPipelines({ page: p, limit: 20, query: query || undefined });
      setList(res.list || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleRun = async (record: Pipeline) => {
    try {
      await triggerPipelineRun(record.id);
      message.success(`流水线「${record.name}」已触发运行`);
      fetchData();
    } catch {
      /* request() already surfaced */
    }
  };

  const handleDelete = (record: Pipeline) => {
    Modal.confirm({
      title: '确定删除？',
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      content: `确定要删除流水线「${record.name}」吗？删除后不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await deletePipeline(record.id);
        message.success('已删除');
        fetchData();
      },
    });
  };

  const columns: ColumnsType<Pipeline> = [
    {
      title: '流水线名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <a onClick={() => history.push(`${PATHS.pipelines}/${record.id}`)} className='font-medium'>
          {name}
        </a>
      ),
    },
    {
      title: '最近运行',
      key: 'latest_status',
      width: 100,
      render: (_, record) => {
        if (!record.latest_status) return <span className='text-secondary'>-</span>;
        const tag = STATUS_TAG_MAP[record.latest_status] || { color: 'default', label: record.latest_status };
        return <Tag color={tag.color}>{tag.label}</Tag>;
      },
    },
    {
      title: '触发方式',
      key: 'latest_trigger',
      width: 100,
      render: (_, record) => {
        if (!record.latest_trigger) return '-';
        return TRIGGER_LABEL[record.latest_trigger] || record.latest_trigger;
      },
    },
    {
      title: '操作者',
      dataIndex: 'latest_operator',
      key: 'latest_operator',
      width: 100,
      render: (v: string) => v || '-',
    },
    {
      title: '最近运行时间',
      key: 'latest_start_at',
      width: 170,
      sorter: (a, b) => (a.latest_start_at || 0) - (b.latest_start_at || 0),
      defaultSortOrder: 'descend',
      render: (_, record) =>
        record.latest_start_at ? moment.unix(record.latest_start_at).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title='运行'>
            <Button type='text' size='small' icon={<PlayCircleOutlined />} onClick={() => handleRun(record)} />
          </Tooltip>
          <Tooltip title='编辑'>
            <Button
              type='text'
              size='small'
              icon={<EditOutlined />}
              onClick={() => history.push(`${PATHS.pipelines}/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title='删除'>
            <Button type='text' size='small' danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <PageLayout title='部署流水线'>
      <div className='fc-page n9e'>
        <Card className='mb-4 rounded-2xl border-fc-200'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='min-w-0 flex-1'>
              <div className='text-lg font-semibold text-title'>流水线列表</div>
            </div>
            <div className='flex shrink-0 items-center gap-2'>
              <Input
                allowClear
                prefix={<SearchOutlined className='text-secondary' />}
                placeholder='搜索流水线名称'
                style={{ width: 220 }}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onPressEnter={() => { setPage(1); fetchData(1, searchKeyword); }}
              />
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => history.push(`${PATHS.pipelines}/new`)}
              >
                新建流水线
              </Button>
            </div>
          </div>
        </Card>

        <Card className='rounded-2xl border-fc-200'>
          <Table<Pipeline>
            rowKey='id'
            size='small'
            loading={loading}
            columns={columns}
            dataSource={list}
            pagination={{
              current: page,
              pageSize: 20,
              total,
              showSizeChanger: false,
              onChange: (p) => { setPage(p); fetchData(p); },
            }}
          />
        </Card>
      </div>
    </PageLayout>
  );
}
