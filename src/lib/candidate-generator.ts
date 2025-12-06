/**
 * Candidate Generation Engine
 *
 * Comprehensive candidate generation using Faker.js and personality modeling.
 * Creates realistic candidates with diverse personalities, skills, and backgrounds.
 */

import { faker } from '@faker-js/faker'
import { nanoid } from 'nanoid'
import {
  Candidate,
  PersonalityTraits,
  WorkBehaviorPatterns,
  CognitiveProfile,
  TechnicalSkills,
  ProfessionalExperience,
  InterviewPerformance,
  CandidateGenerationParams
} from '@/types/candidate'

/**
 * Personality archetype configurations
 * Predefined personality patterns that create distinctive candidate profiles
 */
const personalityArchetypes = {
  balanced: {
    name: 'Balanced Professional',
    traits: {
      openness: 60,
      conscientiousness: 70,
      extraversion: 50,
      agreeableness: 65,
      neuroticism: 40
    },
    description: 'Well-rounded professional with balanced traits'
  },
  innovator: {
    name: 'Innovation Leader',
    traits: {
      openness: 90,
      conscientiousness: 60,
      extraversion: 75,
      agreeableness: 55,
      neuroticism: 35
    },
    description: 'Creative thinker who thrives on new challenges and ideas'
  },
  specialist: {
    name: 'Technical Expert',
    traits: {
      openness: 50,
      conscientiousness: 85,
      extraversion: 35,
      agreeableness: 60,
      neuroticism: 45
    },
    description: 'Deep technical expertise with strong attention to detail'
  },
  leader: {
    name: 'Natural Leader',
    traits: {
      openness: 75,
      conscientiousness: 80,
      extraversion: 85,
      agreeableness: 70,
      neuroticism: 30
    },
    description: 'Charismatic leader who inspires and motivates others'
  },
  collaborator: {
    name: 'Team Collaborator',
    traits: {
      openness: 65,
      conscientiousness: 70,
      extraversion: 70,
      agreeableness: 85,
      neuroticism: 40
    },
    description: 'Excellent team player who builds strong relationships'
  }
}

/**
 * Technology stack configurations for realistic skill profiles
 */
const technologyStacks = {
  fullstack: {
    programming: [
      { lang: 'JavaScript', minExp: 2, maxExp: 8 },
      { lang: 'TypeScript', minExp: 1, maxExp: 6 },
      { lang: 'Python', minExp: 1, maxExp: 5 }
    ],
    frameworks: [
      { name: 'React', minExp: 2, maxExp: 7 },
      { name: 'Node.js', minExp: 2, maxExp: 6 },
      { name: 'Next.js', minExp: 1, maxExp: 4 }
    ]
  },
  backend: {
    programming: [
      { lang: 'Java', minExp: 3, maxExp: 10 },
      { lang: 'Python', minExp: 2, maxExp: 8 },
      { lang: 'Go', minExp: 1, maxExp: 5 }
    ],
    frameworks: [
      { name: 'Spring Boot', minExp: 2, maxExp: 8 },
      { name: 'Django', minExp: 1, maxExp: 6 },
      { name: 'Docker', minExp: 2, maxExp: 6 }
    ]
  },
  frontend: {
    programming: [
      { lang: 'JavaScript', minExp: 3, maxExp: 10 },
      { lang: 'TypeScript', minExp: 2, maxExp: 8 }
    ],
    frameworks: [
      { name: 'React', minExp: 3, maxExp: 10 },
      { name: 'Vue.js', minExp: 1, maxExp: 5 },
      { name: 'Angular', minExp: 1, maxExp: 6 }
    ]
  },
  devops: {
    programming: [
      { lang: 'Python', minExp: 2, maxExp: 7 },
      { lang: 'Bash', minExp: 3, maxExp: 10 },
      { lang: 'Go', minExp: 1, maxExp: 4 }
    ],
    frameworks: [
      { name: 'Kubernetes', minExp: 1, maxExp: 6 },
      { name: 'Terraform', minExp: 1, maxExp: 5 },
      { name: 'Jenkins', minExp: 2, maxExp: 8 }
    ]
  }
}

