import React, { useEffect, useState } from 'react';
import { Button, Card, Input, Space, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';

import PageLayout from '@/components/pageLayout';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

import { PATHS } from '../constants';
import { createPipeline } from '../services';

const DEFAULT_YAML = `name: my-pipeline
description: ''
stages:
  - name: deploy
    jobs:
      - name: deploy-job
        steps:
          - name: run-script
            type: shell
            with:
              script: echo "hello world"
`;

export default function PipelineEdit() {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const isNew = !id;
  const [yaml, setYaml] = useState(DEFAULT_YAML);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isNew) {
      setLoading(true);
      request(`/api/n9e-plus/delivery/pipelines/${id}`, { method: RequestMethod.Get })
        .then((res) => {
          const yaml = res?.dat?.latest_config?.flow_yaml || res?.dat?.flow_yaml;
          if (yaml) setYaml(yaml);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSave = async () => {
    if (!yaml.trim()) {
      message.warning('YAML 内容不能为空');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const newId = await createPipeline({ flow_yaml: yaml });
        message.success('流水线创建成功');
        history.replace(`${PATHS.pipelines}/${newId}/edit`);
      } else {
        await request(`/api/n9e-plus/delivery/pipelines/${id}`, {
          method: RequestMethod.Put,
          data: { flow_yaml: yaml },
        });
        message.success('流水线已保存');
      }
    } catch {
      /* surfaced by request() */
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout
      title={
        <Space>
          <Button type='text' icon={<ArrowLeftOutlined />} onClick={() => history.push(PATHS.pipelines)} />
          <span>{isNew ? '新建流水线' : '编辑流水线'}</span>
        </Space>
      }
    >
      <div className='fc-page n9e'>
        <Card className='rounded-2xl border-fc-200' loading={loading}>
          <div className='mb-4 flex items-center justify-between'>
            <span className='text-base font-medium text-title'>流程配置（YAML）</span>
            <Button type='primary' icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              保存
            </Button>
          </div>
          <Input.TextArea
            value={yaml}
            onChange={(e) => setYaml(e.target.value)}
            autoSize={{ minRows: 20, maxRows: 40 }}
            className='font-mono text-sm'
            placeholder='输入流水线 YAML 配置...'
          />
        </Card>
      </div>
    </PageLayout>
  );
}
