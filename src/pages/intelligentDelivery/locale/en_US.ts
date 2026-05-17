const en_US = {
  title: 'Intelligent Delivery',
  subtitle: 'Build a unified delivery workspace for pipeline orchestration, artifact reuse, knowledge sharing, and test governance.',
  status: 'Planning',
  sections: {
    pipelines: {
      desc: 'Coordinate build, deployment, rollback, and approval stages with visible execution history.',
    },
    artifacts: {
      desc: 'Manage delivery assets with versions, provenance, and reusable distribution channels.',
    },
    knowledge: {
      desc: 'Capture runbooks, troubleshooting notes, and delivery standards next to execution flows.',
    },
    tests: {
      desc: 'Organize test plans, results, and quality gates before release.',
    },
  },
  modules: {
    pipelines: {
      title: 'Pipelines',
      eyebrow: 'Orchestration',
      desc: 'Connect build, approval, delivery, and rollback stages into a reusable release flow.',
    },
    artifacts: {
      title: 'Artifact Repository',
      eyebrow: 'Asset hub',
      desc: 'Archive install packages, release bundles, and delivery artifacts for repeated distribution.',
    },
    knowledge: {
      title: 'Knowledge Base',
      eyebrow: 'Shared context',
      desc: 'Preserve SOPs, incident notes, and release experience alongside delivery activities.',
    },
    tests: {
      title: 'Test Management',
      eyebrow: 'Quality gates',
      desc: 'Track plans, cases, results, and release checks in one place.',
    },
  },
  cards: {
    blueprint: 'Recommended initial capability',
    object: 'Natural integration objects',
    rhythm: 'Suggested operating rhythm',
  },
  values: {
    pipelines_blueprint: 'Release template, environment promotion, manual approval, rollback',
    artifacts_blueprint: 'Package archive, metadata registry, retention policy, download traceability',
    knowledge_blueprint: 'Runbook, FAQ, release notes, postmortem snippets',
    tests_blueprint: 'Release checklist, smoke tests, regression suite, quality scorecard',
    pipelines_object: 'Hosts, business groups, agent packages, collect configs',
    artifacts_object: 'Versioned bundles, package channels, environment labels',
    knowledge_object: 'Teams, applications, release windows, incident scenarios',
    tests_object: 'Pipelines, releases, environments, change requests',
    pipelines_rhythm: 'Per change / per release',
    artifacts_rhythm: 'Continuous accumulation',
    knowledge_rhythm: 'Update with every incident or release',
    tests_rhythm: 'Before release and after rollback',
  },
};

export default en_US;
