/** MVP 本地持久化：标签、禁用状态、删除掩码、仓库动态（后续 D2 迁后端） */

export type ArtifactActivityType = 'upload' | 'delete' | 'disable' | 'enable' | 'download';

export interface ArtifactActivity {
  id: string;
  type: ArtifactActivityType;
  artifactName: string;
  version: string;
  operator: string;
  reason?: string;
  createdAt: number;
}

export interface VersionState {
  disabled: boolean;
  reason?: string;
}

const ACTIVITY_KEY = 'stellar-artifact-activities';
const TAG_CATALOG_KEY = 'stellar-artifact-tag-catalog';
const GROUP_TAGS_PREFIX = 'stellar-artifact-tags:';
const VERSION_STATE_KEY = 'stellar-artifact-version-states';
const DELETED_IDS_KEY = 'stellar-artifact-deleted-ids';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getTagCatalog(): string[] {
  return readJson<string[]>(TAG_CATALOG_KEY, []);
}

export function saveTagCatalog(tags: string[]) {
  writeJson(TAG_CATALOG_KEY, [...new Set(tags.map((t) => t.trim()).filter(Boolean))]);
}

export function getGroupTags(groupKey: string): string[] {
  return readJson<string[]>(`${GROUP_TAGS_PREFIX}${groupKey}`, []);
}

export function saveGroupTags(groupKey: string, tags: string[]) {
  writeJson(`${GROUP_TAGS_PREFIX}${groupKey}`, tags);
}

export function addTagToCatalog(tag: string) {
  const trimmed = tag.trim();
  if (!trimmed) return;
  const catalog = getTagCatalog();
  if (!catalog.includes(trimmed)) {
    saveTagCatalog([...catalog, trimmed]);
  }
}

function loadVersionStates(): Record<string, VersionState> {
  return readJson<Record<string, VersionState>>(VERSION_STATE_KEY, {});
}

export function getVersionState(packageId: number): VersionState {
  return loadVersionStates()[String(packageId)] || { disabled: false };
}

export function setVersionState(packageId: number, state: VersionState) {
  const all = loadVersionStates();
  all[String(packageId)] = state;
  writeJson(VERSION_STATE_KEY, all);
}

export function getDeletedVersionIds(): number[] {
  return readJson<number[]>(DELETED_IDS_KEY, []);
}

export function markVersionDeleted(packageId: number) {
  const ids = new Set(getDeletedVersionIds());
  ids.add(packageId);
  writeJson(DELETED_IDS_KEY, Array.from(ids));
}

export function markVersionsDeleted(packageIds: number[]) {
  const ids = new Set(getDeletedVersionIds());
  packageIds.forEach((id) => ids.add(id));
  writeJson(DELETED_IDS_KEY, Array.from(ids));
}

export function getActivities(): ArtifactActivity[] {
  return readJson<ArtifactActivity[]>(ACTIVITY_KEY, []).sort((a, b) => b.createdAt - a.createdAt);
}

export function appendActivity(
  entry: Omit<ArtifactActivity, 'id' | 'createdAt'> & { createdAt?: number },
): ArtifactActivity {
  const item: ArtifactActivity = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: entry.createdAt ?? Math.floor(Date.now() / 1000),
  };
  const list = getActivities();
  writeJson(ACTIVITY_KEY, [item, ...list].slice(0, 500));
  return item;
}

export function activityTypeLabel(type: ArtifactActivityType) {
  const map: Record<ArtifactActivityType, string> = {
    upload: '上传了',
    delete: '删除了',
    disable: '禁用了',
    enable: '启用了',
    download: '下载了',
  };
  return map[type];
}
