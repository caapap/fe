const zh_CN = {
  title: '智能交付',
  subtitle: '把流水线编排、资源复用、文档解析与测试治理收进一个统一的交付工作台。',
  status: '规划中',
  sections: {
    pipelines: {
      desc: '把构建、发布、审批、回滚等阶段串成可复用的交付流程，并保留执行轨迹。',
    },
    artifacts: {
      desc: '管理安装包、发布包和交付制品，保留版本、来源与复用关系。',
    },
    knowledge: {
      desc: '解析部署文档与部署视图，生成流水线草稿、CMDB 资产和服务连接候选项。',
    },
    tests: {
      desc: '围绕发布前后的质量门禁，组织测试计划、结果与追踪记录。',
    },
  },
  modules: {
    pipelines: {
      title: '流水线',
      eyebrow: '流程编排',
      desc: '把构建、审批、下发、回滚串成可复用的发布流程，适合承载后续智能交付主链路。',
    },
    artifacts: {
      title: '资源仓库',
      eyebrow: '资产中枢',
      desc: '统一归档安装包、版本包和交付产物，为离线分发、复用和追溯提供底座。',
    },
    knowledge: {
      title: '文档解析',
      eyebrow: '文档转模板',
      desc: '把传统部署文档加工成流水线草稿，并从部署视图中提取 CMDB 与服务连接。',
    },
    tests: {
      title: '测试管理',
      eyebrow: '质量门禁',
      desc: '围绕发布流程管理测试计划、测试集和验收结果，把质量检查前置到交付过程。',
    },
  },
  cards: {
    blueprint: '推荐的首期能力',
    object: '天然可联动对象',
    rhythm: '建议的使用节奏',
  },
  values: {
    pipelines_blueprint: '发布模板、环境晋级、人工审批、回滚节点',
    artifacts_blueprint: '包归档、元数据登记、保留策略、下载追踪',
    knowledge_blueprint: '部署文档解析、流程抽取、变量映射、导入草稿',
    tests_blueprint: '发布检查单、冒烟测试、回归测试、质量评分卡',
    pipelines_object: '机器、业务组、Agent 包、采集配置',
    artifacts_object: '版本制品、包渠道、环境标签',
    knowledge_object: '流水线模板、CMDB、服务连接、制品包',
    tests_object: '流水线、发布单、环境、变更申请',
    pipelines_rhythm: '每次变更 / 每次发布',
    artifacts_rhythm: '持续积累',
    knowledge_rhythm: '每次新项目交付或部署视图变更',
    tests_rhythm: '发布前与回滚后',
  },
  atomicCapabilities: {
    'env-precheck': '环境预检（IPTSE）',
    'license-grant': '授权',
    component: '公共组件',
    distribute: '分发下发',
    'app-deploy': '应用部署',
    'config-render': '配置注入',
    'service-ctl': '服务管控',
    'health-check': '健康检查',
    'shell-exec': '命令执行',
    'manual-gate': '人工卡点',
    'mcp-call': 'MCP 调用',
  },
  deployForms: {
    native: '原生',
    hosted: '托管平台',
    container: '容器化',
  },
};

export default zh_CN;
