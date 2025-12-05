import type { TechStackItem } from "../company";

export const CLOUD_INFRASTRUCTURE: TechStackItem[] = [
  // Cloud Providers
  {
    id: "aws",
    name: "Amazon Web Services",
    category: "cloud_infrastructure",
    description: "Comprehensive cloud computing platform by Amazon"
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    category: "cloud_infrastructure",
    description: "Cloud computing platform for building and managing applications"
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    category: "cloud_infrastructure",
    description: "Suite of cloud computing services by Google"
  },
  // Container Orchestration
  {
    id: "kubernetes",
    name: "Kubernetes",
    category: "cloud_infrastructure",
    description: "Container orchestration platform for automating deployment"
  },
  {
    id: "docker",
    name: "Docker",
    category: "cloud_infrastructure",
    description: "Platform for developing, shipping, and running applications"
  },
  {
    id: "helm",
    name: "Helm",
    category: "cloud_infrastructure",
    description: "Package manager for Kubernetes applications"
  },
  // Serverless
  {
    id: "aws_lambda",
    name: "AWS Lambda",
    category: "cloud_infrastructure",
    description: "Serverless compute service for running code without provisioning servers"
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "cloud_infrastructure",
    description: "Frontend deployment platform with serverless functions"
  },
  {
    id: "netlify",
    name: "Netlify",
    category: "cloud_infrastructure",
    description: "Platform for modern web development with serverless functions"
  },
  // CDN & Edge
  {
    id: "cloudflare",
    name: "Cloudflare",
    category: "cloud_infrastructure",
    description: "CDN, security, and edge computing platform"
  },
  {
    id: "fastly",
    name: "Fastly",
    category: "cloud_infrastructure",
    description: "Edge cloud platform for modern applications"
  },
  // Infrastructure as Code
  {
    id: "terraform",
    name: "Terraform",
    category: "cloud_infrastructure",
    description: "Infrastructure as Code tool for provisioning cloud resources"
  },
  {
    id: "pulumi",
    name: "Pulumi",
    category: "cloud_infrastructure",
    description: "Infrastructure as Code framework using general-purpose languages"
  },
  {
    id: "cloudformation",
    name: "AWS CloudFormation",
    category: "cloud_infrastructure",
    description: "AWS service for modeling and provisioning AWS resources"
  }
];

export const DEVOPS_TOOLS: TechStackItem[] = [
  // CI/CD
  {
    id: "github_actions",
    name: "GitHub Actions",
    category: "devops_tools",
    description: "CI/CD platform for automating software workflows"
  },
  {
    id: "gitlab_ci",
    name: "GitLab CI/CD",
    category: "devops_tools",
    description: "Integrated CI/CD tool within GitLab platform"
  },
  {
    id: "jenkins",
    name: "Jenkins",
    category: "devops_tools",
    description: "Open-source automation server for building and deploying software"
  },
  {
    id: "circleci",
    name: "CircleCI",
    category: "devops_tools",
    description: "Continuous integration and delivery platform"
  },
  {
    id: "travisci",
    name: "Travis CI",
    category: "devops_tools",
    description: "Continuous integration service for GitHub projects"
  },
  // Package Management
  {
    id: "npm",
    name: "npm",
    category: "devops_tools",
    description: "Package manager for JavaScript and Node.js ecosystem"
  },
  {
    id: "yarn",
    name: "Yarn",
    category: "devops_tools",
    description: "Fast, reliable, and secure dependency management for JavaScript"
  },
  {
    id: "pnpm",
    name: "pnpm",
    category: "devops_tools",
    description: "Fast, disk space efficient package manager for JavaScript"
  },
  {
    id: "pip",
    name: "pip",
    category: "devops_tools",
    description: "Package installer for Python"
  },
  {
    id: "poetry",
    name: "Poetry",
    category: "devops_tools",
    description: "Python dependency management and packaging tool"
  },
  // Container Tools
  {
    id: "docker_compose",
    name: "Docker Compose",
    category: "devops_tools",
    description: "Tool for defining and running multi-container applications"
  },
  {
    id: "skaffold",
    name: "Skaffold",
    category: "devops_tools",
    description: "Kubernetes-native development workflow tool"
  },
  {
    id: "tiller",
    name: "Tiller",
    category: "devops_tools",
    description: "Kubernetes development workflow tool"
  }
];