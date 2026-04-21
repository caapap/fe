import React, { useContext } from 'react';
import { Badge, Tooltip } from 'antd';
import { Trans } from 'react-i18next';
import { CommonStateContext } from '@/App';
// @ts-ignore
import useIsPlus from 'plus:/components/useIsPlus';
import './locale';
export interface Versions {
  github_verison: string;
  version: string;
}

export default function Version() {
  const isPlus = useIsPlus();
  const { versions } = useContext(CommonStateContext);
  const fePkgVersion = import.meta.env.VITE_FE_PKG_VERSION;
  const serverVersion = versions?.version;
  /** 后端版本来自 /api/n9e/versions；与 package.json 不一致时并列展示，避免误以为右上角就是 fe 的 tag */
  const displayVersion =
    fePkgVersion && serverVersion && fePkgVersion !== serverVersion ? `${fePkgVersion} · ${serverVersion}` : fePkgVersion || serverVersion;

  if (!isPlus) {
    return (
      <div style={{ marginRight: 16 }}>
        <Tooltip
          title={
            versions.newVersion ? (
              <Trans
                ns='headerVersion'
                i18nKey='newVersion'
                values={{
                  version: versions?.github_verison,
                }}
                components={{ a: <a style={{ color: '#b7a6e5' }} href='https://github.com/ccfos/nightingale/releases' target='_blank' /> }}
              />
            ) : undefined
          }
        >
          <Badge dot={versions.newVersion}>
            <span
              style={{
                cursor: versions.newVersion ? 'pointer' : 'default',
              }}
            >
              {displayVersion}
            </span>
          </Badge>
        </Tooltip>
      </div>
    );
  }
  return null;
}
