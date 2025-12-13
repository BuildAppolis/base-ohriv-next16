import { EvaluatorRole } from "./evaluation";
import { TenantMembershipRole } from "./user";

// Maps evaluator roles to tenant membership roles that are allowed to perform them
export const evaluatorRolePermissions: Record<
  EvaluatorRole,
  TenantMembershipRole[]
> = {
  sourcer: ["owner", "admin", "recruiter"],
  recruiter: ["owner", "admin", "recruiter"],
  hiring_manager: ["owner", "admin", "interviewer"],
  technical_interviewer: ["owner", "admin", "interviewer"],
  values_interviewer: ["owner", "admin", "recruiter", "interviewer"],
  peer: ["owner", "admin", "interviewer"],
  partner: ["owner", "admin", "partner_manager"],
};

export function roleCanPerformEvaluatorRole(
  membershipRole: TenantMembershipRole,
  evaluatorRole: EvaluatorRole
) {
  if (membershipRole === "owner" || membershipRole === "admin") return true;
  return (evaluatorRolePermissions[evaluatorRole] || []).includes(membershipRole);
}
