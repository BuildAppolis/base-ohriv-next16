import type { TechStackItem } from "../company";

export const MONITORING_TOOLS: TechStackItem[] = [
  // Application Performance Monitoring
  {
    id: "datadog",
    name: "Datadog",
    category: "monitoring_tools",
    description: "Monitoring and analytics platform for cloud applications"
  },
  {
    id: "new_relic",
    name: "New Relic",
    category: "monitoring_tools",
    description: "Full-stack observability platform for modern software"
  },
  {
    id: "sentry",
    name: "Sentry",
    category: "monitoring_tools",
    description: "Error monitoring and performance platform for developers"
  },
  {
    id: "honeybadger",
    name: "Honeybadger",
    category: "monitoring_tools",
    description: "Exception and uptime monitoring for Ruby and other apps"
  },
  // Logging
  {
    id: "elk_stack",
    name: "ELK Stack",
    category: "monitoring_tools",
    description: "Elasticsearch, Logstash, and Kibana for log management"
  },
  {
    id: "fluentd",
    name: "Fluentd",
    category: "monitoring_tools",
    description: "Unified logging layer for data collection and processing"
  },
  {
    id: "loki",
    name: "Grafana Loki",
    category: "monitoring_tools",
    description: "Log aggregation system inspired by Prometheus"
  },
  // Metrics & Visualization
  {
    id: "prometheus",
    name: "Prometheus",
    category: "monitoring_tools",
    description: "Monitoring system and time series database"
  },
  {
    id: "grafana",
    name: "Grafana",
    category: "monitoring_tools",
    description: "Open-source analytics and visualization platform"
  },
  {
    id: "zabbix",
    name: "Zabbix",
    category: "monitoring_tools",
    description: "Enterprise-class monitoring solution for networks and applications"
  },
  {
    id: "nagios",
    name: "Nagios",
    category: "monitoring_tools",
    description: "IT infrastructure monitoring and alerting system"
  },
  {
    id: "pingdom",
    name: "Pingdom",
    category: "monitoring_tools",
    description: "Website uptime and performance monitoring service"
  }
];

export const TESTING_TOOLS: TechStackItem[] = [
  // Frontend Testing
  {
    id: "jest",
    name: "Jest",
    category: "testing_tools",
    description: "JavaScript testing framework with a focus on simplicity"
  },
  {
    id: "vitest",
    name: "Vitest",
    category: "testing_tools",
    description: "Next generation testing framework powered by Vite"
  },
  {
    id: "cypress",
    name: "Cypress",
    category: "testing_tools",
    description: "End-to-end testing framework for web applications"
  },
  {
    id: "playwright",
    name: "Playwright",
    category: "testing_tools",
    description: "End-to-end testing framework for modern web apps"
  },
  {
    id: "testing_library",
    name: "Testing Library",
    category: "testing_tools",
    description: "Testing utilities for focused component testing"
  },
  // Backend Testing
  {
    id: "pytest",
    name: "Pytest",
    category: "testing_tools",
    description: "Testing framework for Python applications"
  },
  {
    id: "junit",
    name: "JUnit",
    category: "testing_tools",
    description: "Testing framework for Java applications"
  },
  {
    id: "rspec",
    name: "RSpec",
    category: "testing_tools",
    description: "Testing tool for Ruby applications"
  },
  {
    id: "mocha",
    name: "Mocha",
    category: "testing_tools",
    description: "JavaScript test framework for Node.js and browsers"
  },
  // Performance Testing
  {
    id: "k6",
    name: "k6",
    category: "testing_tools",
    description: "Modern load testing and performance engineering platform"
  },
  {
    id: "artillery",
    name: "Artillery",
    category: "testing_tools",
    description: "Serverless load testing platform"
  },
  {
    id: "jmeter",
    name: "Apache JMeter",
    category: "testing_tools",
    description: "Open-source load and performance testing tool"
  },
  // Visual Testing
  {
    id: "storybook",
    name: "Storybook",
    category: "testing_tools",
    description: "Development environment for UI components"
  },
  {
    id: "chromatic",
    name: "Chromatic",
    category: "testing_tools",
    description: "Visual testing platform for Storybook"
  },
  {
    id: "percy",
    name: "Percy",
    category: "testing_tools",
    description: "Visual testing and review platform"
  }
];

