import React from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props {
  value?: string[];
  onChange: (value: string[]) => void;
  options?: string[];
}

export default function VersionSelect({ value, onChange, options = [] }: Props) {
  const { t } = useTranslation('hosts');

  return (
    <Select
      mode='multiple'
      allowClear
      placeholder={t('version_select.placeholder')}
      style={{ minWidth: 150 }}
      value={value}
      onChange={onChange}
      options={options.map((version) => ({
        label: version || t('version_select.unknown'),
        value: version || '',
      }))}
    />
  );
}
