export type VisibleStepChoice = "yes" | "no" | "";

export const getVisibleStepIds = (websiteChoice: VisibleStepChoice) =>
  websiteChoice === "yes"
    ? ["website_choice", "website_url", "company_size", "about", "values"]
    : ["website_choice", "name", "company_size", "about", "values"];
