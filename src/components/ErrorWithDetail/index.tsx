import React, { useState } from 'react';
import _ from 'lodash';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './locale';
interface IProps {
  error: {
    message: string;
    raw_message?: string;
  };
}

export default function index(props: IProps) {
  const { error } = props;
  const { t } = useTranslation('ErrorWithDetail');
  const { message, raw_message } = error;
  const [collapse, setCollapse] = useState(true);
  return (
    <div>
      {message}{' '}
      {raw_message && (
        <div style={{ color: 'var(--fc-text-4)' }}>
          <div onClick={() => setCollapse(!collapse)} style={{ cursor: 'pointer' }}>
            {t('more')} {collapse ? <DownOutlined /> : <UpOutlined />}
          </div>
          {!collapse && <div style={{ maxHeight: 400, overflow: 'auto' }}>{raw_message}</div>}
        </div>
      )}
    </div>
  );
}

