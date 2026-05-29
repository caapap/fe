const ru_RU = {
  title: 'Интеллектуальная доставка',
  subtitle: 'Объедините оркестрацию пайплайнов, повторное использование артефактов, разбор документов и управление тестами в одном рабочем пространстве.',
  status: 'Планируется',
  sections: {
    pipelines: {
      desc: 'Связывайте сборку, деплой, откат и этапы согласования в наглядный процесс.',
    },
    artifacts: {
      desc: 'Управляйте артефактами с версиями, происхождением и повторно используемыми каналами доставки.',
    },
    knowledge: {
      desc: 'Разбирайте deployment-документы и deployment view в черновики pipeline, CMDB-активы и кандидаты service connection.',
    },
    tests: {
      desc: 'Организуйте планы тестирования, результаты и контроль качества перед релизом.',
    },
  },
  modules: {
    pipelines: {
      title: 'Пайплайны',
      eyebrow: 'Оркестрация',
      desc: 'Объединяйте сборку, согласование, доставку и откат в повторно используемый процесс релиза.',
    },
    artifacts: {
      title: 'Репозиторий артефактов',
      eyebrow: 'Центр артефактов',
      desc: 'Архивируйте установочные пакеты, релизные сборки и артефакты доставки для повторного распространения.',
    },
    knowledge: {
      title: 'Разбор документов',
      eyebrow: 'Docs to templates',
      desc: 'Превращайте традиционные delivery-документы в черновики pipeline, CMDB-активы и кандидаты service connection.',
    },
    tests: {
      title: 'Управление тестами',
      eyebrow: 'Контроль качества',
      desc: 'Отслеживайте планы, кейсы, результаты и проверки перед релизом в одном месте.',
    },
  },
  cards: {
    blueprint: 'Рекомендуемая стартовая способность',
    object: 'Естественные объекты интеграции',
    rhythm: 'Рекомендуемый ритм работы',
  },
  values: {
    pipelines_blueprint: 'Шаблон релиза, продвижение по средам, ручное согласование, откат',
    artifacts_blueprint: 'Архив пакетов, реестр метаданных, политика хранения, трассировка загрузок',
    knowledge_blueprint: 'Разбор deployment-документов, извлечение шагов, маппинг переменных, импорт черновика',
    tests_blueprint: 'Чек-лист релиза, smoke-тесты, регрессия, карточка качества',
    pipelines_object: 'Хосты, бизнес-группы, пакеты Agent, конфиги сбора',
    artifacts_object: 'Версионированные сборки, каналы пакетов, метки сред',
    knowledge_object: 'Шаблоны pipelines, CMDB, service connections, артефакты',
    tests_object: 'Пайплайны, релизы, среды, заявки на изменения',
    pipelines_rhythm: 'На изменение / на релиз',
    artifacts_rhythm: 'Непрерывное накопление',
    knowledge_rhythm: 'При новой поставке проекта или изменении deployment view',
    tests_rhythm: 'Перед релизом и после отката',
  },
  atomicCapabilities: {
    "env-precheck": "env-precheck",
    "license-grant": "license-grant",
    component: "component",
    distribute: "distribute",
    "app-deploy": "app-deploy",
    "config-render": "config-render",
    "service-ctl": "service-ctl",
    "health-check": "health-check",
    "shell-exec": "shell-exec",
    "manual-gate": "manual-gate",
    "mcp-call": "mcp-call",
  },
  deployForms: { native: "native", hosted: "hosted", container: "container" },
};

export default ru_RU;
