const en_US = {
  pageTitle: 'Welcome to Nightingale',
  hero: {
    badge: 'Open Source · All-in-one Monitoring & Alerting',
    highlight: 'Monitoring made simple and intelligent',
    description: 'Unified ingestion and analysis of metrics and logs. Alerting, dashboards and an AI assistant out of the box. Cloud-native ready.',
    primaryAction: 'View Docs',
    secondaryAction: 'Ask AI',
  },
  matrix: {
    headerKicker: 'Product Matrix',
    headerSubtitle: 'From data ingestion to incident recovery — the full observability lifecycle',
    scenarioTag: 'Scenarios · Unified Reliability',
    observabilityTag: 'Platform · Unified Observability',
    notificationTag: 'Reach · Notification Channels',
    collectionTag: 'Data · Unified Collection',
    integrationTag: 'Data · Unified Integration',
    infrastructureTag: 'Enterprise Infrastructure',
    dataIngestArrow: 'Data · Unified Ingestion',
    alertEventArrow: 'Alert Events',
    scenario: {
      businessGroups: {
        title: 'Business Groups',
        description: 'Multi-tenancy & resource isolation',
      },
      alertGovernance: {
        title: 'Alert Governance',
        description: 'Rules · Mutes · Subscriptions',
      },
      eventHistory: {
        title: 'Event History',
        description: 'Full event retrospection',
      },
      aiAssistant: {
        title: 'AI Intelligence',
        description: 'LLM + MCP tool calling',
      },
    },
    observability: {
      dashboard: 'Dashboards',
      metricExplorer: 'Metric Explorer',
      logExplorer: 'Log Explorer',
      alertRules: 'Alert Rules',
      alertMutes: 'Alert Mutes',
      alertSubscribes: 'Alert Subscribes',
      objectExplorer: 'Object Explorer',
      recordingRules: 'Recording Rules',
    },
    collection: {
      description: 'All-in-one open-source collector',
      footer: 'Unified collection of metrics / logs',
    },
    infrastructure: {
      components: 'Components',
      microservice: 'Microservice',
      apiFunctions: 'API / Function',
      endpoints: 'Endpoints',
      publicCloud: 'Public Cloud',
      privateCloud: 'Private Cloud',
      containers: 'Containers / VM',
      devices: 'Devices',
      network: 'Network',
    },
    notification: {
      rules: { title: 'Notification Rules', description: 'Fine-grained routing' },
      templates: { title: 'Templates', description: 'Unified message styling' },
      channels: { title: 'Channels', description: 'Multi-channel delivery' },
      users: { title: 'Users & Teams', description: 'Recipient management' },
    },
    footnotes: {
      scenario: ['Multi-dimensional data fusion', 'Best practices for alert governance', 'LLM-powered intelligent analysis'],
      observability: 'Integrated observability platform',
      integration: 'Mainstream open-source & public cloud data sources',
      notification: ['Notification Center', 'Subscribe & Escalate'],
    },
  },
  quickStart: {
    title: 'Quick Start',
    viewAll: 'All Documentation',
    askAi: 'Ask AI',
    ingest: {
      title: 'Unified Ingestion',
      description: 'Deploy and ingest data quickly',
      links: ['How to deploy Nightingale with Docker Compose?', 'How to collect host and middleware data with Categraf?'],
    },
    observe: {
      title: 'Unified Observability',
      description: 'Metrics and logs in one place',
      links: ['How to visualize business metrics on dashboards?', 'How to write PromQL queries in the metric explorer?'],
    },
    alert: {
      title: 'Alert Governance',
      description: 'Alert rules and notification delivery',
      links: ['How to configure my first alert rule?', 'How to deliver alerts to corporate IM?'],
    },
    ai: {
      title: 'AI Intelligence',
      description: 'LLM, MCP and agents',
      links: ['How to configure an LLM model?', 'How to use Agents to analyze alerts?'],
    },
  },
  aiAssistant: {
    title: 'Nightingale AI Assistant',
    description: 'Powered by LLMs and MCP tools — operate the platform, query data and analyze root causes with natural language.',
    capabilities: ['Natural language queries', 'Root-cause analysis', 'PromQL / LogQL generation', 'Documentation Q&A'],
    action: 'Try the AI Assistant',
  },
};

export default en_US;
