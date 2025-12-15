# Ohriv Multi-Tenant Tech Recruitment Platform

## Architecture & System Design Guide

---

## 1. Executive Overview

Ohriv is a multi-tenant, enterprise-grade recruitment platform designed for technology companies, staffing agencies, and partners. It provides isolated tenant environments, structured candidate evaluation (KSA-based), advanced analytics, and future deep integrations with external ATS systems.

### Platform Value Proposition

* **Technology Companies**: Scalable recruiting platform with structured evaluations and future ATS integrations
* **Staffing & Recruiting Firms**: Multi-client recruiting with strong isolation and permissions
* **Recruiters & Hiring Managers**: Consistent evaluation frameworks, analytics, and workflow automation
* **Candidates**: Simple application experience with future external ATS ID tracking
* **Partners & Integrators**: Future APIs and migrate.dev support for data portability

---

## 2. Multi-Tenant Architecture Overview

### Core Platform Components

```
Ohriv Platform
│
├── Global Authentication Database (ohriv-auth)
│   ├── Credentials & authentication metadata
│   ├── Session and MFA management
│   └── Login and security history
│
├── Global User Directory (ohriv-directory)
│   ├── User identities
│   ├── Cross-tenant memberships
│   ├── Email / phone mappings
│   └── Global role references
│
├── Tenant Databases (tenant-{id})
│   ├── tenant-google
│   ├── tenant-tesla
│   ├── tenant-spacex
│   └── tenant-agency
│
└── Management Database (ohriv-management)
    ├── Tenant metadata & lifecycle
    ├── Billing & plans
    ├── System configuration
    └── Platform analytics
```

### Data Isolation Strategy

* **Physical isolation**: Separate RavenDB databases per tenant
* **Network isolation**: Tenant-scoped database connections
* **Application isolation**: Tenant-aware sessions and APIs
* **Logical isolation**: Tenant IDs enforced on all documents

---

## 3. Tenant Organization Models

### Enterprise Technology Company

* Multiple internal companies/locations
* Hundreds of recruiters, interviewers, and hiring managers
* Thousands of jobs and candidates
* Advanced analytics and ML-enabled evaluations

### Staffing / Recruiting Agency

* One tenant managing multiple client companies
* Strong role-based access per client
* Commission tracking and performance analytics

### Startup / SMB

* Single company, small user base
* Lightweight workflows
* Reduced limits and simplified configuration

---

## 4. Authentication & Access Control 🔐

### Hybrid Authentication Model

* **Frontend Authentication**: Stack Auth (login, sessions, MFA)
* **Backend Identity Resolution**: Global Directory
* **Authorization Context**: Tenant- and company-scoped sessions

### Visual: Authentication → Tenant Context Pipeline

```
👤 User
  │  (email/password, SSO)
  ▼
🛡️ Stack Auth (Frontend)
  │  issues JWT
  ▼
🧩 Backend API
  │  validates JWT
  ▼
📇 Global Directory (ohriv-directory)
  │  resolves memberships + roles
  ▼
🏢 Tenant Context (tenantId + company scope)
  │  creates server-side session
  ▼
✅ Authorized Requests (RBAC + audit)
```

### Cross-Tenant Access (Same User, Different Contexts)

```
👤 Same identity
  ├── 🏢 Tenant A: Role = Technical Interviewer → companies = [A1, A2]
  ├── 🏢 Tenant B: Role = Partner Recruiter     → companies = [B3]
  └── 🏢 Tenant C: Role = Assessor              → companies = [C1, C2, C5]

Rule: Every request is evaluated inside exactly one tenant context.
Note: Roles will have a "parent" role, with custom "scopes" for Role-Based Access.
```

---

## 5. Per-Tenant Database Design

### Core Collections

* companies
* locations
* jobs
* candidates
* applications
* evaluations
* users
* memberships
* analytics
* configurations

### Key Relationships

* Company → Jobs (1:N)
* Job → Applications (1:N)
* Application → Candidate (N:1)
* Application → Evaluations (1:N)
* User → Memberships (1:N)
* Candidate → External ATS Reference (1:1)

### Security & Compliance

* Tenant ID enforced on all documents
* Role-based access controls
* Encrypted storage and backups
* Full audit logging

---

## 6. KSA Evaluation System 🎯

### Evaluation Framework

Each job defines a structured evaluation guideline:

* **Knowledge**: Concepts, theory, domain understanding
* **Skills**: Practical execution and tooling
* **Ability**: Problem-solving, communication, leadership

Weighting presets vary by role level (junior, senior, staff, leadership).

### Visual: Stage-by-Stage Evaluation Pipeline

```
💼 Job Created
  │  (guideline + stages + weighting)
  ▼
👤 Candidate Added
  │  (profile + external ATS reference)
  ▼
🧑‍🤝‍🧑 Evaluators Assigned
  │  (role-based + stage access)
  ▼
📝 Stage 1 Evaluation
  ▼
📝 Stage 2 Evaluation
  ▼
📝 Stage N Evaluation
  ▼
📊 Final Scorecard + Recommendation
```

