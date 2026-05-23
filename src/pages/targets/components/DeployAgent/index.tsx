import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, message, Modal } from 'antd';
import { useTranslation } from 'react-i18next';

import { AgentPackage, DeployAgentRequest, SSHCredential, getAgentPackages, getSSHCredentials, postDeployAgent } from '../../services';
import CredentialInlineModal from './CredentialInlineModal';
import RunView from './RunView';
import SourcePanel from './SourcePanel';
import TargetsEditor, { TargetRow, makeBlankRow } from './TargetsEditor';
import UploadPackageModal from './UploadPackageModal';

interface Props {
  selectedIdents: string[];
  title?: string;
  onOk?: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className='mb-1 text-sm text-text-secondary'>{children}</div>;
}

const stopOverlayPropagation = (e: React.MouseEvent<HTMLElement>) => {
  e.stopPropagation();
};

export default function DeployAgent({ selectedIdents, title, onOk }: Props) {
  const { t } = useTranslation(['hosts', 'common']);
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [credentials, setCredentials] = useState<SSHCredential[]>([]);
  const [packages, setPackages] = useState<AgentPackage[]>([]);
  const [rows, setRows] = useState<TargetRow[]>([makeBlankRow()]);
  const [packageId, setPackageId] = useState<number | undefined>();
  const [remoteUrl, setRemoteUrl] = useState('');
  const [installDir, setInstallDir] = useState('');
  const [serverURL, setServerURL] = useState('');

  const [credModalOpen, setCredModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [runId, setRunId] = useState<number | undefined>();

  const preselectedIdents = selectedIdents ?? [];
  const modalTitle = title ?? t('deploy_agent.title');

  const reloadCredentials = async () => {
    try {
      const list = await getSSHCredentials();
      setCredentials(list);
    } catch {
      /* request() already surfaced */
    }
  };
  const reloadPackages = async () => {
    try {
      const list = await getAgentPackages();
      setPackages(list);
    } catch {
      /* request() already surfaced */
    }
  };

  useEffect(() => {
    if (!visible) return;
    void reloadCredentials();
    void reloadPackages();
  }, [visible]);

  // When the modal opens with preselected idents, auto-populate target rows
  // with those hosts (overwriting whatever was there on last close).
  useEffect(() => {
    if (!visible) return;
    if (preselectedIdents.length > 0) {
      setRows(preselectedIdents.map((host) => makeBlankRow({ host })));
    } else {
      setRows([makeBlankRow()]);
    }
    setPackageId(undefined);
    setRemoteUrl('');
    setInstallDir('');
    setServerURL('');
    setRunId(undefined);
    // intentionally depend only on `visible`; reopening resets the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const close = () => {
    setVisible(false);
    onOk?.();
  };

  const validate = (): DeployAgentRequest | null => {
    const filled = rows.filter((r) => r.host.trim() !== '');
    if (filled.length === 0) {
      message.warning(t('deploy_agent.validation_targets'));
      return null;
    }
    if (filled.some((r) => !r.credential_id)) {
      message.warning(t('deploy_agent.validation_credential'));
      return null;
    }
    // 验证安装包来源：本地包或远程 URL 至少选择一个
    if (!packageId && !remoteUrl.trim()) {
      message.warning(t('deploy_agent.validation_package'));
      return null;
    }
    if (!serverURL.trim()) {
      message.warning(t('deploy_agent.validation_server'));
      return null;
    }
    // Current backend accepts a single credential per run; if users picked
    // different credentials per row, use the first one for now. (Multi-credential
    // dispatch is a backlog item.)
    const credentialId = filled[0].credential_id!;
    return {
      hosts: filled.map((r) => r.host),
      credential_id: credentialId,
      package_id: packageId,
      download_url: remoteUrl.trim() || undefined,
      install_dir: installDir.trim() || undefined,
      n9e_server_url: serverURL.trim(),
    };
  };

  const submit = async () => {
    const payload = validate();
    if (!payload) return;
    setSubmitting(true);
    try {
      const { run_id } = await postDeployAgent(payload);
      message.success(t('deploy_agent.success', { count: payload.hosts.length }));
      setRunId(run_id);
    } catch {
      /* request() already surfaced */
    } finally {
      setSubmitting(false);
    }
  };

  const body = useMemo(() => {
    if (runId != null) {
      return <RunView runId={runId} onBack={() => setRunId(undefined)} />;
    }
    return (
      <div className='flex flex-col gap-4'>
        {preselectedIdents.length === 0 && (
          <div>
            <SectionLabel>{t('deploy_agent.section.targets')}</SectionLabel>
            <TargetsEditor
              rows={rows}
              onRowsChange={setRows}
              credentials={credentials}
              onRequestNewCredential={() => setCredModalOpen(true)}
              preselectedIdents={preselectedIdents}
            />
          </div>
        )}

        <div>
          <SectionLabel>{t('deploy_agent.section.source')}</SectionLabel>
          <SourcePanel
            packages={packages}
            selectedPackageId={packageId}
            onSelect={setPackageId}
            onRequestUpload={() => setUploadModalOpen(true)}
            onRemoteUrlChange={setRemoteUrl}
          />
        </div>

        <div className='flex gap-3'>
          <div className='flex-1'>
            <SectionLabel>{t('deploy_agent.install_dir')}</SectionLabel>
            <Input placeholder={t('deploy_agent.install_dir_default')} value={installDir} onChange={(e) => setInstallDir(e.target.value)} allowClear />
          </div>
          <div className='flex-1'>
            <SectionLabel>{t('deploy_agent.section.server')}</SectionLabel>
            <Input placeholder={t('deploy_agent.server_url_default')} value={serverURL} onChange={(e) => setServerURL(e.target.value)} allowClear />
          </div>
        </div>
      </div>
    );
  }, [runId, rows, credentials, preselectedIdents, packages, packageId, installDir, serverURL, t]);

  return (
    <>
      <span
        onClick={() => {
          setVisible(true);
        }}
        style={{ cursor: 'pointer' }}
      >
        {modalTitle}
      </span>
      <Modal
        title={modalTitle}
        visible={visible}
        width={960}
        destroyOnClose
        maskClosable={false}
        onCancel={close}
        modalRender={(node) => (
          <div onClick={stopOverlayPropagation} onMouseDown={stopOverlayPropagation}>
            {node}
          </div>
        )}
        footer={
          runId != null ? (
            <Button onClick={close}>{t('btn.close', { ns: 'common' })}</Button>
          ) : (
            <div className='flex justify-end gap-2'>
              <Button onClick={close}>{t('deploy_agent.cancel')}</Button>
              <Button type='primary' loading={submitting} onClick={submit}>
                {t('deploy_agent.submit')}
              </Button>
            </div>
          )
        }
      >
        {body}
      </Modal>

      <CredentialInlineModal
        open={credModalOpen}
        onCancel={() => setCredModalOpen(false)}
        onCreated={(cred) => {
          setCredModalOpen(false);
          setCredentials((prev) => [cred, ...prev.filter((c) => c.id !== cred.id)]);
          // Auto-fill any rows without a credential with the newly created one.
          setRows((prev) => prev.map((r) => (r.credential_id ? r : { ...r, credential_id: cred.id })));
        }}
      />

      <UploadPackageModal
        open={uploadModalOpen}
        onCancel={() => setUploadModalOpen(false)}
        onUploaded={(pkg) => {
          setUploadModalOpen(false);
          setPackages((prev) => [pkg, ...prev.filter((p) => p.id !== pkg.id)]);
          setPackageId(pkg.id);
        }}
      />
    </>
  );
}
