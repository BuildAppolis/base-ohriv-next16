/**
 * Simple KSA Evaluation
 *
 * Just generates basic scores for the fixed candidates against KSA frameworks
 */

import { SimpleCandidate } from "@/lib/candidate-data";
import { KSAInterviewOutput } from "@/types/old/company_old/ksa";
import { CandidateEvaluation } from "@/types/latest/to-refactor/candidate";

/**
 * Simple KSA Evaluation Function
 * Generates realistic scores for candidates against KSA frameworks
 */
export async function evaluateCandidateKSA(
  candidate: SimpleCandidate,
  ksaFramework: KSAInterviewOutput,
  config?: any,
  jobContext?: string
): Promise<CandidateEvaluation> {
  // Generate base scores from candidate ID for consistency
  const candidateNumber = parseInt(candidate.id.split("-")[1]);
  const baseScore = 4 + (candidateNumber % 4); // Varies between 4-7

  // Add some randomness for realism
  const knowledgeScore = Math.min(10, baseScore + Math.random() * 3);
  const skillsScore = Math.min(10, baseScore + Math.random() * 2.5);
  const abilityScore = Math.min(10, baseScore + Math.random() * 2.8);

  // Calculate overall score
  const overallScore =
    Math.round(((knowledgeScore + skillsScore + abilityScore) / 3) * 10) / 10;

  // Generate recommendation based on score
  const recommendation =
    overallScore >= 8
      ? "strong-recommend"
      : overallScore >= 6
      ? "recommend"
      : overallScore >= 4
      ? "consider"
      : "reject";

  const jobTitle =
    jobContext ||
    (ksaFramework.KSA_JobFit && Object.keys(ksaFramework.KSA_JobFit)[0]) ||
    "Unknown Position";

  return {
    candidateId: candidate.id,
    evaluationContext: {
      jobTitle,
      ksaFramework,
      evaluationDate: new Date().toISOString(),
      evaluator: "KSA Evaluation System",
    },
    scores: {
      knowledge: {
        overall: knowledgeScore,
        breakdown: {
          theoreticalKnowledge: knowledgeScore * 0.9,
          practicalApplication: knowledgeScore * 0.8,
          industryAwareness: knowledgeScore * 0.85,
        },
        confidence: 0.8,
        notes: `Knowledge assessment completed with score ${knowledgeScore.toFixed(
          1
        )}/10`,
      },
      skills: {
        overall: skillsScore,
        breakdown: {
          technicalSkills: skillsScore * 0.9,
          problemSolving: skillsScore * 0.85,
          collaboration: skillsScore * 0.8,
        },
        confidence: 0.8,
        notes: `Skills assessment completed with score ${skillsScore.toFixed(
          1
        )}/10`,
      },
      abilities: {
        overall: abilityScore,
        breakdown: {
          leadership: abilityScore * 0.8,
          communication: abilityScore * 0.9,
          adaptability: abilityScore * 0.85,
        },
        confidence: 0.8,
        notes: `Abilities assessment completed with score ${abilityScore.toFixed(
          1
        )}/10`,
      },
    },
    overallCompatibility: {
      score: overallScore,
      recommendation,
      strengths:
        overallScore >= 6
          ? [
              "Good overall compatibility with role requirements",
              "Strong potential for growth and development",
            ]
          : [],
      concerns:
        overallScore < 6
          ? [
              "May need additional development in key areas",
              "Consider targeted training and mentorship",
            ]
          : [],
      interviewFocus: [
        "Problem-solving approach and methodology",
        "Team collaboration and communication style",
        "Technical decision-making process",
      ],
    },
    predictedPerformance: {
      behavioral: Math.round(((abilityScore + knowledgeScore) / 2) * 10) / 10,
      technical: Math.round(((skillsScore + knowledgeScore) / 2) * 10) / 10,
      cultural: Math.round(((abilityScore + skillsScore) / 2) * 10) / 10,
      overall: overallScore,
    },
  };
}
