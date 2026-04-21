import React, { useMemo, useState } from 'react';
import { Button, Popover, Input } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { getLokiQueryHistory } from '../../utils/history';
import './style.less';

interface Props {
  datasourceValue: number;
  onChange?: (query: string) => void;
}

export default function HistoricalRecords({ datasourceValue, onChange }: Props) {
  const { t } = useTranslation('explorer');
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(false);
  const historicalRecords = useMemo(() => getLokiQueryHistory(datasourceValue), [datasourceValue, visible]);

  return (
    <Popover
      visible={visible}
      onVisibleChange={(newVisible) => {
        setVisible(newVisible);
      }}
      content={
        <div className='loki-historical-records-popover-content'>
          <Input 
            placeholder={t('historicalRecords.searchPlaceholder')} 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <div className='loki-historical-records-popover-content-records-content'>
            {_.map(historicalRecords, (item) => {
              if (!search || item[0].includes(search)) {
                return (
                  <div
                    className='loki-historical-records-popover-content-records-item'
                    key={item[0]}
                    onClick={() => {
                      onChange && onChange(item[0]);
                      setVisible(false);
                    }}
                  >
                    {item[0]}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      }
      title={
        <div
          style={{
            height: 36,
            lineHeight: '36px',
          }}
        >
          {t('historicalRecords.button')}
        </div>
      }
      trigger='click'
      placement='bottomLeft'
    >
      <Button
        onClick={() => {
          setVisible(true);
        }}
      >
        {t('historicalRecords.button')}
      </Button>
    </Popover>
  );
} 