/**
 * Company name pool for realistic work history
 */
const companyNames = [
  'TechCorp Solutions', 'InnovateLabs', 'DigitalForge', 'CloudNine Systems',
  'DataDriven Inc', 'NextGen Technologies', 'AlphaSoftware', 'BetaDynamics',
  'GammaInnovations', 'DeltaSystems', 'EpsilonTech', 'ZetaDigital',
  'EtaSolutions', 'ThetaPlatforms', 'IotaTechnologies', 'KappaSystems'
]

/**
 * Generate realistic personality traits with variation
 */
function generatePersonalityTraits(archetype?: string): PersonalityTraits {
  const baseTraits = personalityArchetypes[archetype as keyof typeof personalityArchetypes] || personalityArchetypes.balanced

  return {
    openness: clampWithVariation(baseTraits.traits.openness, 15),
    conscientiousness: clampWithVariation(baseTraits.traits.conscientiousness, 10),
    extraversion: clampWithVariation(baseTraits.traits.extraversion, 20),
    agreeableness: clampWithVariation(baseTraits.traits.agreeableness, 15),
    neuroticism: clampWithVariation(baseTraits.traits.neuroticism, 15)
  }
}

/**
 * Generate work behavior patterns based on personality
 */
function generateWorkBehaviorPatterns(personality: PersonalityTraits): WorkBehaviorPatterns {
  const communicationStyles: WorkBehaviorPatterns['communicationStyle'][] = [
    'direct', 'collaborative', 'diplomatic', 'analytical'
  ]

  const conflictStyles: WorkBehaviorPatterns['conflictResolutionStyle'][] = [
    'collaborative', 'competing', 'accommodating', 'avoiding'
  ]

  const teamTypes: WorkBehaviorPatterns['teamPlayerType'][] = [
    'leader', 'collaborator', 'specialist', 'contributor'
  ]

  const workStyles: WorkBehaviorPatterns['workStyle'][] = [
    'methodical', 'rapid', 'iterative', 'comprehensive'
  ]

  const decisionStyles: WorkBehaviorPatterns['decisionMakingStyle'][] = [
    'analytical', 'intuitive', 'collaborative', 'decisive'
  ]

  // Personality-driven behavior selection
  const communicationStyle = personality.extraversion > 70
    ? faker.helpers.arrayElement(['direct', 'collaborative'])
    : personality.agreeableness > 70
    ? faker.helpers.arrayElement(['diplomatic', 'collaborative'])
    : faker.helpers.arrayElement(['analytical', 'direct'])

  const teamPlayerType = personality.extraversion > 80 ? 'leader' :
                         personality.agreeableness > 75 ? 'collaborator' :
                         personality.conscientiousness > 80 ? 'specialist' : 'contributor'

  return {
    communicationStyle,
    conflictResolutionStyle: faker.helpers.arrayElement(conflictStyles),
    teamPlayerType,
    workStyle: faker.helpers.arrayElement(workStyles),
    decisionMakingStyle: personality.conscientiousness > 70
      ? faker.helpers.arrayElement(['analytical', 'comprehensive'])
      : faker.helpers.arrayElement(decisionStyles)
  }
}

/**
 * Generate cognitive profile with realistic variations
 */
function generateCognitiveProfile(): CognitiveProfile {
  // Ensure some variation but keep overall balance
  const baseScore = faker.number.int({ min: 4, max: 8 })

  return {
    logicalReasoning: clampWithVariation(baseScore, 2),
    creativeThinking: clampWithVariation(baseScore, 3),
    socialIntelligence: clampWithVariation(baseScore, 2),
    abstractReasoning: clampWithVariation(baseScore, 3),
    verbalCommunication: clampWithVariation(baseScore, 2),
    quantitativeAbility: clampWithVariation(baseScore, 3)
  }
}

