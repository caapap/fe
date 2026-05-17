const zh_HK = {
  title: '智能交付',
  subtitle: '把流水線編排、製品複用、知識沉澱與測試治理收進一個統一的交付工作台。',
  status: '規劃中',
  sections: {
    pipelines: {
      desc: '把構建、發布、審批、回滾等階段串成可複用的交付流程，並保留執行軌跡。',
    },
    artifacts: {
      desc: '管理安裝包、發布包和交付製品，保留版本、來源與複用關係。',
    },
    knowledge: {
      desc: '沉澱運維手冊、故障經驗與發布規範，讓交付與知識在同一上下文中協作。',
    },
    tests: {
      desc: '圍繞發布前後的質量門禁，組織測試計劃、結果與追蹤記錄。',
    },
  },
  modules: {
    pipelines: {
      title: '流水線',
      eyebrow: '流程編排',
      desc: '把構建、審批、下發、回滾串成可複用的發布流程，適合承載後續智能交付主鏈路。',
    },
    artifacts: {
      title: '製品倉庫',
      eyebrow: '資產中樞',
      desc: '統一歸檔安裝包、版本包和交付產物，為離線分發、複用和追溯提供底座。',
    },
    knowledge: {
      title: '知識庫',
      eyebrow: '經驗沉澱',
      desc: '把 SOP、FAQ、發布說明和事故復盤與交付動作關聯起來，減少重複溝通。',
    },
    tests: {
      title: '測試管理',
      eyebrow: '質量門禁',
      desc: '圍繞發布流程管理測試計劃、測試集和驗收結果，把質量檢查前置到交付過程。',
    },
  },
  cards: {
    blueprint: '推薦的首期能力',
    object: '天然可聯動對象',
    rhythm: '建議的使用節奏',
  },
  values: {
    pipelines_blueprint: '發布模板、環境晉級、人工審批、回滾節點',
    artifacts_blueprint: '包歸檔、元數據登記、保留策略、下載追蹤',
    knowledge_blueprint: '運維手冊、FAQ、發布說明、復盤片段',
    tests_blueprint: '發布檢查單、冒煙測試、回歸測試、質量評分卡',
    pipelines_object: '機器、業務組、Agent 包、採集配置',
    artifacts_object: '版本製品、包渠道、環境標籤',
    knowledge_object: '團隊、應用、發布窗口、事故場景',
    tests_object: '流水線、發布單、環境、變更申請',
    pipelines_rhythm: '每次變更 / 每次發布',
    artifacts_rhythm: '持續積累',
    knowledge_rhythm: '每次故障或發布後更新',
    tests_rhythm: '發布前與回滾後',
  },
};

export default zh_HK;
