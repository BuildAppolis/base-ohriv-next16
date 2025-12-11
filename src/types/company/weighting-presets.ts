import type { JobLevel, JobType, WeightingBand } from "./ksa-new";

/**
 * Preset weighting distributions by job type and level.
 * Values must sum to 100 (Knowledge + Skills + Ability).
 */
export const jobTypeWeightingPresets: Record<
  JobType,
  Record<JobLevel, WeightingBand>
> = {
  technical: {
    intern: {
      Knowledge: 25,
      Skills: 50,
      Ability: 25,
      rationale:
        "Emphasize hands-on coding skills and ability to apply concepts; basic knowledge is useful; Ability supports learning agility.",
    },
    entry: {
      Knowledge: 28,
      Skills: 55,
      Ability: 17,
      rationale:
        "Strong focus on applying skills and growing a knowledge base; smaller but growing emphasis on problem-solving approach.",
    },
    junior: {
      Knowledge: 32,
      Skills: 50,
      Ability: 18,
      rationale:
        "More emphasis on solid knowledge and execution; Ability remains important for learning patterns and collaboration.",
    },
    mid: {
      Knowledge: 28,
      Skills: 55,
      Ability: 17,
      rationale:
        "Autonomous execution and design input grow; Skills remain key, with Knowledge supporting complexity handling.",
    },
    senior: {
      Knowledge: 22,
      Skills: 50,
      Ability: 28,
      rationale:
        "Leadership in technical decisions begins; Ability (leadership, mentoring) rises.",
    },
    principal: {
      Knowledge: 20,
      Skills: 40,
      Ability: 40,
      rationale:
        "Technical influence and systems thinking dominate; Knowledge/Skills still important, but Ability-led impact grows.",
    },
    teamLead: {
      Knowledge: 18,
      Skills: 38,
      Ability: 44,
      rationale:
        "People leadership and cross-team coordination strengthen; Ability becomes more central.",
    },
    manager: {
      Knowledge: 15,
      Skills: 30,
      Ability: 55,
      rationale:
        "Management across projects/teams; decision-making and organizational influence rise; Ability leads.",
    },
    director: {
      Knowledge: 12,
      Skills: 28,
      Ability: 60,
      rationale:
        "Strategic leadership and governance; Ability (vision, change leadership) dominates; Knowledge/Skills still useful.",
    },
    vp: {
      Knowledge: 10,
      Skills: 20,
      Ability: 70,
      rationale:
        "Executives drive strategy and outcomes; broad Abilities and influence are critical; Knowledge/Skills are supportive.",
    },
    cLevel: {
      Knowledge: 5,
      Skills: 15,
      Ability: 80,
      rationale:
        "Top-level leadership and transformation; Abilities (strategic foresight, crisis leadership) drive success; Knowledge/Skills become less differentiating.",
    },
  },
  "non-technical": {
    intern: {
      Knowledge: 25,
      Skills: 50,
      Ability: 25,
      rationale:
        "Early emphasis on selling skills and potential; product/market knowledge grows; Ability supports communication.",
    },
    entry: {
      Knowledge: 25,
      Skills: 55,
      Ability: 20,
      rationale:
        "Strong focus on sales process and relationship-building; knowledge grows alongside execution.",
    },
    junior: {
      Knowledge: 25,
      Skills: 55,
      Ability: 20,
      rationale:
        "Consistent sales execution; knowledge deepens; Ability remains important but not dominant.",
    },
    mid: {
      Knowledge: 25,
      Skills: 50,
      Ability: 25,
      rationale:
        "Solid product/market knowledge; process discipline; Ability and leadership capabilities start to matter more.",
    },
    senior: {
      Knowledge: 20,
      Skills: 45,
      Ability: 35,
      rationale:
        "Greater stakeholder management and strategic selling; Ability (influence, negotiation) rises.",
    },
    principal: {
      Knowledge: 20,
      Skills: 35,
      Ability: 45,
      rationale:
        "Thought leadership in sales strategy; Ability becomes the primary differentiator.",
    },
    teamLead: {
      Knowledge: 20,
      Skills: 30,
      Ability: 50,
      rationale:
        "People leadership and coaching; Ability focuses on developing the team and coaching.",
    },
    manager: {
      Knowledge: 15,
      Skills: 25,
      Ability: 60,
      rationale:
        "Management across accounts/teams; Ability (leadership, stakeholder influence) leads.",
    },
    director: {
      Knowledge: 15,
      Skills: 20,
      Ability: 65,
      rationale:
        "Strategic direction and governance; Ability dominates for driving organizational outcomes.",
    },
    vp: {
      Knowledge: 15,
      Skills: 20,
      Ability: 65,
      rationale:
        "Organization-wide impact; Abilities (vision, political acumen, executive presence) are critical; Knowledge/Skills supportive.",
    },
    cLevel: {
      Knowledge: 10,
      Skills: 15,
      Ability: 75,
      rationale:
        "Top-level transformation and strategy; Abilities (extensive influence, market-shaping leadership) are key.",
    },
  },
};