/**
 * Generate technical skills based on experience level and focus
 */
function generateTechnicalSkills(
  experienceLevel: string,
  technicalFocus?: string[]
): TechnicalSkills {
  let selectedStack: typeof technologyStacks.fullstack

  // Determine technology stack based on focus or random selection
  if (technicalFocus?.includes('frontend')) {
    selectedStack = technologyStacks.frontend
  } else if (technicalFocus?.includes('backend')) {
    selectedStack = technologyStacks.backend
  } else if (technicalFocus?.includes('devops')) {
    selectedStack = technologyStacks.devops
  } else {
    const stacks = Object.values(technologyStacks)
    selectedStack = faker.helpers.arrayElement(stacks)
  }

  // Scale experience based on experience level
  const expMultiplier = {
    entry: 0.3,
    junior: 0.5,
    mid: 1,
    senior: 1.5,
    lead: 2,
    principal: 2.5
  }[experienceLevel] || 1

  // Generate programming languages
  const programmingLanguages = selectedStack.programming.map(tech => {
    const years = faker.number.int({
      min: Math.max(1, Math.floor(tech.minExp * expMultiplier)),
      max: Math.floor(tech.maxExp * expMultiplier)
    })

    const proficiency = getProficiencyFromYears(years)

    return {
      language: tech.lang,
      proficiency,
      yearsExperience: years
    }
  })

  // Generate frameworks
  const frameworksAndTools = selectedStack.frameworks.map(tech => {
    const years = faker.number.int({
      min: Math.max(1, Math.floor(tech.minExp * expMultiplier * 0.8)),
      max: Math.floor(tech.maxExp * expMultiplier * 0.9)
    })

    const proficiency = getProficiencyFromYears(years)

    return {
      name: tech.name,
      proficiency,
      yearsExperience: years
    }
  })

  // Generate system design scores
  const baseSystemScore = {
    entry: 2,
    junior: 3,
    mid: 5,
    senior: 7,
    lead: 8,
    principal: 9
  }[experienceLevel] || 5

  return {
    programmingLanguages,
    frameworksAndTools,
    systemDesign: {
      microservices: clampWithVariation(baseSystemScore, 2),
      monolithic: clampWithVariation(baseSystemScore + 1, 2),
      cloudNative: clampWithVariation(baseSystemScore - 1, 2),
      database: clampWithVariation(baseSystemScore, 2),
      security: clampWithVariation(baseSystemScore - 1, 3)
    },
    methodologies: {
      agile: clampWithVariation(7, 2),
      waterfall: clampWithVariation(4, 2),
      devops: clampWithVariation(baseSystemScore - 1, 2),
      testing: clampWithVariation(6, 2),
      documentation: clampWithVariation(5, 3)
    }
  }
}

/**
 * Generate professional experience history
 */
