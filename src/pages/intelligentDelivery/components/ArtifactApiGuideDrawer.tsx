import React, { useMemo, useState } from 'react';
import { Alert, Drawer, Input, Typography } from 'antd';

import Markdown from '@/components/Markdown';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ArtifactApiGuideDrawer({ open, onClose }: Props) {
  const defaultBase = useMemo(() => {
    if (typeof window === 'undefined') return 'http://127.0.0.1:30007';
    const host = window.location.hostname || '127.0.0.1';
    return `${window.location.protocol}//${host}:30007`;
  }, []);
  const [base, setBase] = useState(defaultBase);

  const tokenVar = '${YOUR_USER_TOKEN}';
  const pkg = 'my-app-1.2.dmg';
  const version = '1.2.0';
  const encodedPkg = encodeURIComponent(pkg);
  const exp = String(Date.now() + 3600_000);

  const uploadCurl = `curl -X POST '${base}/v1/n9e-plus/delivery/artifacts/files/${encodedPkg}?version=${version}&fileName=${encodedPkg}&versionDescription=release-notes' \\
  -H 'X-User-Token: ${tokenVar}' \\
  -F 'file=@./${pkg}'`;

  const downloadCurl = `curl -L '${base}/v1/n9e-plus/delivery/artifacts/files/${encodedPkg}?version=${version}' \\
  -H 'X-User-Token: ${tokenVar}' \\
  -o ${pkg}`;

  const signCurl = `curl -I '${base}/v1/n9e-plus/delivery/artifacts/files/${encodedPkg}?version=${version}&signUrl=true&expiration=${exp}' \\
  -H 'X-User-Token: ${tokenVar}'`;

  const markdownContent = useMemo(
    () => `
## 上传制品

\`POST /v1/n9e-plus/delivery/artifacts/files/{filePath}\`  
Query 参数：

- \`version\`（必填）
- \`fileName\`（可选）
- \`versionDescription\`（可选）

Body 使用 \`multipart/form-data\`，字段名为 \`file\`。

\`\`\`bash
${uploadCurl}
\`\`\`

响应示例：

\`\`\`json
{
  "successful": true,
  "object": {
    "fileMd5": "...",
    "fileSize": 123,
    "url": "..."
  }
}
\`\`\`

## 下载制品

\`GET /v1/n9e-plus/delivery/artifacts/files/{filePath}?version={version}\`

\`\`\`bash
${downloadCurl}
\`\`\`

## 获取临时免密下载地址

\`HEAD /v1/n9e-plus/delivery/artifacts/files/{filePath}?version={version}&signUrl=true&expiration={msTimestamp}\`

关键响应头：

- \`X-Stellar-Artifact-Sign-Url\`
- \`X-Stellar-Checksum-Md5\`
- \`X-Stellar-Generic-Version-Description\`

\`\`\`bash
${signCurl}
\`\`\`
`,
    [uploadCurl, downloadCurl, signCurl],
  );

  return (
    <Drawer visible={open} onClose={onClose} width={720} title='API 上传与下载' destroyOnClose>
      <Alert
        type='info'
        showIcon
        className='mb-4'
        message='鉴权说明'
        description={
          <div className='text-sm'>
            <div>
              云效使用 <Typography.Text code>Basic</Typography.Text> 认证；星相平台请在「个人中心 → Token 管理」创建 Token，请求头携带{' '}
              <Typography.Text code>X-User-Token</Typography.Text>（与 UI 登录的 Bearer JWT 不同）。
            </div>
            <div className='mt-2'>
              <Typography.Text code>filePath</Typography.Text> 对应制品列表中的<strong>包名</strong>，勿包含{' '}
              <Typography.Text code>&</Typography.Text>、<Typography.Text code>?</Typography.Text>、空格等特殊字符。
            </div>
          </div>
        }
      />
      <div className='mb-4'>
        <div className='mb-1 text-xs text-secondary'>API 基础地址（可按 Docker Compose 外部映射端口修改）</div>
        <Input
          value={base}
          onChange={(e) => setBase(e.target.value.trim())}
          placeholder='例如 http://127.0.0.1:30007'
        />
        <div className='mt-1 text-xs text-secondary'>
          默认用 <Typography.Text code>:30007</Typography.Text>；之前看到的 <Typography.Text code>:8765</Typography.Text>{' '}
          是前端开发服务端口，不是 Nightingale API 端口。
        </div>
      </div>
      <Markdown content={markdownContent} showCodeCopy />
    </Drawer>
  );
}
