import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Descriptions,
  Drawer,
  Input,
  Modal,
  Popover,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { DownloadOutlined, EditOutlined, ExclamationCircleOutlined, LinkOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

import { CommonStateContext } from '@/App';

import { ArtifactPackageGroup, LAST_DOWNLOAD_TIME_TOOLTIP, formatBytes } from '../utils/artifact';
import {
  addTagToCatalog,
  appendActivity,
  getGroupTags,
  getTagCatalog,
  getVersionState,
  markVersionDeleted,
  saveGroupTags,
  setVersionState,
} from '../utils/artifactStore';

const { Text } = Typography;

interface MetadataItem {
  key: string;
  value: string;
}

interface Props {
  open: boolean;
  group: ArtifactPackageGroup | null;
  onClose: () => void;
  onVersionDeleted?: (packageId: number) => void;
  onActivity?: () => void;
}

function metadataStorageKey(groupKey: string) {
  return `stellar-artifact-metadata:${groupKey}`;
}

function loadMetadata(groupKey: string): MetadataItem[] {
  try {
    const raw = localStorage.getItem(metadataStorageKey(groupKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMetadata(groupKey: string, items: MetadataItem[]) {
  localStorage.setItem(metadataStorageKey(groupKey), JSON.stringify(items));
}

function triggerBrowserDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || '';
  a.rel = 'noopener noreferrer';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function ArtifactDetailDrawer({ open, group, onClose, onVersionDeleted, onActivity }: Props) {
  const { profile } = useContext(CommonStateContext);
  const operator = profile?.username || 'unknown';

  const [activeVersionId, setActiveVersionId] = useState<number>();
  const [tab, setTab] = useState('file');
  const [metadata, setMetadata] = useState<MetadataItem[]>([]);
  const [versionDesc, setVersionDesc] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [groupTags, setGroupTags] = useState<string[]>([]);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [disableReason, setDisableReason] = useState('');
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [pendingDisable, setPendingDisable] = useState(false);

  const tagCatalog = useMemo(() => getTagCatalog(), [tagPopoverOpen, groupTags]);

  useEffect(() => {
    if (!group) return;
    setActiveVersionId(group.latest.id);
    setTab('file');
    setMetadata(loadMetadata(group.key));
    setGroupTags(getGroupTags(group.key));
    setVersionDesc('');
    setEditingDesc(false);
    setTagPopoverOpen(false);
    setTagSearch('');
  }, [group?.key, open]);

  const activeVersion = useMemo(() => {
    if (!group) return undefined;
    return group.versions.find((v) => v.id === activeVersionId) || group.latest;
  }, [group, activeVersionId]);

  useEffect(() => {
    if (!activeVersion) return;
    const state = getVersionState(activeVersion.id);
    setDisabled(state.disabled);
    setDisableReason(state.reason || '');
  }, [activeVersion?.id]);

  if (!group || !activeVersion) {
    return (
      <Drawer visible={open} onClose={onClose} width={920} destroyOnClose title='制品详情'>
        <div className='text-secondary'>未选择制品</div>
      </Drawer>
    );
  }

  const totalDownloads = '-';
  const lastDownloadDisplay = activeVersion.created_at
    ? moment.unix(activeVersion.created_at).format('YYYY-MM-DD HH:mm:ss')
    : '-';

  const handleTagsChange = (tags: string[]) => {
    setGroupTags(tags);
    saveGroupTags(group.key, tags);
    tags.forEach((t) => addTagToCatalog(t));
  };

  const handleAddMetadata = () => {
    setMetadata((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleMetadataChange = (index: number, field: 'key' | 'value', value: string) => {
    setMetadata((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleMetadataBlur = () => {
    const cleaned = metadata.filter((item) => item.key.trim() || item.value.trim());
    setMetadata(cleaned);
    saveMetadata(group.key, cleaned);
  };

  const logAndNotify = (type: Parameters<typeof appendActivity>[0]['type'], reason?: string) => {
    appendActivity({
      type,
      artifactName: group.displayName,
      version: activeVersion.version,
      operator,
      reason,
    });
    onActivity?.();
  };

  const handleDownloadVersion = () => {
    triggerBrowserDownload(activeVersion.download_url, parseArtifactFilename(activeVersion.name));
    logAndNotify('download');
    message.success('已开始下载');
  };

  const handleDeleteVersion = () => {
    Modal.confirm({
      title: '确定删除？',
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      content: '确定要删除此版本吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        markVersionDeleted(activeVersion.id);
        logAndNotify('delete');
        onVersionDeleted?.(activeVersion.id);
        message.success('已删除此版本（本地记录，后端删除接口待接入）');
        onClose();
      },
    });
  };

  const handleDisableSwitch = (checked: boolean) => {
    if (checked) {
      setPendingDisable(true);
      setDisableModalOpen(true);
      return;
    }
    setVersionState(activeVersion.id, { disabled: false });
    setDisabled(false);
    setDisableReason('');
    logAndNotify('enable');
    message.success('已启用制品');
  };

  const confirmDisable = () => {
    const reason = disableReason.trim();
    if (!reason) {
      message.warning('请填写禁用原因');
      return;
    }
    setVersionState(activeVersion.id, { disabled: true, reason });
    setDisabled(true);
    setDisableModalOpen(false);
    setPendingDisable(false);
    logAndNotify('disable', reason);
    message.success('已禁用此版本');
  };

  const cancelDisableModal = () => {
    setDisableModalOpen(false);
    setPendingDisable(false);
    setDisabled(false);
  };

  const versionOptions = group.versions.map((v, index) => ({
    label: (
      <Space size={6}>
        <span>{v.version}</span>
        {index === 0 ? <Tag color='blue'>latest</Tag> : null}
        {getVersionState(v.id).disabled ? <Tag color='default'>已禁用</Tag> : null}
      </Space>
    ),
    value: v.id,
  }));

  const tagSelectOptions = tagCatalog
    .filter((t) => !tagSearch || t.toLowerCase().includes(tagSearch.toLowerCase()))
    .map((t) => ({ label: t, value: t }));

  const tagPopover = (
    <div className='w-56'>
      <Select
        mode='multiple'
        showSearch
        autoFocus
        placeholder='搜索标签'
        value={groupTags}
        onChange={handleTagsChange}
        onSearch={setTagSearch}
        filterOption={false}
        notFoundContent='无选项'
        options={tagSelectOptions}
        style={{ width: '100%' }}
        dropdownStyle={{ maxHeight: 200 }}
      />
      <div className='mt-2 text-xs text-secondary'>可在下方输入新标签名后回车加入目录</div>
      <Input
        size='small'
        className='mt-2'
        placeholder='新标签，回车添加'
        onPressEnter={(e) => {
          const v = (e.target as HTMLInputElement).value.trim();
          if (!v) return;
          addTagToCatalog(v);
          if (!groupTags.includes(v)) handleTagsChange([...groupTags, v]);
          (e.target as HTMLInputElement).value = '';
        }}
      />
    </div>
  );

  return (
    <>
      <Drawer
        visible={open}
        onClose={onClose}
        width={920}
        destroyOnClose
        title={<span className='font-semibold'>{group.displayName}</span>}
      >
        <div className='grid gap-6 pb-16 lg:grid-cols-[240px_minmax(0,1fr)]'>
          <div className='rounded-xl border border-fc-200 bg-fc-50 p-4 dark:bg-[rgba(15,23,42,0.35)]'>
            <div className='mb-4 text-sm font-semibold text-title'>制品信息</div>
            <Descriptions column={1} size='small' colon={false} labelStyle={{ color: 'var(--fc-text-3)', width: 96 }}>
              <Descriptions.Item label='版本总数'>{group.versionCount}</Descriptions.Item>
              <Descriptions.Item label='下载总数'>{totalDownloads}</Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space size={4}>
                    <span>最近下载时间</span>
                    <Tooltip title={LAST_DOWNLOAD_TIME_TOOLTIP}>
                      <QuestionCircleOutlined className='text-secondary' />
                    </Tooltip>
                  </Space>
                }
              >
                {lastDownloadDisplay}
              </Descriptions.Item>
              <Descriptions.Item label='存储大小'>{formatBytes(group.totalSize)}</Descriptions.Item>
            </Descriptions>
            <div className='mt-4 border-t border-fc-200 pt-4'>
              <div className='mb-2 text-xs text-secondary'>制品标签</div>
              <div className='mb-2 flex flex-wrap gap-1'>
                {groupTags.map((t) => (
                  <Tag key={t} closable onClose={() => handleTagsChange(groupTags.filter((x) => x !== t))}>
                    {t}
                  </Tag>
                ))}
              </div>
              <Popover
                content={tagPopover}
                title={null}
                trigger='click'
                visible={tagPopoverOpen}
                onVisibleChange={setTagPopoverOpen}
                placement='bottomLeft'
              >
                <Button type='link' size='small' icon={<PlusOutlined />} className='px-0'>
                  添加标签
                </Button>
              </Popover>
            </div>
          </div>

          <div className='flex min-h-[420px] flex-col rounded-xl border border-fc-200'>
            <div className='border-b border-fc-200 p-4'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <Select value={activeVersion.id} onChange={setActiveVersionId} options={versionOptions} style={{ minWidth: 180 }} />
                <Tooltip title='复制此版本下载链接'>
                  <Button
                    type='text'
                    icon={<LinkOutlined className='text-[#1677ff]' />}
                    onClick={() => {
                      if (navigator.clipboard?.writeText) {
                        navigator.clipboard.writeText(activeVersion.download_url).then(() => message.success('下载链接已复制'));
                      }
                    }}
                  />
                </Tooltip>
              </div>
            </div>

            <div className='flex-1 p-4'>
              <Tabs activeKey={tab} onChange={setTab}>
                <Tabs.TabPane tab='文件信息' key='file'>
                  <Descriptions column={1} size='small' colon={false} labelStyle={{ width: 108, color: 'var(--fc-text-3)' }}>
                    <Descriptions.Item label='推送人'>{activeVersion.created_by || '-'}</Descriptions.Item>
                    <Descriptions.Item label='推送时间'>
                      {activeVersion.created_at ? moment.unix(activeVersion.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label='MD5'>
                      <Text code copyable={{ text: activeVersion.md5 }}>
                        {activeVersion.md5 || '-'}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label='存储大小'>{formatBytes(activeVersion.size)}</Descriptions.Item>
                    <Descriptions.Item label='下载次数'>{totalDownloads}</Descriptions.Item>
                    <Descriptions.Item
                      label={
                        <Space size={4}>
                          <span>最近下载时间</span>
                          <Tooltip title={LAST_DOWNLOAD_TIME_TOOLTIP}>
                            <QuestionCircleOutlined className='text-secondary' />
                          </Tooltip>
                        </Space>
                      }
                    >
                      {lastDownloadDisplay}
                    </Descriptions.Item>
                    <Descriptions.Item label='版本描述'>
                      {editingDesc ? (
                        <Input.TextArea
                          rows={2}
                          value={versionDesc}
                          onChange={(e) => setVersionDesc(e.target.value)}
                          onBlur={() => setEditingDesc(false)}
                          placeholder='填写版本说明'
                          autoFocus
                        />
                      ) : (
                        <Space>
                          <span className='text-secondary'>{versionDesc || '没有版本描述'}</span>
                          <Button type='text' size='small' icon={<EditOutlined />} onClick={() => setEditingDesc(true)} />
                        </Space>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                  <div className='mt-4 text-xs text-secondary'>
                    直链：
                    <Text copyable={{ text: activeVersion.download_url }} className='text-xs'>
                      {activeVersion.download_url}
                    </Text>
                  </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab='元数据' key='meta'>
                  <div className='mb-3 text-sm text-secondary'>自定义元数据（当前保存在浏览器本地，后续将同步至服务端）</div>
                  <div className='space-y-3'>
                    {metadata.map((item, index) => (
                      <div key={index} className='flex gap-2'>
                        <Input
                          placeholder='参数名'
                          value={item.key}
                          onChange={(e) => handleMetadataChange(index, 'key', e.target.value)}
                          onBlur={handleMetadataBlur}
                        />
                        <Input
                          placeholder='参数值'
                          value={item.value}
                          onChange={(e) => handleMetadataChange(index, 'value', e.target.value)}
                          onBlur={handleMetadataBlur}
                        />
                      </div>
                    ))}
                  </div>
                  <Button type='link' icon={<PlusOutlined />} className='mt-2 px-0' onClick={handleAddMetadata}>
                    添加元数据
                  </Button>
                </Tabs.TabPane>
              </Tabs>
            </div>

            <div className='flex flex-wrap items-center justify-between gap-3 border-t border-fc-200 bg-fc-50 px-4 py-3 dark:bg-[rgba(15,23,42,0.2)]'>
              <Space>
                <Button type='primary' icon={<DownloadOutlined />} onClick={handleDownloadVersion} disabled={disabled}>
                  下载此版本
                </Button>
                <Button danger onClick={handleDeleteVersion}>
                  删除此版本
                </Button>
              </Space>
              <Space>
                <span className='text-sm text-secondary'>禁用制品</span>
                <Switch checked={disabled || pendingDisable} onChange={handleDisableSwitch} />
              </Space>
            </div>
          </div>
        </div>
      </Drawer>

      <Modal
        title='请填写禁用原因'
        visible={disableModalOpen}
        onOk={confirmDisable}
        onCancel={cancelDisableModal}
        okText='确定'
        cancelText='取消'
        destroyOnClose
      >
        <Input.TextArea
          rows={4}
          placeholder='请填写禁用原因'
          value={disableReason}
          onChange={(e) => setDisableReason(e.target.value)}
        />
      </Modal>
    </>
  );
}

function parseArtifactFilename(name: string) {
  const idx = name.lastIndexOf('/');
  return idx === -1 ? name : name.slice(idx + 1);
}
