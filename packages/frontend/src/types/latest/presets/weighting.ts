import type { JobLevel, JobType, WeightingBand } from "../evaluation-guideline";

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
      Knowledge: { delta: 25, leftPoints: 4, rightPoints: 6 },
      Skills: { delta: 50, leftPoints: 6, rightPoints: 8 },
      Ability: { delta: 25, leftPoints: 5, rightPoints: 5 },
      rationale:
        "Emphasize hands-on coding skills and ability to apply concepts; basic knowledge is useful; Ability supports learning agility.",
    },
    entry: {
      Knowledge: { delta: 28, leftPoints: 4, rightPoints: 6 },
      Skills: { delta: 55, leftPoints: 5, rightPoints: 7 },
      Ability: { delta: 17, leftPoints: 3, rightPoints: 5 },
      rationale:
        "Strong focus on applying skills and growing a knowledge base; smaller but growing emphasis on problem-solving approach.",
    },
    junior: {
      Knowledge: { delta: 32, leftPoints: 6, rightPoints: 6 },
      Skills: { delta: 50, leftPoints: 5, rightPoints: 5 },
      Ability: { delta: 18, leftPoints: 4, rightPoints: 6 },
      rationale:
        "More emphasis on solid knowledge and execution; Ability remains important for learning patterns and collaboration.",
    },
    mid: {
      Knowledge: { delta: 28, leftPoints: 5, rightPoints: 5 },
      Skills: { delta: 55, leftPoints: 4, rightPoints: 6 },
      Ability: { delta: 17, leftPoints: 3, rightPoints: 5 },
      rationale:
        "Autonomous execution and design input grow; Skills remain key, with Knowledge supporting complexity handling.",
    },
    senior: {
      Knowledge: { delta: 22, leftPoints: 7, rightPoints: 5 },
      Skills: { delta: 50, leftPoints: 5, rightPoints: 5 },
      Ability: { delta: 28, leftPoints: 6, rightPoints: 8 },
      rationale:
        "Leadership in technical decisions begins; Ability (leadership, mentoring) rises.",
    },
    principal: {
      Knowledge: { delta: 20, leftPoints: 6, rightPoints: 6 },
      Skills: { delta: 40, leftPoints: 5, rightPoints: 5 },
      Ability: { delta: 40, leftPoints: 6, rightPoints: 6 },
      rationale:
        "Technical influence and systems thinking dominate; Knowledge/Skills still important, but Ability-led impact grows.",
    },
    teamLead: {
      Knowledge: { delta: 18, leftPoints: 5, rightPoints: 7 },
      Skills: { delta: 38, leftPoints: 4, rightPoints: 6 },
      Ability: { delta: 44, leftPoints: 6, rightPoints: 8 },
      rationale:
        "People leadership and cross-team coordination strengthen; Ability becomes more central.",
    },
    manager: {
      Knowledge: { delta: 15, leftPoints: 4, rightPoints: 6 },
      Skills: { delta: 30, leftPoints: 4, rightPoints: 6 },
      Ability: { delta: 55, leftPoints: 6, rightPoints: 8 },
      rationale:
        "Management across projects/teams; decision-making and organizational influence rise; Ability leads.",
    },
    director: {
      Knowledge: { delta: 12, leftPoints: 3, rightPoints: 5 },
      Skills: { delta: 28, leftPoints: 4, rightPoints: 6 },
      Ability: { delta: 60, leftPoints: 6, rightPoints: 7 },
      rationale:
        "Strategic leadership and governance; Ability (vision, change leadership) dominates; Knowledge/Skills still useful.",
    },
    vp: {
      Knowledge: { delta: 10, leftPoints: 3, rightPoints: 5 },
      Skills: { delta: 20, leftPoints: 3, rightPoints: 5 },
      Ability: { delta: 70, leftPoints: 5, rightPoints: 6 },
      rationale:
        "Executives drive strategy and outcomes; broad Abilities and influence are critical; Knowledge/Skills are supportive.",
    },
    cLevel: {
      Knowledge: { delta: 5, leftPoints: 2, rightPoints: 3 },
      Skills: { delta: 15, leftPoints: 3, rightPoints: 4 },
      Ability: { delta: 80, leftPoints: 5, rightPoints: 6 },
      rationale:
        "Top-level leadership and transformation; Abilities (strategic foresight, crisis leadership) drive success; Knowledge/Skills become less differentiating.",
    },
  },
  "non-technical": {
    intern: {
      Knowledge: { delta: 25, leftPoints: 4, rightPoints: 6 },
      Skills: { delta: 50, leftPoints: 5, rightPoints: 7 },
      Ability: { delta: 25, leftPoints: 4, rightPoints: 6 },
      rationale:
        "Early emphasis on selling skills and potential; product/market knowledge grows; Ability supports communication.",
    },
    entry: {
      Knowledge: { delta: 25, leftPoints: 4, rightPoints: 6 },
      Skills: { delta: 55, leftPoints: 5, rightPoints: 7 },
      Ability: { delta: 20, leftPoints: 4, rightPoints: 5 },
      rationale:
        "Strong focus on sales process and relationship-building; knowledge grows alongside execution.",
    },
    junior: {
      Knowledge: { delta: 25, leftPoints: 5, rightPoints: 5 },
      Skills: { delta: 55, leftPoints: 5, rightPoints: 6 },
      Ability: { delta: 20, leftPoints: 4, rightPoints: 5 },
      rationale:
        "Consistent sales execution; knowledge deepens; Ability remains important but not dominant.",
    },
    mid: {
      Knowledge: { delta: 25, leftPoints: 4, rightPoints: 6 },
      Skills: { delta: 50, leftPoints: 4, rightPoints: 6 },
      Ability: { delta: 25, leftPoints: 4, rightPoints: 5 },
      rationale:
        "Solid product/market knowledge; process discipline; Ability and leadership capabilities start to matter more.",
    },
    senior: {
      Knowledge: { delta: 20, leftPoints: 5, rightPoints: 6 },
      Skills: { delta: 45, leftPoints: 5, rightPoints: 6 },
      Ability: { delta: 35, leftPoints: 6, rightPoints: 7 },
      rationale:
        "Greater stakeholder management and strategic selling; Ability (influence, negotiation) rises.",
    },
    principal: {
      Knowledge: { delta: 20, leftPoints: 4, rightPoints: 6 },
      Skills: { delta: 35, leftPoints: 5, rightPoints: 6 },
      Ability: { delta: 45, leftPoints: 6, rightPoints: 7 },
      rationale:
        "Thought leadership in sales strategy; Ability becomes the primary differentiator.",
    },
    teamLead: {
      Knowledge: { delta: 20, leftPoints: 4, rightPoints: 6 },
      Skills: { delta: 30, leftPoints: 4, rightPoints: 6 },
      Ability: { delta: 50, leftPoints: 6, rightPoints: 7 },
      rationale:
        "People leadership and coaching; Ability focuses on developing the team and coaching.",
    },
    manager: {
      Knowledge: { delta: 15, leftPoints: 4, rightPoints: 5 },
      Skills: { delta: 25, leftPoints: 4, rightPoints: 6 },
      Ability: { delta: 60, leftPoints: 6, rightPoints: 8 },
      rationale:
        "Management across accounts/teams; Ability (leadership, stakeholder influence) leads.",
    },
    director: {
      Knowledge: { delta: 15, leftPoints: 3, rightPoints: 5 },
      Skills: { delta: 20, leftPoints: 3, rightPoints: 5 },
      Ability: { delta: 65, leftPoints: 7, rightPoints: 8 },
      rationale:
        "Strategic direction and governance; Ability dominates for driving organizational outcomes.",
    },
    vp: {
      Knowledge: { delta: 15, leftPoints: 3, rightPoints: 5 },
      Skills: { delta: 20, leftPoints: 3, rightPoints: 5 },
      Ability: { delta: 65, leftPoints: 6, rightPoints: 7 },
      rationale:
        "Organization-wide impact; Abilities (vision, political acumen, executive presence) are critical; Knowledge/Skills supportive.",
    },
    cLevel: {
      Knowledge: { delta: 10, leftPoints: 2, rightPoints: 4 },
      Skills: { delta: 15, leftPoints: 3, rightPoints: 4 },
      Ability: { delta: 75, leftPoints: 6, rightPoints: 7 },
      rationale:
        "Top-level transformation and strategy; Abilities (extensive influence, market-shaping leadership) are key.",
    },
  },
};
