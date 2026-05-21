import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, message } from 'antd';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';
import moment from 'moment';

import PageLayout from '@/components/pageLayout';

import {
  ServiceConnection,
  createServiceConnection,
  deleteServiceConnection,
  getServiceConnections,
  updateServiceConnection,
} from '../services';

const TYPE_OPTIONS: Array<{ value: ServiceConnection['type']; label: string }> = [
  { value: 'SSH_KEY', label: 'SSH 密钥对' },
  { value: 'USERNAME_PASSWORD', label: '用户名密码' },
  { value: 'TOKEN', label: 'Token / API Key' },
];

const TYPE_LABEL = TYPE_OPTIONS.reduce<Record<string, string>>((acc, cur) => {
  acc[cur.value] = cur.label;
  return acc;
}, {});

interface FormValues {
  name: string;
  type: ServiceConnection['type'];
  description?: string;
  host?: string;
  port?: number;
  username?: string;
  private_key?: string;
  password?: string;
  token?: string;
}

export default function ServiceConnections() {
  const [list, setList] = useState<ServiceConnection[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceConnection | null>(null);
  const [form] = Form.useForm<FormValues>();
  const watchType = Form.useWatch('type', form);

  const fetchData = async (p = page, q = keyword) => {
    setLoading(true);
    try {
      const res = await getServiceConnections({ page: p, limit: 20, query: q || undefined });
      setList(res.list || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ type: 'SSH_KEY', port: 22 });
    setModalOpen(true);
  };

  const openEdit = (record: ServiceConnection) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      name: record.name,
      type: record.type,
      description: record.description,
      port: 22,
    });
    setModalOpen(true);
  };

  const handleDelete = (record: ServiceConnection) => {
    Modal.confirm({
      title: '删除服务连接？',
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      content: `确定要删除「${record.name}」吗？依赖此连接的流水线将无法继续部署。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await deleteServiceConnection(record.id);
        message.success('已删除');
        fetchData();
      },
    });
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const params: Record<string, unknown> = {};
    if (values.type === 'SSH_KEY') {
      params.host = values.host;
      params.port = values.port ?? 22;
      params.username = values.username;
      params.private_key = values.private_key;
    } else if (values.type === 'USERNAME_PASSWORD') {
      params.host = values.host;
      params.port = values.port ?? 22;
      params.username = values.username;
      params.password = values.password;
    } else if (values.type === 'TOKEN') {
      params.token = values.token;
    }

    try {
      if (editing) {
        await updateServiceConnection(editing.id, {
          name: values.name,
          type: values.type,
          description: values.description,
          params,
        });
        message.success('已更新');
      } else {
        await createServiceConnection({
          name: values.name,
          type: values.type,
          description: values.description,
          params,
        });
        message.success('已创建');
      }
      setModalOpen(false);
      fetchData();
    } catch {
      /* request() surfaces */
    }
  };

  const columns: ColumnsType<ServiceConnection> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (v: string) => <span className='font-medium'>{v}</span>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (v: string) => <Tag color='blue'>{TYPE_LABEL[v] || v}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (v: string) => v || <span className='text-secondary'>-</span>,
    },
    {
      title: '创建者',
      dataIndex: 'creator',
      key: 'creator',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'create_at',
      key: 'create_at',
      width: 170,
      render: (v: number) => (v ? moment.unix(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size={4}>
          <Button type='text' size='small' icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Button type='text' size='small' danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageLayout title='服务连接'>
      <div className='fc-page n9e'>
        <Card className='mb-4 rounded-2xl border-fc-200'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='min-w-0 flex-1'>
              <div className='text-lg font-semibold text-title'>服务连接</div>
              <div className='mt-1 text-sm text-secondary'>
                管理 SSH 密钥对、用户名密码等部署凭证。流水线 deploy / shell 步骤通过 connection 名称引用。
              </div>
            </div>
            <Space>
              <Input
                allowClear
                prefix={<SearchOutlined className='text-secondary' />}
                placeholder='搜索名称'
                style={{ width: 220 }}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={() => {
                  setPage(1);
                  fetchData(1, keyword);
                }}
              />
              <Button type='primary' icon={<PlusOutlined />} onClick={openCreate}>
                新建连接
              </Button>
            </Space>
          </div>
        </Card>

        <Card className='rounded-2xl border-fc-200'>
          <Table<ServiceConnection>
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
              onChange: (p) => {
                setPage(p);
                fetchData(p);
              },
            }}
          />
        </Card>
      </div>

      <Modal
        title={editing ? '编辑服务连接' : '新建服务连接'}
        visible={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText='保存'
        cancelText='取消'
        destroyOnClose
        width={640}
      >
        <Form form={form} layout='vertical' preserve={false}>
          <Form.Item
            name='name'
            label='连接名称'
            rules={[{ required: true, message: '请输入连接名称' }, { max: 128 }]}
          >
            <Input placeholder='例如：prod-server-ssh' disabled={!!editing} />
          </Form.Item>
          <Form.Item name='type' label='类型' rules={[{ required: true }]}>
            <Select options={TYPE_OPTIONS} disabled={!!editing} />
          </Form.Item>
          <Form.Item name='description' label='描述'>
            <Input.TextArea rows={2} placeholder='可选，备注用途' />
          </Form.Item>

          {watchType === 'SSH_KEY' && (
            <>
              <div className='flex gap-2'>
                <Form.Item
                  name='host'
                  label='Host'
                  className='flex-1'
                  rules={[{ required: true, message: '请输入主机地址' }]}
                >
                  <Input placeholder='10.0.0.1 或 example.com' />
                </Form.Item>
                <Form.Item name='port' label='端口' style={{ width: 120 }} initialValue={22}>
                  <InputNumber min={1} max={65535} className='w-full' />
                </Form.Item>
              </div>
              <Form.Item name='username' label='用户名' rules={[{ required: true, message: '请输入用户名' }]}>
                <Input placeholder='root' />
              </Form.Item>
              <Form.Item
                name='private_key'
                label='私钥（PEM 格式）'
                rules={[{ required: !editing, message: '请粘贴私钥内容' }]}
                extra={editing ? '保留为空表示不修改' : '粘贴 OpenSSH / RSA 私钥全文，AES-256-GCM 加密存储'}
              >
                <Input.TextArea
                  rows={6}
                  placeholder={'-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----'}
                  className='font-mono text-xs'
                />
              </Form.Item>
            </>
          )}

          {watchType === 'USERNAME_PASSWORD' && (
            <>
              <div className='flex gap-2'>
                <Form.Item
                  name='host'
                  label='Host'
                  className='flex-1'
                  rules={[{ required: true, message: '请输入主机地址' }]}
                >
                  <Input placeholder='10.0.0.1' />
                </Form.Item>
                <Form.Item name='port' label='端口' style={{ width: 120 }} initialValue={22}>
                  <InputNumber min={1} max={65535} className='w-full' />
                </Form.Item>
              </div>
              <Form.Item name='username' label='用户名' rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item
                name='password'
                label='密码'
                rules={[{ required: !editing, message: '请输入密码' }]}
                extra={editing ? '保留为空表示不修改' : 'AES-256-GCM 加密存储'}
              >
                <Input.Password />
              </Form.Item>
            </>
          )}

          {watchType === 'TOKEN' && (
            <Form.Item
              name='token'
              label='Token'
              rules={[{ required: !editing, message: '请输入 Token' }]}
              extra={editing ? '保留为空表示不修改' : 'AES-256-GCM 加密存储'}
            >
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </PageLayout>
  );
}
