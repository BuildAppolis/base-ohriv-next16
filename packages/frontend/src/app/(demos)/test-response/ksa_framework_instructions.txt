# AI INTERVIEW QUESTION GENERATION - TRAINING PROTOCOL

## IMMEDIATE INSTRUCTIONS

When you receive company data for interview question generation, you MUST follow this exact protocol:

### STEP 1: INPUT DATA PROCESSING
Parse the JSON input containing:
- `company_profile`: name, industry, size, location, stage
- `mission_and_culture`: mission statement, core_values array
- `interview_steps`: total_steps, steps array with order/type/generation flags
- `technologies`: languages, frameworks, databases, infrastructure, tools
- `positions`: array with title, category, seniority, requirements, tools

### STEP 2: KSA FRAMEWORK DEFINITION
Always output this structure first:
```json
{
  "KSAs": {
    "Knowledge": {
      "definition": "The body of information, facts, theories, and principles needed for a candidate to succeed in the role.",
      "evaluation_scale": {
        "1": "Cannot perform job duty",
        "2": "Cannot perform job duty",
        "3": "Requires significant training/guidance to perform job duty",
        "4": "Requires significant training/guidance to perform job duty",
        "5": "Able to perform job duties with minimal guidance",
        "6": "Able to perform job duties with minimal guidance",
        "7": "Able to perform job duties and positively impact performance of peers",
        "8": "Able to perform job duties and positively impact performance of peers",
        "9": "Transforms the way the team delivers",
        "10": "Transforms the way the team delivers"
      },
      "behavioral_indicators": ["Demonstrates understanding of relevant industry trends", "Possesses knowledge of enterprise software solutions", "Understands best practices in software development methodologies", "Familiar with company products and market dynamics"],
      "assessment_methods": ["Technical quizzes", "Scenario-based questions", "Discussion about past projects", "Relevant certifications"],
      "weighting": 40,
      "role_level_expectations": "Solid understanding of software engineering practices and product management frameworks.",
      "red_flag_indicators": ["Lacks basic industry or role-specific knowledge", "Struggles to articulate how knowledge applies to role", "Unfamiliar with company mission and product goals"]
    },
    "Skills": {
      "definition": "The proficient manual, verbal, or mental manipulation of data or information.",
      "evaluation_scale": { "Same 1-10 scale as above" },
      "behavioral_indicators": ["Proficient in relevant programming languages", "Demonstrates ability to use collaboration tools effectively", "Shows capabilities with relevant hardware/software tools", "Engages in productive technical discussions"],
      "assessment_methods": ["Practical coding tests", "Tool proficiency evaluations", "Behavioral interviews", "Group assessments"],
      "weighting": 35,
      "role_level_expectations": "Ability to create efficient solutions and collaborate effectively.",
      "red_flag_indicators": ["Demonstrates inability to solve problems independently", "Lacks fluency with necessary tools and technologies", "Low confidence in technical subjects"]
    },
    "Abilities": {
      "definition": "The capacity to perform an observable behavior or produce a result.",
      "evaluation_scale": { "Same 1-10 scale as above" },
      "behavioral_indicators": ["Ability to translate requirements into actionable solutions", "Successfully leads team sessions", "Effectively mentors team members", "Shows initiative in suggesting improvements"],
      "assessment_methods": ["Situational judgment tests", "Role-playing scenarios", "Group discussions", "Behavioral interviews"],
      "weighting": 25,
      "role_level_expectations": "Exhibits leadership abilities and contributes to team success.",
      "red_flag_indicators": ["Inconsistent performance in collaborative assignments", "Shows reluctance to take ownership", "Fails to demonstrate initiative"]
    },
    "Value": {
      "definition": "Alignment of candidate's values with the company's mission and culture.",
      "evaluation_scale": { "Same 1-10 scale as above" },
      "behavioral_indicators": ["Demonstrates commitment to company values", "Fosters collaboration and positive team culture", "Shows interest in continuous learning", "Aligns personal goals with mission objectives"],
      "assessment_methods": ["Cultural fit interviews", "Values-based questions", "Group discussions"],
      "weighting": 10,
      "role_level_expectations": "Strong alignment with company mission and values.",
      "red_flag_indicators": ["Inconsistent values with company culture", "Negative attitude towards collaboration", "Focuses solely on personal goals"]
    }
  }
}
```

### STEP 3: QUESTION GENERATION - MANDATORY STRUCTURE

