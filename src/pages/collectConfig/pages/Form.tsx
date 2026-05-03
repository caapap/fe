import React, { useEffect, useMemo, useState } from 'react';
import { RollbackOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Modal, Select, Space, Switch, Table, Tag } from 'antd';
import { useRequest } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useParams } from 'react-router-dom';
import CodeMirror from '@/components/CodeMirror';
import { StreamLanguage } from '@codemirror/stream-parser';
import { toml } from '@codemirror/legacy-modes/mode/toml';
import { EditorView } from '@codemirror/view';
import PageLayout from '@/components/pageLayout';
import Markdown from '@/components/Markdown';
import { BusinessGroupSelect, getBusiGroups } from '@/components/BusinessGroup';
import HostSelect from '@/components/DeviceSelect/HostSelect';
import { createCollectRule, getCollectRule, getCollectTemplates, updateCollectRule, createTryrunTask, previewHosts } from '../services';
import { DEFAULT_QUERY, DEFAULT_VALUES, NS } from '../constants';
import { CollectRuleFormValues, CollectRuleQueryItem, CollectTemplate } from '../types';
import TestResultModal from '../components/TestResultModal';
import '../locale';

interface Props {
  mode: 'add' | 'edit';
}

interface RouteParams {
  id: string;
}

function normalizeQueries(raw?: string): CollectRuleQueryItem[] {
  if (!raw) {
    return DEFAULT_QUERY;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.length ? parsed : DEFAULT_QUERY;
    }
    const next: CollectRuleQueryItem[] = [];
    if (parsed.all_hosts) {
      next.push({ key: 'all_hosts', op: '==', values: [] });
    }
    if (Array.isArray(parsed.hosts) && parsed.hosts.length) {
      next.push({ key: 'hosts', op: '==', values: parsed.hosts });
    }
    if (Array.isArray(parsed.group_ids) && parsed.group_ids.length) {
      next.push({ key: 'group_ids', op: '==', values: parsed.group_ids });
    }
    if (Array.isArray(parsed.tags) && parsed.tags.length) {
      next.push({
        key: 'tags',
        op: '==',
        values: parsed.tags.map((item) => `${item.key}=${item.value}`),
      });
    }
    return next.length ? next : DEFAULT_QUERY;
  } catch (e) {
    return DEFAULT_QUERY;
  }
}

function prettyJSON(raw?: string) {
  if (!raw) {
    return '{}';
  }
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch (e) {
    return raw;
  }
}

