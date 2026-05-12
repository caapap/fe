import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

import { Item, Stats } from './types';

export type { Item, Stats };

export function getList(params: {
  query?: string;
  gids?: string;
  limit: number;
  p: number;
  hosts?: string;
  downtime?: number;
  agent_versions?: string;
}): Promise<{ list: Item[]; total: number }> {
  return request('/api/n9e/targets', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
}

export function getStats(params: { gids?: string }): Promise<Stats> {
  return request('/api/n9e/targets/stats', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
}
