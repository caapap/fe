import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Badge, Button, Drawer, Progress, Table, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { DeployTaskHostResult, getDeployRunHosts } from '../../services';

interface Props {
  runId: number;
  onBack: () => void;
}

const STEP_KEYS = ['connect', 'upload', 'extract', 'render', 'systemd', 'verify'] as const;

const terminal = (status: string) => status === 'success' || status === 'failed';

export default function RunView({ runId, onBack }: Props) {
  const { t } = useTranslation('hosts');
  const [hosts, setHosts] = useState<DeployTaskHostResult[]>([]);
  const [logHost, setLogHost] = useState<DeployTaskHostResult | null>(null);
  const pollingRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const list = await getDeployRunHosts(runId);
        if (cancelled) return;
        setHosts(list);
        // Stop polling once every host is in a terminal state.
        if (list.length > 0 && list.every((h) => terminal(h.status))) {
          window.clearInterval(pollingRef.current);
          pollingRef.current = undefined;
        }
      } catch {
        // keep polling — network blips shouldn't kill the view
      }
    };
    void tick();
    pollingRef.current = window.setInterval(tick, 1500);
    return () => {
      cancelled = true;
      if (pollingRef.current) window.clearInterval(pollingRef.current);
    };
  }, [runId]);

  // If the currently-opened log drawer's host got updated by the poll, refresh it too.
  useEffect(() => {
    if (!logHost) return;
    const fresh = hosts.find((h) => h.id === logHost.id);
    if (fresh && fresh !== logHost) setLogHost(fresh);
  }, [hosts, logHost]);

  const summary = useMemo(() => {
    const s = { success: 0, failed: 0, running: 0, pending: 0, total: hosts.length };
    hosts.forEach((h) => {
      s[h.status as keyof typeof s] = (s[h.status as keyof typeof s] ?? 0) + 1;
    });
    return s;
  }, [hosts]);

  const progressPercent = summary.total === 0 ? 0 : Math.round(((summary.success + summary.failed) / summary.total) * 100);

  const statusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'processing';
      default:
        return 'default';
    }
  };

  const statusLabel = (status: string) => t(`deploy_agent.run.status_${status}` as any, status);

  const stepIndex = (step: string) => STEP_KEYS.indexOf(step as (typeof STEP_KEYS)[number]);

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <Button type='text' size='small' icon={<ArrowLeftOutlined />} onClick={onBack}>
          {t('deploy_agent.run.back_to_form')}
        </Button>
      </div>

      <Alert
        type='info'
        showIcon
        message={t('deploy_agent.run.progress_summary', summary)}
        description={<Progress percent={progressPercent} size='small' />}
      />

      <Table<DeployTaskHostResult>
        dataSource={hosts}
        rowKey='id'
        size='small'
        pagination={false}
        columns={[
          {
            title: t('deploy_agent.table.host'),
            dataIndex: 'host',
            width: 180,
          },
          {
            title: t('deploy_agent.table.ssh_user'),
            width: 110,
            render: (_, h) => `${h.ssh_user}@:${h.ssh_port}`,
          },
          {
            title: 'Status',
            width: 120,
            render: (_, h) => <Badge status={statusColor(h.status) as any} text={statusLabel(h.status)} />,
          },
          {
            title: 'Step',
            render: (_, h) => {
              if (h.status === 'pending') return <Tag>—</Tag>;
              const idx = stepIndex(h.current_step);
              return (
                <div className='flex gap-1'>
                  {STEP_KEYS.map((k, i) => {
                    let color: string | undefined;
                    if (h.status === 'failed' && i === idx) color = 'red';
                    else if (i < idx || (i === idx && h.status === 'success')) color = 'green';
                    else if (i === idx) color = 'blue';
                    return (
                      <Tag key={k} color={color}>
                        {t(`deploy_agent.run.step_${k}` as any)}
                      </Tag>
                    );
                  })}
                </div>
              );
            },
          },
          {
            title: '',
            width: 100,
            render: (_, h) => (
              <Button size='small' type='link' onClick={() => setLogHost(h)}>
                {t('deploy_agent.run.view_logs')}
              </Button>
            ),
          },
        ]}
      />

      <Drawer
        title={logHost ? `${logHost.host} — ${statusLabel(logHost.status)}` : ''}
        visible={!!logHost}
        onClose={() => setLogHost(null)}
        width={720}
        destroyOnClose
      >
        {logHost ? (
          <div className='flex flex-col gap-2'>
            {logHost.error_msg ? <Alert type='error' showIcon message={logHost.error_msg} /> : null}
            <pre className='bg-bg-elevated rounded p-3 text-xs leading-5 whitespace-pre-wrap break-all max-h-[70vh] overflow-auto m-0'>
              {logHost.logs || t('deploy_agent.run.no_logs')}
            </pre>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
