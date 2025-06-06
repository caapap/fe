/*
 * Copyright 2024 Stellar Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect } from 'react';
import { Form, Select, Row, Col, InputNumber, Switch, Input, Checkbox, Space } from 'antd';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { Panel } from '../../Components/Collapse';
import { calcsOptions, legendPostion } from '../../config';
import { useGlobalState } from '../../../globalState';

export default function GraphStyles() {
  const { t, i18n } = useTranslation('dashboard');
  const namePrefix = ['custom'];
  const [statFields, setStatFields] = useGlobalState('statFields');
  const fields = _.compact(_.concat(statFields, 'Value'));
  const valueField = Form.useWatch([...namePrefix, 'valueField']);

  useEffect(() => {
    return () => {
      setStatFields([]);
    };
  }, []);

  return (
    <Panel header={t('panel.custom.title')}>
      <>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item label={t('panel.custom.calc')} name={[...namePrefix, 'calc']} tooltip={t('panel.custom.calc_tip')}>
              <Select>
                {_.map(calcsOptions, (item, key) => {
                  return (
                    <Select.Option key={key} value={key}>
                      {t(`calcs.${key}`)}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('panel.custom.valueField')} name={[...namePrefix, 'valueField']} tooltip={t('panel.custom.valueField_tip')}>
              <Select>
                {_.map(fields, (item) => {
                  return (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          {valueField !== 'Value' && (
            <Col span={8}>
              <Form.Item
                label={t('panel.custom.pie.countOfValueField')}
                name={[...namePrefix, 'countOfValueField']}
                tooltip={t('panel.custom.pie.countOfValueField_tip')}
                initialValue={true}
                valuePropName='checked'
              >
                <Switch />
              </Form.Item>
            </Col>
          )}
          <Col span={10}>
            <Form.Item label={t('panel.custom.pie.legengPosition')} name={[...namePrefix, 'legengPosition']}>
              <Select>
                {legendPostion.map((item) => {
                  return (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label={t('panel.custom.pie.max')} name={[...namePrefix, 'max']} tooltip={t('panel.custom.pie.max_tip')}>
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label={t('panel.custom.pie.donut')} name={[...namePrefix, 'donut']} valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Space>
              <Form.Item label={t('panel.custom.pie.labelWithName')} name={[...namePrefix, 'labelWithName']} valuePropName='checked'>
                <Switch />
              </Form.Item>
              <Form.Item label={t('panel.custom.pie.labelWithValue')} name={[...namePrefix, 'labelWithValue']} valuePropName='checked'>
                <Switch />
              </Form.Item>
            </Space>
          </Col>
          <Col span={9}>
            <Form.Item label={t('panel.custom.pie.detailName')} name={[...namePrefix, 'detailName']}>
              <Input style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={15}>
            <Form.Item
              label={t('panel.custom.pie.detailUrl')}
              name={[...namePrefix, 'detailUrl']}
              tooltip={{
                overlayInnerStyle: { width: 330 },
                title: <Trans ns='dashboard' i18nKey='dashboard:var.help_tip' components={{ 1: <br /> }} />,
              }}
            >
              <Input style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </>
    </Panel>
  );
}