export const COLLABORATION_TOOLS: TechStackItem[] = [
  // Version Control
  {
    id: "github",
    name: "GitHub",
    category: "collaboration_tools",
    description: "Development platform for hosting and reviewing code"
  },
  {
    id: "gitlab",
    name: "GitLab",
    category: "collaboration_tools",
    description: "Complete DevOps platform for software development"
  },
  {
    id: "bitbucket",
    name: "Bitbucket",
    category: "collaboration_tools",
    description: "Git-based code collaboration and CI/CD platform"
  },
  // Communication
  {
    id: "slack",
    name: "Slack",
    category: "collaboration_tools",
    description: "Business communication platform for teams"
  },
  {
    id: "discord",
    name: "Discord",
    category: "collaboration_tools",
    description: "Voice, video, and text communication for communities"
  },
  {
    id: "msteams",
    name: "Microsoft Teams",
    category: "collaboration_tools",
    description: "Unified communication and collaboration platform"
  },
  // Project Management
  {
    id: "jira",
    name: "Jira",
    category: "collaboration_tools",
    description: "Issue tracking and project management tool"
  },
  {
    id: "linear",
    name: "Linear",
    category: "collaboration_tools",
    description: "Modern issue tracking for software teams"
  },
  {
    id: "asana",
    name: "Asana",
    category: "collaboration_tools",
    description: "Work management platform for teams"
  },
  {
    id: "notion",
    name: "Notion",
    category: "collaboration_tools",
    description: "All-in-one workspace for notes, tasks, and collaboration"
  },
  {
    id: "confluence",
    name: "Confluence",
    category: "collaboration_tools",
    description: "Team collaboration and knowledge management platform"
  },
  {
    id: "miro",
    name: "Miro",
    category: "collaboration_tools",
    description: "Online collaborative whiteboard platform"
  },
  // Code Review & Quality
  {
    id: "sonarqube",
    name: "SonarQube",
    category: "collaboration_tools",
    description: "Continuous inspection of code quality"
  },
  {
    id: "codecov",
    name: "Codecov",
    category: "collaboration_tools",
    description: "Code coverage reporting and visualization"
  },
  {
    id: "snyk",
    name: "Snyk",
    category: "collaboration_tools",
    description: "Developer security platform for finding and fixing vulnerabilities"
  }
];

export const SPECIALIZED_TECHNOLOGIES: TechStackItem[] = [
  // AI/ML Platforms
  {
    id: "openai",
    name: "OpenAI API",
    category: "specialized_technologies",
    description: "API platform for accessing GPT models and AI capabilities"
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    category: "specialized_technologies",
    description: "AI assistant API for various tasks and workflows"
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    category: "specialized_technologies",
    description: "Platform for building, training, and deploying ML models"
  },
  {
    id: "tensorflow",
    name: "TensorFlow",
    category: "specialized_technologies",
    description: "Open-source platform for machine learning and AI"
  },
  {
    id: "pytorch",
    name: "PyTorch",
    category: "specialized_technologies",
    description: "Machine learning framework for deep learning applications"
  },
  // Data Science & Analytics
  {
    id: "sql",
    name: "SQL",
    category: "specialized_technologies",
    description: "Standard query language for relational databases and data manipulation"
  },
  {
    id: "excel",
    name: "Microsoft Excel",
    category: "specialized_technologies",
    description: "Spreadsheet software for data analysis and visualization"
  },
  {
    id: "tableau",
    name: "Tableau",
    category: "specialized_technologies",
    description: "Data visualization and business intelligence platform"
  },
  {
    id: "power_bi",
    name: "Power BI",
    category: "specialized_technologies",
    description: "Business analytics and visualization platform by Microsoft"
  },
  {
    id: "spss",
    name: "IBM SPSS Statistics",
    category: "specialized_technologies",
    description: "Statistical analysis software for social sciences and healthcare"
  },
  {
    id: "jupyter_notebook",
    name: "Jupyter Notebook",
    category: "specialized_technologies",
    description: "Interactive web application for creating and sharing documents with live code"
  },
  {
    id: "aws_sagemaker",
    name: "Amazon SageMaker",
    category: "specialized_technologies",
    description: "Fully managed machine learning service by AWS"
  },
  // Blockchain
  {
    id: "ethereum",
    name: "Ethereum",
    category: "specialized_technologies",
    description: "Decentralized platform for smart contracts and dApps"
  },
  {
    id: "solidity",
    name: "Solidity",
    category: "specialized_technologies",
    description: "Object-oriented programming language for smart contracts"
  },
  {
    id: "web3js",
    name: "Web3.js",
    category: "specialized_technologies",
    description: "Ethereum JavaScript API for interacting with smart contracts"
  },
  // IoT
  {
    id: "arduino",
    name: "Arduino",
    category: "specialized_technologies",
    description: "Open-source electronics platform for IoT projects"
  },
  {
    id: "raspberry_pi",
    name: "Raspberry Pi",
    category: "specialized_technologies",
    description: "Single-board computer for IoT and embedded systems"
  },
  // GraphQL
  {
    id: "graphql",
    name: "GraphQL",
    category: "specialized_technologies",
    description: "Query language and runtime for APIs"
  },
  {
    id: "apollo",
    name: "Apollo GraphQL",
    category: "specialized_technologies",
    description: "GraphQL platform for building APIs with GraphQL"
  },
  // gRPC
  {
    id: "grpc",
    name: "gRPC",
    category: "specialized_technologies",
    description: "High-performance RPC framework for microservices"
  },
  // WebAssembly
  {
    id: "wasm",
    name: "WebAssembly",
    category: "specialized_technologies",
    description: "Binary instruction format for web applications"
  }
];