import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export function getTargetInformationByIdent(ident: string) {
  return request('/api/n9e/target/extra-meta', {
    method: RequestMethod.Get,
    params: {
      ident,
    },
  }).then((res) => {
    const dat = res?.dat?.extend_info;
    try {
      return JSON.parse(dat);
    } catch (e) {
      return {};
    }
  });
}

export function putTargetsBgids(data: { bgids: number[]; idents: string[]; action: string }) {
  return request('/api/n9e/targets/bgids', {
    method: RequestMethod.Put,
    data,
  });
}

export function getBusiGroupsTags() {
  return request('/api/n9e/busi-groups/tags', {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
}

export function postTargetsUpgrade(data: { idents: string[]; new_version: string; download_url: string }) {
  return request('/api/n9e/n9e-plus/targets/upgrade', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
}

export function postTargetsAction(data: { idents: string[]; action: 'restart' | 'uninstall' }) {
  return request('/api/n9e/n9e-plus/targets/actions', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
}

export interface AgentPackage {
  id: number;
  name: string;
  version: string;
  os: string;
  arch: string;
  sha256: string;
  size: number;
  created_at: number;
  created_by: string;
  download_url: string;
}

export function getAgentPackages(): Promise<AgentPackage[]> {
  return request('/api/n9e/n9e-plus/agent-packages', {
    method: RequestMethod.Get,
  }).then((res) => res.dat || []);
}

export function uploadAgentPackage(data: { file: File; version: string; os: string; arch: string }): Promise<AgentPackage> {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('version', data.version);
  formData.append('os', data.os);
  formData.append('arch', data.arch);
  return request('/api/n9e/n9e-plus/agent-packages', {
    method: RequestMethod.Post,
    data: formData,
  }).then((res) => res.dat);
}

export function postTargetsDeploy(data: { idents: string[]; version: string; download_url?: string; package_id?: number }) {
  return request('/api/n9e/n9e-plus/targets/deploy', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
}

// ---------- M2 Phase 3: SSH Credential + Deploy Agent ----------

export interface SSHCredential {
  id: number;
  name: string;
  ssh_user: string;
  ssh_port: number;
  auth_type: 'password' | 'private_key';
  created_by?: string;
  created_at?: number;
  updated_at?: number;
}

export function getSSHCredentials(): Promise<SSHCredential[]> {
  return request('/api/n9e/ssh/credentials', {
    method: RequestMethod.Get,
  }).then((res) => res.dat || []);
}

export function addSSHCredential(data: {
  name: string;
  ssh_user: string;
  ssh_port: number;
  auth_type: 'password' | 'private_key';
  secret: string;
}): Promise<void> {
  return request('/api/n9e/ssh/credentials', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
}

export function deleteSSHCredentials(ids: number[]): Promise<void> {
  return request('/api/n9e/ssh/credentials', {
    method: RequestMethod.Delete,
    data: { ids },
  }).then((res) => res.dat);
}

export interface DeployAgentRequest {
  hosts: string[];
  credential_id: number;
  package_id?: number;
  download_url?: string;
  install_dir?: string;
  n9e_server_url: string;
}

export function postDeployAgent(data: DeployAgentRequest): Promise<{ run_id: number }> {
  return request('/api/n9e/n9e-plus/deploy/agent', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
}

export interface DeployTaskRun {
  id: number;
  task_type: string;
  created_by: string;
  created_at: number;
  completed_at: number;
  status: 'running' | 'completed';
}

export interface DeployTaskHostResult {
  id: number;
  run_id: number;
  host: string;
  ssh_user: string;
  ssh_port: number;
  status: 'pending' | 'running' | 'success' | 'failed';
  current_step: string;
  step_progress?: string;
  logs: string;
  error_msg: string;
  started_at: number;
  completed_at: number;
}

export function getDeployRun(runId: number): Promise<DeployTaskRun> {
  return request(`/api/n9e/n9e-plus/deploy/runs/${runId}`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
}

export function getDeployRunHosts(runId: number): Promise<DeployTaskHostResult[]> {
  return request(`/api/n9e/n9e-plus/deploy/runs/${runId}/hosts`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat || []);
}

export function getDeployHost(hostId: number): Promise<DeployTaskHostResult> {
  return request(`/api/n9e/n9e-plus/deploy/hosts/${hostId}`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
}

export function deleteTargetsUpgrade(data: { idents: string[] }) {
  return request('/api/n9e/n9e-plus/targets/upgrade', {
    method: RequestMethod.Delete,
    data,
  }).then((res) => res.dat);
}

export function getTargetCollectConfigs(ident: string) {
  return request(`/api/n9e/n9e-plus/targets/${ident}/collect-configs`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat || []);
}

export function postTargetRestart(ident: string) {
  return request(`/api/n9e/n9e-plus/targets/${ident}/restart`, {
    method: RequestMethod.Post,
  }).then((res) => res.dat);
}

export function deleteTargetAgent(ident: string) {
  return request(`/api/n9e/n9e-plus/targets/${ident}/agent`, {
    method: RequestMethod.Delete,
  }).then((res) => res.dat);
}
