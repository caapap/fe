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
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation, Link } from 'react-router-dom';
import querystring from 'query-string';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Button, Space, Dropdown, Menu, notification, Input, message, Tooltip } from 'antd';
import { RollbackOutlined, SettingOutlined, SaveOutlined, FullscreenOutlined, DownOutlined } from '@ant-design/icons';
import { useKeyPress } from 'ahooks';
import { TimeRangePickerWithRefresh, IRawTimeRange } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import { IS_ENT } from '@/utils/constant';
import { updateDashboardConfigs, getBusiGroupsDashboards } from '@/services/dashboardV2';
import DashboardLinks from '../DashboardLinks';
import { AddPanelIcon } from '../config';
import { visualizations } from '../Editor/config';
import { dashboardTimeCacheKey } from './Detail';
import FormModal from '../List/FormModal';
import ImportGrafanaURLFormModal from '../List/ImportGrafanaURLFormModal';
import { IDashboard, ILink } from '../types';
import { useGlobalState } from '../globalState';
import { goBack } from './utils';

interface IProps {
  dashboard: IDashboard;
  dashboardLinks?: ILink[];
  setDashboardLinks: (links: ILink[]) => void;
  handleUpdateDashboardConfigs: (id: number, params: any) => void;
  range: IRawTimeRange;
  setRange: (range: IRawTimeRange) => void;
  onAddPanel: (type: string) => void;
  isPreview: boolean;
  isBuiltin: boolean;
  isAuthorized: boolean;
  gobackPath?: string;
  editable: boolean;
  updateAtRef: React.MutableRefObject<number | undefined>;
  setAllowedLeave: (allowed: boolean) => void;
}

const cachePageTitle = document.title || 'Stellar';

