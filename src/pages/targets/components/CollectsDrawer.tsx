import React, { useState, useEffect } from 'react';
import { Drawer, List, Tag, Empty, Spin, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { getTargetCollectConfigs } from '../services';

interface CollectRule {
  id: number;
  name: string;
  cate: string;
  disabled: number;
}

interface Props {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  ident: string;
}

export default function CollectsDrawer({ visible, setVisible, ident }: Props) {
  const { t } = useTranslation('targets');
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<CollectRule[]>([]);

  useEffect(() => {
    if (visible && ident) {
      setLoading(true);
      getTargetCollectConfigs(ident)
        .then((res) => setRules(res))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [visible, ident]);

  return (
    <Drawer
      title={t('collects_drawer.title', { ident })}
      visible={visible}
      onClose={() => setVisible(false)}
      width={600}
    >
      <Spin spinning={loading}>
        {_.isEmpty(rules) ? (
          <Empty description={t('collects_drawer.empty')} />
        ) : (
          <List
            dataSource={rules}
            renderItem={(rule) => (
              <List.Item>
                <List.Item.Meta
                  title={rule.name}
                  description={
                    <Space>
                      <Tag>{rule.cate}</Tag>
                      <Tag color={rule.disabled === 0 ? 'green' : 'default'}>
                        {rule.disabled === 0 ? t('collects_drawer.enabled') : t('collects_drawer.disabled')}
                      </Tag>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Spin>
    </Drawer>
  );
}
