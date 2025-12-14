#!/usr/bin/env tsx

import { DocumentStore } from 'ravendb';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Import the model interfaces
import type {
  CandidateDocument,
  ApplicationDocument,
  StageEvaluationDocument,
  CompanyDocument,
  JobDocument,
  AnalyticsReportDocument,
  PipelineAnalyticsDocument,
  EvaluatorAnalyticsDocument,
  TenantDocument,
  UserDocument
} from '../src/models';

// Configuration for the test
const CONFIG = {
  ravendbUrl: 'http://localhost:8080',
  databaseName: 'ohriv-storage-test',
  testSizes: {
    small: { companies: 1, jobs: 5, candidates: 50, applications: 100, evaluations: 200 },
    medium: { companies: 5, jobs: 25, candidates: 500, applications: 1500, evaluations: 3000 },
    large: { companies: 20, jobs: 100, candidates: 5000, applications: 20000, evaluations: 40000 }
  }
};

// Initialize RavenDB store
const store = new DocumentStore(CONFIG.ravendbUrl, CONFIG.databaseName);
store.initialize();

// Utility functions
function generateId(collection: string, identifier: string): string {
  return `${collection}/${identifier}`;
}

function generateFileSize(minKB: number, maxKB: number): number {
  return Math.floor(Math.random() * (maxKB - minKB + 1)) * 1024 + minKB * 1024;
}

function generateMockFile(type: string, sizeKB: number): string {
  // This would normally upload to S3/cloud storage
  // For testing, we'll just return a mock URL
  return `https://mock-storage.example.com/files/${crypto.randomUUID()}.${type}`;
}

// Data generators
function generateTenant(tenantId: string): TenantDocument {
  return {
    id: generateId('tenants', tenantId),
    collection: 'tenants',
    tenantId,
    name: faker.company.name(),
    plan: faker.helpers.arrayElement(['free', 'standard', 'enterprise']) as any,
    status: 'active',
    databaseName: CONFIG.databaseName,
    ownerUserId: generateId('users', crypto.randomUUID()),
    ownerEmail: faker.internet.email(),
    ownerName: faker.person.fullName(),
    companyLimit: 50,
    userLimit: 200,
    storageLimitGB: 100,
    settings: {
      branding: {
        logoUrl: faker.image.url(),
        primaryColor: faker.internet.color(),
      },
      features: {
        aiEvaluation: faker.datatype.boolean(),
        advancedAnalytics: faker.datatype.boolean(),
        customWorkflows: faker.datatype.boolean(),
        apiAccess: faker.datatype.boolean(),
      }
    },
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    createdBy: generateId('users', crypto.randomUUID()),
    usageStats: {
      companiesCount: 0,
      usersCount: 0,
      storageUsedGB: 0,
      evaluationsCount: 0,
      lastCalculated: new Date().toISOString(),
    }
  };
}

function generateUser(tenantId: string, role: string): UserDocument {
  const userId = crypto.randomUUID();
  return {
    id: generateId('users', userId),
    collection: 'users',
    userId,
    email: faker.internet.email(),
    name: faker.person.fullName(),
    status: 'active',
    primaryTenantId: tenantId,
    memberships: [{
      tenantId,
      userId,
      role: role as any,
      scopes: [],
      invitedBy: generateId('users', crypto.randomUUID()),
      invitedAt: faker.date.past().toISOString(),
      acceptedAt: faker.date.recent().toISOString(),
      isActive: true
    }],
    profile: {
      avatarUrl: faker.image.url(),
      bio: faker.lorem.paragraph(),
      timezone: faker.location.timeZone(),
      phone: faker.phone.number(),
    },
    permissions: [],
    defaultRole: role as any,
    preferences: {
      emailNotifications: faker.datatype.boolean(),
      pushNotifications: faker.datatype.boolean(),
      theme: faker.helpers.arrayElement(['light', 'dark', 'system']),
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    },
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    createdBy: generateId('users', crypto.randomUUID()),
    loginHistory: [],
    auditLog: []
  };
}

function generateCompany(tenantId: string): CompanyDocument {
  const companyId = crypto.randomUUID();
  return {
    id: generateId('companies', companyId),
    collection: 'companies',
    companyId,
    tenantId,
    name: faker.company.name(),
    website: faker.internet.url(),
    industry: faker.company.buzzAdjective(),
    size: faker.helpers.arrayElement(['startup', 'small', 'medium', 'large', 'enterprise']) as any,
    stage: faker.helpers.arrayElement(['seed', 'early', 'growth', 'mature', 'declining']) as any,
    businessModel: faker.helpers.arrayElement(['b2b', 'b2c', 'b2b2c', 'marketplace', 'saas', 'other']) as any,
    headquarters: {
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      postalCode: faker.location.zipCode(),
      timezone: faker.location.timeZone(),
    },
    remotePolicy: faker.helpers.arrayElement(['fully_remote', 'hybrid', 'onsite', 'flexible']) as any,
    locations: [{
      type: 'office',
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      isPrimary: true
    }],
    culture: {
      mission: faker.lorem.sentence(),
      vision: faker.lorem.sentence(),
      values: faker.helpers.multiple(() => faker.lorem.words(), { count: 5 }),
      description: faker.lorem.paragraph(),
      benefits: faker.helpers.multiple(() => faker.lorem.words(), { count: 8 }),
      techStack: faker.helpers.multiple(() => faker.lorem.words(), { count: 10 }),
      workEnvironment: faker.helpers.arrayElement(['casual', 'business', 'creative', 'technical']) as any,
    },
    recruitment: {
      approvalWorkflow: [faker.helpers.arrayElement(['manager', 'hr'])],
      diversityGoals: {
        gender: { male: 0.5, female: 0.4, other: 0.1 },
        ethnicity: { white: 0.6, asian: 0.2, black: 0.1, hispanic: 0.1 },
        veterans: 0.1,
        disabilities: 0.05,
      },
      branding: {
        logoUrl: faker.image.url(),
        heroImageUrl: faker.image.url(),
        careersUrl: faker.internet.url(),
      },
    },
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    createdBy: generateId('users', crypto.randomUUID()),
    isActive: true,
    isDefault: false,
    stats: {
      totalJobs: faker.number.int({ min: 0, max: 50 }),
      activeJobs: faker.number.int({ min: 0, max: 20 }),
      totalApplications: faker.number.int({ min: 0, max: 500 }),
      activeApplications: faker.number.int({ min: 0, max: 100 }),
      totalHires: faker.number.int({ min: 0, max: 50 }),
      averageTimeToHire: faker.number.int({ min: 10, max: 60 }),
      lastUpdated: new Date().toISOString(),
    },
    integrations: []
  };
}

