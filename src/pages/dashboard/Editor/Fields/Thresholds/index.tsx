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
import React from 'react';
import { Form, Input, InputNumber, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Panel } from '../../Components/Collapse';
import ColorPicker from '../../../Components/ColorPicker';

interface Props {
  hideBase?: boolean;
  preNamePrefix?: (string | number)[];
  namePrefix?: (string | number)[];
  initialValue?: any;
}

export default function index(props: Props) {
  const { hideBase } = props;
  const { t } = useTranslation('dashboard');
  const { preNamePrefix = [], namePrefix = ['options', 'thresholds'], initialValue } = props;

  return (
    <Panel header={t('panel.options.thresholds.title')}>
      <Form.List name={[...namePrefix, 'steps']} initialValue={initialValue}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => {
              return (
                <Form.Item key={key} shouldUpdate noStyle>
                  {({ getFieldValue }) => {
                    const type = getFieldValue([...preNamePrefix, ...namePrefix, 'steps', name, 'type']);
                    const width = type === 'base' ? 'calc(100% - 32px)' : 'calc(100% - 82px)';

                    return (
                      <div
                        style={{
                          display: hideBase && type === 'base' ? 'none' : 'block',
                        }}
                      >
                        <Input.Group key={key} compact style={{ marginBottom: 5 }}>
                          <Form.Item noStyle {...restField} name={[name, 'color']}>
                            <ColorPicker />
                          </Form.Item>
                          <Form.Item noStyle {...restField} name={[name, 'type']} hidden>
                            <div />
                          </Form.Item>
                          <Form.Item noStyle {...restField} name={[name, 'value']}>
                            <InputNumber style={{ width }} disabled={type === 'base'} placeholder={type} />
                          </Form.Item>
                          {type === 'base' ? null : (
                            <Button
                              style={{ width: 50 }}
                              icon={<DeleteOutlined />}
                              onClick={() => {
                                remove(name);
                              }}
                            />
                          )}
                        </Input.Group>
                      </div>
                    );
                  }}
                </Form.Item>
              );
            })}
            <Button
              style={{ width: '100%' }}
              onClick={() => {
                add(
                  {
                    color: '#ef843c',
                    value: 0,
                    type: '', // 只是为了不让合并默认值的时候被覆盖
                  },
                  0,
                );
              }}
            >
              {t('panel.options.thresholds.btn')}
            </Button>
          </>
        )}
      </Form.List>
    </Panel>
  );
}
