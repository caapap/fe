import React, { useMemo } from 'react';
import { Button, InputNumber, Select, Table, Tooltip, Input } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { SSHCredential } from '../../services';

export interface TargetRow {
  key: string;
  host: string;
  ssh_user: string;
  ssh_port: number;
  credential_id?: number;
}

interface Props {
  rows: TargetRow[];
  onRowsChange: (rows: TargetRow[]) => void;
  credentials: SSHCredential[];
  onRequestNewCredential: () => void;
  preselectedIdents: string[];
}

const mkKey = () => Math.random().toString(36).slice(2, 10);

export function makeBlankRow(partial?: Partial<TargetRow>): TargetRow {
  return {
    key: mkKey(),
    host: '',
    ssh_user: 'root',
    ssh_port: 22,
    ...partial,
  };
}

// 解析 IP 段，支持格式如：10.0.1.[1-120]
function parseIpRange(input: string): string[] {
  const rangePattern = /^(.+)\[(\d+)-(\d+)\](.*)$/;
  const match = input.match(rangePattern);

  if (!match) {
    return [input];
  }

  const [, prefix, startStr, endStr, suffix] = match;
  const start = parseInt(startStr, 10);
  const end = parseInt(endStr, 10);

  if (start > end || start < 0 || end > 255) {
    return [input];
  }

  const result: string[] = [];
  for (let i = start; i <= end; i++) {
    result.push(`${prefix}${i}${suffix}`);
  }

  return result;
}

export default function TargetsEditor({
  rows,
  onRowsChange,
  credentials,
  onRequestNewCredential,
  preselectedIdents,
}: Props) {
  const { t } = useTranslation('hosts');

  const update = (key: string, patch: Partial<TargetRow>) => {
    onRowsChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const remove = (key: string) => {
    // Always keep at least one row — reset it to blank instead of empty table.
    if (rows.length <= 1) {
      onRowsChange([makeBlankRow()]);
      return;
    }
    onRowsChange(rows.filter((r) => r.key !== key));
  };

  const addRow = () => {
    onRowsChange([...rows, makeBlankRow()]);
  };

  const loadSelected = () => {
    const selectedRows = preselectedIdents.map((host) => makeBlankRow({ host }));
    // Replace anything already in the table since "load" is an authoritative action.
    onRowsChange(selectedRows.length > 0 ? selectedRows : [makeBlankRow()]);
  };

  const expandIpRanges = () => {
    const expandedRows: TargetRow[] = [];
    rows.forEach((row) => {
      if (row.host.trim()) {
        const hosts = parseIpRange(row.host.trim());
        hosts.forEach((host) => {
          expandedRows.push(makeBlankRow({
            host,
            ssh_user: row.ssh_user,
            ssh_port: row.ssh_port,
            credential_id: row.credential_id,
          }));
        });
      } else {
        expandedRows.push(row);
      }
    });
    onRowsChange(expandedRows);
  };

  const credentialOptions = useMemo(
    () =>
      credentials.map((c) => ({
        label: `${c.name} (${c.ssh_user}@:${c.ssh_port})`,
        value: c.id,
      })),
    [credentials],
  );

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-2 items-center'>
        {preselectedIdents.length > 0 ? (
          <Button onClick={loadSelected} type='link' size='small'>
            {t('deploy_agent.load_selected', { count: preselectedIdents.length })}
          </Button>
        ) : null}
        <Button onClick={addRow} type='link' size='small' icon={<PlusOutlined />}>
          {t('deploy_agent.add_row')}
        </Button>
      </div>

      <Table<TargetRow>
        dataSource={rows}
        rowKey='key'
        pagination={false}
        size='small'
        scroll={{ y: 280 }}
        columns={[
          {
            title: t('deploy_agent.table.host'),
            dataIndex: 'host',
            width: 200,
            render: (_, row) => (
              <Input
                value={row.host}
                placeholder='10.0.1.11 或 10.0.1.[1-120]'
                onChange={(e) => update(row.key, { host: e.target.value.trim() })}
                size='small'
              />
            ),
          },
          {
            title: t('deploy_agent.table.ssh_user'),
            dataIndex: 'ssh_user',
            width: 140,
            render: (_, row) => (
              <Input
                value={row.ssh_user}
                onChange={(e) => update(row.key, { ssh_user: e.target.value.trim() })}
                size='small'
              />
            ),
          },
          {
            title: t('deploy_agent.table.ssh_port'),
            dataIndex: 'ssh_port',
            width: 100,
            render: (_, row) => (
              <InputNumber
                value={row.ssh_port}
                min={1}
                max={65535}
                onChange={(v) => update(row.key, { ssh_port: Number(v) || 22 })}
                size='small'
                className='w-full'
              />
            ),
          },
          {
            title: t('deploy_agent.table.credential'),
            dataIndex: 'credential_id',
            render: (_, row) => (
              <div className='flex gap-1'>
                <Select
                  className='flex-1'
                  size='small'
                  value={row.credential_id}
                  placeholder={t('deploy_agent.table.credential_placeholder')}
                  options={credentialOptions}
                  onChange={(v) => update(row.key, { credential_id: v })}
                  allowClear
                />
                <Tooltip title={t('deploy_agent.table.new_credential')}>
                  <Button size='small' onClick={onRequestNewCredential}>
                    +
                  </Button>
                </Tooltip>
              </div>
            ),
          },
          {
            title: '',
            width: 48,
            render: (_, row) => (
              <Button
                type='text'
                size='small'
                icon={<DeleteOutlined />}
                onClick={() => remove(row.key)}
                aria-label={t('deploy_agent.table.remove')}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
