const en_US = {
  title: 'Explorer',
  add_btn: 'Add a query panel',
  query_btn: 'Execute',
  query_tab: 'Query',
  addPanel: 'Add panel',
  log: {
    search_placeholder: 'Search field',
    available: 'Available fields',
    selected: 'Selected fields',
    interval: 'Interval',
    mode: {
      indexPatterns: 'Index patterns',
      indices: 'Indices',
    },
    hideChart: 'Hide chart',
    showChart: 'Show chart',
    fieldValues_topn: 'Top 5 values',
    fieldValues_topnNoData: 'The field present in the mapping, but not in the 500 documents',
    copyToClipboard: 'Copy to clipboard',
    show_conext: 'Show context',
    context: 'Log context',
    limit: 'Limit',
    sort: {
      NEWEST_FIRST: 'Newest first',
      OLDEST_FIRST: 'Oldest first',
    },
    download: 'Download logs',
    export: 'Download records',
    log_download: {
      title: 'Download',
      download_title: 'Download Log Data',
      range: 'Time range',
      filter: 'Search query',
      format: 'Data format',
      time_sort: 'Log sorting',
      count: 'Log count',
      time_sort_desc: 'Descending by time',
      time_sort_asc: 'Ascending by time',
      all: 'All',
      custom: 'Custom',
      custom_validated: 'The number of logs must be between 1-65535',
      all_quantity: 'Total approximately',
      createSuccess: 'Task created successfully',
    },
    log_export: {
      title: 'Export records (Online exported files will be retained for 3 days)',
      fileName: 'File name',
      create_time: 'Creation time',
      describe: 'File description',
      status: 'Status',
      status0: 'Pending',
      status1: 'Generated',
      status2: 'File expired',
      operation: 'Operation',
      delSuccess: 'Task deleted',
      del_btn_tips: 'Are you sure you want to delete?',
      del_btn: 'Delete',
      emptyText: 'No export records yet, please click to query logs and then click download',
    },
  },
  historicalRecords: {
    button: 'Historical records',
    searchPlaceholder: 'Search historical records',
  },
  share_tip: 'Click to copy the share link',
  share_tip_2: 'Click to copy the share link, currently only supports sharing log text queries',
  help: 'Show data source Help',
  clear_tabs: 'Clear',
  clear_tabs_tip: 'Only keep the current tab',
};
export default en_US;
