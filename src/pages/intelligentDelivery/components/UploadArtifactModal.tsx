import React, { useState } from 'react';
import { Form, Input, Modal, Progress, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

import { ArtifactPackage, uploadArtifact } from '../services';
import { getDisplayPackageName } from '../utils/artifact';
import { appendActivity } from '../utils/artifactStore';

interface Props {
  open: boolean;
  operator?: string;
  onCancel: () => void;
  onUploaded: (pkg: ArtifactPackage) => void;
}

interface FormValues {
  packageName: string;
  version: string;
}

const stopOverlayPropagation = (e: React.MouseEvent<HTMLElement>) => {
  e.stopPropagation();
};

export default function UploadArtifactModal({ open, operator = 'unknown', onCancel, onUploaded }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [file, setFile] = useState<File | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const reset = () => {
    form.resetFields();
    setFile(undefined);
    setProgress(0);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!file) {
        message.warning('请选择要上传的文件');
        return;
      }
      setSubmitting(true);
      setProgress(0);
      const pkg = await uploadArtifact({
        file,
        packageName: values.packageName.trim(),
        version: values.version.trim(),
        onProgress: setProgress,
      });
      appendActivity({
        type: 'upload',
        artifactName: getDisplayPackageName(pkg.name),
        version: pkg.version,
        operator,
      });
      message.success('制品上传成功');
      onUploaded(pkg);
      reset();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message ?? '上传失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    reset();
    onCancel();
  };

  return (
    <Modal
      title='上传制品'
      visible={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={submitting}
      okText={submitting ? '上传中' : '上传'}
      cancelText='取消'
      destroyOnClose
      maskClosable={false}
      width={520}
      modalRender={(node) => (
        <div onClick={stopOverlayPropagation} onMouseDown={stopOverlayPropagation}>
          {node}
        </div>
      )}
    >
      <Form form={form} layout='vertical' initialValues={{ version: '1.0.0' }}>
        <Form.Item label='文件' required>
          <Upload.Dragger
            multiple={false}
            disabled={submitting}
            fileList={file ? [{ uid: '-1', name: file.name, status: 'done' as const }] : []}
            beforeUpload={(f) => {
              setFile(f);
              if (!form.getFieldValue('packageName')) {
                form.setFieldsValue({ packageName: f.name });
              }
              return false;
            }}
            onRemove={() => {
              if (submitting) return false;
              setFile(undefined);
              return true;
            }}
          >
            <p className='ant-upload-drag-icon'>
              <InboxOutlined />
            </p>
            <p className='ant-upload-text'>拖拽文件到此处，或点击选择</p>
            <p className='ant-upload-hint'>支持 tar.gz、tgz、zip、dmg 等常见交付包格式，单文件不超过 500MB</p>
          </Upload.Dragger>
          {file && submitting ? (
            <Progress percent={progress} size='small' className='mt-3' status={progress >= 100 ? 'success' : 'active'} />
          ) : null}
        </Form.Item>

        <Form.Item
          name='packageName'
          label='包名'
          rules={[{ required: true, whitespace: true, message: '请输入包名' }]}
          extra='同一包名可多次上传不同文件，形成多版本；列表按包名聚合展示'
        >
          <Input placeholder='例如 my-app-1.2.dmg' maxLength={255} showCount />
        </Form.Item>

        <Form.Item
          name='version'
          label='版本'
          rules={[{ required: true, whitespace: true, message: '请输入版本号' }]}
          extra='当前版本策略为自定义版本号'
        >
          <Input placeholder='1.0.0' />
        </Form.Item>
      </Form>
    </Modal>
  );
}
