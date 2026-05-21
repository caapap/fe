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
// --- Pipeline APIs ---

export interface Pipeline {
  id: number;
  name: string;
  description: string;
  group_id: number;
  status: string;
  latest_config_id: number;
  latest_run_id: number;
  latest_run_no: number;
  latest_status: string;
  latest_stage: string;
  latest_operator: string;
  latest_trigger: string;
  latest_start_at: number;
  latest_elapsed_ms: number;
  creator: string;
  create_at: number;
  update_at: number;
  update_by: string;
}

export interface PipelineListResult {
  list: Pipeline[];
  total: number;
}

export function getPipelines(params?: { group_id?: number; query?: string; page?: number; limit?: number }): Promise<PipelineListResult> {
  return request('/api/n9e-plus/delivery/pipelines', {
    method: RequestMethod.Get,
    params: { group_id: -1, page: 1, limit: 20, ...params },
  }).then((res) => res?.dat ?? { list: [], total: 0 });
}

export function createPipeline(data: { flow_yaml: string; group_id?: number }): Promise<number> {
  return request('/api/n9e-plus/delivery/pipelines', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.dat);
}

export function deletePipeline(id: number): Promise<void> {
  return request(`/api/n9e-plus/delivery/pipelines/${id}`, {
    method: RequestMethod.Delete,
  });
}

export function triggerPipelineRun(id: number, variables?: Record<string, string>): Promise<any> {
  return request(`/api/n9e-plus/delivery/pipelines/${id}/run`, {
    method: RequestMethod.Post,
    data: { variables: variables ? JSON.stringify(variables) : '' },
  }).then((res) => res?.dat);
}

export function getPipelineRuns(pipelineId: number, params?: { page?: number; limit?: number }): Promise<{ list: any[]; total: number }> {
  return request(`/api/n9e-plus/delivery/pipelines/${pipelineId}/runs`, {
    method: RequestMethod.Get,
    params: { page: 1, limit: 20, ...params },
  }).then((res) => res?.dat ?? { list: [], total: 0 });
}

export function getPipelineRunDetail(runId: number): Promise<any> {
  return request(`/api/n9e-plus/delivery/pipeline-runs/${runId}`, {
    method: RequestMethod.Get,
  }).then((res) => res?.dat);
}

// --- Artifact APIs ---

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
