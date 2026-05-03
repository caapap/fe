import React, { useEffect, useState } from 'react';
import { Drawer, Table, Tag, Spin, Alert, Button, Space, Collapse, Input } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getTryrunResult } from '../services';
import { NS } from '../constants';

const { Panel } = Collapse;

interface TestResultModalProps {
  visible: boolean;
  uuid: string;
  onClose: () => void;
}

interface MetricData {
  ident?: string;
  metric: string;
  tags: string;
  value: number;
  ts: number;
}

interface ResultItem {
  ident: string;
  status: string;
  data: MetricData[];
  log?: string;
}

export default function TestResultModal({ visible, uuid, onClose }: TestResultModalProps) {
  const { t } = useTranslation(NS);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [polling, setPolling] = useState(true);
  const [metricSearchText, setMetricSearchText] = useState('');
  const [tagSearchText, setTagSearchText] = useState('');

  const fetchResults = async () => {
    try {
      setLoading(true);
      const data = await getTryrunResult(uuid);
      setResults(data);

      // 检查是否所有机器都已返回结果
      const allCompleted = data.every((item: ResultItem) => item.status !== 'pending');
      if (allCompleted) {
        setPolling(false);
      }
    } catch (error) {
      console.error('Failed to fetch tryrun results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible || !uuid) {
      return;
    }

    let timer: NodeJS.Timeout;

    fetchResults();

    // 轮询查询结果（每 2 秒一次，最多 30 秒）
    if (polling) {
      timer = setInterval(fetchResults, 2000);
      setTimeout(() => {
        setPolling(false);
      }, 30000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [visible, uuid, polling]);

  // 汇总所有机器的指标数据
  const allMetrics = results.flatMap((result) =>
    result.data.map((metric) => ({
      ...metric,
      ident: result.ident,
    }))
  );

  // 过滤指标数据
  const filteredMetrics = allMetrics.filter((metric) => {
    const matchMetric = !metricSearchText || metric.metric.toLowerCase().includes(metricSearchText.toLowerCase());
    const matchTag = !tagSearchText || metric.tags.toLowerCase().includes(tagSearchText.toLowerCase());
    return matchMetric && matchTag;
  });

  const metricColumns = [
    {
      title: t('test_result_metric_name'),
      dataIndex: 'metric',
      key: 'metric',
      width: 200,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={t('common:search_placeholder')}
            value={metricSearchText}
            onChange={(e) => setMetricSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </div>
      ),
      filterIcon: () => <SearchOutlined style={{ color: metricSearchText ? '#1890ff' : undefined }} />,
    },
    {
      title: t('test_result_tags'),
      dataIndex: 'tags',
      key: 'tags',
      ellipsis: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={t('common:search_placeholder')}
            value={tagSearchText}
            onChange={(e) => setTagSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </div>
      ),
      filterIcon: () => <SearchOutlined style={{ color: tagSearchText ? '#1890ff' : undefined }} />,
    },
    {
      title: t('test_result_value'),
      dataIndex: 'value',
      key: 'value',
      width: 120,
    },
    {
      title: t('test_result_timestamp'),
      dataIndex: 'ts',
      key: 'ts',
      width: 180,
      render: (ts: number) => new Date(ts * 1000).toLocaleString(),
    },
  ];

  const totalMetrics = allMetrics.length;

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <span>{t('test_result_title')}</span>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchResults}
            loading={loading}
          >
            {t('common:btn.refresh')}
          </Button>
        </div>
      }
      placement="right"
      width={900}
      visible={visible}
      onClose={onClose}
      destroyOnClose
    >
      <Spin spinning={loading && results.length === 0}>
        {polling && (
          <Alert
            message={t('test_result_polling')}
            type="info"
            showIcon
            className="mb-4"
          />
        )}

        {results.length === 0 && !loading && (
          <Alert message={t('test_result_empty')} type="warning" showIcon />
        )}

        {results.length > 0 && (
          <div className="flex flex-col gap-4">
            <Alert
              message={t('test_result_sample_tip')}
              type="info"
              showIcon
            />

            {/* 机器标识和状态 */}
            <Collapse defaultActiveKey={results.map((_, index) => index.toString())}>
              {results.map((result, index) => {
                const statusColor = result.status === 'success' ? 'green' : result.status === 'fail' ? 'red' : 'orange';
                const statusText = result.status === 'success' ? t('test_result_success') : result.status === 'fail' ? t('test_result_fail') : t('test_result_pending');
                const metricCount = result.data.length;

                return (
                  <Panel
                    key={index.toString()}
                    header={
                      <div className="flex items-center justify-between">
                        <Space>
                          <span className="font-medium">{t('test_result_machine_ident')}</span>
                          <span>{result.ident}</span>
                        </Space>
                        <Space>
                          <span className="font-medium">{t('test_result_status')}</span>
                          <Tag color={statusColor}>{statusText}</Tag>
                          {result.status === 'success' && (
                            <span className="text-xs text-secondary">
                              {t('test_result_collected_count', { count: metricCount })}
                            </span>
                          )}
                        </Space>
                      </div>
                    }
                  >
                    {/* 日志部分 */}
                    {result.log && (
                      <div className="mb-4">
                        <div className="text-xs font-medium text-secondary mb-2">{t('test_result_log')}</div>
                        <pre className="rounded bg-[#1e1e1e] p-3 font-mono text-xs text-[#d4d4d4] overflow-x-auto max-h-60">
                          {result.log}
                        </pre>
                      </div>
                    )}

                    {result.status === 'fail' && (!result.data || result.data.length === 0) && (
                      <Alert message={t('test_result_no_data')} type="warning" showIcon />
                    )}
                  </Panel>
                );
              })}
            </Collapse>

            {/* 指标表格 */}
            {totalMetrics > 0 && (
              <div>
                <div className="text-xs font-medium text-secondary mb-2">
                  {t('test_result_metrics')} ({totalMetrics} {t('test_result_metrics_unit')})
                </div>
                <Table
                  size="small"
                  dataSource={filteredMetrics}
                  columns={metricColumns}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `${t('common:table.total')} ${total} ${t('test_result_metrics_unit')}`,
                  }}
                  rowKey={(record, index) => `${record.metric}-${index}`}
                  scroll={{ x: 800 }}
                />
              </div>
            )}
          </div>
        )}
      </Spin>
    </Drawer>
  );
}