function generateProfessionalExperience(
  experienceLevel: string,
  technicalSkills: TechnicalSkills
): ProfessionalExperience {
  const targetRoles = {
    entry: ['Junior Developer', 'Software Engineer I', 'Associate Developer'],
    junior: ['Software Engineer', 'Frontend Developer', 'Backend Developer'],
    mid: ['Senior Software Engineer', 'Full Stack Developer', 'Software Engineer II'],
    senior: ['Senior Software Engineer', 'Lead Developer', 'Principal Software Engineer'],
    lead: ['Engineering Lead', 'Tech Lead', 'Senior Engineering Lead'],
    principal: ['Principal Engineer', 'Staff Engineer', 'Architect']
  }

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'E-commerce', 'SaaS',
    'Consulting', 'Manufacturing', 'Media', 'Education', 'Retail'
  ]

  const currentTitle = faker.helpers.arrayElement(targetRoles[experienceLevel as keyof typeof targetRoles] || targetRoles.mid)
  const currentCompany = faker.helpers.arrayElement(companyNames)
  const currentIndustry = faker.helpers.arrayElement(industries)

  // Calculate years of experience based on level
  const yearsOfExperience = {
    entry: faker.number.int({ min: 0, max: 2 }),
    junior: faker.number.int({ min: 2, max: 4 }),
    mid: faker.number.int({ min: 4, max: 8 }),
    senior: faker.number.int({ min: 8, max: 15 }),
    lead: faker.number.int({ min: 12, max: 20 }),
    principal: faker.number.int({ min: 15, max: 25 })
  }[experienceLevel] || 5

  const startDate = faker.date.past({ years: yearsOfExperience })
  const isCurrentRole = faker.datatype.boolean({ probability: 0.7 })

  // Generate current position
  const currentPosition = {
    title: currentTitle,
    company: currentCompany,
    industry: currentIndustry,
    location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
    startDate: startDate.toISOString().split('T')[0],
    endDate: isCurrentRole ? undefined : faker.date.recent({ years: 1 }).toISOString().split('T')[0],
    isCurrentRole,
    description: faker.lorem.paragraphs(2),
    keyAchievements: faker.helpers.multiple(() => faker.lorem.sentence(), { count: { min: 2, max: 4 } }),
    teamSize: faker.datatype.boolean() ? faker.number.int({ min: 2, max: 15 }) : undefined,
    directReports: experienceLevel === 'lead' || experienceLevel === 'principal'
      ? faker.number.int({ min: 1, max: 8 })
      : undefined
  }

  // Generate previous positions
  const numPreviousPositions = Math.min(
    faker.number.int({ min: 0, max: Math.floor(yearsOfExperience / 2) }),
    3
  )

  const previousPositions = Array.from({ length: numPreviousPositions }, (_, index) => {
    const roleStart = faker.date.past({ years: yearsOfExperience - index * 2 })
    const roleEnd = faker.date.between({
      from: roleStart,
      to: startDate
    })

    return {
      title: faker.helpers.arrayElement(targetRoles[Math.max(0,
        (experienceLevel === 'entry' ? 0 : experienceLevel === 'junior' ? 0 : 1) - index - 1) as keyof typeof targetRoles] || targetRoles.junior),
      company: faker.helpers.arrayElement(companyNames.filter(c => c !== currentCompany)),
      industry: faker.helpers.arrayElement(industries),
      location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
      startDate: roleStart.toISOString().split('T')[0],
      endDate: roleEnd.toISOString().split('T')[0],
      description: faker.lorem.paragraph(),
      keyAchievements: faker.helpers.multiple(() => faker.lorem.sentence(), { count: { min: 1, max: 3 } }),
      teamSize: faker.datatype.boolean() ? faker.number.int({ min: 1, max: 10 }) : undefined,
      technologiesUsed: faker.helpers.arrayElements(
        [...technicalSkills.programmingLanguages.map(p => p.language),
         ...technicalSkills.frameworksAndTools.map(f => f.name)],
        { min: 2, max: 5 }
      )
    }
  })

  // Generate education
  const education = [{
    degree: faker.helpers.arrayElement(['Bachelor of Science', 'Bachelor of Arts', 'Master of Science', 'Master of Engineering']),
    field: faker.helpers.arrayElement(['Computer Science', 'Software Engineering', 'Information Technology', 'Computer Engineering']),
    institution: faker.helpers.arrayElement(['State University', 'Tech Institute', 'College of Engineering', 'University of Technology']),
    location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
    graduationYear: faker.number.int({ min: 2005, max: 2022 }),
    gpa: faker.datatype.boolean() ? Number(faker.number.float({ min: 3.0, max: 4.0, precision: 0.1 }).toFixed(1)) : undefined,
    honors: faker.datatype.boolean({ probability: 0.3 })
      ? faker.helpers.multiple(() => faker.lorem.words(2), { count: { min: 1, max: 2 } })
      : undefined
  }]

  // Generate certifications
  const certifications = faker.datatype.boolean({ probability: 0.6 })
    ? faker.helpers.multiple(() => ({
        name: faker.helpers.arrayElement([
          'AWS Certified Developer', 'Google Cloud Professional',
          'Microsoft Certified: Azure Developer', 'Certified Kubernetes Administrator',
          'Professional Scrum Master', 'Certified Java Developer'
        ]),
        issuer: faker.helpers.arrayElement(['Amazon Web Services', 'Google', 'Microsoft', 'Scrum.org', 'Oracle']),
        issueDate: faker.date.past({ years: 3 }).toISOString().split('T')[0],
        expiryDate: faker.datatype.boolean() ? faker.date.future({ years: 2 }).toISOString().split('T')[0] : undefined,
        credentialId: faker.datatype.boolean() ? faker.string.alphanumeric({ length: 10 }) : undefined
      }), { count: { min: 1, max: 3 } })
    : []

  return {
    currentPosition,
    previousPositions,
    education,
    certificationsAndTraining: certifications
  }
}

