import { Platform } from 'react-native';

// Skill categories for weighted matching
export const SKILL_CATEGORIES = {
  CORE_LANGUAGES: 'core_languages',
  FRAMEWORKS: 'frameworks',
  DATABASES: 'databases',
  CLOUD: 'cloud',
  TOOLS: 'tools',
} as const;

type SkillCategory = typeof SKILL_CATEGORIES[keyof typeof SKILL_CATEGORIES];

interface SkillDefinition {
  name: string;
  category: SkillCategory;
  aliases?: string[];
  weight: number;
}

// Enhanced skill definitions with categories and weights
const SKILL_DEFINITIONS: SkillDefinition[] = [
  // Core Languages (highest weight)
  {
    name: "javascript",
    category: SKILL_CATEGORIES.CORE_LANGUAGES,
    aliases: ["js", "ecmascript"],
    weight: 1.5
  },
  {
    name: "typescript",
    category: SKILL_CATEGORIES.CORE_LANGUAGES,
    weight: 1.5
  },
  {
    name: "python",
    category: SKILL_CATEGORIES.CORE_LANGUAGES,
    weight: 1.5
  },
  {
    name: "java",
    category: SKILL_CATEGORIES.CORE_LANGUAGES,
    weight: 1.5
  },
  {
    name: "kotlin",
    category: SKILL_CATEGORIES.CORE_LANGUAGES,
    weight: 1.5
  },
  {
    name: "swift",
    category: SKILL_CATEGORIES.CORE_LANGUAGES,
    weight: 1.5
  },

  // Frameworks
  {
    name: "react",
    category: SKILL_CATEGORIES.FRAMEWORKS,
    weight: 1.3
  },
  {
    name: "react native",
    category: SKILL_CATEGORIES.FRAMEWORKS,
    weight: 1.3
  },
  {
    name: "vue",
    category: SKILL_CATEGORIES.FRAMEWORKS,
    weight: 1.3
  },
  {
    name: "angular",
    category: SKILL_CATEGORIES.FRAMEWORKS,
    weight: 1.3
  },
  {
    name: "node.js",
    category: SKILL_CATEGORIES.FRAMEWORKS,
    aliases: ["nodejs", "node"],
    weight: 1.3
  },
  {
    name: "express",
    category: SKILL_CATEGORIES.FRAMEWORKS,
    weight: 1.2
  },
  {
    name: "next.js",
    category: SKILL_CATEGORIES.FRAMEWORKS,
    aliases: ["nextjs"],
    weight: 1.2
  },

  // Databases
  {
    name: "sql",
    category: SKILL_CATEGORIES.DATABASES,
    weight: 1.2
  },
  {
    name: "postgresql",
    category: SKILL_CATEGORIES.DATABASES,
    aliases: ["postgres"],
    weight: 1.2
  },
  {
    name: "mongodb",
    category: SKILL_CATEGORIES.DATABASES,
    weight: 1.2
  },
  {
    name: "mysql",
    category: SKILL_CATEGORIES.DATABASES,
    weight: 1.2
  },
  {
    name: "redis",
    category: SKILL_CATEGORIES.DATABASES,
    weight: 1.2
  },

  // Cloud & DevOps
  {
    name: "aws",
    category: SKILL_CATEGORIES.CLOUD,
    weight: 1.4
  },
  {
    name: "azure",
    category: SKILL_CATEGORIES.CLOUD,
    weight: 1.4
  },
  {
    name: "gcp",
    category: SKILL_CATEGORIES.CLOUD,
    aliases: ["google cloud"],
    weight: 1.4
  },
  {
    name: "docker",
    category: SKILL_CATEGORIES.CLOUD,
    weight: 1.3
  },
  {
    name: "kubernetes",
    category: SKILL_CATEGORIES.CLOUD,
    aliases: ["k8s"],
    weight: 1.3
  },

  // Tools & Others
  {
    name: "git",
    category: SKILL_CATEGORIES.TOOLS,
    weight: 1.0
  },
  {
    name: "github",
    category: SKILL_CATEGORIES.TOOLS,
    weight: 1.0
  },
  {
    name: "gitlab",
    category: SKILL_CATEGORIES.TOOLS,
    weight: 1.0
  },
  {
    name: "jira",
    category: SKILL_CATEGORIES.TOOLS,
    weight: 1.0
  },
  {
    name: "rest api",
    category: SKILL_CATEGORIES.TOOLS,
    aliases: ["restful", "rest"],
    weight: 1.2
  },
  {
    name: "graphql",
    category: SKILL_CATEGORIES.TOOLS,
    weight: 1.2
  }
];

