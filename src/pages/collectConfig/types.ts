export interface CollectRuleQueryItem {
  key: string;
  op: string;
  values?: Array<string | number>;
}

export interface CollectTemplate {
  id: number;
  plugin: string;
  category?: string;
  description?: string;
  config_content: string;
  variables?: string;
  is_builtin?: number;
}

export interface CollectRule {
  id: number;
  name: string;
  group_id: number;
  queries: string;
  enable_time?: string;
  disabled: number;
  component?: string;
  component_id?: number;
  cate: string;
  content: string;
  version?: string;
  custom_params: string;
  create_at?: string;
  create_by?: string;
  update_at?: string;
  update_by?: string;
  status?: string;
}

export interface CollectRuleFormValues {
  id?: number;
  name: string;
  group_id?: number;
  disabled: number;
  cate: string;
  content: string;
  queries: CollectRuleQueryItem[];
  custom_params_text: string;
}
