import React, { useState } from 'react';
import { Button, Input, message, Modal, Popconfirm } from 'antd';
import { useTranslation } from 'react-i18next';

import { deleteTargetsUpgrade, postTargetsUpgrade } from '../services';

interface Props {
  selectedIdents: string[];
  onOk?: () => void;
}

export default function UpgradeAgent({ selectedIdents, onOk }: Props) {
  const { t } = useTranslation('hosts');
  const [visible, setVisible] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  const [downloadURL, setDownloadURL] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const idents = selectedIdents || [];

  const reset = () => {
    setNewVersion('');
    setDownloadURL('');
    setSubmitting(false);
  };

  const handleClose = () => {
    setVisible(false);
    reset();
  };

  const submit = async () => {
    const trimmedVersion = newVersion.trim();
    const trimmedURL = downloadURL.trim();
    if (!trimmedVersion || !trimmedURL) {
      message.warning(t('upgrade_agent.validation'));
      return;
    }
    if (idents.length === 0) {
      message.warning(t('upgrade_agent.no_selection'));
      return;
    }
    try {
      setSubmitting(true);
      await postTargetsUpgrade({ idents, new_version: trimmedVersion, download_url: trimmedURL });
      message.success(t('upgrade_agent.success', { count: idents.length }));
      handleClose();
      onOk?.();
    } catch (e) {
      // request() 已弹错
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async () => {
    if (idents.length === 0) {
      message.warning(t('upgrade_agent.no_selection'));
      return;
    }
    try {
      await deleteTargetsUpgrade({ idents });
      message.success(t('upgrade_agent.cancel_success', { count: idents.length }));
      onOk?.();
    } catch (e) {
      // request() 已弹错
    }
  };

  return (
    <>
      <span
        onClick={() => {
          if (idents.length === 0) {
            message.warning(t('upgrade_agent.no_selection'));
            return;
          }
          setVisible(true);
        }}
      >
        {t('upgrade_agent.title')}
      </span>
      <Modal
        title={t('upgrade_agent.title')}
        visible={visible}
        onCancel={handleClose}
        destroyOnClose
        footer={
          <div className='flex items-center justify-between'>
            <Popconfirm title={t('upgrade_agent.cancel_confirm', { count: idents.length })} onConfirm={cancel}>
              <Button danger>{t('upgrade_agent.cancel_btn')}</Button>
            </Popconfirm>
            <div>
              <Button onClick={handleClose} className='mr-2'>
                {t('common:btn.cancel')}
              </Button>
              <Button type='primary' loading={submitting} onClick={submit}>
                {t('common:btn.confirm')}
              </Button>
            </div>
          </div>
        }
      >
        <div className='flex flex-col gap-3'>
          <div className='text-secondary'>{t('upgrade_agent.selected', { count: idents.length })}</div>
          <div>
            <div className='mb-1'>{t('upgrade_agent.new_version')}</div>
            <Input
              placeholder='v0.5.7'
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
              allowClear
            />
          </div>
          <div>
            <div className='mb-1'>{t('upgrade_agent.download_url')}</div>
            <Input
              placeholder='https://download.flashcat.cloud/categraf-v0.5.7-linux-amd64.tar.gz'
              value={downloadURL}
              onChange={(e) => setDownloadURL(e.target.value)}
              allowClear
            />
          </div>
          <div className='text-xs text-secondary'>{t('upgrade_agent.hint')}</div>
        </div>
      </Modal>
    </>
  );
}
