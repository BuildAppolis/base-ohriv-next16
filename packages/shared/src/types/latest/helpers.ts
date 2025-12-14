import { JobLevel } from "./enums";

export const prettyPrintJobLevel = ({ level }: { level: JobLevel }) => {
  switch (level) {
    case "intern":
      return "Internship";
    case "entry":
      return "Entry Level";
    case "junior":
      return "Junior Level";
    case "mid":
      return "Mid Level";
    case "senior":
      return "Senior Level";
    case "principal":
      return "Principal Level";
    case "teamLead":
      return "Team Lead";
    case "manager":
      return "Manager";
    case "director":
      return "Director";
    case "vp":
      return "Vice President";
    case "cLevel":
      return "C-Level Executive";
    default:
      return level;
  }
};
