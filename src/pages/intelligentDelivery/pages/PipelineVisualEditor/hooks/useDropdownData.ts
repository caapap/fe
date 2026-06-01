import { useEffect, useState } from 'react';
import { getArtifactPackages, getServiceConnections } from '../../../services';
import { getBusiGroups } from '@/services/common';

/** 制品包选项 */
export function useArtifactOptions() {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getArtifactPackages()
      .then((packages) => {
        const opts = packages.map((pkg) => ({
          value: `${pkg.name}:${pkg.version}`,
          label: `${pkg.name} v${pkg.version} (${pkg.os}/${pkg.arch})`,
        }));
        setOptions(opts);
      })
      .catch((err) => {
        console.error('Failed to load artifact packages:', err);
        setOptions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { options, loading };
}

/** 主机组选项 */
export function useBusiGroupOptions() {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getBusiGroups('')
      .then((res) => {
        const groups = res?.dat || [];
        const opts = groups.map((g: any) => ({
          value: g.id.toString(),
          label: `${g.name} (${g.label_value || 'default'})`,
        }));
        setOptions(opts);
      })
      .catch((err) => {
        console.error('Failed to load busi groups:', err);
        setOptions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { options, loading };
}

/** 服务连接选项 */
export function useServiceConnectionOptions(type?: 'SSH_KEY' | 'USERNAME_PASSWORD' | 'TOKEN' | 'all') {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getServiceConnections({ limit: 100 })
      .then((res) => {
        let connections = res?.list || [];
        if (type && type !== 'all') {
          connections = connections.filter((c) => c.type === type);
        }
        const opts = connections.map((c) => ({
          value: c.id.toString(),
          label: `${c.name} (${c.type})`,
        }));
        setOptions(opts);
      })
      .catch((err) => {
        console.error('Failed to load service connections:', err);
        setOptions([]);
      })
      .finally(() => setLoading(false));
  }, [type]);

  return { options, loading };
}

/** MCP Provider 选项（从后端动态加载，暂时 mock） */
export function useMcpProviderOptions() {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([
    { value: 'ansible-mcp-server', label: 'ansible-mcp-server（运维自动化）' },
    { value: 'skynet-mcp-server', label: 'skynet-mcp-server（Skynet 托管平台）' },
    { value: 'k8s-mcp-server', label: 'k8s-mcp-server（Kubernetes）' },
  ]);
  const [loading, setLoading] = useState(false);

  // TODO: 从 /api/n9e-plus/mcp/providers 动态加载
  // useEffect(() => {
  //   setLoading(true);
  //   request('/api/n9e-plus/mcp/providers', { method: 'GET' })
  //     .then((res) => {
  //       const providers = res?.dat || [];
  //       const opts = providers.map((p: any) => ({
  //         value: p.name,
  //         label: `${p.name}（${p.description}）`,
  //       }));
  //       setOptions(opts);
  //     })
  //     .finally(() => setLoading(false));
  // }, []);

  return { options, loading };
}
