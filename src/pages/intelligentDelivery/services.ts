import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { AccessTokenKey } from '@/utils/constant';
import { basePrefix } from '@/App';


export interface ArtifactPackage {
  id: number;
  name: string;
  version: string;
  os: string;
  arch: string;
  md5: string;
  size: number;
  created_at: number;
  created_by: string;
  download_url: string;
}

export function getArtifactPackages(): Promise<ArtifactPackage[]> {
  return request('/api/n9e-plus/agent-packages', {
    method: RequestMethod.Get,
  }).then((res) => {
    const dat = res?.dat;
    return Array.isArray(dat) ? dat : [];
  });
}

export interface UploadArtifactParams {
  file: File;
  packageName: string;
  version: string;
  onProgress?: (percent: number) => void;
}

/** 通用制品上传：包名 + 自定义版本号，底层仍走 agent-packages 存储 */
export function uploadArtifact(params: UploadArtifactParams): Promise<ArtifactPackage> {
  const { file, packageName, version, onProgress } = params;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', packageName.trim());
  formData.append('version', version.trim());
  formData.append('os', 'linux');
  formData.append('arch', 'amd64');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${basePrefix}/api/n9e-plus/agent-packages`);
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem(AccessTokenKey) || ''}`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      const raw = xhr.responseText || '';
      try {
        const body = JSON.parse(raw);
        if (xhr.status >= 200 && xhr.status < 300 && body.err === '') {
          resolve(body.dat);
          return;
        }
        reject(new Error(body.err || body.message || `upload failed (${xhr.status})`));
      } catch {
        const plain = raw.trim();
        reject(new Error(plain || `upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error('network error'));
    xhr.send(formData);
  });
}
