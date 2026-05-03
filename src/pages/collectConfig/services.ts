import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { CollectRule, CollectTemplate } from './types';

const apiPrefix = '/api/n9e/n9e-plus';

export const getCollectRules = (params?: Record<string, any>): Promise<CollectRule[]> => {
  return request(`${apiPrefix}/collects`, {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat || []);
};

export const getCollectRule = (id: string | number): Promise<CollectRule> => {
  return request(`${apiPrefix}/collect/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const createCollectRule = (data: Partial<CollectRule>) => {
  return request(`${apiPrefix}/collect`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const updateCollectRule = (id: string | number, data: Partial<CollectRule>) => {
  return request(`${apiPrefix}/collect/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res.dat);
};

export const updateCollectRuleStatus = (id: string | number, disabled: number) => {
  return request(`${apiPrefix}/collect/${id}/status`, {
    method: RequestMethod.Put,
    data: { disabled },
  }).then((res) => res.dat);
};

export const deleteCollectRules = (ids: number[]) => {
  return request(`${apiPrefix}/collects`, {
    method: RequestMethod.Delete,
    data: { ids },
  }).then((res) => res.dat);
};

export const getCollectTemplates = (): Promise<CollectTemplate[]> => {
  return request(`${apiPrefix}/collect-templates`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat || []);
};

// 采集配置测试相关 API
export const createTryrunTask = (data: { idents: string[]; input: string; config: string; timeout: number }) => {
  return request(`${apiPrefix}/collect-tryrun`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const getTryrunResult = (uuid: string) => {
  return request(`${apiPrefix}/collect-tryrun-res`, {
    method: RequestMethod.Get,
    params: { uuid },
  }).then((res) => res.dat || []);
};

// 机器预览 API
export const previewHosts = (queries: string) => {
  return request(`${apiPrefix}/collects/preview`, {
    method: RequestMethod.Post,
    data: { queries },
  }).then((res) => res.dat || []);
};
