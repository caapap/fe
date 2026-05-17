import React, { useMemo } from 'react';
import { Avatar, Button, Drawer, Empty, Typography } from 'antd';
import moment from 'moment';

import { ArtifactActivity, activityTypeLabel, getActivities } from '../utils/artifactStore';

const { Text } = Typography;

interface Props {
  open: boolean;
  refreshKey?: number;
  onClose: () => void;
  onViewArtifact?: (artifactName: string) => void;
}

function activityDetail(item: ArtifactActivity) {
  const base = `制品 ${item.artifactName} 版本 ${item.version}`;
  switch (item.type) {
    case 'disable':
      return `${base} 被禁用${item.reason ? `，原因：${item.reason}` : ''}`;
    case 'delete':
      return `${base} 已删除`;
    case 'upload':
      return base;
    case 'download':
      return `${base}（触发下载）`;
    case 'enable':
      return `${base} 已重新启用`;
    default:
      return base;
  }
}

export default function ArtifactActivityDrawer({ open, refreshKey = 0, onClose, onViewArtifact }: Props) {
  const activities = useMemo(() => (open ? getActivities() : []), [open, refreshKey]);

  return (
    <Drawer visible={open} onClose={onClose} width={640} destroyOnClose title='仓库动态'>
      {activities.length === 0 ? (
        <Empty description='暂无动态，上传、下载、禁用或删除制品后会记录在这里。' />
      ) : (
        <div className='space-y-0'>
          {activities.map((item) => (
            <div
              key={item.id}
              className='flex gap-3 border-b border-fc-200 py-4 last:border-b-0'
            >
              <Avatar style={{ backgroundColor: '#f56a00', flexShrink: 0 }}>{item.operator.slice(0, 2).toUpperCase()}</Avatar>
              <div className='min-w-0 flex-1'>
                <div className='text-sm text-title'>
                  <span className='font-medium'>{item.operator}</span>
                  <span className='mx-1 text-secondary'>{activityTypeLabel(item.type)}</span>
                  <span>一个制品</span>
                </div>
                <div className='mt-1 text-sm text-secondary'>{activityDetail(item)}</div>
                {onViewArtifact ? (
                  <Button type='link' size='small' className='mt-1 h-auto px-0' onClick={() => onViewArtifact(item.artifactName)}>
                    查看制品
                  </Button>
                ) : null}
              </div>
              <Text type='secondary' className='shrink-0 text-xs'>
                {moment.unix(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Text>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}