```json
{
  "KSA_JobFit": {
    "Knowledge": {
      "attribute": { "Copy Knowledge definition from KSA framework above" },
      "questions": [
        {
          "id": 1,
          "category": "Knowledge",
          "type": "behavioral",
          "difficulty": "intermediate",
          "question_text": "Company-specific knowledge question using company name and industry",
          "evaluation_criteria": "What constitutes a strong response",
          "expected_answers": "Key elements that should be included",
          "follow_up_probes": ["Specific probe 1", "Specific probe 2", "Specific probe 3"],
          "red_flag_indicators": ["Response patterns that signal concerns"]
        },
        {
          "id": 2,
          "category": "Knowledge",
          "type": "behavioral",
          "difficulty": "intermediate",
          "question_text": "Second knowledge question focusing on continuous learning",
          "evaluation_criteria": "Engagement in continuous learning and application",
          "expected_answers": "Mentorship, courses, resources used",
          "follow_up_probes": ["How often do you engage with these resources?", "Example of learning improving performance"],
          "red_flag_indicators": ["No specific learning examples", "Lack of professional development motivation"]
        }
      ]
    },
    "Skills": {
      "attribute": { "Copy Skills definition from KSA framework above" },
      "questions": [
        {
          "id": 3,
          "category": "Skills",
          "type": "behavioral",
          "difficulty": "advanced",
          "question_text": "Technical problem-solving question using specific technologies from input data",
          "evaluation_criteria": "Ability to articulate technical problem-solving processes",
          "expected_answers": "Clear steps, technologies used, outcome achieved",
          "follow_up_probes": ["What challenges did you face?", "How did you ensure solution met user needs?"],
          "red_flag_indicators": ["Inability to explain process clearly", "Lack of technical depth"]
        },
        {
          "id": 4,
          "category": "Skills",
          "type": "behavioral",
          "difficulty": "intermediate",
          "question_text": "Collaboration tool usage question referencing specific tools from position_tools",
          "evaluation_criteria": "Experience and proficiency with project management tools",
          "expected_answers": "Examples of managing tasks via tools",
          "follow_up_probes": ["How did tools improve outcomes?", "What features were most beneficial?"],
          "red_flag_indicators": ["Negative responses about tool effectiveness", "Limited tool exposure"]
        }
      ]
    },
    "Abilities": {
      "attribute": { "Copy Abilities definition from KSA framework above" },
      "questions": [
        {
          "id": 5,
          "category": "Abilities",
          "type": "behavioral",
          "difficulty": "advanced",
          "question_text": "Leadership/ownership question about project responsibility",
          "evaluation_criteria": "Demonstration of leadership skills and accountability",
          "expected_answers": "Clear role descriptions, challenges, personal growth",
          "follow_up_probes": ["How did you measure success?", "What would you do differently?"],
          "red_flag_indicators": ["Vague project explanations", "Inability to accept responsibility"]
        },
        {
          "id": 6,
          "category": "Abilities",
          "type": "behavioral",
          "difficulty": "intermediate",
          "question_text": "Process improvement/initiative question",
          "evaluation_criteria": "Ability to identify and implement improvements",
          "expected_answers": "Specific improvements and impact on efficiency",
          "follow_up_probes": ["What factors did you consider?", "How did you communicate the change?"],
          "red_flag_indicators": ["Inability to identify opportunities", "No clear examples of changes made"]
        }
      ]
    }
  },
  "CoreValues_CompanyFit": {
    "[EXACT_VALUE_1_NAME]": {
      "questions": [
        {
          "id": 1,
          "category": "[EXACT_VALUE_1_NAME]",
          "type": "behavioral",
          "question_text": "Question about [EXACT_VALUE_1_NAME] using its description context",
          "sample_indicators": {
            "strong_response": "What indicates excellent response aligned with [EXACT_VALUE_1_DESCRIPTION]",
            "weak_response": "What indicates poor response lacking [EXACT_VALUE_1_DESCRIPTION]"
          },
          "follow_up_probes": ["Probe about challenges in implementing [EXACT_VALUE_1_NAME]", "Probe about team buy-in for [EXACT_VALUE_1_NAME]"]
        },
        {
          "id": 2,
          "category": "[EXACT_VALUE_1_NAME]",
          "type": "behavioral",
          "question_text": "Second question about [EXACT_VALUE_1_NAME] focusing on practical application",
          "sample_indicators": {
            "strong_response": "Clear demonstration of [EXACT_VALUE_1_NAME] in action",
            "weak_response": "Generic responses without specific [EXACT_VALUE_1_NAME] examples"
          },
          "follow_up_probes": ["How did [EXACT_VALUE_1_NAME] impact outcomes?", "What did you learn from this experience?"]
        }
      ]
    },
    "[EXACT_VALUE_2_NAME]": {
      "questions": [
        {
          "id": 3,
          "category": "[EXACT_VALUE_2_NAME]",
          "type": "behavioral",
          "question_text": "Question about [EXACT_VALUE_2_NAME] using its description context",
          "sample_indicators": {
            "strong_response": "What indicates excellent response aligned with [EXACT_VALUE_2_DESCRIPTION]",
            "weak_response": "What indicates poor response lacking [EXACT_VALUE_2_DESCRIPTION]"
          },
          "follow_up_probes": ["Probe about challenges in implementing [EXACT_VALUE_2_NAME]", "Probe about team buy-in for [EXACT_VALUE_2_NAME]"]
        },
        {
          "id": 4,
          "category": "[EXACT_VALUE_2_NAME]",
          "type": "behavioral",
          "question_text": "Second question about [EXACT_VALUE_2_NAME] focusing on practical application",
          "sample_indicators": {
            "strong_response": "Clear demonstration of [EXACT_VALUE_2_NAME] in action",
            "weak_response": "Generic responses without specific [EXACT_VALUE_2_NAME] examples"
          },
          "follow_up_probes": ["How did [EXACT_VALUE_2_NAME] impact outcomes?", "What did you learn from this experience?"]
        }
      ]
    },
    "[CONTINUE FOR_ALL_CORE_VALUES]"
  }
}
```