/**
 * Generate interview performance predictions
 */
function generateInterviewPerformance(
  personality: PersonalityTraits,
  cognitiveProfile: CognitiveProfile,
  technicalSkills: TechnicalSkills
): InterviewPerformance {
  // Calculate behavioral scores based on personality and cognitive profile
  const behavioralBase = (personality.extraversion + personality.agreeableness +
                         cognitiveProfile.socialIntelligence * 10) / 3

  const simulatedInterviewScores = {
    behavioral: {
      overall: Math.round(behavioralBase / 10),
      communication: Math.round((personality.extraversion + cognitiveProfile.verbalCommunication * 10) / 20),
      problemSolving: Math.round((cognitiveProfile.logicalReasoning + cognitiveProfile.creativeThinking) / 2),
      leadership: Math.round((personality.extraversion + cognitiveProfile.socialIntelligence * 10) / 20),
      teamwork: Math.round(personality.agreeableness / 10)
    },
    technical: {
      coding: calculateTechnicalScore(technicalSkills.programmingLanguages),
      systemDesign: Math.round(Object.values(technicalSkills.systemDesign).reduce((a, b) => a + b, 0) / 5),
      troubleshooting: Math.round((cognitiveProfile.logicalReasoning + cognitiveProfile.abstractReasoning) / 2),
      bestPractices: Math.round(technicalSkills.methodologies.testing + technicalSkills.methodologies.documentation / 2)
    },
    cultural: {
      companyFit: Math.round((personality.agreeableness + personality.openness) / 20),
      valuesAlignment: Math.round(personality.agreeableness / 10),
      collaboration: Math.round((personality.agreeableness + personality.extraversion) / 20),
      innovation: Math.round(personality.openness / 10)
    }
  }

  // Generate response patterns
  const responsePatterns = {
    answerStructure: personality.conscientiousness > 70 ? 'comprehensive' :
                      personality.extraversion > 60 ? 'detailed' :
                      personality.conscientiousness < 40 ? 'concise' : 'storytelling',
    storytellingStyle: faker.helpers.arrayElement(['STAR', 'CAR', 'PAR', 'narrative']),
    enthusiasmLevel: Math.round((personality.extraversion + personality.openness) / 20),
    selfAwarenessLevel: Math.round((100 - personality.neuroticism + personality.conscientiousness) / 20)
  }

  // Generate potential red flags and strengths
  const potentialRedFlags = []
  const keyStrengths = []

  if (personality.neuroticism > 70) {
    potentialRedFlags.push('May experience stress in high-pressure situations')
  }
  if (personality.agreeableness < 30) {
    potentialRedFlags.push('May struggle with team collaboration')
  }
  if (cognitiveProfile.quantitativeAbility < 4) {
    potentialRedFlags.push('Limited quantitative reasoning skills')
  }

  if (personality.openness > 80) {
    keyStrengths.push('Highly innovative and adaptable to new technologies')
  }
  if (personality.conscientiousness > 80) {
    keyStrengths.push('Exceptional attention to detail and reliability')
  }
  if (cognitiveProfile.socialIntelligence > 8) {
    keyStrengths.push('Strong interpersonal and communication skills')
  }

  return {
    simulatedInterviewScores,
    responsePatterns,
    potentialRedFlags,
    keyStrengths
  }
}

