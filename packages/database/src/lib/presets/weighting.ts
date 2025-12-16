import { WeightingPresetDocument } from "../../models";

/**
 * Default weighting presets by job type and level
 * Values must sum to 100 (Knowledge + Skills + Ability)
 */
export const jobTypeWeightingPresets: Record<
  "technical" | "non-technical",
  Record<
    | "intern"
    | "entry"
    | "junior"
    | "mid"
    | "senior"
    | "principal"
    | "teamLead"
    | "manager"
    | "director"
    | "vp"
    | "cLevel",
    Omit<
      WeightingPresetDocument,
      "collection" | "tenantId" | "createdAt" | "updatedAt" | "createdBy"
    >
  >
> = {
  technical: {
    intern: {
      id: "technical-intern",
      name: "Technical Intern",
      jobType: "technical",
      jobLevel: "intern",
      weightings: {
        knowledge: { delta: 25, leftPoints: 4, rightPoints: 6 },
        skills: { delta: 50, leftPoints: 6, rightPoints: 8 },
        ability: { delta: 25, leftPoints: 5, rightPoints: 5 },
      },
      rationale:
        "Emphasize hands-on coding skills and ability to apply concepts; basic knowledge is useful; Ability supports learning agility.",
      target: {
        companySizes: ["startup", "small"],
        departments: ["engineering", "product"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      version: 1,
      isDefault: true,
      isRecommended: true,
      tags: ["intern", "entry-level", "learning"],
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    entry: {
      id: "technical-entry",
      name: "Entry Level Technical",
      jobType: "technical",
      jobLevel: "entry",
      weightings: {
        knowledge: { delta: 28, leftPoints: 4, rightPoints: 6 },
        skills: { delta: 55, leftPoints: 5, rightPoints: 7 },
        ability: { delta: 17, leftPoints: 3, rightPoints: 5 },
      },
      rationale:
        "Strong focus on applying skills and growing a knowledge base; smaller but growing emphasis on problem-solving approach.",
      target: {
        companySizes: ["small", "medium", "large"],
        departments: ["engineering", "devops"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["entry-level", "junior", "growth"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    junior: {
      id: "technical-junior",
      name: "Junior Technical",
      jobType: "technical",
      jobLevel: "junior",
      weightings: {
        knowledge: { delta: 32, leftPoints: 6, rightPoints: 6 },
        skills: { delta: 50, leftPoints: 5, rightPoints: 5 },
        ability: { delta: 18, leftPoints: 4, rightPoints: 6 },
      },
      rationale:
        "More emphasis on solid knowledge and execution; Ability remains important for learning patterns and collaboration.",
      target: {
        companySizes: ["small", "medium", "large", "enterprise"],
        departments: ["engineering", "product", "qa"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["junior", "individual-contributor"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    mid: {
      id: "technical-mid",
      name: "Mid-Level Technical",
      jobType: "technical",
      jobLevel: "mid",
      weightings: {
        knowledge: { delta: 28, leftPoints: 5, rightPoints: 5 },
        skills: { delta: 55, leftPoints: 4, rightPoints: 6 },
        ability: { delta: 17, leftPoints: 3, rightPoints: 5 },
      },
      rationale:
        "Autonomous execution and design input grow; Skills remain key, with Knowledge supporting complexity handling.",
      target: {
        companySizes: ["medium", "large", "enterprise"],
        departments: ["engineering", "architecture"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["mid-level", "autonomous"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    senior: {
      id: "technical-senior",
      name: "Senior Technical",
      jobType: "technical",
      jobLevel: "senior",
      weightings: {
        knowledge: { delta: 22, leftPoints: 7, rightPoints: 5 },
        skills: { delta: 50, leftPoints: 5, rightPoints: 5 },
        ability: { delta: 28, leftPoints: 6, rightPoints: 8 },
      },
      rationale:
        "Leadership in technical decisions begins; Ability (leadership, mentoring) rises.",
      target: {
        companySizes: ["large", "enterprise"],
        departments: ["engineering", "architecture", "tech-lead"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["senior", "leadership"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    principal: {
      id: "technical-principal",
      name: "Principal Technical",
      jobType: "technical",
      jobLevel: "principal",
      weightings: {
        knowledge: { delta: 20, leftPoints: 6, rightPoints: 6 },
        skills: { delta: 40, leftPoints: 5, rightPoints: 5 },
        ability: { delta: 40, leftPoints: 6, rightPoints: 6 },
      },
      rationale:
        "Technical influence and systems thinking dominate; Knowledge/Skills still important, but Ability-led impact grows.",
      target: {
        companySizes: ["large", "enterprise"],
        departments: ["engineering", "architecture", "research"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["principal", "thought-leadership"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    teamLead: {
      id: "technical-team-lead",
      name: "Technical Team Lead",
      jobType: "technical",
      jobLevel: "teamLead",
      weightings: {
        knowledge: { delta: 18, leftPoints: 5, rightPoints: 7 },
        skills: { delta: 38, leftPoints: 4, rightPoints: 6 },
        ability: { delta: 44, leftPoints: 6, rightPoints: 8 },
      },
      rationale:
        "People leadership and cross-team coordination strengthen; Ability becomes more central.",
      target: {
        companySizes: ["medium", "large", "enterprise"],
        departments: ["engineering", "product"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["team-lead", "people-management"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    manager: {
      id: "technical-manager",
      name: "Technical Manager",
      jobType: "technical",
      jobLevel: "manager",
      weightings: {
        knowledge: { delta: 15, leftPoints: 4, rightPoints: 6 },
        skills: { delta: 30, leftPoints: 4, rightPoints: 6 },
        ability: { delta: 55, leftPoints: 6, rightPoints: 8 },
      },
      rationale:
        "Management across projects/teams; decision-making and organizational influence rise; Ability leads.",
      target: {
        companySizes: ["large", "enterprise"],
        departments: ["engineering", "product", "program-management"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["manager", "people-leadership"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    director: {
      id: "technical-director",
      name: "Technical Director",
      jobType: "technical",
      jobLevel: "director",
      weightings: {
        knowledge: { delta: 12, leftPoints: 3, rightPoints: 5 },
        skills: { delta: 28, leftPoints: 4, rightPoints: 6 },
        ability: { delta: 60, leftPoints: 6, rightPoints: 7 },
      },
      rationale:
        "Strategic leadership and governance; Ability (vision, change leadership) dominates; Knowledge/Skills still useful.",
      target: {
        companySizes: ["enterprise"],
        departments: ["engineering", "technology", "innovation"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["director", "strategic"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    vp: {
      id: "technical-vp",
      name: "VP of Engineering",
      jobType: "technical",
      jobLevel: "vp",
      weightings: {
        knowledge: { delta: 10, leftPoints: 3, rightPoints: 5 },
        skills: { delta: 20, leftPoints: 3, rightPoints: 5 },
        ability: { delta: 70, leftPoints: 5, rightPoints: 6 },
      },
      rationale:
        "Executives drive strategy and outcomes; broad Abilities and influence are critical; Knowledge/Skills are supportive.",
      target: {
        companySizes: ["enterprise"],
        departments: ["engineering", "technology"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["vp", "executive"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    cLevel: {
      id: "technical-cto",
      name: "Chief Technology Officer",
      jobType: "technical",
      jobLevel: "cLevel",
      weightings: {
        knowledge: { delta: 5, leftPoints: 2, rightPoints: 3 },
        skills: { delta: 15, leftPoints: 3, rightPoints: 4 },
        ability: { delta: 80, leftPoints: 5, rightPoints: 6 },
      },
      rationale:
        "Top-level leadership and transformation; Abilities (strategic foresight, crisis leadership) drive success; Knowledge/Skills become less differentiating.",
      target: {
        companySizes: ["large", "enterprise"],
        departments: ["technology", "innovation"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["cto", "c-level", "executive"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
  },
  "non-technical": {
    intern: {
      id: "non-technical-intern",
      name: "Non-Technical Intern",
      jobType: "non-technical",
      jobLevel: "intern",
      weightings: {
        knowledge: { delta: 25, leftPoints: 4, rightPoints: 6 },
        skills: { delta: 50, leftPoints: 5, rightPoints: 7 },
        ability: { delta: 25, leftPoints: 4, rightPoints: 6 },
      },
      rationale:
        "Early emphasis on selling skills and potential; product/market knowledge grows; Ability supports communication.",
      target: {
        companySizes: ["startup", "small"],
        departments: ["sales", "marketing", "support"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["intern", "customer-facing"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    entry: {
      id: "non-technical-entry",
      name: "Entry Level Non-Technical",
      jobType: "non-technical",
      jobLevel: "entry",
      weightings: {
        knowledge: { delta: 25, leftPoints: 4, rightPoints: 6 },
        skills: { delta: 55, leftPoints: 5, rightPoints: 7 },
        ability: { delta: 20, leftPoints: 4, rightPoints: 5 },
      },
      rationale:
        "Strong focus on sales process and relationship-building; knowledge grows alongside execution.",
      target: {
        companySizes: ["small", "medium", "large"],
        departments: ["sales", "customer-success", "marketing"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["entry-level", "customer-facing"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    junior: {
      id: "non-technical-junior",
      name: "Junior Non-Technical",
      jobType: "non-technical",
      jobLevel: "junior",
      weightings: {
        knowledge: { delta: 25, leftPoints: 5, rightPoints: 5 },
        skills: { delta: 55, leftPoints: 5, rightPoints: 6 },
        ability: { delta: 20, leftPoints: 4, rightPoints: 5 },
      },
      rationale:
        "Consistent sales execution; knowledge deepens; Ability remains important but not dominant.",
      target: {
        companySizes: ["medium", "large", "enterprise"],
        departments: ["sales", "marketing", "partnerships"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["junior", "individual-contributor"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    mid: {
      id: "non-technical-mid",
      name: "Mid-Level Non-Technical",
      jobType: "non-technical",
      jobLevel: "mid",
      weightings: {
        knowledge: { delta: 25, leftPoints: 4, rightPoints: 6 },
        skills: { delta: 50, leftPoints: 4, rightPoints: 6 },
        ability: { delta: 25, leftPoints: 4, rightPoints: 5 },
      },
      rationale:
        "Solid product/market knowledge; process discipline; Ability and leadership capabilities start to matter more.",
      target: {
        companySizes: ["large", "enterprise"],
        departments: ["sales", "account-management", "solutions"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["mid-level", "experienced"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    senior: {
      id: "non-technical-senior",
      name: "Senior Non-Technical",
      jobType: "non-technical",
      jobLevel: "senior",
      weightings: {
        knowledge: { delta: 20, leftPoints: 5, rightPoints: 6 },
        skills: { delta: 45, leftPoints: 5, rightPoints: 6 },
        ability: { delta: 35, leftPoints: 6, rightPoints: 7 },
      },
      rationale:
        "Greater stakeholder management and strategic selling; Ability (influence, negotiation) rises.",
      target: {
        companySizes: ["large", "enterprise"],
        departments: ["sales", "solutions", "strategic-accounts"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["senior", "strategic"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    principal: {
      id: "non-technical-principal",
      name: "Principal Non-Technical",
      jobType: "non-technical",
      jobLevel: "principal",
      weightings: {
        knowledge: { delta: 20, leftPoints: 4, rightPoints: 6 },
        skills: { delta: 35, leftPoints: 5, rightPoints: 6 },
        ability: { delta: 45, leftPoints: 6, rightPoints: 7 },
      },
      rationale:
        "Thought leadership in sales strategy; Ability becomes the primary differentiator.",
      target: {
        companySizes: ["enterprise"],
        departments: ["sales", "pre-sales", "consulting"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["principal", "thought-leadership"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    teamLead: {
      id: "non-technical-team-lead",
      name: "Non-Technical Team Lead",
      jobType: "non-technical",
      jobLevel: "teamLead",
      weightings: {
        knowledge: { delta: 20, leftPoints: 4, rightPoints: 6 },
        skills: { delta: 30, leftPoints: 4, rightPoints: 6 },
        ability: { delta: 50, leftPoints: 6, rightPoints: 7 },
      },
      rationale:
        "People leadership and coaching; Ability focuses on developing the team and coaching.",
      target: {
        companySizes: ["large", "enterprise"],
        departments: ["sales", "customer-success", "support"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["team-lead", "people-management"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    manager: {
      id: "non-technical-manager",
      name: "Non-Technical Manager",
      jobType: "non-technical",
      jobLevel: "manager",
      weightings: {
        knowledge: { delta: 15, leftPoints: 4, rightPoints: 5 },
        skills: { delta: 25, leftPoints: 4, rightPoints: 6 },
        ability: { delta: 60, leftPoints: 6, rightPoints: 8 },
      },
      rationale:
        "Management across accounts/teams; Ability (leadership, stakeholder influence) leads.",
      target: {
        companySizes: ["large", "enterprise"],
        departments: ["sales", "marketing", "customer-success"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["manager", "people-leadership"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    director: {
      id: "non-technical-director",
      name: "Non-Technical Director",
      jobType: "non-technical",
      jobLevel: "director",
      weightings: {
        knowledge: { delta: 15, leftPoints: 3, rightPoints: 5 },
        skills: { delta: 20, leftPoints: 3, rightPoints: 5 },
        ability: { delta: 65, leftPoints: 7, rightPoints: 8 },
      },
      rationale:
        "Strategic direction and governance; Ability dominates for driving organizational outcomes.",
      target: {
        companySizes: ["enterprise"],
        departments: ["sales", "marketing", "operations"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["director", "strategic"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    vp: {
      id: "non-technical-vp",
      name: "VP Non-Technical",
      jobType: "non-technical",
      jobLevel: "vp",
      weightings: {
        knowledge: { delta: 15, leftPoints: 3, rightPoints: 5 },
        skills: { delta: 20, leftPoints: 3, rightPoints: 5 },
        ability: { delta: 65, leftPoints: 6, rightPoints: 7 },
      },
      rationale:
        "Organization-wide impact; Abilities (vision, political acumen, executive presence) are critical; Knowledge/Skills supportive.",
      target: {
        companySizes: ["enterprise"],
        departments: ["sales", "marketing", "customer-experience"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["vp", "executive"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
    cLevel: {
      id: "non-technical-c-level",
      name: "C-Level Non-Technical",
      jobType: "non-technical",
      jobLevel: "cLevel",
      weightings: {
        knowledge: { delta: 10, leftPoints: 2, rightPoints: 4 },
        skills: { delta: 15, leftPoints: 3, rightPoints: 4 },
        ability: { delta: 75, leftPoints: 6, rightPoints: 7 },
      },
      rationale:
        "Top-level transformation and strategy; Abilities (extensive influence, market-shaping leadership) are key.",
      target: {
        companySizes: ["large", "enterprise"],
        departments: ["sales", "marketing", "growth"],
      },
      usage: {
        guidelinesCount: 0,
        jobsCount: 0,
        evaluationsCount: 0,
      },
      isDefault: true,
      isRecommended: true,
      tags: ["c-level", "executive"],
      version: 1,
      performance: {
        predictiveValidity: undefined,
        candidateSatisfaction: undefined,
        evaluatorFeedback: {
          averageRating: 0,
          comments: [],
        },
      },
      isActive: true,
    },
  },
};
