const zh_CN = {
  title: '智能交付',
  subtitle: '把流水线编排、资源复用、知识沉淀与测试治理收进一个统一的交付工作台。',
  status: '规划中',
  sections: {
    pipelines: {
      desc: '把构建、发布、审批、回滚等阶段串成可复用的交付流程，并保留执行轨迹。',
    },
    artifacts: {
      desc: '管理安装包、发布包和交付制品，保留版本、来源与复用关系。',
    },
    knowledge: {
      desc: '沉淀运维手册、故障经验与发布规范，让交付与知识在同一上下文中协作。',
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
      title: '知识库',
      eyebrow: '经验沉淀',
      desc: '把 SOP、FAQ、发布说明和事故复盘与交付动作关联起来，减少重复沟通。',
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
    knowledge_blueprint: '运维手册、FAQ、发布说明、复盘片段',
    tests_blueprint: '发布检查单、冒烟测试、回归测试、质量评分卡',
    pipelines_object: '机器、业务组、Agent 包、采集配置',
    artifacts_object: '版本制品、包渠道、环境标签',
    knowledge_object: '团队、应用、发布窗口、事故场景',
    tests_object: '流水线、发布单、环境、变更申请',
    pipelines_rhythm: '每次变更 / 每次发布',
    artifacts_rhythm: '持续积累',
    knowledge_rhythm: '每次故障或发布后更新',
    tests_rhythm: '发布前与回滚后',
  },
};

export default zh_CN;
