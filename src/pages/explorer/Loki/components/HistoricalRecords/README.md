# Loki 历史记录功能

## 功能说明

为 Loki 日志查询界面添加了历史记录功能，用户可以快速重用之前执行过的 LogQL 查询语句。

## 实现特性

- **本地存储**: 使用 localStorage 存储历史记录，按数据源ID分别管理
- **容量限制**: 最多保存 100 条历史记录
- **时间排序**: 按最近使用时间倒序排列
- **搜索功能**: 支持在历史记录中搜索特定查询语句
- **去重机制**: 相同查询语句只保存一条，但会更新时间戳
- **自动清理**: 超过容量限制时自动删除最旧的记录

## 文件结构

```
fe/src/pages/explorer/Loki/
├── components/
│   └── HistoricalRecords/
│       ├── index.tsx          # 历史记录组件
│       └── style.less         # 样式文件
├── utils/
│   └── history.ts             # 历史记录工具函数
└── index.tsx                  # 主页面（已修改）
```

## 使用方式

1. 在 LogQL 搜索框右侧会显示"历史记录"按钮
2. 点击按钮打开历史记录弹窗
3. 可以在搜索框中过滤历史记录
4. 点击任意历史记录项即可应用到当前查询
5. 每次执行查询时会自动保存到历史记录

## 存储格式

历史记录以以下格式存储在 localStorage 中：

- **存储键**: `loki-query-history-${datasourceValue}`
- **存储值**: `[[query1, timestamp1], [query2, timestamp2], ...]`

## 技术实现

- 复用了 Prometheus 历史记录的实现逻辑
- 使用 React Hooks (useState, useMemo) 管理状态
- 使用 Ant Design 的 Popover 和 Input 组件构建UI
- 通过 Form API 设置查询值 