const zh_HK = {
  business_group: '業務組',
  search_placeholder: '搜尋',
  nodata: '暫無數據',
  btn: {
    add: '新增',
    create: '建立',
    modify: '修改',
    delete: '刪除',
    clone: '克隆',
    detail: '詳情',
    execute: '查詢',
    export: '匯出',
    import: '匯入',
    save: '儲存',
    ok: '確定',
    cancel: '取消',
    view: '檢視',
    more: '更多操作',
    back: '返回',
    edit: '編輯',
    submit: '提交',
    operations: '操作',
    testAndSave: '測試並儲存',
    batch_operations: '批量操作',
    batch_delete: '批量刪除',
    batch_clone: '批量克隆',
    batch_modify: '批量修改',
    batch_export: '批量匯出',
    batch_import: '批量匯入',
    test: '測試',
  },
  table: {
    name: '名稱',
    ident: '標識',
    tag: '標籤',
    update_at: '更新時間',
    update_by: '更新人',
    create_at: '建立時間',
    create_by: '建立者',
    status: '狀態',
    enabled: '啟用',
    note: '備註',
    operations: '操作',
    total: '共 {{total}} 條',
  },
  datasource: {
    prod: '監控型別',
    name: '數據源',
    type: '數據源型別',
    id: '關聯數據源',
    id_required: '請選擇數據源',
    empty_modal: {
      title: '暫無數據源配置，請聯絡管理員去新增數據源',
      btn1: '前往配置',
      btn2: '知道了',
    },
  },
  confirm: {
    delete: '確認刪除嗎？',
    clone: '確認克隆嗎？',
    save: '確認儲存嗎？',
  },
  success: {
    submit: '提交成功',
    modify: '修改成功',
    edit: '編輯成功',
    create: '創建成功',
    add: '新增成功',
    delete: '刪除成功',
    clone: '克隆成功',
    sort: '排序成功',
    import: '匯入成功',
    save: '儲存成功',
  },
  error: {
    clone: '克隆失敗',
    import: '匯入失敗',
  },
  time: {
    millisecond: '毫秒',
    second: '秒',
    minute: '分鐘',
    hour: '小時',
    weekdays: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
  },
  severity: {
    '1': '一級報警',
    '2': '二級報警',
    '3': '三級報警',
  },
  tpl: '自愈指令碼',
  'tpl.create': '建立',
  'tpl.tag.bind': '繫結標籤',
  'tpl.tag.unbind': '解綁標籤',
  'tpl.tag.bind.title': '批量繫結標籤',
  'tpl.tag.bind.field': '待繫結的標籤',
  'tpl.tag.bind.success': '批量繫結標籤成功',
  'tpl.tag.unbind.title': '批量解綁標籤',
  'tpl.tag.unbind.field': '待解綁的標籤',
  'tpl.tag.unbind.success': '批量解綁標籤成功',
  'tpl.node.modify': '修改節點',
  'tpl.node.modify.title': '批量修改節點',
  'tpl.batch.modify.group': '批量修改所屬分組',
  'tpl.title': '標題',
  'tpl.title.tpl.help': '標題，說明這個指令碼的作用',
  'tpl.title.task.help': '標題，說明這個任務的作用',
  'tpl.tags': '標籤',
  'tpl.tags.help': '標籤，用於分類',
  'tpl.creator': '建立人',
  'tpl.last_updator': '更新人',
  'tpl.last_updated': '更新時間',
  'tpl.account.help': '執行賬號，慎用 root，除非要代表作業系統意志',
  'tpl.batch.help': '併發度，預設是 0，表示全併發執行，1 表示順序執行，2 表示每次執行 2 臺',
  'tpl.tolerance.help': '容忍幾臺機器失敗，預設是 0，表示一臺都不容忍，只要失敗了，立馬暫停',
  'tpl.timeout.help': '單機指令碼執行的超時時間，單位是秒',
  'tpl.pause.help': '暫停點，做完某臺之後暫停一下，要暫停多臺，寫多個 host，逗號分隔',
  'tpl.host.help': '要執行的機器列表',
  'tpl.script.help': '要執行的指令碼內容',
  'tpl.args.help': '附於指令碼之後的引數，多個引數之間用雙逗號,,分隔，比如 arg1,,arg2,,arg3',
  'tpl.modify': '編輯指令碼',
  'tpl.create.task': '建立任務',
  task: '執行歷史',
  'task.create': '建立任務',
  'task.title': '標題',
  'task.done': '是否完成',
  'task.clone': '克隆任務',
  'task.meta': '元資訊',
  'task.creator': '建立人',
  'task.created': '建立時間',
  'task.only.mine': '只看自己',
  'task.host': 'Host',
  'task.status': '狀態',
  'task.output': '輸出',
  'task.refresh': '重新整理',
  'task.control.params': '控制引數',
  'task.account': '執行賬號',
  'task.batch': '併發度',
  'task.tolerance': '容忍度',
  'task.timeout': '超時時間',
  'task.script': '指令碼內容',
  'task.script.args': '指令碼引數',
  'task.pause': '暫停點',
  'task.host.list': '機器列表',
  'task.clone.new': '克隆一個新任務',
  'task.temporary.create': '建立臨時任務',
  'task.save.temporarily': '儲存暫不執行',
  'task.save.execute': '儲存立刻執行',
  'task.tip.title': '提示資訊',
  'task.tip.content': '如果你的角色是管理員，則可以在任意機器執行指令碼；否則，只能對有管理許可權的業務組下的機器執行指令碼',
  'last.7.days': '最近 7 天',
  'last.15.days': '最近 15 天',
  'last.30.days': '最近 30 天',
  'last.60.days': '最近 60 天',
  'last.90.days': '最近 90 天',
  'msg.submit.success': '提交成功',
  'msg.modify.success': '修改成功',
  'msg.create.success': '創建成功',
  'msg.add.success': '新增成功',
  'msg.delete.success': '刪除成功',
  'msg.clone.success': '克隆成功',
  'msg.clone.error': '克隆失敗',
  'msg.sort.success': '排序成功',
};

export default zh_HK;