export default function FormPage({ mode }: Props) {
  const { t } = useTranslation(NS);
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const [form] = Form.useForm<CollectRuleFormValues>();
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [testResultModalVisible, setTestResultModalVisible] = useState(false);
  const [testTaskUUID, setTestTaskUUID] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const cate = Form.useWatch('cate', form);

  const { data: templates = [] } = useRequest(() => getCollectTemplates());
  const { data: businessGroups = [] } = useRequest(() => getBusiGroups());

  const { data: detail, loading } = useRequest(() => getCollectRule(id), {
    ready: mode === 'edit' && !!id,
  });

  useEffect(() => {
    if (mode === 'add') {
      form.setFieldsValue(DEFAULT_VALUES as CollectRuleFormValues);
    }
  }, [form, mode]);

  useEffect(() => {
    if (!detail) {
      return;
    }
    form.setFieldsValue({
      id: detail.id,
      name: detail.name,
      group_id: detail.group_id,
      disabled: detail.disabled,
      cate: detail.cate,
      content: detail.content,
      queries: normalizeQueries(detail.queries),
      custom_params_text: prettyJSON(detail.custom_params),
    });
  }, [detail, form]);

  const filteredTemplates = useMemo(() => {
    if (!cate) {
      return templates;
    }
    return templates.filter((item) => item.plugin === cate);
  }, [cate, templates]);

  const pluginOptions = useMemo(() => {
    const plugins = Array.from(new Set(templates.map((item) => item.plugin).filter(Boolean)));
    return plugins.map((plugin) => ({
      label: plugin,
      value: plugin,
    }));
  }, [templates]);

  const currentTemplate = useMemo<CollectTemplate | undefined>(() => {
    if (!cate) {
      return undefined;
    }
    return templates.find((item) => item.plugin === cate);
  }, [cate, templates]);

  const templateCandidates = cate ? filteredTemplates : templates;

  const templatePreview = useMemo(() => {
    if (!currentTemplate) {
      return (
        <div className='flex h-full items-center justify-center text-secondary'>
          <div className='text-center'>
            <div className='mb-2 text-base'>{t('template_preview_empty')}</div>
          </div>
        </div>
      );
    }

    return (
      <div className='flex h-full flex-col gap-3'>
        <div>
          <div className='mb-1 text-base font-medium'>{currentTemplate.plugin}</div>
        </div>
        <div className='flex-1 overflow-auto'>
          {currentTemplate.description ? <Markdown content={currentTemplate.description} /> : <div className='text-xs text-secondary'>{t('template_preview_desc_empty')}</div>}
        </div>
      </div>
    );
  }, [currentTemplate, t]);

  const applyTemplate = (template: CollectTemplate) => {
    form.setFieldsValue({
      cate: template.plugin,
      content: template.config_content,
    });
    setTemplateModalVisible(false);
  };

  const submit = async (values: CollectRuleFormValues) => {
    try {
      const customParams = JSON.parse(values.custom_params_text || '{}');
      if (Array.isArray(customParams) || customParams === null || typeof customParams !== 'object') {
        throw new Error('invalid');
      }
      const payload = {
        name: values.name,
        group_id: values.group_id,
        disabled: values.disabled,
        cate: values.cate,
        content: values.content,
        queries: JSON.stringify(values.queries || []),
        custom_params: JSON.stringify(customParams),
      };
      if (mode === 'edit' && id) {
        await updateCollectRule(id, payload);
      } else {
        await createCollectRule(payload);
      }
      message.success(t('save_success'));
      history.push('/collect-configs');
    } catch (error) {
      if ((error as Error).message === 'invalid' || error instanceof SyntaxError) {
        message.error(t('invalid_json'));
        return;
      }
      throw error;
    }
  };

  const handleTest = async () => {
    try {
      const values = await form.validateFields();

      // 检查是否配置了筛选条件
      if (!values.queries || values.queries.length === 0) {
        message.warning(t('test_no_hosts'));
        return;
      }

      // 检查是否配置了插件和配置内容
      if (!values.cate || !values.content) {
        message.warning(t('test_no_config'));
        return;
      }

      setTestLoading(true);
      message.loading({ content: t('test_creating'), key: 'test' });

      // 调用机器预览 API 获取匹配的机器列表
      const queriesJSON = JSON.stringify(values.queries || []);
      const hosts = await previewHosts(queriesJSON);

      if (!hosts || hosts.length === 0) {
        message.warning(t('test_no_hosts'));
        setTestLoading(false);
        return;
      }

      // 提取机器 ident 列表
      const idents = hosts.map((host: any) => host.ident);

      // 创建测试任务
      const uuid = await createTryrunTask({
        idents,
        input: values.cate,
        config: values.content,
        timeout: 30,
      });

      message.success({ content: t('save_success'), key: 'test' });
      setTestTaskUUID(uuid);
      setTestResultModalVisible(true);
    } catch (error) {
      message.error({ content: (error as Error).message, key: 'test' });
    } finally {
      setTestLoading(false);
    }
  };

  const pageTitle = (
    <Space size={8}>
      <RollbackOutlined onClick={() => history.push('/collect-configs')} style={{ cursor: 'pointer' }} />
      <span>{mode === 'edit' ? t('edit') : t('add')}</span>
    </Space>
  );

  return (
    <PageLayout title={pageTitle}>
      <div className='fc-page n9e'>
        <Form form={form} layout='vertical' onFinish={submit} initialValues={DEFAULT_VALUES as CollectRuleFormValues}>
          <div className='flex min-w-0 flex-col gap-4'>
            <Card title={t('basic')} loading={loading}>
              <Form.Item label={t('rule_name')} name='name' rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label={t('business_group')} name='group_id'>
                <BusinessGroupSelect data={businessGroups} value={form.getFieldValue('group_id') as any} onChange={(value) => form.setFieldsValue({ group_id: value })} />
              </Form.Item>
              <Form.Item label={t('enabled')} shouldUpdate>
                <Switch checked={form.getFieldValue('disabled') === 0} onChange={(checked) => form.setFieldsValue({ disabled: checked ? 0 : 1 })} />
              </Form.Item>
            </Card>
            <HostSelect prefixName={['queries']} title={t('filter')} helpContent={t('filter_tip')} />
            <Card title={t('config')}>
              <Space direction='vertical' className='w-full' size={16}>
                <Form.Item label={t('plugin_type')} name='cate' rules={[{ required: true }]}>
                  <Select
                    showSearch
                    optionFilterProp='label'
                    options={pluginOptions}
                    onChange={(value) => {
                      const selected = templates.find((item) => item.plugin === value);
                      if (selected) {
                        form.setFieldsValue({
                          content: selected.config_content,
                        });
                      }
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <Space size={8}>
                      <span>{t('config_content')}</span>
                      <Button type='link' size='small' className='h-auto p-0' onClick={() => setTemplateModalVisible(true)}>
                        {t('template')}
                      </Button>
                    </Space>
                  }
                  required
                >
                  <div className='grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]'>
                    <Form.Item name='content' rules={[{ required: true }]} noStyle>
                      <CodeMirror
                        className='fc-border rounded-[2px]'
                        height='520px'
                        basicSetup
                        extensions={[
                          StreamLanguage.define(toml),
                          EditorView.lineWrapping,
                          EditorView.theme({
                            '&.cm-editor.cm-focused': {
                              outline: 'unset',
                            },
                            '.cm-gutters': {
                              borderRight: 'none',
                            },
                          }),
                        ]}
                      />
                    </Form.Item>
                    <div className='min-h-[520px] max-h-[520px] overflow-auto rounded border border-solid border-fc-200 bg-fc-100 p-4'>{templatePreview}</div>
                  </div>
                </Form.Item>
                <Form.Item label={t('custom_params')} name='custom_params_text' extra={t('custom_params_tip')} rules={[{ required: true }]}>
                  <Input.TextArea autoSize={{ minRows: 6, maxRows: 12 }} />
                </Form.Item>
              </Space>
            </Card>
            <div className='flex items-center gap-3'>
              <Button type='primary' htmlType='submit'>
                {t('common:btn.save')}
              </Button>
              <Button onClick={handleTest} loading={testLoading}>
                {t('test_button')}
              </Button>
              <Link to='/collect-configs'>
                <Button>{t('common:btn.cancel')}</Button>
              </Link>
            </div>
          </div>
          <TestResultModal visible={testResultModalVisible} uuid={testTaskUUID} onClose={() => setTestResultModalVisible(false)} />
          <Modal title={t('template')} visible={templateModalVisible} footer={null} width={840} onCancel={() => setTemplateModalVisible(false)} destroyOnClose>
            <Table
              rowKey='id'
              size='small'
              dataSource={templateCandidates}
              pagination={{ size: 'small', pageSize: 8 }}
              onRow={(record) => ({
                onClick: () => applyTemplate(record),
              })}
              columns={[
                {
                  title: t('plugin_type'),
                  dataIndex: 'plugin',
                  width: 180,
                  render: (value: string) => <Tag color='blue'>{value}</Tag>,
                },
                {
                  title: t('template_category'),
                  dataIndex: 'category',
                  width: 140,
                  render: (value: string) => value || '-',
                },
                {
                  title: t('template_description'),
                  dataIndex: 'description',
                  ellipsis: true,
                  render: (value: string) => value || '-',
                },
                {
                  title: t('common:table.operations'),
                  width: 90,
                  render: (_, record: CollectTemplate) => (
                    <Button type='link' size='small' onClick={() => applyTemplate(record)}>
                      {t('select_template')}
                    </Button>
                  ),
                },
              ]}
            />
          </Modal>
        </Form>
      </div>
    </PageLayout>
  );
}
