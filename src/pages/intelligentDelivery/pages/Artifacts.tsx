import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Card, Empty, Modal, Space, Table, Tag, Tooltip, message } from 'antd';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  ApiOutlined,
  HistoryOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { SortOrder } from 'antd/lib/table/interface';
import moment from 'moment';

import { CommonStateContext } from '@/App';
import PageLayout from '@/components/pageLayout';
import SmartDeliveryIcon from '@/components/SideMenu/icons/SmartDeliveryIcon';

import ArtifactActivityDrawer from '../components/ArtifactActivityDrawer';
import ArtifactDetailDrawer from '../components/ArtifactDetailDrawer';
import ArtifactApiGuideDrawer from '../components/ArtifactApiGuideDrawer';
import ArtifactSearchBar from '../components/ArtifactSearchBar';
import UploadArtifactModal from '../components/UploadArtifactModal';
import { ArtifactPackage, getArtifactPackages } from '../services';
import {
  ArtifactPackageGroup,
  LAST_DOWNLOAD_TIME_TOOLTIP,
  formatBytes,
  groupArtifactPackages,
} from '../utils/artifact';
import { appendActivity, getDeletedVersionIds, markVersionsDeleted } from '../utils/artifactStore';

import './Artifacts.less';

export default function Artifacts() {
  const { profile } = useContext(CommonStateContext);
  const [loading, setLoading] = useState(false);
  const [rawList, setRawList] = useState<ArtifactPackage[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [apiGuideOpen, setApiGuideOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<ArtifactPackageGroup | null>(null);
  const [storeTick, setStoreTick] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const bumpStore = () => setStoreTick((n) => n + 1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const list = await getArtifactPackages();
      setRawList(list);
    } catch {
      /* request() already surfaced */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const groups = useMemo(() => {
    const deleted = new Set(getDeletedVersionIds());
    const visible = rawList.filter((item) => !deleted.has(item.id));
    return groupArtifactPackages(visible);
  }, [rawList, storeTick]);

  const filteredGroups = useMemo(() => {
    const q = searchKeyword.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => {
      if (g.displayName.toLowerCase().includes(q)) return true;
      if (g.latest.version.toLowerCase().includes(q)) return true;
      if (g.versions.some((v) => v.name.toLowerCase().includes(q) || (v.md5 || '').toLowerCase().includes(q))) {
        return true;
      }
      if ((g.latest.created_by || '').toLowerCase().includes(q)) return true;
      return false;
    });
  }, [groups, searchKeyword]);

  const openDetail = (group: ArtifactPackageGroup) => {
    setActiveGroup(group);
    setDetailOpen(true);
  };

  const handleDeleteGroup = (record: ArtifactPackageGroup) => {
    Modal.confirm({
      title: '确定删除？',
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      content: '确定要删除此制品吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        markVersionsDeleted(record.versions.map((v) => v.id));
        appendActivity({
          type: 'delete',
          artifactName: record.displayName,
          version: record.latest.version,
          operator: profile?.username || 'unknown',
        });
        bumpStore();
        if (activeGroup?.key === record.key) {
          setDetailOpen(false);
          setActiveGroup(null);
        }
        message.success('已删除');
      },
    });
  };

  const isRowActionTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest('button, a, .ant-switch, input, textarea, .ant-select'));
  };

  const columns = [
    {
      title: '包名',
      dataIndex: 'displayName',
      key: 'displayName',
      onCell: () => ({ style: { cursor: 'pointer' } }),
      render: (name: string) => <span className='font-medium text-title'>{name}</span>,
    },
    {
      title: '最新版本',
      key: 'latestVersion',
      render: (_: unknown, record: ArtifactPackageGroup) => (
        <Space size={4}>
          <Tag color='blue'>{record.latest.version}</Tag>
          <Tag>latest</Tag>
        </Space>
      ),
    },
    {
      title: '最近更新时间',
      dataIndex: 'latestUpdatedAt',
      key: 'latestUpdatedAt',
      sorter: (a, b) => (a.latestUpdatedAt || 0) - (b.latestUpdatedAt || 0),
      sortDirections: ['descend', 'ascend'] as SortOrder[],
      defaultSortOrder: 'descend' as SortOrder,
      render: (ts: number) => (ts ? moment.unix(ts).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '存储大小',
      key: 'totalSize',
      render: (_: unknown, record: ArtifactPackageGroup) => formatBytes(record.totalSize),
    },
    {
      title: '版本数',
      dataIndex: 'versionCount',
      key: 'versionCount',
    },
    {
      title: '下载数',
      key: 'downloads',
      render: () => '-',
    },
    {
      title: (
        <Space size={4}>
          <span>最近下载时间</span>
          <Tooltip title={LAST_DOWNLOAD_TIME_TOOLTIP}>
            <QuestionCircleOutlined className='text-secondary' />
          </Tooltip>
        </Space>
      ),
      key: 'lastDownload',
      render: (_: unknown, record: ArtifactPackageGroup) =>
        record.latestUpdatedAt ? moment.unix(record.latestUpdatedAt).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      onCell: () => ({
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }),
      align: 'center' as const,
      width: 72,
      render: (_: unknown, record: ArtifactPackageGroup) => (
        <Tooltip title='删除制品'>
          <Button
            type='text'
            size='small'
            className='text-secondary hover:!text-[#1677ff]'
            icon={<DeleteOutlined className='text-base' />}
            aria-label='删除制品'
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteGroup(record);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <PageLayout
      title={
        <Space size={10}>
          <span>资源仓库</span>
          <Tag color='processing'>组织内可见</Tag>
        </Space>
      }
      icon={<SmartDeliveryIcon />}
    >
      <div className='fc-page n9e'>
        <Card className='mb-4 rounded-2xl border-fc-200'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='min-w-0 flex-1'>
              <div className='text-lg font-semibold text-title'>包列表</div>
            </div>
            <div className='flex shrink-0 items-center gap-2 whitespace-nowrap'>
              <ArtifactSearchBar value={searchKeyword} onChange={setSearchKeyword} />
              <span className='mx-1 h-4 w-px shrink-0 bg-fc-200' aria-hidden />
              <Button icon={<ApiOutlined />} onClick={() => setApiGuideOpen(true)}>
                API 参考
              </Button>
              <Button icon={<HistoryOutlined />} onClick={() => setActivityOpen(true)}>
                日志
              </Button>
              <Button type='primary' icon={<UploadOutlined />} onClick={() => setUploadOpen(true)}>
                上传制品
              </Button>
            </div>
          </div>
        </Card>

        <Card className='rounded-2xl border-fc-200'>
          <Table<ArtifactPackageGroup>
            className='artifacts-package-table'
            rowKey='key'
            size='small'
            showSorterTooltip={false}
            loading={loading}
            columns={columns}
            dataSource={filteredGroups}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 'max-content' }}
            onRow={(record) => ({
              onClick: (e) => {
                if (isRowActionTarget(e.target)) return;
                openDetail(record);
              },
              style: { cursor: 'pointer' },
            })}
            locale={{
              emptyText: (
                <Empty
                  description={
                    searchKeyword.trim()
                      ? `未找到与「${searchKeyword.trim()}」匹配的制品`
                      : '还没有制品，点击「上传制品」添加第一个包。'
                  }
                />
              ),
            }}
          />
        </Card>

        <UploadArtifactModal
          open={uploadOpen}
          operator={profile?.username || 'unknown'}
          onCancel={() => setUploadOpen(false)}
          onUploaded={(pkg) => {
            setUploadOpen(false);
            bumpStore();
            setRawList((prev) => {
              const next = [pkg, ...prev.filter((item) => item.id !== pkg.id)];
              const deleted = new Set(getDeletedVersionIds());
              const grouped = groupArtifactPackages(next.filter((item) => !deleted.has(item.id)));
              const matched = grouped.find((g) => g.versions.some((v) => v.id === pkg.id));
              if (matched) {
                setActiveGroup(matched);
                setDetailOpen(true);
              }
              return next;
            });
          }}
        />

        <ArtifactDetailDrawer
          open={detailOpen}
          group={activeGroup}
          onClose={() => {
            setDetailOpen(false);
            setActiveGroup(null);
          }}
          onVersionDeleted={() => bumpStore()}
          onActivity={bumpStore}
        />

        <ArtifactApiGuideDrawer open={apiGuideOpen} onClose={() => setApiGuideOpen(false)} />

        <ArtifactActivityDrawer
          open={activityOpen}
          refreshKey={storeTick}
          onClose={() => setActivityOpen(false)}
          onViewArtifact={(name) => {
            const matched = groups.find(
              (g) => g.displayName === name || g.versions.some((v) => v.name === name),
            );
            if (matched) {
              setActiveGroup(matched);
              setDetailOpen(true);
              setActivityOpen(false);
            }
          }}
        />
      </div>
    </PageLayout>
  );
}