// Derived type for skill names
export type KnownSkill = typeof SKILL_DEFINITIONS[number]['name'];

export interface SkillMatch {
  matched: KnownSkill[];
  missing: KnownSkill[];
  score: number;
  matchedByCategory: Record<SkillCategory, KnownSkill[]>;
}

/**
 * Enhanced skill extraction with alias support and better pattern matching
 */
export function extractSkills(text: string): KnownSkill[] {
  const normalizedText = text.toLowerCase();
  const foundSkills = new Set<KnownSkill>();

  SKILL_DEFINITIONS.forEach(skillDef => {
    // Check main skill name
    const mainPattern = new RegExp(
      `\\b${skillDef.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i'
    );
    
    if (mainPattern.test(normalizedText)) {
      foundSkills.add(skillDef.name);
      return;
    }

    // Check aliases
    if (skillDef.aliases) {
      for (const alias of skillDef.aliases) {
        const aliasPattern = new RegExp(
          `\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
          'i'
        );
        if (aliasPattern.test(normalizedText)) {
          foundSkills.add(skillDef.name);
          break;
        }
      }
    }
  });

  return Array.from(foundSkills);
}

/**
 * Enhanced skill matching with weighted scoring and category analysis
 */
export function calculateSkillMatch(
  candidateSkills: KnownSkill[],
  requiredSkills: KnownSkill[]
): SkillMatch {
  const matched: KnownSkill[] = [];
  const missing: KnownSkill[] = [];
  const matchedByCategory: Record<SkillCategory, KnownSkill[]> = Object.values(SKILL_CATEGORIES).reduce(
    (acc, category) => ({ ...acc, [category]: [] }),
    {} as Record<SkillCategory, KnownSkill[]>
  );

  let weightedMatchScore = 0;
  let totalWeight = 0;

  requiredSkills.forEach(skill => {
    const skillDef = SKILL_DEFINITIONS.find(def => def.name === skill);
    if (!skillDef) return;

    totalWeight += skillDef.weight;

    if (candidateSkills.includes(skill)) {
      matched.push(skill);
      matchedByCategory[skillDef.category].push(skill);
      weightedMatchScore += skillDef.weight;
    } else {
      missing.push(skill);
    }
  });

  const score = Math.round((weightedMatchScore / (totalWeight || 1)) * 100);

  return {
    matched,
    missing,
    score,
    matchedByCategory,
  };
}

// Mock API for skill suggestions with category-based recommendations
export async function suggestSkillImprovements(
  currentSkills: KnownSkill[],
  targetRole: string
): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const suggestions: string[] = [];
  const roleSkills = getRoleRecommendedSkills(targetRole);
  
  Object.entries(SKILL_CATEGORIES).forEach(([category, categoryValue]) => {
    const categorySkills = roleSkills.filter(skill => 
      SKILL_DEFINITIONS.find(def => def.name === skill)?.category === categoryValue
    );
    
    const missingCategorySkills = categorySkills.filter(
      skill => !currentSkills.includes(skill)
    );

    if (missingCategorySkills.length > 0) {
      suggestions.push(
        `Consider adding ${category.toLowerCase()} skills: ${missingCategorySkills.join(', ')}`
      );
    }
  });

  return suggestions;
}

// Helper function to get recommended skills by role
function getRoleRecommendedSkills(role: string): KnownSkill[] {
  const normalizedRole = role.toLowerCase();
  
  // Role-based skill recommendations
  const roleSkillMap: Record<string, KnownSkill[]> = {
    'frontend': ['react', 'typescript', 'javascript'],
    'backend': ['node.js', 'express', 'postgresql'],
    'fullstack': ['react', 'node.js', 'typescript', 'postgresql'],
    'mobile': ['react native', 'typescript', 'swift', 'kotlin'],
    'devops': ['docker', 'kubernetes', 'aws', 'azure'],
  };

  // Return default full stack skills if no match
  return roleSkillMap[normalizedRole] || roleSkillMap.fullstack;
}