import { EvaluationGuideline } from "./ksa-new";

export const exampleGuideline: EvaluationGuideline = {
  jobType: "technical",
  jobFit: {
    Knowledge: {
      attribute: {
        definition:
          "The body of information, facts, theories, and principles needed for a candidate to succeed in TechCorp Solutions' Software Engineer role, with emphasis on the company's stack (TypeScript/Python, React/FastAPI/Django, PostgreSQL/Redis, AWS/Kubernetes/Docker, observability with Datadog/Prometheus) and its growth-stage Enterprise Software context.",
        evaluationScale: {
          "1": "Cannot perform job duty",
          "2": "Cannot perform job duty",
          "3": "Requires significant training/guidance to perform job duty",
          "4": "Requires significant training/guidance to perform job duty",
          "5": "Able to perform job duties with minimal guidance",
          "6": "Able to perform job duties with minimal guidance",
          "7": "Able to perform job duties and positively impact performance of peers",
          "8": "Able to perform job duties and positively impact performance of peers",
          "9": "Transforms the way the team delivers",
          "10": "Transforms the way the team delivers",
        },
        weighting: { min: 35, max: 45 },
        redFlags: [
          "Lacks knowledge of TechCorp's stack or enterprise software implications",
          "Cannot connect knowledge to business goals",
          "Overly generic explanations with no concrete tech context",
        ],
      },
      questions: [
        {
          id: 1,
          questionText:
            "Describe how you would design a scalable, multi-tenant data model for a SaaS product at TechCorp Solutions using PostgreSQL and Redis, deployed on AWS with Kubernetes. What trade-offs would you consider for data isolation, performance, and cost?",
          followUpProbes: [
            "Which PostgreSQL features would you leverage (e.g., schemas, partitions, RLS)?",
            "How would you monitor impact on latency and cost as tenants scale?",
            "How would you validate data isolation and security across tenants?",
          ],
          evaluationCriteria:
            "Demonstrates multi-tenant data modeling awareness, scale considerations, and alignment to enterprise-grade requirements.",
          expectedAnswers:
            "Concrete tenant isolation strategy (schemas/row-level security), indexing/partitioning plan, caching strategy with Redis, observability hooks (metrics/logs), cost/performance trade-offs, deployment considerations on Kubernetes/AWS, security/compliance considerations.",
          redFlagIndicators: [
            "No concrete tenant-model approach",
            "Cannot connect data model choices to performance/cost impacts",
            "Vague references to technologies without integration context",
          ],
          difficulty: "advanced",
        },
        {
          id: 2,
          questionText:
            "Tell me about a time you diagnosed a performance bottleneck in a React frontend with a Python backend (FastAPI or Django) deployed on AWS/Kubernetes. What was your approach and the outcome?",
          followUpProbes: [
            "What metrics guided your decision making?",
            "How did you validate the improvement before and after deployment?",
            "What would you monitor ongoing to prevent regressions?",
          ],
          evaluationCriteria:
            "Shows systematic diagnosis, cross-team collaboration, and measurable outcomes tied to stack specifics.",
          expectedAnswers:
            "Clarifies symptoms, metrics used (e.g., Lighthouse/real user metrics, backend latency, database queries), steps taken (profiling, code changes, caching, CDN, architectural adjustments), and quantified improvements.",
          redFlagIndicators: [
            "No measurable outcome or data to support changes",
            "Blames external factors without internal actions",
            "Vague reference to stack without concrete steps",
          ],
          difficulty: "intermediate",
        },
      ],
    },
    Skills: {
      attribute: {
        definition:
          "Proficiency with the programming languages, frameworks, tools, and practices referenced in TechCorp Solutions' context (TypeScript, Python, React, FastAPI, Django, PostgreSQL, Redis, AWS, Kubernetes, Docker, Terraform, Datadog/Prometheus, Jira/Slack/Linear).",
        evaluationScale: {
          "1": "Novice; requires substantial coaching",
          "2": "Novice; requires substantial coaching",
          "3": "Fundamental; limited autonomy",
          "4": "Competent; handles standard tasks with guidance",
          "5": "Proficient; works independently with quality",
          "6": "Proficient; contributes to peers",
          "7": "Strong; influences team practices",
          "8": "Advanced; mentors others",
          "9": "Expert; shapes architecture and standards",
          "10": "Authoritative; industry-impact level",
        },
        weighting: { min: 30, max: 40 },
        redFlags: [
          "Can't describe end-to-end flows or fail to connect tool usage to outcomes",
          "Overly generic tech talk with no real-world applicability",
        ],
      },
      questions: [
        {
          id: 3,
          questionText:
            "Walk me through a full deployment of a microservice using Docker, Kubernetes, and Terraform in TechCorp's stack. Include CI/CD steps, observability (Datadog/Prometheus), and how you handle rollback.",
          followUpProbes: [
            "What were the key challenges and how did you resolve them?",
            "How do you ensure observability covers failure modes across services?",
            "What would you improve next time?",
          ],
          evaluationCriteria:
            "Shows hands-on deployment experience, orchestration, and reliability/observability integration.",
          expectedAnswers:
            "Clear pipeline steps, containerization strategy, Kubernetes manifests, Terraform plans, monitoring dashboards, rollback plan, and rollback criteria.",
          redFlagIndicators: [
            "No concrete deployment steps or misalignment with observability",
            "Skips validation/rollback considerations",
            "Lacks connection to real-world metrics",
          ],
          difficulty: "intermediate",
        },
        {
          id: 4,
          questionText:
            "Describe your approach to building a maintainable frontend in TypeScript with React, backed by a Python API (FastAPI/Django). How do you structure data fetching, error handling, and security (auth/input validation)?",
          followUpProbes: [
            "How do you handle loading and error states in the UI?",
            "What testing approaches do you use for frontend/backend integration?",
            "How do you secure APIs and protect against common vulnerabilities?",
          ],
          evaluationCriteria:
            "Demonstrates structure, data flow, error handling, and security best practices.",
          expectedAnswers:
            "Componentization strategy, data fetching patterns (hooks/RTK/React Query), error boundaries, input validation, authentication integration, and testability aspects.",
          redFlagIndicators: [
            "Frontend or backend separation is weak or unclear",
            "Security concerns are not addressed",
            "No testing strategy described",
          ],
          difficulty: "intermediate",
        },
      ],
    },
    Ability: {
      attribute: {
        definition:
          "Demonstrated leadership, problem-solving, and mentoring capacity appropriate to TechCorp's growth-stage maturity.",
        evaluationScale: {
          "1": "Cannot perform leadership or mentoring tasks",
          "2": "Limited ability to lead or mentor",
          "3": "Requires guidance to lead others",
          "4": "Leads small initiatives with coaching",
          "5": "Leads cross-functional work streams independently",
          "6": "Mentors others; drives outcomes with minimal guidance",
          "7": "Strategic influencer; aligns teams around outcomes",
          "8": "Mentors multiple teams; drives capability building",
          "9": "Leads organization-wide initiatives",
          "10": "Transformational leadership; shapes team and company direction",
        },
        weighting: { min: 20, max: 30 },
        redFlags: [
          "Avoids ownership; passing responsibility",
          "Fails to demonstrate measurable impact or sustainability",
        ],
      },
      questions: [
        {
          id: 5,
          questionText:
            "Tell me about a time you led a cross-functional initiative (e.g., migrating to Kubernetes or adopting a new observability stack). What was your approach, how did you influence stakeholders, and what was the outcome?",
          followUpProbes: [
            "How did you gain buy-in from leadership and engineers?",
            "What metrics indicated success?",
            "What would you change if you could redo it?",
          ],
          evaluationCriteria:
            "Shows initiative, stakeholder management, and measurable outcomes.",
          expectedAnswers:
            "Clear problem statement, plan, stakeholder engagement, milestones, metrics, and results; reflection on learnings.",
          redFlagIndicators: [
            "Lacks ownership or accountability",
            "No concrete outcomes or metrics",
          ],
          difficulty: "advanced",
        },
        {
          id: 6,
          questionText:
            "Describe a time you mentored a junior engineer or peer to resolve a critical production issue. How did you approach mentoring, and what was the impact on the teammate and the system?",
          followUpProbes: [
            "What did you do to ensure the learner could sustain the improvement?",
            "How did this affect team dynamics?",
            "What did you learn from the experience?",
          ],
          evaluationCriteria:
            "Demonstrates mentorship, technical guidance, and measurable impact on both people and product.",
          expectedAnswers:
            "Mentorship approach, concrete steps, knowledge transfer, and outcome evidence (reduced incidents, faster MTTR).",
          redFlagIndicators: [
            "No growth in the mentee or no tangible impact",
            "Mentor role is described but no concrete actions",
          ],
          difficulty: "intermediate",
        },
      ],
    },
  },
  valuesFit: {
    Innovation: {
      questions: [
        {
          id: 1,
          questionText:
            "Tell me about a time you introduced an innovative solution at a growth-stage company like TechCorp Solutions.",
          followUpProbes: [
            "How did you validate the risk and secure buy-in?",
            "What metrics demonstrated success, and what would you do differently next time?",
            "How did this solution scale or adapt as the company grew?",
          ],
          sampleIndicators: {
            strongResponse:
              "Specific solution, measurable impact, linked to company mission, clear implementation plan",
            weakResponse: "Vague idea, no impact, no alignment to goals",
          },
        },
        {
          id: 2,
          questionText:
            "How do you balance risk and innovation when evaluating new technologies for enterprise-scale apps?",
          followUpProbes: [
            "What metrics did you track during pilots?",
            "How did you obtain stakeholder alignment?",
            "What would you adjust in future experiments?",
          ],
          sampleIndicators: {
            strongResponse:
              "Shows measurable evaluation framework, pilot results, and business rationale",
            weakResponse: "Vague risk consideration; no framework or outcomes",
          },
        },
      ],
    },
    Excellence: {
      questions: [
        {
          id: 1,
          questionText:
            "Describe a time you delivered a high-impact feature with quality under tight deadlines. What practices ensured excellence?",
          followUpProbes: [
            "What quality gates did you implement and why?",
            "How did you validate quality before release?",
            "What would you change to improve future deliveries?",
          ],
          sampleIndicators: {
            strongResponse:
              "Defined quality gates, automated checks, clear trade-offs, and on-time delivery",
            weakResponse: "Missed quality signals or timelines; vague process",
          },
        },
        {
          id: 2,
          questionText:
            "Tell me about a time you improved a process to reduce bugs or improve reliability in a production system.",
          followUpProbes: [
            "What metrics improved and by how much?",
            "How did you ensure sustainability of the improvement?",
            "What did you learn for future iterations?",
          ],
          sampleIndicators: {
            strongResponse:
              "Implemented automated tests/monitoring with measurable defect reduction",
            weakResponse: "No measurable outcome or vague improvements",
          },
        },
      ],
    },
    Collaboration: {
      questions: [
        {
          id: 1,
          questionText:
            "Tell me about a time you partnered with product managers, designers, and QA to deliver a complex feature. How did you navigate competing priorities?",
          followUpProbes: [
            "How did you align goals and timelines across teams?",
            "What trade-offs were made and how were they justified?",
            "What would you do differently next time?",
          ],
          sampleIndicators: {
            strongResponse:
              "Clear coordination plan, respectful conflict resolution, successful delivery",
            weakResponse: "Siloed work; misalignment; missed delivery",
          },
        },
        {
          id: 2,
          questionText:
            "Describe a conflict within a cross-functional team and how you helped resolve it to ship a solution.",
          followUpProbes: [
            "What was your role in resolving the conflict?",
            "What was the impact on team morale and delivery?",
            "What would you improve in future collaborations?",
          ],
          sampleIndicators: {
            strongResponse:
              "Proactive mediation, objective criteria, and eventual consensus",
            weakResponse:
              "Avoided the conflict or escalated without resolution",
          },
        },
      ],
    },
    Growth: {
      questions: [
        {
          id: 1,
          questionText:
            "Describe how you stay current with evolving technologies and how you apply new learning to a project at TechCorp.",
          followUpProbes: [
            "What resources or communities do you rely on?",
            "How did you measure the impact of your learning?",
            "What would you do differently next time?",
          ],
          sampleIndicators: {
            strongResponse:
              "Specific learning plan, applied to a concrete project, with measurable impact",
            weakResponse: "No concrete plan or unclear application",
          },
        },
        {
          id: 2,
          questionText:
            "Tell me about mentoring someone on the team and what you learned from the experience.",
          followUpProbes: [
            "What changes did you implement as a result?",
            "How did the mentee's performance or engagement change?",
            "What did you learn about your own leadership style?",
          ],
          sampleIndicators: {
            strongResponse:
              "Structured mentoring plan, tangible improvement, reciprocal learning",
            weakResponse: "Ad-hoc mentoring with no measurable outcomes",
          },
        },
      ],
    },
  },
};
