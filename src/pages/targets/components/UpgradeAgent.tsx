import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, message, Modal, Popconfirm, Select, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';

import { AgentPackage, deleteTargetsUpgrade, getAgentPackages, postTargetsUpgrade } from '../services';
import UploadPackageModal from './DeployAgent/UploadPackageModal';

interface Props {
  selectedIdents: string[];
  onOk?: () => void;
}

type UpgradeSource = 'local' | 'remote';

const stopOverlayPropagation = (e: React.MouseEvent<HTMLElement>) => {
  e.stopPropagation();
};

export default function UpgradeAgent({ selectedIdents, onOk }: Props) {
  const { t } = useTranslation('hosts');
  const [visible, setVisible] = useState(false);
  const [source, setSource] = useState<UpgradeSource>('local');
  const [newVersion, setNewVersion] = useState('');
  const [downloadURL, setDownloadURL] = useState('');
  const [packageId, setPackageId] = useState<number | undefined>();
  const [packages, setPackages] = useState<AgentPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const idents = selectedIdents || [];

  const reset = () => {
    setSource('local');
    setNewVersion('');
    setDownloadURL('');
    setPackageId(undefined);
    setSubmitting(false);
  };

  const packageOptions = useMemo(
    () =>
      packages.map((pkg) => ({
        label: `${pkg.name} — ${pkg.version} (${pkg.os}/${pkg.arch})`,
        value: pkg.id,
      })),
    [packages],
  );

  const reloadPackages = async () => {
    setPackagesLoading(true);
    try {
      const list = await getAgentPackages();
      setPackages(list);
    } catch {
      /* request() already surfaced */
    } finally {
      setPackagesLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    void reloadPackages();
  }, [visible]);

  const handleClose = () => {
    setVisible(false);
    reset();
  };

  const submit = async () => {
    const trimmedVersion = newVersion.trim();
    const trimmedURL = source === 'remote' ? downloadURL.trim() : '';
    if (!trimmedVersion) {
      message.warning(t('upgrade_agent.validation_version'));
      return;
    }
    if (source === 'local' && !packageId) {
      message.warning(t('upgrade_agent.validation_package'));
      return;
    }
    if (source === 'remote' && !trimmedURL) {
      message.warning(t('upgrade_agent.validation_url'));
      return;
    }
    if (idents.length === 0) {
      message.warning(t('upgrade_agent.no_selection'));
      return;
    }
    try {
      setSubmitting(true);
      await postTargetsUpgrade({
        idents,
        new_version: trimmedVersion,
        download_url: source === 'remote' ? trimmedURL : undefined,
        package_id: source === 'local' ? packageId : undefined,
      });
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
        modalRender={(node) => (
          <div onClick={stopOverlayPropagation} onMouseDown={stopOverlayPropagation}>
            {node}
          </div>
        )}
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
          <Tabs activeKey={source} onChange={(key) => setSource(key as UpgradeSource)}>
            <Tabs.TabPane tab={t('deploy_agent.source_local')} key='local'>
              <div className='flex flex-col gap-3'>
                <div>
                  <div className='mb-1'>{t('upgrade_agent.package')}</div>
                  <div className='flex gap-2'>
                    <Select
                      className='flex-1'
                      placeholder={t('deploy_agent.reuse_package_placeholder')}
                      options={packageOptions}
                      value={packageId}
                      loading={packagesLoading}
                      onChange={(value) => {
                        setPackageId(value);
                        const selected = packages.find((pkg) => pkg.id === value);
                        if (selected) {
                          setNewVersion(selected.version);
                        }
                      }}
                      allowClear
                      showSearch
                      optionFilterProp='label'
                    />
                    <Button onClick={() => setUploadModalOpen(true)}>{t('deploy_agent.upload_new')}</Button>
                  </div>
                </div>
                <div>
                  <div className='mb-1'>{t('upgrade_agent.new_version')}</div>
                  <Input placeholder='v0.5.7' value={newVersion} onChange={(e) => setNewVersion(e.target.value)} allowClear />
                </div>
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('deploy_agent.source_remote')} key='remote'>
              <div className='flex flex-col gap-3'>
                <div>
                  <div className='mb-1'>{t('upgrade_agent.new_version')}</div>
                  <Input placeholder='v0.5.7' value={newVersion} onChange={(e) => setNewVersion(e.target.value)} allowClear />
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
              </div>
            </Tabs.TabPane>
          </Tabs>
          <div className='text-xs text-secondary'>{t('upgrade_agent.hint')}</div>
        </div>
      </Modal>
      <UploadPackageModal
        open={uploadModalOpen}
        onCancel={() => setUploadModalOpen(false)}
        onUploaded={(pkg) => {
          setUploadModalOpen(false);
          setPackages((prev) => [pkg, ...prev.filter((item) => item.id !== pkg.id)]);
          setPackageId(pkg.id);
          setNewVersion(pkg.version);
          setSource('local');
        }}
      />
    </>
  );
}