export default function Title(props: IProps) {
  const { t } = useTranslation('dashboard');
  const {
    dashboard,
    dashboardLinks,
    setDashboardLinks,
    handleUpdateDashboardConfigs,
    range,
    setRange,
    onAddPanel,
    isPreview,
    isBuiltin,
    isAuthorized,
    editable,
    updateAtRef,
    setAllowedLeave,
  } = props;
  const history = useHistory();
  const location = useLocation();
  const { siteInfo, dashboardSaveMode } = useContext(CommonStateContext);
  const query = querystring.parse(location.search);
  const { viewMode, __public__ } = query;
  const isClickTrigger = useRef(false);
  const [dashboardList, setDashboardList] = useState<IDashboard[]>([]);
  const [dashboardListDropdownSearch, setDashboardListDropdownSearch] = useState('');
  const [dashboardListDropdownVisible, setDashboardListDropdownVisible] = useState(false);
  const [panelClipboard, setPanelClipboard] = useGlobalState('panelClipboard');

  useEffect(() => {
    document.title = `${dashboard.name} - ${siteInfo?.page_title || cachePageTitle}`;
    return () => {
      document.title = siteInfo?.page_title || cachePageTitle;
    };
  }, [dashboard.name]);

  useKeyPress('esc', () => {
    if (query.viewMode === 'fullscreen') {
      history.replace({
        pathname: location.pathname,
        search: querystring.stringify(_.omit(query, ['viewMode', 'themeMode'])),
      });
      notification.close('dashboard_fullscreen');
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 500);
    }
  });

  useEffect(() => {
    if (query.viewMode === 'fullscreen' && isClickTrigger.current) {
      notification.info({
        key: 'dashboard_fullscreen',
        message: (
          <div>
            <div>{t('detail.fullscreen.notification.esc')}</div>
          </div>
        ),
        duration: 3,
      });
    }
  }, [query.viewMode]);

  useEffect(() => {
    // __public__: true 为公开仪表盘，公开仪表盘不需要获取分组下的仪表盘列表
    if (__public__ !== 'true' && dashboard.group_id && isPreview === false) {
      getBusiGroupsDashboards(_.toString(dashboard.group_id)).then((res) => {
        setDashboardList(res);
      });
    }
  }, [__public__, dashboard?.group_id]);

  return (
    <div
      className={`dashboard-detail-header ${!IS_ENT ? 'n9e-page-header-content' : ''}`}
      style={{
        display: query.viewMode === 'fullscreen' ? 'none' : 'flex',
      }}
    >
      <div className='dashboard-detail-header-left'>
        {isPreview && !isBuiltin ? null : (
          <Space>
            <Tooltip title={isBuiltin ? t('back_icon_tip_is_built_in') : t('back_icon_tip')}>
              <RollbackOutlined
                className='back_icon'
                onClick={() => {
                  goBack(history).catch(() => {
                    history.push(props.gobackPath || '/dashboards');
                  });
                }}
              />
            </Tooltip>
            <Space className='pr1'>
              <Link to={props.gobackPath || '/dashboards'}>{isBuiltin ? t('builtInComponents:title') : t('list')}</Link>
              {'>'}
            </Space>
          </Space>
        )}
        {isPreview === true || __public__ === 'true' ? (
          // 公开仪表盘不显示下拉
          <div className='title'>{dashboard.name}</div>
        ) : (
          <Dropdown
            trigger={['click']}
            visible={dashboardListDropdownVisible}
            onVisibleChange={(visible) => {
              setDashboardListDropdownVisible(visible);
            }}
            overlay={
              <div className='collects-payloads-dropdown-overlay p2 n9e-fill-color-2 n9e-border-base n9e-border-radius-base n9e-base-shadow'>
                <Input
                  className='mb1'
                  placeholder={t('common:search_placeholder')}
                  value={dashboardListDropdownSearch}
                  onChange={(e) => {
                    setDashboardListDropdownSearch(e.target.value);
                  }}
                />
                <Menu>
                  {_.map(
                    _.filter(dashboardList, (item) => {
                      return _.includes(_.toLower(item.name), _.toLower(dashboardListDropdownSearch));
                    }),
                    (item) => {
                      return (
                        <Menu.Item
                          key={item.id}
                          onClick={() => {
                            history.push(`/dashboards/${item.ident || item.id}`);
                            setDashboardListDropdownVisible(false);
                            setDashboardListDropdownSearch('');
                          }}
                        >
                          {item.name}
                        </Menu.Item>
                      );
                    },
                  )}
                </Menu>
              </div>
            }
          >
            <span style={{ cursor: 'pointer' }}>
              <span className='title'>{dashboard.name}</span> <DownOutlined />
            </span>
          </Dropdown>
        )}
      </div>

      <div className='dashboard-detail-header-right'>
        <Space>
          {dashboard.configs?.mode !== 'iframe' ? (
            <>
              {isAuthorized && (
                <Dropdown
                  trigger={['click']}
                  overlay={
                    <Menu>
                      {_.map(_.concat(panelClipboard ? [{ type: 'pastePanel' }] : [], [{ type: 'row', name: 'row' }], visualizations), (item) => {
                        return (
                          <Menu.Item
                            key={item.type}
                            onClick={() => {
                              onAddPanel(item.type);
                            }}
                          >
                            {t(`visualizations.${item.type}`)}
                          </Menu.Item>
                        );
                      })}
                    </Menu>
                  }
                >
                  <Button type='primary' icon={<AddPanelIcon />}>
                    {t('add_panel')}
                  </Button>
                </Dropdown>
              )}
              <TimeRangePickerWithRefresh
                localKey={`${dashboardTimeCacheKey}_${dashboard.id}`}
                dateFormat='YYYY-MM-DD HH:mm:ss'
                value={range}
                onChange={(val) => {
                  // 以下 history replace 会触发 beforeunload，在手动保存模式下暂时关闭
                  if (dashboardSaveMode !== 'manual') {
                    history.replace({
                      pathname: location.pathname,
                      // 重新设置时间范围时，清空 __from 和 __to
                      search: querystring.stringify(_.omit(querystring.parse(window.location.search), ['__from', '__to'])),
                    });
                  }
                  setRange(val);
                }}
              />
              {isAuthorized && dashboardSaveMode === 'manual' && (
                <Button
                  icon={<SaveOutlined />}
                  onClick={() => {
                    if (editable) {
                      updateDashboardConfigs(dashboard.id, {
                        configs: JSON.stringify(dashboard.configs),
                      }).then((res) => {
                        updateAtRef.current = res.update_at;
                        message.success(t('detail.saved'));
                        setAllowedLeave(true);
                      });
                    } else {
                      message.warning(t('detail.expired'));
                    }
                  }}
                />
              )}
              {isAuthorized && (
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => {
                    FormModal({
                      action: 'edit',
                      initialValues: dashboard,
                      onOk: () => {
                        window.location.reload();
                      },
                    });
                  }}
                />
              )}
              <DashboardLinks
                editable={isAuthorized}
                value={dashboardLinks}
                onChange={(v) => {
                  const dashboardConfigs: any = dashboard.configs;
                  dashboardConfigs.links = v;
                  handleUpdateDashboardConfigs(dashboard.id, {
                    configs: JSON.stringify(dashboardConfigs),
                  });
                  setDashboardLinks(v);
                }}
              />
            </>
          ) : (
            <>
              {isAuthorized && (
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => {
                    ImportGrafanaURLFormModal({
                      initialValues: dashboard,
                      onOk: () => {
                        window.location.reload();
                      },
                    });
                  }}
                />
              )}
            </>
          )}
          <Tooltip title={dashboard.configs?.mode === 'iframe' ? t('embeddedDashboards:exitFullScreen_tip') : undefined}>
            <Button
              onClick={() => {
                const newQuery = _.omit(querystring.parse(window.location.search), ['viewMode', 'themeMode']);
                if (!viewMode) {
                  newQuery.viewMode = 'fullscreen';
                  isClickTrigger.current = true;
                }
                history.replace({
                  pathname: location.pathname,
                  search: querystring.stringify(newQuery),
                });
                // TODO: 解决仪表盘 layout resize 问题
                setTimeout(() => {
                  window.dispatchEvent(new Event('resize'));
                }, 500);
              }}
              icon={<FullscreenOutlined />}
            />
          </Tooltip>
        </Space>
      </div>
    </div>
  );
}
