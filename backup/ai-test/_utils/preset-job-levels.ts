export interface PresetJobLevel {
  name: string
  description: string
}

export interface PresetJobLevelCategory {
  name: string
  icon: string
  description: string
  levels: PresetJobLevel[]
}

export const presetJobLevelCategories: PresetJobLevelCategory[] = [
  {
    name: 'Traditional Corporate',
    icon: 'Building',
    description: 'Standard corporate hierarchy with clear progression paths',
    levels: [
      { name: 'Entry Level', description: 'Fresh graduates and career starters with 0-2 years of experience' },
      { name: 'Junior', description: 'Early career professionals with 2-4 years of experience' },
      { name: 'Mid-Level', description: 'Experienced professionals with 4-7 years of experience' },
      { name: 'Senior', description: 'Seasoned professionals with 7+ years of experience' },
      { name: 'Lead', description: 'Team leaders and technical leads with mentoring responsibilities' },
      { name: 'Manager', description: 'People managers responsible for team performance and growth' },
      { name: 'Senior Manager', description: 'Experienced managers overseeing multiple teams or projects' },
      { name: 'Director', description: 'Strategic leaders responsible for department-level decisions' },
      { name: 'Senior Director', description: 'Senior strategic leaders with cross-functional responsibilities' },
      { name: 'Vice President', description: 'Executive leaders driving organizational strategy' },
      { name: 'Senior Vice President', description: 'Top-tier executives with company-wide impact' },
      { name: 'Executive', description: 'C-suite and top executive positions' }
    ]
  },
  {
    name: 'Tech Startup',
    icon: 'Rocket',
    description: 'Flat structure common in tech startups and modern companies',
    levels: [
      { name: 'Intern', description: 'Students and learners gaining practical experience' },
      { name: 'Junior Engineer', description: 'Entry-level engineers building foundational skills' },
      { name: 'Engineer', description: 'Core contributors delivering features and improvements' },
      { name: 'Senior Engineer', description: 'Technical experts driving complex projects' },
      { name: 'Staff Engineer', description: 'Technical leaders influencing architecture and standards' },
      { name: 'Principal Engineer', description: 'Top individual contributors shaping technical direction' },
      { name: 'Engineering Manager', description: 'Leaders balancing technical and people management' },
      { name: 'Director of Engineering', description: 'Strategic leaders overseeing engineering organizations' },
      { name: 'VP of Engineering', description: 'Executive leaders driving engineering strategy' },
      { name: 'CTO', description: 'Chief Technology Officer leading all technical initiatives' }
    ]
  },
  {
    name: 'Consulting',
    icon: 'Briefcase',
    description: 'Typical hierarchy in consulting and professional services firms',
    levels: [
      { name: 'Analyst', description: 'Entry-level consultants performing research and analysis' },
      { name: 'Senior Analyst', description: 'Experienced analysts leading workstreams' },
      { name: 'Associate', description: 'Post-MBA or experienced consultants managing projects' },
      { name: 'Senior Associate', description: 'Senior consultants with client-facing responsibilities' },
      { name: 'Engagement Manager', description: 'Project leaders managing client engagements' },
      { name: 'Principal', description: 'Senior leaders developing client relationships' },
      { name: 'Partner', description: 'Firm leaders driving business development and strategy' },
      { name: 'Senior Partner', description: 'Top firm leaders with significant equity and influence' }
    ]
  },
  {
    name: 'Simple Structure',
    icon: 'Users',
    description: 'Simplified structure for small teams and organizations',
    levels: [
      { name: 'Junior', description: 'Early career professionals learning and growing' },
      { name: 'Mid-Level', description: 'Experienced professionals contributing independently' },
      { name: 'Senior', description: 'Expert professionals mentoring others' },
      { name: 'Lead', description: 'Team leaders driving initiatives' },
      { name: 'Manager', description: 'People managers building teams' }
    ]
  },
  {
    name: 'Academic',
    icon: 'GraduationCap',
    description: 'Common hierarchy in academic and research institutions',
    levels: [
      { name: 'Research Assistant', description: 'Supporting research projects and studies' },
      { name: 'Graduate Student', description: 'Pursuing advanced degrees while contributing to research' },
      { name: 'Postdoctoral Researcher', description: 'Recent PhD graduates conducting independent research' },
      { name: 'Research Scientist', description: 'Professional researchers leading projects' },
      { name: 'Senior Research Scientist', description: 'Experienced researchers with significant contributions' },
      { name: 'Assistant Professor', description: 'Junior faculty members building research programs' },
      { name: 'Associate Professor', description: 'Tenured faculty with established research' },
      { name: 'Professor', description: 'Senior faculty leaders in their field' },
      { name: 'Distinguished Professor', description: 'Top academic leaders with exceptional achievements' }
    ]
  },
  {
    name: 'Healthcare',
    icon: 'Heart',
    description: 'Typical levels in healthcare organizations',
    levels: [
      { name: 'Trainee', description: 'Students and residents in training programs' },
      { name: 'Junior Practitioner', description: 'Recently licensed healthcare professionals' },
      { name: 'Practitioner', description: 'Fully licensed professionals providing care' },
      { name: 'Senior Practitioner', description: 'Experienced professionals with specialized skills' },
      { name: 'Lead Practitioner', description: 'Clinical leaders mentoring others' },
      { name: 'Supervisor', description: 'Managing clinical teams and operations' },
      { name: 'Manager', description: 'Department managers overseeing services' },
      { name: 'Director', description: 'Service line directors driving strategy' },
      { name: 'Chief', description: 'C-suite healthcare executives' }
    ]
  },
  {
    name: 'Sales',
    icon: 'TrendingUp',
    description: 'Common hierarchy in sales organizations',
    levels: [
      { name: 'Sales Development Rep', description: 'Entry-level reps generating leads' },
      { name: 'Account Executive', description: 'Closing deals and managing accounts' },
      { name: 'Senior Account Executive', description: 'Handling complex deals and key accounts' },
      { name: 'Sales Team Lead', description: 'Leading small sales teams' },
      { name: 'Sales Manager', description: 'Managing sales teams and territories' },
      { name: 'Senior Sales Manager', description: 'Overseeing multiple teams or regions' },
      { name: 'Sales Director', description: 'Strategic sales leadership' },
      { name: 'VP of Sales', description: 'Executive sales leadership' }
    ]
  }
]

