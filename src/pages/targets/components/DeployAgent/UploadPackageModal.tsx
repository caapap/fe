import React, { useState } from 'react';
import { Form, Input, InputNumber, Modal, Select, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { AgentPackage, uploadAgentPackage } from '../../services';

interface Props {
  open: boolean;
  onCancel: () => void;
  onUploaded: (pkg: AgentPackage) => void;
}

interface FormValues {
  version: string;
  os: string;
  arch: string;
}

const stopOverlayPropagation = (e: React.MouseEvent<HTMLElement>) => {
  e.stopPropagation();
};

export default function UploadPackageModal({ open, onCancel, onUploaded }: Props) {
  const { t } = useTranslation('hosts');
  const [form] = Form.useForm<FormValues>();
  const [file, setFile] = useState<File | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    form.resetFields();
    setFile(undefined);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!file) {
        message.warning(t('deploy_agent.upload_modal.file'));
        return;
      }
      setSubmitting(true);
      const pkg = await uploadAgentPackage({
        file,
        version: values.version.trim(),
        os: values.os,
        arch: values.arch,
      });
      message.success(t('deploy_agent.upload_modal.success'));
      onUploaded(pkg);
      reset();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message ?? 'upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <Modal
      title={t('deploy_agent.upload_modal.title')}
      visible={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={submitting}
      destroyOnClose
      maskClosable={false}
      modalRender={(node) => (
        <div onClick={stopOverlayPropagation} onMouseDown={stopOverlayPropagation}>
          {node}
        </div>
      )}
    >
      <Form form={form} layout='vertical' initialValues={{ os: 'linux', arch: 'amd64' } satisfies Partial<FormValues>}>
        <Form.Item name='version' label={t('deploy_agent.upload_modal.version')} rules={[{ required: true, whitespace: true }]}>
          <Input placeholder='v0.4.9' />
        </Form.Item>

        <div className='flex gap-3'>
          <Form.Item name='os' label={t('deploy_agent.upload_modal.os')} rules={[{ required: true }]} className='flex-1'>
            <Select
              options={[
                { label: 'linux', value: 'linux' },
                { label: 'darwin', value: 'darwin' },
                { label: 'windows', value: 'windows' },
              ]}
            />
          </Form.Item>
          <Form.Item name='arch' label={t('deploy_agent.upload_modal.arch')} rules={[{ required: true }]} className='flex-1'>
            <Select
              options={[
                { label: 'amd64', value: 'amd64' },
                { label: 'arm64', value: 'arm64' },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item label={t('deploy_agent.upload_modal.file')} required>
          <Upload.Dragger
            multiple={false}
            accept='.gz,.tgz'
            fileList={file ? [{ uid: '-1', name: file.name, status: 'done' as const }] : []}
            beforeUpload={(f) => {
              setFile(f);
              return false;
            }}
            onRemove={() => {
              setFile(undefined);
              return true;
            }}
          >
            <p className='ant-upload-drag-icon'>
              <InboxOutlined />
            </p>
            <p className='ant-upload-text'>{t('deploy_agent.upload_modal.upload_text')}</p>
            <p className='ant-upload-hint'>{t('deploy_agent.upload_modal.upload_hint')}</p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
}