### Evaluator Controls

* Stage-specific permissions
* Role-based evaluator assignment
* Calibration and bias analysis

---

## 7. ML-Assisted Evaluation (Decision Support) 🤖

### Design Principles

* Assist human decision-making
* No automated hiring decisions
* Clear confidence and data basis
* No algorithm internals exposed to end users

### Visual: ML Prediction Pipeline

```
📝 Stage Completion Event
  │  (e.g., after Screening)
  ▼
📥 Feature Assembly
  │  KSA + Values + Job Context + Historical Cohort
  ▼
🧠 Model Execution
  │  (tenant defaults + optional tenant-specific models)
  ▼
📈 Outputs
  ├── Predicted Score (0–10)
  ├── Success Probability (%)
  ├── Recommendation (Hire / Consider / Reject)
  ├── Confidence
  └── Early Warnings (risk indicators)
  ▼
🧑‍⚖️ Evaluator UI
  │  “Decision support only — human judgment primary”
  ▼
🗂️ Stored in Tenant DB (audit + analytics)
```

### Prediction Inputs

* Historical evaluation data
* Current KSA scores
* Company values fit
* Job context and seniority

---

## 8. Question Management

### Job-Centric Question Model

* Questions embedded within job evaluation guidelines
* Company- and location-specific variations
* Tagged by difficulty, skill, and domain

### Question Metadata

* Expected answer guidelines
* Red flags
* Follow-up probes
* Scoring weight

---

## 9. Recruitment Workflow 🧭

### Visual: End-to-End Recruiting Pipeline

```
🧾 Requisition
  ▼
📣 Job Posting
  ▼
🔎 Sourcing
  ├── Manual entry
  ├── ATS sync
  └── migrate.dev import
  ▼
🧹 Screening
  ▼
🧑‍💻 Interviews
  ▼
📝 Structured Evaluations (KSA + Values)
  ▼
📊 Decision + Offer
  ▼
✅ Hire
  ▼
🔁 ATS Status Sync + Audit Trail
```

### Notes

* Each stage can be customized per tenant/company via configuration.
* Permissions restrict who can view/score each stage.

---

## 10. Analytics & Reporting

### Analytics Levels

* Platform-wide metrics
* Tenant-level performance
* Company and department insights

### Metrics Examples

* Time-to-hire
* Cost-per-hire
* Funnel conversion rates
* Interview quality and calibration
* Source effectiveness

---

## 11. Security, Privacy & Compliance

### Controls

* Encryption at rest and in transit
* Role-based access
* Audit trails
* Configurable data retention

### Regulatory Alignment

* GDPR-ready data handling
* SOC2-aligned controls
* Candidate data portability

---

## 12. Scalability & Performance

### Architecture

* Load-balanced application layer
* Horizontally scalable Next.js services
* RavenDB clusters with replication
* Background job queues

### Targets

* Thousands of concurrent users
* Millions of evaluations
* Sub-second read performance for dashboards

---

## 13. Integration Architecture 🔌

### Supported Integrations

* ATS platforms (Greenhouse, Lever, Workday)
* migrate.dev for bulk data migration
* Communication tools (Email, Slack, Calendars)
* External talent platforms (LinkedIn, GitHub)

### Visual: Integration Hub Data Flow

```
🏢 Tenant Workspace
  │
  ├── 📤 Outbound: Post jobs / update statuses
  │       ▼
  │   🌿 ATS Providers (Greenhouse / Lever / Workday)
  │
  ├── 📥 Inbound: Import candidates / applications
  │       ▲
  │   🔄 migrate.dev (bulk migration)
  │
  └── 📣 Notifications
          ▼
      ✉️ Email / 💬 Slack / 📅 Calendars

All integration calls are scoped by tenant + rate-limited by plan.
```

### API Design

* Tenant-scoped API gateway
* Rate limiting per plan
* Versioned REST APIs

---

## 14. Configuration & Customization

### Tenant-Level Configuration

* Plans and usage limits
* Branding and domains
* Feature toggles
* Security policies

### Company-Level Configuration

* Locations and departments
* Evaluation stages and templates
* Company values
* Approval workflows

---

## 15. Conclusion & Next Steps

This architecture provides:

* Strong tenant isolation
* Enterprise-grade security
* Flexible evaluation frameworks
* Scalable infrastructure
* Deep ATS interoperability

### Next Steps

1. Validate core tenant and auth flows
2. Finalize type definitions and schemas
3. Implement tenant provisioning service (done, just need to test)
4. Reimplement evaluation and workflow engine (just need to refactor the evaluation objects after our changes)
    - Create steps on Motia backend to handle most of the workflows
5. Configure UI
6. Test before alpha/production
    - Auth
    - Company onboarding
    - KSA Generation
    - Stage Managment
    - Values Management
    - Jobs Management
    - Candidates Management

