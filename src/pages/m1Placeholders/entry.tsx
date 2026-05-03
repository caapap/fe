import React from 'react';
import PageLayout from '@/components/pageLayout';

interface Props {
  title: string;
}

function PlaceholderPage({ title }: Props) {
  return (
    <PageLayout title={title}>
      <div className='fc-page n9e'>
        <div className='rounded-lg border border-fc-200 bg-fc-100 px-6 py-8 text-base text-secondary'>{title}建设中，当前先完成菜单占位。</div>
      </div>
    </PageLayout>
  );
}

const NetworkDevices = () => <PlaceholderPage title='网络设备' />;
const CollectTemplates = () => <PlaceholderPage title='采集模板' />;
const HeartbeatManagement = () => <PlaceholderPage title='拨测管理' />;
const HeartbeatStatus = () => <PlaceholderPage title='拨测状态' />;
const Pingmesh = () => <PlaceholderPage title='PING Mesh' />;

export default {
  routes: [
    {
      path: '/network-devices',
      component: NetworkDevices,
      exact: true,
    },
    {
      path: '/collect-templates',
      component: CollectTemplates,
      exact: true,
    },
    {
      path: '/heartbeat-mgmt',
      component: HeartbeatManagement,
      exact: true,
    },
    {
      path: '/heartbeat-status',
      component: HeartbeatStatus,
      exact: true,
    },
    {
      path: '/pingmesh',
      component: Pingmesh,
      exact: true,
    },
  ],
};
