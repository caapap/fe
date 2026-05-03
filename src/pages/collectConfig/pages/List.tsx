import React, { useMemo, useState } from 'react';
import { Button, message, Modal, Space, Switch, Table, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import usePagination from '@/components/usePagination';
import { deleteCollectRules, getCollectRules, updateCollectRuleStatus } from '../services';
import { NS } from '../constants';
import { CollectRule } from '../types';

export default function List() {
  const { t } = useTranslation(NS);
  const history = useHistory();
  const pagination = usePagination({ PAGESIZE_KEY: NS });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { data, loading, run } = useRequest(() => getCollectRules());

  const columns = useMemo(
    () => [
      {
        title: t('rule_name'),
        dataIndex: 'name',
      },
      {
        title: t('plugin_type'),
        dataIndex: 'cate',
        render: (value: string) => <Tag color='blue'>{value}</Tag>,
      },
      {
        title: t('business_group'),
        dataIndex: 'group_id',
      },
      {
        title: t('disabled_status'),
        dataIndex: 'disabled',
        render: (value: number, record: CollectRule) => (
          <Switch
            size='small'
            checked={value === 0}
            checkedChildren={t('enabled_label')}
            unCheckedChildren={t('disabled_label')}
            onChange={(checked) => {
              updateCollectRuleStatus(record.id, checked ? 0 : 1).then(() => {
                message.success(t('status_success'));
                run();
              });
            }}
          />
        ),
      },
      {
        title: t('update_time'),
        dataIndex: 'update_at',
      },
      {
        title: t('common:table.operations'),
        render: (record: CollectRule) => (
          <Space size={4}>
            <Button size='small' type='text' icon={<EditOutlined />} onClick={() => history.push(`/collect-configs/edit/${record.id}`)} />
            <Button
              size='small'
              type='text'
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: t('common:confirm.delete'),
                  onOk: () => {
                    deleteCollectRules([record.id]).then(() => {
                      message.success(t('delete_success'));
                      setSelectedRowKeys([]);
                      run();
                    });
                  },
                });
              }}
            />
          </Space>
        ),
      },
    ],
    [history, run, t],
  );

  return (
    <PageLayout title={t('title')}>
      <div className='fc-page n9e'>
        <div className='flex flex-col gap-3'>
          <div className='fc-toolbar flex flex-wrap items-center justify-between gap-2'>
            <div />
            <Space>
              <Button
                danger
                disabled={!selectedRowKeys.length}
                onClick={() => {
                  if (!selectedRowKeys.length) {
                    message.warning(t('no_selection'));
                    return;
                  }
                  Modal.confirm({
                    title: t('common:confirm.delete'),
                    onOk: () => {
                      deleteCollectRules(selectedRowKeys as number[]).then(() => {
                        message.success(t('delete_success'));
                        setSelectedRowKeys([]);
                        run();
                      });
                    },
                  });
                }}
              >
                {t('batch_delete')}
              </Button>
              <Button type='primary' icon={<PlusOutlined />} onClick={() => history.push('/collect-configs/add')}>
                {t('add')}
              </Button>
            </Space>
          </div>
          <Table
            rowKey='id'
            size='small'
            loading={loading}
            pagination={pagination}
            dataSource={data || []}
            columns={columns}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
          />
        </div>
      </div>
    </PageLayout>
  );
}
