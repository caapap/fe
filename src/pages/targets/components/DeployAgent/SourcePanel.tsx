import React from 'react';
import { Button, Select, Tabs, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import { AgentPackage } from '../../services';

interface Props {
  packages: AgentPackage[];
  selectedPackageId?: number;
  onSelect: (id: number | undefined) => void;
  onRequestUpload: () => void;
}

export default function SourcePanel({ packages, selectedPackageId, onSelect, onRequestUpload }: Props) {
  const { t } = useTranslation('hosts');

  const packageOptions = packages.map((p) => ({
    label: `${p.name} — ${p.version} (${p.os}/${p.arch})`,
    value: p.id,
  }));

  return (
    <Tabs size='small'>
      <Tabs.TabPane tab={t('deploy_agent.source_local')} key='local'>
        <div className='flex gap-2'>
          <Select
            className='flex-1'
            placeholder={t('deploy_agent.reuse_package_placeholder')}
            options={packageOptions}
            value={selectedPackageId}
            onChange={onSelect}
            allowClear
            showSearch
            optionFilterProp='label'
          />
          <Button onClick={onRequestUpload}>{t('deploy_agent.upload_new')}</Button>
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={
          <Tooltip title={t('deploy_agent.source_remote_disabled_tip')}>
            <span>{t('deploy_agent.source_remote')}</span>
          </Tooltip>
        }
        key='remote'
        disabled
      >
        <div className='text-text-secondary'>—</div>
      </Tabs.TabPane>
    </Tabs>
  );
}
