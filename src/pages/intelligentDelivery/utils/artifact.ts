import { ArtifactPackage } from '../services';

export function parseArtifactName(name: string) {
  const idx = name.lastIndexOf('/');
  if (idx === -1) {
    return { repoPath: '', fileName: name, fullName: name };
  }
  return {
    repoPath: name.slice(0, idx),
    fileName: name.slice(idx + 1),
    fullName: name,
  };
}

/** 列表/详情展示用包名（兼容历史数据里带 path 的 name） */
export function getDisplayPackageName(name: string) {
  const { fileName } = parseArtifactName(name);
  return fileName || name;
}

export interface ArtifactPackageGroup {
  key: string;
  repoPath: string;
  displayName: string;
  versions: ArtifactPackage[];
  latest: ArtifactPackage;
  versionCount: number;
  totalSize: number;
  latestUpdatedAt: number;
}

export function groupArtifactPackages(items: ArtifactPackage[]): ArtifactPackageGroup[] {
  const map = new Map<string, ArtifactPackage[]>();
  for (const item of items) {
    const key = item.name;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }

  return Array.from(map.entries())
    .map(([key, versions]) => {
      const sorted = [...versions].sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
      const latest = sorted[0];
      const { repoPath } = parseArtifactName(latest.name);
      return {
        key,
        repoPath,
        displayName: getDisplayPackageName(latest.name),
        versions: sorted,
        latest,
        versionCount: sorted.length,
        totalSize: sorted.reduce((sum, v) => sum + (v.size || 0), 0),
        latestUpdatedAt: latest.created_at || 0,
      };
    })
    .sort((a, b) => b.latestUpdatedAt - a.latestUpdatedAt);
}

export function formatBytes(size: number) {
  if (!size) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = size;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const digits = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(digits)} ${units[unitIndex]}`;
}

export const LAST_DOWNLOAD_TIME_TOOLTIP =
  'MVP 阶段尚未记录真实下载时间：列表中的「最近下载时间」暂用最近上传时间展示。后续版本会在每次 HTTP 下载时更新该字段。';