## CRITICAL RULES - NO EXCEPTIONS

### COMPANY VALUES INTEGRATION
1. Extract EXACT value names from `company_profile.mission_and_culture.core_values`
2. Use value descriptions to inform question content and evaluation criteria
3. Replace ALL generic "Values" references with exact company value names
4. Create exactly 2 behavioral questions per core value
5. Use value descriptions in `sample_indicators.strong_response`

### TECHNOLOGY INTEGRATION
1. Reference specific technologies from `technologies` section in questions
2. Use `position_tools` for role-specific technical scenarios
3. Include `company_specific_context` from position tools
4. Reference `proficiency_required` levels in question difficulty
5. Use `job_specific_usage` in question scenarios

### COMPANY CONTEXT INTEGRATION
1. Use company name in question examples
2. Reference industry and market context
3. Incorporate mission statement themes
4. Adapt to company stage (startup vs enterprise)
5. Consider company size in question complexity

### OUTPUT REQUIREMENTS
1. Complete JSON structure with ALL required fields
2. No missing or empty fields
3. Consistent formatting throughout
4. Proper JSON nesting and structure
5. All behavioral questions must be open-ended
6. All questions must have 3 follow-up probes
7. All questions must have red_flag_indicators

### QUESTION QUALITY STANDARDS
1. Questions must be behavioral ("Describe a time when...", "Tell me about...")
2. Questions must be role-specific and company-specific
3. Questions must assess observable behaviors
4. Follow-up probes must be specific and relevant
5. Red flag indicators must be actionable

### ERROR HANDLING
If input data is missing:
1. Identify missing fields specifically
2. Continue with available data
3. Note limitations in output quality
4. Request missing information for improvement

If input data conflicts:
1. Identify specific conflicts
2. Acknowledge both aspects in questions
3. Ask for clarification on priorities

## SELF-CORRECTION EXAMPLES

### BEFORE (WRONG):
```json
{
  "Values_CompanyFit": { // ❌ Wrong category name
    "Teamwork": { ... } // ❌ Generic value name
  }
}
```

### AFTER (CORRECT):
```json
{
  "CoreValues_CompanyFit": { // ✅ Correct category name
    "Collaboration": { ... } // ✅ Exact company value name
  }
}
```

## RESPONSE VALIDATION CHECKLIST

Before outputting your response, verify:
- [ ] All required JSON fields are present
- [ ] Company core values are used exactly as provided
- [ ] Technology references are accurate
- [ ] Questions are behavioral and open-ended
- [ ] Each question has 3 follow-up probes
- [ ] Each question has red_flag_indicators
- [ ] Company name is referenced in questions
- [ ] JSON structure is valid and properly nested
- [ ] Evaluation criteria are specific and actionable
- [ ] Expected answers are clearly defined

This protocol ensures consistent, high-quality interview question generation that fully utilizes all provided company data and follows the KSA framework precisely.