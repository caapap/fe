import React from 'react';
import { Form, Card, Space, Select, Tooltip } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import ValuesSelect from './ValuesSelect';
import Preview from './Preview';
import '../locale';

interface Props {
  prefixName: (string | number)[];
  title?: React.ReactNode;
  helpContent?: React.ReactNode;
}

export default function index(props: Props) {
  const { t } = useTranslation('DeviceSelect');
  const queryKeyOptions = ['all_hosts', 'group_ids', 'tags', 'hosts'];
  const { prefixName } = props;
  const form = Form.useFormInstance();
  const prefixNameValues = Form.useWatch(prefixName);

  return (
    <div>
      <Form.List
        name={prefixName}
        initialValue={[
          {
            key: 'all_hosts',
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <Card
            title={
              <Space>
                <span>{props.title || t('host.title')}</span>
                {props.helpContent ? (
                  <Tooltip title={props.helpContent}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                ) : null}
                <PlusCircleOutlined
                  onClick={() =>
                    add({
                      key: 'group_ids',
                      op: '==',
                      values: [],
                    })
                  }
                />
              </Space>
            }
            size='small'
          >
            {fields.map((field, idx) => {
              const queryKey = form.getFieldValue([...prefixName, field.name, 'key']);
              const queryOp = form.getFieldValue([...prefixName, field.name, 'op']);
              return (
                <div key={field.key}>
                  <Space align='baseline'>
                    {idx > 0 && <div className='alert-rule-host-condition-tips'>且</div>}
                    <Form.Item {...field} name={[field.name, 'key']} rules={[{ required: true, message: 'Missing key' }]}>
                      <Select
                        style={{ minWidth: idx > 0 ? 100 : 142 }}
                        onChange={() => {
                          const values = _.cloneDeep(form.getFieldsValue());
                          _.set(values, [...prefixName, field.name, 'op'], '==');
                          _.set(values, [...prefixName, field.name, 'values'], undefined);
                          form.setFieldsValue(values);
                        }}
                      >
                        {queryKeyOptions.map((item) => (
                          <Select.Option key={item} value={item}>
                            {t(`host.key.${item}`)}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    {queryKey !== 'all_hosts' && (
                      <Space align='baseline'>
                        <Form.Item {...field} name={[field.name, 'op']} rules={[{ required: true, message: 'Missing op' }]}>
                          <Select
                            style={{ minWidth: 60 }}
                            options={_.concat(
                              [
                                {
                                  value: '==',
                                  label: '==',
                                },
                                {
                                  value: '!=',
                                  label: '!=',
                                },
                              ],
                              queryKey === 'hosts'
                                ? [
                                    {
                                      value: '=~',
                                      label: '=~',
                                    },
                                    {
                                      value: '!~',
                                      label: '!~',
                                    },
                                  ]
                                : [],
                            )}
                            onChange={() => {
                              const values = _.cloneDeep(form.getFieldsValue());
                              _.set(values, [...prefixName, field.name, 'values'], undefined);
                              form.setFieldsValue(values);
                            }}
                          />
                        </Form.Item>
                        <ValuesSelect queryKey={queryKey} queryOp={queryOp} field={field} />
                      </Space>
                    )}
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                </div>
              );
            })}
            <Preview queries={prefixNameValues} />
          </Card>
        )}
      </Form.List>
    </div>
  );
}
