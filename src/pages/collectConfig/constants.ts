export const NS = 'collect-config';
export const PERM = '/collect-configs';
export const DEFAULT_QUERY = [
  {
    key: 'all_hosts',
    op: '==',
    values: [],
  },
];
export const DEFAULT_VALUES = {
  name: '',
  group_id: undefined,
  disabled: 0,
  cate: '',
  content: '',
  custom_params_text: '{}',
};
