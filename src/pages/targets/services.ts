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

export function deleteTargetsUpgrade(data: { idents: string[] }) {
  return request('/api/n9e/n9e-plus/targets/upgrade', {
    method: RequestMethod.Delete,
    data,
  }).then((res) => res.dat);
}