/**
 * Main candidate generation function
 */
export function generateCandidate(params: CandidateGenerationParams): Candidate {
  const {
    targetRole,
    experienceLevel = 'mid',
    personalityArchetype = 'balanced',
    technicalFocus,
    industryBackground,
    locationPreference,
    customRequirements = [],
    count = 1
  } = params

  // Generate basic personality
  const personality = generatePersonalityTraits(personalityArchetype)

  // Generate derived characteristics
  const workBehavior = generateWorkBehaviorPatterns(personality)
  const cognitiveProfile = generateCognitiveProfile()
  const technicalSkills = generateTechnicalSkills(experienceLevel, technicalFocus)
  const experience = generateProfessionalExperience(experienceLevel, technicalSkills)
  const interviewPerformance = generateInterviewPerformance(personality, cognitiveProfile, technicalSkills)

  // Generate personal info
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const location = locationPreference
    ? parseLocation(locationPreference)
    : generateRandomLocation()

  const candidate: Candidate = {
    id: nanoid(),
    personalInfo: {
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }),
      phone: faker.phone.number(),
      location,
      portfolioUrl: faker.datatype.boolean({ probability: 0.4 }) ? faker.internet.url() : undefined,
      linkedinUrl: faker.datatype.boolean({ probability: 0.7 }) ? `https://linkedin.com/in/${faker.internet.userName(firstName, lastName)}` : undefined,
      githubUrl: faker.datatype.boolean({ probability: 0.6 }) ? `https://github.com/${faker.internet.userName(firstName, lastName)}` : undefined
    },
    personality,
    workBehavior,
    cognitiveProfile,
    technicalSkills,
    experience,
    interviewPerformance,
    metadata: {
      dateCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      source: 'ai-generated',
      generationPrompt: JSON.stringify(params, null, 2),
      tags: [
        experienceLevel,
        personalityArchetype,
        ...(technicalFocus || []),
        ...(customRequirements || [])
      ]
    }
  }

  return candidate
}

/**
 * Generate multiple candidates with the same parameters
 */
export function generateMultipleCandidates(params: CandidateGenerationParams): Candidate[] {
  const { count = 1 } = params
  return Array.from({ length: count }, (_, index) =>
    generateCandidate({
      ...params,
      // Add slight variations for multiple generations
      customRequirements: [
        ...(params.customRequirements || []),
        `variation-${index + 1}`
      ]
    })
  )
}

// Helper functions

function clampWithVariation(base: number, variation: number): number {
  return Math.max(1, Math.min(10, faker.number.int({
    min: Math.max(1, base - variation),
    max: Math.min(10, base + variation)
  })))
}

function getProficiencyFromYears(years: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  if (years < 1) return 'beginner'
  if (years < 3) return 'intermediate'
  if (years < 7) return 'advanced'
  return 'expert'
}

function calculateTechnicalScore(languages: Array<{ proficiency: string }>): number {
  const proficiencyScores = {
    beginner: 3,
    intermediate: 5,
    advanced: 8,
    expert: 10
  }

  const avgScore = languages.reduce((sum, lang) =>
    sum + proficiencyScores[lang.proficiency], 0) / languages.length

  return Math.round(avgScore)
}

function parseLocation(locationString: string) {
  const [city, state] = locationString.includes(',')
    ? locationString.split(',').map(s => s.trim())
    : [locationString, faker.location.state({ abbreviated: true })]

  return {
    city,
    state: state || faker.location.state({ abbreviated: true }),
    country: 'USA',
    timezone: faker.location.timeZone()
  }
}

function generateRandomLocation() {
  return {
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    country: 'USA',
    timezone: faker.location.timeZone()
  }
}