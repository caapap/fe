import React, { useState } from 'react';
import { Form, Input, InputNumber, Modal, Radio, message } from 'antd';
import { useTranslation } from 'react-i18next';

import { SSHCredential, addSSHCredential } from '../../services';

interface Props {
  open: boolean;
  onCancel: () => void;
  onCreated: (credential: SSHCredential) => void;
}

interface FormValues {
  name: string;
  ssh_user: string;
  ssh_port: number;
  auth_type: 'password' | 'private_key';
  secret: string;
}

export default function CredentialInlineModal({ open, onCancel, onCreated }: Props) {
  const { t } = useTranslation('hosts');
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const authType = Form.useWatch('auth_type', form) ?? 'password';

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const created = await addSSHCredential({
        name: values.name.trim(),
        ssh_user: values.ssh_user.trim(),
        ssh_port: Number(values.ssh_port) || 22,
        auth_type: values.auth_type,
        secret: values.secret,
      });

      form.resetFields();
      onCreated(created);
      message.success(t('deploy_agent.credential_modal.success'));
    } catch (err: any) {
      if (err?.errorFields) return; // form validation — already shown inline
      message.error(err?.message ?? t('deploy_agent.credential_modal.validation'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={t('deploy_agent.credential_modal.title')}
      visible={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={submitting}
      destroyOnClose
      maskClosable={false}
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{ ssh_port: 22, auth_type: 'password' } satisfies Partial<FormValues>}
        requiredMark='optional'
      >
        <Form.Item
          name='name'
          label={t('deploy_agent.credential_modal.name')}
          rules={[{ required: true, whitespace: true }]}
        >
          <Input placeholder={t('deploy_agent.credential_modal.name_placeholder')} />
        </Form.Item>

        <div className='flex gap-3'>
          <Form.Item
            name='ssh_user'
            label={t('deploy_agent.credential_modal.ssh_user')}
            rules={[{ required: true, whitespace: true }]}
            className='flex-1'
          >
            <Input placeholder='root' />
          </Form.Item>
          <Form.Item
            name='ssh_port'
            label={t('deploy_agent.credential_modal.ssh_port')}
            rules={[{ required: true, type: 'number', min: 1, max: 65535 }]}
            className='w-32'
          >
            <InputNumber className='w-full' min={1} max={65535} />
          </Form.Item>
        </div>

        <Form.Item
          name='auth_type'
          label={t('deploy_agent.credential_modal.auth_type')}
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Radio.Button value='password'>{t('deploy_agent.credential_modal.auth_password')}</Radio.Button>
            <Radio.Button value='private_key'>{t('deploy_agent.credential_modal.auth_key')}</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name='secret'
          label={
            authType === 'password'
              ? t('deploy_agent.credential_modal.secret_password')
              : t('deploy_agent.credential_modal.secret_key')
          }
          rules={[{ required: true }]}
        >
          {authType === 'password' ? (
            <Input.Password autoComplete='new-password' />
          ) : (
            <Input.TextArea rows={8} placeholder='-----BEGIN OPENSSH PRIVATE KEY-----' />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
}
