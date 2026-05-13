import React, { useState, useEffect } from 'react';
import { Button, Select, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';

import { AgentPackage } from '../../services';

interface Props {
  packages: AgentPackage[];
  selectedPackageId?: number;
  onSelect: (id: number | undefined) => void;
  onRequestUpload: () => void;
  onRemoteUrlChange?: (url: string) => void;
}

// 预设最新的几个 categraf 版本（按时间从新到旧）
// 用户也可以在下拉框中手动输入其他版本号
const CATEGRAF_VERSIONS = [
  'v0.5.7',
  'v0.5.6',
  'v0.5.5',
  'v0.5.4',
  'v0.5.3',
];

const ARCHITECTURES = [
  { label: 'Linux AMD64', value: 'linux-amd64', os: 'linux', arch: 'amd64' },
  { label: 'Linux ARM64', value: 'linux-arm64', os: 'linux', arch: 'arm64' },
  { label: 'Darwin AMD64', value: 'darwin-amd64', os: 'darwin', arch: 'amd64' },
  { label: 'Darwin ARM64', value: 'darwin-arm64', os: 'darwin', arch: 'arm64' },
  { label: 'Windows AMD64', value: 'windows-amd64', os: 'windows', arch: 'amd64' },
];

export default function SourcePanel({ packages, selectedPackageId, onSelect, onRequestUpload, onRemoteUrlChange }: Props) {
  const { t } = useTranslation('hosts');
  const [selectedVersion, setSelectedVersion] = useState<string>();
  const [selectedArch, setSelectedArch] = useState<string>();

  const packageOptions = packages.map((p) => ({
    label: `${p.name} — ${p.version} (${p.os}/${p.arch})`,
    value: p.id,
  }));

  const versionOptions = CATEGRAF_VERSIONS.map((v) => ({
    label: v,
    value: v,
  }));

  useEffect(() => {
    if (selectedVersion && selectedArch) {
      const arch = ARCHITECTURES.find((a) => a.value === selectedArch);
      if (arch) {
        // 直接构建 GitHub Release 下载链接，不走 api.github.com
        const url = `https://github.com/flashcatcloud/categraf/releases/download/${selectedVersion}/categraf-${selectedVersion}-${arch.os}-${arch.arch}.tar.gz`;
        onRemoteUrlChange?.(url);
      }
    } else {
      onRemoteUrlChange?.('');
    }
  }, [selectedVersion, selectedArch, onRemoteUrlChange]);

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
        tab={t('deploy_agent.source_remote')}
        key='remote'
      >
        <div className='flex flex-col gap-2'>
          <Select
            mode='tags'
            placeholder='选择版本或手动输入（如 v0.5.7）'
            options={versionOptions}
            value={selectedVersion ? [selectedVersion] : []}
            onChange={(values: string[]) => {
              // tags 模式只取最后一个值（最新选/输入的）
              const last = values[values.length - 1];
              setSelectedVersion(last);
            }}
            maxTagCount={1}
            allowClear
          />
          <Select
            placeholder='选择架构'
            options={ARCHITECTURES}
            value={selectedArch}
            onChange={setSelectedArch}
            allowClear
            showSearch
            optionFilterProp='label'
          />
        </div>
      </Tabs.TabPane>
    </Tabs>
  );
}