function generateJob(tenantId: string, companyId: string): JobDocument {
  const jobId = crypto.randomUUID();

  // Generate realistic job description with good content size
  const description = faker.lorem.paragraphs(8);
  const summary = faker.lorem.paragraphs(2);

  // Generate screening questions
  const screeningQuestions = faker.helpers.multiple(() => ({
    question: faker.lorem.sentence(),
    type: faker.helpers.arrayElement(['text', 'multiple_choice', 'yes_no', 'file']) as any,
    required: faker.datatype.boolean(),
    options: faker.datatype.boolean() ? faker.helpers.multiple(() => faker.lorem.words(), { count: 4 }) : undefined
  }), { count: faker.number.int({ min: 2, max: 6 }) });

  // Generate pipeline stages
  const stages = [
    {
      stageId: crypto.randomUUID(),
      name: 'Initial Screening',
      type: 'screening' as const,
      order: 1,
      evaluators: [crypto.randomUUID()],
      autoAdvance: true,
      passScore: 70
    },
    {
      stageId: crypto.randomUUID(),
      name: 'Technical Interview',
      type: 'interview' as const,
      order: 2,
      evaluators: [crypto.randomUUID(), crypto.randomUUID()],
      autoAdvance: false,
      durationMinutes: 60
    },
    {
      stageId: crypto.randomUUID(),
      name: 'Final Interview',
      type: 'interview' as const,
      order: 3,
      evaluators: [crypto.randomUUID()],
      autoAdvance: false,
      durationMinutes: 45
    }
  ];

  return {
    id: generateId('jobs', jobId),
    collection: 'jobs',
    jobId,
    tenantId,
    companyId,
    title: faker.person.jobTitle(),
    description,
    summary,
    level: faker.helpers.arrayElement(['intern', 'entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'c_level']) as any,
    type: faker.helpers.arrayElement(['full_time', 'part_time', 'contract', 'temporary', 'internship', 'fellowship']) as any,
    workEnvironment: faker.helpers.arrayElement(['remote', 'onsite', 'hybrid', 'flexible']) as any,
    department: faker.commerce.department(),
    compensation: {
      salary: {
        min: faker.number.int({ min: 40000, max: 80000 }),
        max: faker.number.int({ min: 80000, max: 200000 }),
        currency: 'USD',
        frequency: faker.helpers.arrayElement(['hourly', 'monthly', 'yearly']) as any
      },
      benefits: faker.helpers.multiple(() => faker.lorem.words(), { count: 6 })
    },
    requirements: {
      experience: {
        min: faker.number.int({ min: 0, max: 10 }),
        max: faker.number.int({ min: 10, max: 20 }),
        level: faker.lorem.words()
      },
      education: faker.helpers.multiple(() => ({
        level: faker.helpers.arrayElement(['High School', 'Bachelor\'s', 'Master\'s', 'PhD']),
        field: faker.lorem.words(),
        required: faker.datatype.boolean()
      }), { count: faker.number.int({ min: 1, max: 3 }) }),
      skills: faker.helpers.multiple(() => ({
        name: faker.lorem.words(),
        type: faker.helpers.arrayElement(['technical', 'soft', 'language', 'certification']) as any,
        level: faker.helpers.arrayElement(['required', 'preferred']) as any,
        proficiency: faker.number.int({ min: 1, max: 5 })
      }), { count: faker.number.int({ min: 5, max: 15 }) }),
      certifications: faker.helpers.multiple(() => ({
        name: faker.lorem.words(),
        issuer: faker.company.name(),
        required: faker.datatype.boolean(),
        expiry: faker.datatype.boolean()
      }), { count: faker.number.int({ min: 0, max: 5 }) })
    },
    location: {
      type: faker.helpers.arrayElement(['remote', 'onsite', 'hybrid', 'multiple']) as any,
      remote: faker.datatype.boolean() ? {
        policy: faker.helpers.arrayElement(['fully_remote', 'hybrid', 'flexible']) as any,
        timezones: faker.helpers.multiple(() => faker.location.timeZone(), { count: 3 }),
        countries: faker.helpers.multiple(() => faker.location.country(), { count: 5 })
      } : undefined,
      onsite: faker.datatype.boolean() ? [{
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
        remoteOption: faker.datatype.boolean()
      }] : undefined
    },
    application: {
      deadline: faker.date.future().toISOString(),
      startDate: faker.date.future().toISOString(),
      duration: faker.helpers.arrayElement(['3 months', '6 months', '1 year', 'permanent']),
      contactEmail: faker.internet.email(),
      screeningQuestions
    },
    pipeline: {
      stages,
      guidelineId: crypto.randomUUID()
    },
    publishing: {
      status: 'published',
      publishedAt: faker.date.past().toISOString(),
      expiresAt: faker.date.future().toISOString(),
      visibility: faker.helpers.arrayElement(['public', 'internal', 'private']) as any,
      distribution: faker.helpers.multiple(() => faker.lorem.words(), { count: 3 })
    },
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    createdBy: generateId('users', crypto.randomUUID()),
    stats: {
      views: faker.number.int({ min: 50, max: 1000 }),
      applications: faker.number.int({ min: 5, max: 100 }),
      screened: faker.number.int({ min: 2, max: 50 }),
      interviews: faker.number.int({ min: 0, max: 20 }),
      offers: faker.number.int({ min: 0, max: 5 }),
      hires: faker.number.int({ min: 0, max: 3 }),
      rejected: faker.number.int({ min: 0, max: 80 }),
      withdrew: faker.number.int({ min: 0, max: 10 }),
      timeStats: {
        averageScreeningTime: faker.number.int({ min: 5, max: 30 }),
        averageInterviewTime: faker.number.int({ min: 30, max: 120 }),
        averageTimeToHire: faker.number.int({ min: 10, max: 60 })
      },
      lastUpdated: new Date().toISOString()
    },
    collaborators: []
  };
}

function generateCandidate(tenantId: string): CandidateDocument {
  const candidateId = crypto.randomUUID();

  // Generate realistic experience data
  const experience = faker.helpers.multiple(() => ({
    company: faker.company.name(),
    position: faker.person.jobTitle(),
    startDate: faker.date.past({ years: 10 }).toISOString().split('T')[0],
    endDate: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.past().toISOString().split('T')[0] : undefined,
    description: faker.lorem.paragraph(),
    achievements: faker.helpers.multiple(() => faker.lorem.sentence(), { count: faker.number.int({ min: 1, max: 4 }) }),
    technologies: faker.helpers.multiple(() => faker.lorem.words(), { count: faker.number.int({ min: 2, max: 8 }) })
  }), { count: faker.number.int({ min: 1, max: 5 }) });

  // Generate education data
  const education = faker.helpers.multiple(() => ({
    institution: faker.company.name(),
    degree: faker.helpers.arrayElement(['Bachelor of Science', 'Master of Science', 'PhD', 'Bachelor of Arts']),
    field: faker.lorem.words(),
    startDate: faker.date.past({ years: 15 }).toISOString().split('T')[0],
    endDate: faker.date.past({ years: 5 }).toISOString().split('T')[0],
    gpa: faker.datatype.boolean({ probability: 0.7 }) ? faker.number.float({ min: 2.5, max: 4.0, precision: 0.1 }) : undefined,
    honors: faker.helpers.multiple(() => faker.lorem.words(), { count: faker.number.int({ min: 0, max: 3 }) })
  }), { count: faker.number.int({ min: 1, max: 3 }) });

  // Generate skills
  const skills = faker.helpers.multiple(() => ({
    name: faker.lorem.words(),
    category: faker.helpers.arrayElement(['technical', 'soft', 'language', 'tool']) as any,
    proficiency: faker.number.int({ min: 1, max: 5 }),
    yearsExperience: faker.number.int({ min: 0, max: 15 })
  }), { count: faker.number.int({ min: 10, max: 30 }) });

  // Generate attachments (resume, cover letter, etc.)
  const attachments = [
    {
      type: 'resume' as const,
      url: generateMockFile('pdf', 250), // 250KB resume
      title: 'Resume',
      fileName: `resume_${candidateId}.pdf`,
      fileSize: generateFileSize(200, 500), // 200-500KB
      uploadedAt: faker.date.past().toISOString(),
      tags: ['resume', 'current']
    },
    {
      type: 'cover_letter' as const,
      url: generateMockFile('pdf', 150), // 150KB cover letter
      title: 'Cover Letter',
      fileName: `cover_letter_${candidateId}.pdf`,
      fileSize: generateFileSize(100, 300), // 100-300KB
      uploadedAt: faker.date.past().toISOString(),
      tags: ['cover_letter']
    }
  ];

  // Add optional additional resume attachment
  if (faker.datatype.boolean({ probability: 0.3 })) {
    attachments.push({
      type: 'resume' as const,
      url: generateMockFile('pdf', 2000), // 2MB portfolio
      title: 'Portfolio',
      fileName: `portfolio_${candidateId}.pdf`,
      fileSize: generateFileSize(1500, 5000), // 1.5-5MB
      uploadedAt: faker.date.past().toISOString(),
      tags: ['portfolio', 'design']
    });
  }

  return {
    id: generateId('candidates', candidateId),
    collection: 'candidates',
    candidateId,
    tenantId,
    email: faker.internet.email(),
    name: faker.person.fullName(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phone: faker.phone.number(),
    location: `${faker.location.city()}, ${faker.location.state()}`,
    timezone: faker.location.timeZone(),
    professional: {
      title: faker.person.jobTitle(),
      summary: faker.lorem.paragraphs(3),
      experience,
      education,
      skills,
      certifications: faker.helpers.multiple(() => ({
        name: faker.lorem.words(),
        issuer: faker.company.name(),
        dateEarned: faker.date.past().toISOString().split('T')[0],
        expires: faker.datatype.boolean({ probability: 0.3 }) ? faker.date.future().toISOString().split('T')[0] : undefined,
        credentialId: faker.string.alphanumeric(10)
      }), { count: faker.number.int({ min: 0, max: 5 }) })
    },
    profiles: {
      linkedin: faker.datatype.boolean({ probability: 0.8 }) ? `https://linkedin.com/in/${faker.internet.userName()}` : undefined,
      github: faker.datatype.boolean({ probability: 0.4 }) ? `https://github.com/${faker.internet.userName()}` : undefined,
      portfolio: faker.datatype.boolean({ probability: 0.2 }) ? faker.internet.url() : undefined,
      personal: faker.datatype.boolean({ probability: 0.1 }) ? faker.internet.url() : undefined
    },
    preferences: {
      jobTypes: faker.helpers.multiple(() => faker.helpers.arrayElement(['full_time', 'part_time', 'contract', 'remote']), { count: 3 }),
      locations: faker.helpers.multiple(() => ({
        city: faker.location.city(),
        country: faker.location.country(),
        remote: faker.datatype.boolean()
      }), { count: 3 }),
      salary: {
        min: faker.number.int({ min: 40000, max: 80000 }),
        max: faker.number.int({ min: 80000, max: 150000 }),
        currency: 'USD',
        negotiable: true
      },
      remotePreference: faker.helpers.arrayElement(['only_remote', 'prefer_remote', 'open_to_remote', 'no_remote']) as any,
      industries: faker.helpers.multiple(() => faker.lorem.words(), { count: 3 }),
      companySizes: faker.helpers.multiple(() => faker.helpers.arrayElement(['startup', 'small', 'medium', 'large']), { count: 2 })
    },
    source: {
      channel: faker.helpers.arrayElement(['job_board', 'referral', 'linkedin', 'website', 'cold_email', 'event']),
      campaign: faker.datatype.boolean({ probability: 0.4 }) ? faker.lorem.words() : undefined,
      trackingData: {
        source: faker.lorem.words(),
        medium: faker.lorem.words(),
        campaign: faker.lorem.words()
      }
    },
    attachments,
    notes: faker.helpers.multiple(() => ({
      id: crypto.randomUUID(),
      content: faker.lorem.paragraph(),
      authorId: generateId('users', crypto.randomUUID()),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      visibility: faker.helpers.arrayElement(['private', 'team', 'company']) as any
    }), { count: faker.number.int({ min: 0, max: 5 }) }),
    tags: faker.helpers.multiple(() => faker.lorem.words(), { count: faker.number.int({ min: 2, max: 8 }) }),
    status: 'active',
    stage: faker.helpers.arrayElement(['new', 'engaged', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn']) as any,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    createdBy: generateId('users', crypto.randomUUID()),
    lastActiveAt: faker.date.recent().toISOString(),
    communications: faker.helpers.multiple(() => ({
      id: crypto.randomUUID(),
      type: faker.helpers.arrayElement(['email', 'phone', 'sms', 'meeting', 'note']) as any,
      direction: faker.helpers.arrayElement(['inbound', 'outbound']) as any,
      subject: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(2),
      from: generateId('users', crypto.randomUUID()),
      to: [generateId('users', crypto.randomUUID())],
      timestamp: faker.date.past().toISOString(),
      attachments: faker.helpers.multiple(() => generateMockFile('pdf', 100), { count: faker.number.int({ min: 0, max: 2 }) }),
      metadata: {
        category: faker.lorem.words(),
        priority: faker.helpers.arrayElement(['low', 'medium', 'high'])
      }
    }), { count: faker.number.int({ min: 2, max: 8 }) }),
    privacy: {
      dataProcessingConsent: true,
      marketingConsent: faker.datatype.boolean(),
      consentDate: faker.date.past().toISOString(),
      gdprRequests: []
    }
  };
}

function generateApplication(tenantId: string, companyId: string, jobId: string, candidateId: string): ApplicationDocument {
  const applicationId = crypto.randomUUID();

  // Generate stage history
  const stageHistory = [
    {
      stageId: crypto.randomUUID(),
      stageName: 'Applied',
      enteredAt: faker.date.past().toISOString(),
      status: 'passed' as const,
      duration: faker.number.int({ min: 1, max: 1440 }) // minutes
    },
    {
      stageId: crypto.randomUUID(),
      stageName: 'Initial Screening',
      enteredAt: faker.date.recent().toISOString(),
      exitedAt: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.recent().toISOString() : undefined,
      status: faker.datatype.boolean({ probability: 0.6 }) ? 'passed' as const : 'in_progress' as const,
      duration: faker.datatype.boolean() ? faker.number.int({ min: 60, max: 2880 }) : undefined
    }
  ];

  // Add interview stage if applicable
  if (faker.datatype.boolean({ probability: 0.4 })) {
    stageHistory.push({
      stageId: crypto.randomUUID(),
      stageName: 'Technical Interview',
      enteredAt: faker.date.recent().toISOString(),
      status: faker.datatype.boolean({ probability: 0.5 }) ? 'passed' as const : 'in_progress' as const,
      notes: faker.lorem.paragraph()
    });
  }

  // Generate evaluations
  const evaluations = stageHistory.filter(stage => stage.status !== 'in_progress').map(stage => ({
    stageId: stage.stageId,
    evaluatorId: generateId('users', crypto.randomUUID()),
    evaluatorRole: faker.helpers.arrayElement(['recruiter', 'hiring_manager', 'technical_interviewer']) as any,
    status: 'completed' as const,
    completedAt: faker.date.recent().toISOString(),
    overallScore: faker.number.int({ min: 60, max: 95 }),
    recommendation: faker.helpers.arrayElement(['advance', 'hold', 'reject']) as any,
    responses: faker.helpers.multiple(() => ({
      questionId: crypto.randomUUID(),
      answer: faker.lorem.paragraph(),
      score: faker.number.int({ min: 1, max: 10 }),
      confidence: faker.number.float({ min: 0.5, max: 1.0, precision: 0.1 }),
      notes: faker.lorem.sentence()
    }), { count: faker.number.int({ min: 5, max: 15 }) }),
    summary: {
      overallScore: faker.number.int({ min: 60, max: 95 }),
      recommendation: faker.helpers.arrayElement(['advance', 'hold', 'reject']) as any,
      strengths: faker.helpers.multiple(() => faker.lorem.sentence(), { count: faker.number.int({ min: 2, max: 5 }) }),
      concerns: faker.helpers.multiple(() => faker.lorem.sentence(), { count: faker.number.int({ min: 0, max: 3 }) }),
      notes: faker.lorem.paragraph()
    }
  }));

  return {
    id: generateId('applications', applicationId),
    collection: 'applications',
    applicationId,
    tenantId,
    companyId,
    jobId,
    candidateId,
    status: faker.helpers.arrayElement(['applied', 'in_process', 'screening', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn']) as any,
    appliedAt: faker.date.past().toISOString(),
    source: faker.helpers.arrayElement(['linkedin', 'indeed', 'company_website', 'referral']),
    referral: faker.datatype.boolean({ probability: 0.2 }) ? {
      referrerUserId: generateId('users', crypto.randomUUID()),
      referrerName: faker.person.fullName(),
      relationship: faker.helpers.arrayElement(['colleague', 'friend', 'former_colleague', 'family'])
    } : undefined,
    currentStageId: stageHistory[stageHistory.length - 1].stageId,
    stageHistory: stageHistory as any,
    evaluations: evaluations as any,
    decision: {
      status: 'pending' as const,
      decidedBy: generateId('users', crypto.randomUUID()),
      decidedAt: faker.date.recent().toISOString(),
      reason: faker.lorem.sentence()
    },
    communications: faker.helpers.multiple(() => ({
      type: faker.helpers.arrayElement(['application_update', 'interview_schedule', 'offer', 'rejection', 'general']) as any,
      channel: faker.helpers.arrayElement(['email', 'sms', 'portal']) as any,
      sentAt: faker.date.past().toISOString(),
      template: faker.lorem.words(),
      content: faker.lorem.paragraphs(2),
      automated: faker.datatype.boolean()
    }), { count: faker.number.int({ min: 1, max: 5 }) }),
    attachments: faker.helpers.multiple(() => ({
      type: faker.helpers.arrayElement(['resume', 'cover_letter', 'portfolio', 'assignment', 'other']) as any,
      url: generateMockFile('pdf', 300),
      fileName: `${faker.lorem.words()}.pdf`,
      uploadedAt: faker.date.past().toISOString(),
      notes: faker.lorem.sentence()
    }), { count: faker.number.int({ min: 0, max: 3 }) }),
    notes: faker.helpers.multiple(() => ({
      id: crypto.randomUUID(),
      content: faker.lorem.paragraph(),
      authorId: generateId('users', crypto.randomUUID()),
      authorName: faker.person.fullName(),
      createdAt: faker.date.past().toISOString(),
      visibility: faker.helpers.arrayElement(['private', 'team', 'company']) as any,
      tags: faker.helpers.multiple(() => faker.lorem.words(), { count: 2 })
    }), { count: faker.number.int({ min: 0, max: 5 }) }),
    activities: faker.helpers.multiple(() => ({
      type: faker.helpers.arrayElement(['status_change', 'evaluation_completed', 'interview_scheduled', 'note_added', 'communication_sent']) as any,
      description: faker.lorem.sentence(),
      userId: generateId('users', crypto.randomUUID()),
      timestamp: faker.date.past().toISOString(),
      metadata: {
        category: faker.lorem.words(),
        importance: faker.helpers.arrayElement(['low', 'medium', 'high'])
      }
    }), { count: faker.number.int({ min: 3, max: 10 }) }),
    metrics: {
      timeToApplication: faker.number.int({ min: 1, max: 30 }),
      timeInProcess: faker.number.int({ min: 1, max: 60 }),
      responseTime: faker.number.int({ min: 1, max: 72 }),
      interviewCount: faker.number.int({ min: 0, max: 5 }),
      evaluatorCount: faker.number.int({ min: 1, max: 4 }),
      lastUpdated: new Date().toISOString()
    },
    gdpr: {
      consentProvidedAt: faker.date.past().toISOString(),
      dataProcessingBasis: 'legitimate_interest',
      retentionPeriod: 730 // 2 years
    }
  };
}

function generateStageEvaluation(
  tenantId: string,
  applicationId: string,
  candidateId: string,
  jobId: string
): StageEvaluationDocument {
  const evaluationId = crypto.randomUUID();
  const evaluatorId = generateId('users', crypto.randomUUID());

  // Generate detailed responses
  const responses = faker.helpers.multiple(() => {
    const questionType = faker.helpers.arrayElement(['multiple_choice', 'scale', 'text', 'file_review']) as any;
    let response: any = {
      questionId: crypto.randomUUID(),
      question: faker.lorem.sentence(),
      sectionId: crypto.randomUUID(),
      category: faker.lorem.words(),
      type: questionType,
      score: faker.number.int({ min: 1, max: 10 }),
      confidence: faker.number.float({ min: 0.5, max: 1.0, precision: 0.1 }),
      notes: faker.lorem.paragraph(),
      timeSpent: faker.number.int({ min: 60, max: 600 }) // seconds
    };

    if (questionType === 'multiple_choice') {
      response.answer = faker.helpers.arrayElement(['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree']);
    } else if (questionType === 'text') {
      response.answer = faker.lorem.paragraphs(2);
    }

    // Add file attachments for some responses
    if (faker.datatype.boolean({ probability: 0.2 })) {
      response.attachments = faker.helpers.multiple(() => generateMockFile('pdf', 500), { count: faker.number.int({ min: 1, max: 3 }) });
    }

    return response;
  }, { count: faker.number.int({ min: 10, max: 30 }) });

  // Generate section scores
  const sectionScores = [
    {
      sectionId: crypto.randomUUID(),
      sectionName: 'Technical Skills',
      sectionWeight: 0.4,
      rawScore: faker.number.int({ min: 60, max: 95 }),
      weightedScore: faker.number.int({ min: 24, max: 38 }),
      maxScore: 40
    },
    {
      sectionId: crypto.randomUUID(),
      sectionName: 'Cultural Fit',
      sectionWeight: 0.3,
      rawScore: faker.number.int({ min: 65, max: 90 }),
      weightedScore: faker.number.int({ min: 19, max: 27 }),
      maxScore: 30
    },
    {
      sectionId: crypto.randomUUID(),
      sectionName: 'Experience',
      sectionWeight: 0.3,
      rawScore: faker.number.int({ min: 70, max: 95 }),
      weightedScore: faker.number.int({ min: 21, max: 28 }),
      maxScore: 30
    }
  ];

  const overallScore = sectionScores.reduce((sum, section) => sum + section.weightedScore, 0);

  // Generate skills assessment
  const skillsAssessment = {
    technicalSkills: faker.helpers.multiple(() => ({
      skill: faker.lorem.words(),
      level: faker.number.int({ min: 1, max: 5 }),
      demonstrated: faker.datatype.boolean({ probability: 0.7 }),
      evidence: faker.lorem.sentence()
    }), { count: faker.number.int({ min: 5, max: 15 }) }),
    softSkills: faker.helpers.multiple(() => ({
      skill: faker.lorem.words(),
      level: faker.number.int({ min: 1, max: 5 }),
      demonstrated: faker.datatype.boolean({ probability: 0.8 }),
      evidence: faker.lorem.sentence()
    }), { count: faker.number.int({ min: 3, max: 10 }) }),
    gaps: faker.helpers.multiple(() => ({
      skill: faker.lorem.words(),
      requiredLevel: faker.number.int({ min: 3, max: 5 }),
      currentLevel: faker.number.int({ min: 1, max: 3 }),
      impact: faker.lorem.sentence()
    }), { count: faker.number.int({ min: 0, max: 5 }) })
  };

  // Generate audio/video recording (simulated)
  const recording = faker.datatype.boolean({ probability: 0.3 }) ? {
    audioUrl: generateMockFile('mp3', 15000), // 15MB audio file
    videoUrl: generateMockFile('mp4', 75000), // 75MB video file
    transcript: faker.lorem.paragraphs(20), // Large transcript
    duration: faker.number.int({ min: 1800, max: 7200 }), // 30-120 minutes
    size: faker.number.int({ min: 20000000, max: 100000000 }) // 20-100MB
  } : undefined;

  return {
    id: generateId('stage-evaluations', evaluationId),
    collection: 'stage-evaluations',
    evaluationId,
    applicationId,
    stageId: crypto.randomUUID(),
    candidateId,
    jobId,
    tenantId,
    evaluatorId,
    evaluatorRole: faker.helpers.arrayElement(['recruiter', 'hiring_manager', 'technical_interviewer', 'peer']) as any,
    evaluatorName: faker.person.fullName(),
    status: 'completed',
    startedAt: faker.date.past().toISOString(),
    completedAt: faker.date.recent().toISOString(),
    duration: faker.number.int({ min: 30, max: 180 }), // minutes
    responses,
    scoring: {
      sectionScores,
      overallScore,
      percentageScore: Math.round((overallScore / 100) * 100),
      recommendation: faker.helpers.arrayElement(['advance', 'hold', 'reject']) as any,
      confidence: faker.number.float({ min: 0.6, max: 1.0, precision: 0.1 })
    },
    assessment: {
      strengths: faker.helpers.multiple(() => ({
        area: faker.lorem.words(),
        description: faker.lorem.paragraph(),
        evidence: faker.helpers.multiple(() => crypto.randomUUID(), { count: faker.number.int({ min: 1, max: 3 }) })
      }), { count: faker.number.int({ min: 2, max: 5 }) }),
      concerns: faker.helpers.multiple(() => ({
        area: faker.lorem.words(),
        description: faker.lorem.paragraph(),
        severity: faker.helpers.arrayElement(['low', 'medium', 'high']) as any,
        evidence: faker.helpers.multiple(() => crypto.randomUUID(), { count: faker.number.int({ min: 1, max: 2 }) })
      }), { count: faker.number.int({ min: 0, max: 3 }) })
    },
    skillsAssessment,
    notes: {
      candidateImpression: faker.lorem.paragraphs(2),
      culturalFit: faker.lorem.paragraph(),
      motivation: faker.lorem.paragraph(),
      careerGoals: faker.lorem.paragraph(),
      concerns: faker.lorem.paragraph(),
      additionalNotes: faker.datatype.boolean({ probability: 0.5 }) ? faker.lorem.paragraph() : undefined
    },
    followUp: {
      nextSteps: faker.helpers.multiple(() => faker.lorem.sentence(), { count: faker.number.int({ min: 1, max: 4 }) }),
      additionalEvaluators: faker.helpers.multiple(() => generateId('users', crypto.randomUUID()), { count: faker.number.int({ min: 0, max: 2 }) }),
      materialsNeeded: faker.helpers.multiple(() => faker.lorem.words(), { count: faker.number.int({ min: 0, max: 3 }) }),
      timeline: faker.datatype.boolean({ probability: 0.7 }) ? faker.lorem.sentence() : undefined
    },
    recording,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    completedBy: evaluatorId,
    quality: {
      completeness: faker.number.float({ min: 0.8, max: 1.0, precision: 0.1 }),
      consistency: faker.number.float({ min: 0.7, max: 1.0, precision: 0.1 }),
      thoroughness: faker.number.float({ min: 0.6, max: 1.0, precision: 0.1 }),
      timeEfficiency: faker.number.float({ min: 0.5, max: 1.0, precision: 0.1 }),
      lastCalculated: new Date().toISOString()
    }
  };
}

async function createTestDatabase() {
  try {
    console.log('Creating test database...');

    // Check if database exists first
    try {
      const response = await fetch(`${CONFIG.ravendbUrl}/databases`);
      const data = await response.json();
      const existingDb = data.Databases.find((d: any) => d.Name === CONFIG.databaseName);

      if (existingDb) {
        console.log(`✓ Test database '${CONFIG.databaseName}' already exists`);
        return;
      }
    } catch (error) {
      console.log('Could not check existing databases, proceeding with creation...');
    }

    // For RavenDB, we need to use the proper API to create database
    const createDbPayload = {
      DatabaseName: CONFIG.databaseName,
      Settings: {}
    };

    const response = await fetch(`${CONFIG.ravendbUrl}/admin/databases`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createDbPayload)
    });

    if (response.ok) {
      console.log(`✓ Test database '${CONFIG.databaseName}' created successfully`);
    } else {
      const errorText = await response.text();
      throw new Error(`Failed to create database: ${errorText}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log(`✓ Test database '${CONFIG.databaseName}' already exists`);
    } else {
      console.error('Error creating database:', error);
      throw error;
    }
  }
}

async function getDatabaseStats() {
  try {
    const size = await getDatabaseSize();
    return {
      databaseName: CONFIG.databaseName,
      sizeOnDisk: size,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
}

async function getDatabaseSize() {
  try {
    const response = await fetch(`${CONFIG.ravendbUrl}/databases`);
    const data = await response.json();
    const db = data.Databases.find((d: any) => d.Name === CONFIG.databaseName);
    return db ? db.TotalSize.SizeInBytes : 0;
  } catch (error) {
    console.error('Error getting database size:', error);
    return 0;
  }
}

async function generateTestData(size: keyof typeof CONFIG.testSizes) {
  const config = CONFIG.testSizes[size];
  const tenantId = `tenant-${size}-${Date.now()}`;

  console.log(`\n=== Generating ${size.toUpperCase()} test data ===`);
  console.log(`Target: ${config.companies} companies, ${config.candidates} candidates, ${config.evaluations} evaluations`);

  const startTime = Date.now();
  const results = {
    size,
    documents: {
      companies: 0,
      jobs: 0,
      candidates: 0,
      applications: 0,
      evaluations: 0,
      users: 0,
      analytics: 0
    },
    storage: {
      before: 0,
      after: 0,
      growth: 0
    },
    generationTime: 0
  };

  try {
    // Get initial database size
    results.storage.before = await getDatabaseSize();
    console.log(`Initial database size: ${(results.storage.before / 1024 / 1024).toFixed(2)} MB`);

    const session = store.openSession();

    // Generate tenant and users
    console.log('Creating tenant and users...');
    const tenant = generateTenant(tenantId);
    await session.store(tenant);

    // Generate users
    const users = [];
    for (let i = 0; i < 10; i++) {
      const user = generateUser(tenantId, faker.helpers.arrayElement(['owner', 'admin', 'recruiter', 'interviewer']));
      await session.store(user);
      users.push(user);
    }
    results.documents.users = 10;

    // Generate companies
    console.log('Creating companies...');
    const companies = [];
    for (let i = 0; i < config.companies; i++) {
      const company = generateCompany(tenantId);
      await session.store(company);
      companies.push(company);
      results.documents.companies++;
    }

    // Generate jobs
    console.log('Creating jobs...');
    const jobs = [];
    for (let i = 0; i < config.jobs; i++) {
      const company = faker.helpers.arrayElement(companies);
      const job = generateJob(tenantId, company.companyId);
      await session.store(job);
      jobs.push(job);
      results.documents.jobs++;
    }

    // Generate candidates
    console.log('Creating candidates...');
    const candidates = [];
    for (let i = 0; i < config.candidates; i++) {
      const candidate = generateCandidate(tenantId);
      await session.store(candidate);
      candidates.push(candidate);
      results.documents.candidates++;

      // Save in batches to avoid memory issues
      if ((i + 1) % 100 === 0) {
        await session.saveChanges();
        console.log(`  Generated ${i + 1} candidates...`);
      }
    }

    // Generate applications
    console.log('Creating applications...');
    const applications = [];
    for (let i = 0; i < config.applications; i++) {
      const job = faker.helpers.arrayElement(jobs);
      const candidate = faker.helpers.arrayElement(candidates);
      const application = generateApplication(tenantId, job.companyId, job.jobId, candidate.candidateId);
      await session.store(application);
      applications.push(application);
      results.documents.applications++;

      // Save in batches
      if ((i + 1) % 200 === 0) {
        await session.saveChanges();
        console.log(`  Generated ${i + 1} applications...`);
      }
    }

    // Generate evaluations
    console.log('Creating evaluations...');
    for (let i = 0; i < config.evaluations; i++) {
      const application = faker.helpers.arrayElement(applications);
      const evaluation = generateStageEvaluation(
        tenantId,
        application.applicationId,
        application.candidateId,
        application.jobId
      );
      await session.store(evaluation);
      results.documents.evaluations++;

      // Save in batches
      if ((i + 1) % 500 === 0) {
        await session.saveChanges();
        console.log(`  Generated ${i + 1} evaluations...`);
      }
    }

    // Generate some analytics documents
    console.log('Creating analytics documents...');
    for (let i = 0; i < 50; i++) {
      const analyticsReport = {
        id: `analytics-reports/${crypto.randomUUID()}`,
        collection: 'analytics-reports',
        reportId: crypto.randomUUID(),
        tenantId,
        reportType: faker.helpers.arrayElement(['hiring_pipeline', 'recruitment_metrics', 'diversity', 'performance']),
        title: faker.lorem.sentence(),
        data: {
          summary: {
            totalApplications: faker.number.int({ min: 100, max: 1000 }),
            conversionRate: faker.number.float({ min: 0.1, max: 0.8, precision: 0.01 }),
            averageTimeToHire: faker.number.int({ min: 10, max: 60 })
          },
          details: faker.helpers.multiple(() => ({
            month: faker.date.past().toISOString().slice(0, 7),
            applications: faker.number.int({ min: 50, max: 200 }),
            hires: faker.number.int({ min: 1, max: 20 })
          }), { count: 12 })
        },
        createdAt: faker.date.past().toISOString(),
        generatedBy: faker.helpers.arrayElement(users).userId,
        lastCalculated: new Date().toISOString(),
        status: 'completed'
      };
      await session.store(analyticsReport);
      results.documents.analytics++;
    }

    // Final save
    await session.saveChanges();
    console.log('✓ All documents saved successfully');

    // Get final database size
    results.storage.after = await getDatabaseSize();
    results.storage.growth = results.storage.after - results.storage.before;
    results.generationTime = Date.now() - startTime;

    console.log(`\n=== ${size.toUpperCase()} Test Results ===`);
    console.log(`Documents Created:`);
    console.log(`  Companies: ${results.documents.companies}`);
    console.log(`  Jobs: ${results.documents.jobs}`);
    console.log(`  Candidates: ${results.documents.candidates}`);
    console.log(`  Applications: ${results.documents.applications}`);
    console.log(`  Evaluations: ${results.documents.evaluations}`);
    console.log(`  Users: ${results.documents.users}`);
    console.log(`  Analytics: ${results.documents.analytics}`);
    console.log(`  Total: ${Object.values(results.documents).reduce((a, b) => a + b, 0)}`);

    console.log(`\nStorage Impact:`);
    console.log(`  Before: ${(results.storage.before / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  After: ${(results.storage.after / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Growth: ${(results.storage.growth / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Per Candidate: ${(results.storage.growth / results.documents.candidates / 1024).toFixed(2)} KB`);
    console.log(`  Per Evaluation: ${(results.storage.growth / results.documents.evaluations / 1024).toFixed(2)} KB`);

    console.log(`\nPerformance:`);
    console.log(`  Generation Time: ${(results.generationTime / 1000).toFixed(2)} seconds`);
    console.log(`  Documents/Second: ${(Object.values(results.documents).reduce((a, b) => a + b, 0) / (results.generationTime / 1000)).toFixed(2)}`);

    return results;

  } catch (error) {
    console.error(`Error generating ${size} test data:`, error);
    throw error;
  }
}

async function runStorageAnalysis() {
  console.log('🚀 Starting RavenDB Storage Analysis for Recruitment Platform');
  console.log('='.repeat(60));

  try {
    // Create test database
    await createTestDatabase();

    const results = [];

    // Test different sizes
    for (const size of ['small', 'medium', 'large'] as const) {
      try {
        const result = await generateTestData(size);
        results.push(result);

        // Add delay between tests to let RavenDB settle
        console.log('\nWaiting for database to settle...');
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error) {
        console.error(`Failed to generate ${size} test data:`, error);
      }
    }

    // Generate final report
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL STORAGE ANALYSIS REPORT');
    console.log('='.repeat(60));

    results.forEach(result => {
      console.log(`\n${result.size.toUpperCase()} TENANT:`);
      console.log(`  Scale: ${result.documents.candidates} candidates, ${result.documents.evaluations} evaluations`);
      console.log(`  Storage Used: ${(result.storage.growth / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Storage per Candidate: ${(result.storage.growth / result.documents.candidates / 1024).toFixed(2)} KB`);
      console.log(`  Storage per Evaluation: ${(result.storage.growth / result.documents.evaluations / 1024).toFixed(2)} KB`);
    });

    // Calculate projections
    console.log('\n📈 STORAGE PROJECTIONS:');
    console.log('-'.repeat(30));

    // Use medium tenant as baseline for projections
    const mediumResult = results.find(r => r.size === 'medium');
    if (mediumResult) {
      const storagePerCandidate = mediumResult.storage.growth / mediumResult.documents.candidates / 1024; // KB
      const storagePerEvaluation = mediumResult.storage.growth / mediumResult.documents.evaluations / 1024; // KB

      // Small tenant (50 candidates)
      console.log(`Small Tenant (50 candidates): ${(storagePerCandidate * 50 / 1024).toFixed(2)} MB`);

      // Medium tenant (500 candidates)
      console.log(`Medium Tenant (500 candidates): ${(storagePerCandidate * 500 / 1024).toFixed(2)} MB`);

      // Large tenant (5000 candidates)
      console.log(`Large Tenant (5000 candidates): ${(storagePerCandidate * 5000 / 1024).toFixed(2)} MB`);

      // Calculate monthly growth (assuming 10% candidate growth and 3 evaluations per candidate per month)
      console.log('\n📅 MONTHLY GROWTH ESTIMATES:');
      console.log('-'.repeat(30));
      console.log(`Storage per new candidate: ${(storagePerCandidate / 1024).toFixed(2)} MB`);
      console.log(`Storage per evaluation: ${(storagePerEvaluation / 1024).toFixed(2)} KB`);
      console.log(`Estimated monthly growth (500 candidates + 1500 evaluations): ${((storagePerCandidate * 0.1 * 500 + storagePerEvaluation * 1500) / 1024).toFixed(2)} MB`);

      // Cost analysis
      console.log('\n💰 COST ANALYSIS:');
      console.log('-'.repeat(30));
      console.log(`AWS S3 Standard Storage (First 50TB): $0.023 per GB`);
      console.log(`Monthly storage cost per 500 candidates: $${(storagePerCandidate * 500 / 1024 / 1024 * 0.023).toFixed(2)}`);
      console.log(`Annual storage cost per 500 candidates: $${(storagePerCandidate * 500 / 1024 / 1024 * 0.023 * 12).toFixed(2)}`);

      // Save results to file
      const reportData = {
        timestamp: new Date().toISOString(),
        testConfiguration: CONFIG,
        results,
        projections: {
          storagePerCandidate: storagePerCandidate, // KB
          storagePerEvaluation: storagePerEvaluation, // KB
          monthlyGrowthPerActiveCandidate: (storagePerCandidate * 0.1 + storagePerEvaluation * 3) / 1024 // MB
        },
        costs: {
          storageCostPerGB: 0.023,
          monthlyCostPer500Candidates: storagePerCandidate * 500 / 1024 / 1024 * 0.023,
          annualCostPer500Candidates: storagePerCandidate * 500 / 1024 / 1024 * 0.023 * 12
        }
      };

      fs.writeFileSync(
        path.join(process.cwd(), 'storage-analysis-report.json'),
        JSON.stringify(reportData, null, 2)
      );

      console.log('\n📄 Detailed report saved to: storage-analysis-report.json');
    }

  } catch (error) {
    console.error('Storage analysis failed:', error);
    throw error;
  } finally {
    store.dispose();
  }
}

// Run the analysis
if (require.main === module) {
  runStorageAnalysis().catch(console.error);
}

export {
  runStorageAnalysis,
  generateTestData,
  getDatabaseStats,
  CONFIG
};