export const getAllPresetJobLevels = (): PresetJobLevel[] => {
  return presetJobLevelCategories.flatMap(category => category.levels)
}

export const getUniquePresetJobLevels = (): PresetJobLevel[] => {
  const allLevels = getAllPresetJobLevels()
  const uniqueMap = new Map<string, PresetJobLevel>()

  allLevels.forEach(level => {
    const key = level.name.toLowerCase()
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, level)
    }
  })

  return Array.from(uniqueMap.values())
}

/**
 * Platform-wide hardcoded job levels
 * Based on Traditional Corporate hierarchy
 * These are the ONLY job levels available across the platform
 */
export const PLATFORM_JOB_LEVELS = [
  { name: 'Entry Level', description: 'Fresh graduates and career starters with 0-2 years of experience' },
  { name: 'Junior', description: 'Early career professionals with 2-4 years of experience' },
  { name: 'Mid-Level', description: 'Experienced professionals with 4-7 years of experience' },
  { name: 'Senior', description: 'Seasoned professionals with 7+ years of experience' },
  { name: 'Lead', description: 'Team leaders and technical leads with mentoring responsibilities' },
  { name: 'Manager', description: 'People managers responsible for team performance and growth' },
  { name: 'Senior Manager', description: 'Experienced managers overseeing multiple teams or projects' },
  { name: 'Director', description: 'Strategic leaders responsible for department-level decisions' },
  { name: 'Senior Director', description: 'Senior strategic leaders with cross-functional responsibilities' },
  { name: 'Vice President', description: 'Executive leaders driving organizational strategy' },
  { name: 'Senior Vice President', description: 'Top-tier executives with company-wide impact' },
  { name: 'Executive', description: 'C-suite and top executive positions' }
] as const

export type PlatformJobLevelName = typeof PLATFORM_JOB_LEVELS[number]['name']