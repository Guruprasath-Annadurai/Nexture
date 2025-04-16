import { Platform } from 'react-native';
import { fetchAPI } from './api';
import { mockJobs } from '@/data/mock-jobs';
import { Job, JobMatch } from '@/types/jobs';
import { callAI } from './ai-service';
import { AIModel } from '@/types/ai';

// Common skills that might be found in resumes
const commonSkills = [
  'javascript', 'typescript', 'react', 'react native', 'vue', 'angular',
  'node.js', 'express', 'next.js', 'python', 'django', 'flask',
  'java', 'spring', 'c#', '.net', 'php', 'laravel', 'ruby', 'rails',
  'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap',
  'sql', 'mysql', 'postgresql', 'mongodb', 'firebase', 'dynamodb',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
  'git', 'github', 'gitlab', 'ci/cd', 'jenkins', 'github actions',
  'agile', 'scrum', 'kanban', 'jira', 'confluence',
  'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
  'product management', 'project management', 'data analysis',
  'machine learning', 'ai', 'nlp', 'computer vision',
  'mobile development', 'ios', 'android', 'swift', 'kotlin',
  'leadership', 'team management', 'communication', 'problem solving'
];

/**
 * Extract skills from resume text
 * @param text Resume text
 * @returns Array of extracted skills
 */
export function extractSkills(text: string): string[] {
  if (!text) return [];
  
  const lowerText = text.toLowerCase();
  return commonSkills.filter(skill => lowerText.includes(skill.toLowerCase()));
}

/**
 * Extract education information from resume text
 * @param text Resume text
 * @returns Object with education details
 */
export function extractEducation(text: string): { 
  degree?: string;
  university?: string;
  graduationYear?: number;
} {
  if (!text) return {};
  
  // Simple regex patterns to extract education info
  const degreePattern = /(?:bachelor|master|phd|b\.s\.|m\.s\.|b\.a\.|m\.a\.|doctorate|bs|ms|ba|ma|mba)\s+(?:of|in)?\s+(?:science|arts|business|engineering|computer science|cs|information technology|it)/i;
  const universityPattern = /(?:university|college|institute|school) of [a-z ]+|[a-z ]+ (?:university|college|institute|school)/i;
  const yearPattern = /(?:19|20)\d{2}/;
  
  const degreeMatch = text.match(degreePattern);
  const universityMatch = text.match(universityPattern);
  const yearMatch = text.match(yearPattern);
  
  return {
    degree: degreeMatch ? degreeMatch[0] : undefined,
    university: universityMatch ? universityMatch[0] : undefined,
    graduationYear: yearMatch ? parseInt(yearMatch[0]) : undefined,
  };
}

/**
 * Extract experience information from resume text
 * @param text Resume text
 * @returns Object with experience details
 */
export function extractExperience(text: string): {
  yearsOfExperience?: number;
  companies?: string[];
  roles?: string[];
} {
  if (!text) return {};
  
  // Simple regex to find years of experience
  const experiencePattern = /(\d+)(?:\+)?\s+years?(?:\s+of)?\s+experience/i;
  const experienceMatch = text.match(experiencePattern);
  
  // Try to extract company names (this is a simplified approach)
  const companyPattern = /(?:worked at|work for|employed by|employer|company|organization):\s*([A-Z][A-Za-z0-9 ]+)/g;
  const companies = [];
  let companyMatch;
  while ((companyMatch = companyPattern.exec(text)) !== null) {
    companies.push(companyMatch[1].trim());
  }
  
  // Try to extract roles
  const rolePattern = /(?:as a|as an|position|role|title):\s*([A-Z][A-Za-z0-9 ]+)/g;
  const roles = [];
  let roleMatch;
  while ((roleMatch = rolePattern.exec(text)) !== null) {
    roles.push(roleMatch[1].trim());
  }
  
  return {
    yearsOfExperience: experienceMatch ? parseInt(experienceMatch[1]) : undefined,
    companies: companies.length > 0 ? companies : undefined,
    roles: roles.length > 0 ? roles : undefined,
  };
}

/**
 * Calculate match score between resume and job
 * @param resumeText Resume text
 * @param job Job object
 * @returns Match score (0-100)
 */
export function calculateMatchScore(resumeText: string, job: Job): {
  score: number;
  matchedSkills: string[];
  reason: string;
} {
  const extractedSkills = extractSkills(resumeText);
  if (extractedSkills.length === 0) {
    return { 
      score: 0, 
      matchedSkills: [],
      reason: "No skills could be extracted from your resume."
    };
  }
  
  // Find skills that match the job description
  const jobDescription = (job.description || "").toLowerCase();
  const matchedSkills = extractedSkills.filter(skill => 
    jobDescription.includes(skill.toLowerCase())
  );
  
  // Calculate base score based on matched skills
  let score = (matchedSkills.length / Math.min(extractedSkills.length, 10)) * 100;
  
  // Adjust score based on role match if specified
  const resumeLower = resumeText.toLowerCase();
  const jobTitleLower = job.title.toLowerCase();
  
  if (resumeLower.includes(jobTitleLower) || jobTitleLower.includes(extractedSkills.join(' '))) {
    score += 15;
  }
  
  // Adjust for location if specified
  if (job.location && resumeLower.includes(job.location.toLowerCase())) {
    score += 10;
  }
  
  // Adjust for experience
  const experience = extractExperience(resumeText);
  if (experience.yearsOfExperience && job.requiredExperience) {
    if (experience.yearsOfExperience >= job.requiredExperience) {
      score += 10;
    } else {
      score -= 15;
    }
  }
  
  // Adjust for education
  const education = extractEducation(resumeText);
  if (education.degree && job.requiredEducation) {
    if (education.degree.toLowerCase().includes(job.requiredEducation.toLowerCase())) {
      score += 10;
    }
  }
  
  // Adjust for salary expectations if available
  if (job.salary && job.salary > 0) {
    // This is a placeholder for salary matching logic
    // In a real app, you'd extract salary expectations from the resume
    // and compare with the job's offered salary
  }
  
  // Cap score at 100
  score = Math.min(Math.round(score), 100);
  
  // Generate reason for match
  let reason = matchedSkills.length > 0
    ? `Matched on skills: ${matchedSkills.join(", ")}`
    : "No direct skill matches found";
    
  if (experience.yearsOfExperience && job.requiredExperience) {
    reason += experience.yearsOfExperience >= job.requiredExperience
      ? `. Your ${experience.yearsOfExperience} years of experience meets the ${job.requiredExperience} year requirement.`
      : `. Your ${experience.yearsOfExperience} years of experience is below the ${job.requiredExperience} year requirement.`;
  }
  
  return { score, matchedSkills, reason };
}

/**
 * Find jobs that match a resume
 * @param params Search parameters
 * @returns Matching jobs with scores
 */
export async function findJobMatches({
  resumeText,
  desired_role = "",
  location_filter = "",
  page = 1,
  limit = 10
}: {
  resumeText: string;
  desired_role?: string;
  location_filter?: string;
  page?: number;
  limit?: number;
}): Promise<{
  results: JobMatch[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
}> {
  try {
    // In a real app, we would call the API
    // For now, use mock data
    let jobs: Job[] = [];
    
    if (Platform.OS !== 'web') {
      try {
        // Try to fetch from API first
        const response = await fetchAPI<{ jobs: Job[] }>('/jobs/search', {
          method: 'POST',
          body: JSON.stringify({ role: desired_role, location: location_filter }),
        });
        jobs = response.jobs;
      } catch (error) {
        console.log('Using mock jobs due to API error:', error);
        jobs = mockJobs;
      }
    } else {
      // Use mock data for web
      jobs = mockJobs;
    }
    
    // Filter by role and location if provided
    if (desired_role) {
      const roleLower = desired_role.toLowerCase();
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(roleLower) || 
        (job.description && job.description.toLowerCase().includes(roleLower))
      );
    }
    
    if (location_filter) {
      const locationLower = location_filter.toLowerCase();
      jobs = jobs.filter(job => 
        job.location.toLowerCase().includes(locationLower)
      );
    }
    
    // Calculate match scores
    const matches: JobMatch[] = jobs.map(job => {
      const { score, matchedSkills, reason } = calculateMatchScore(resumeText, job);
      
      return {
        ...job,
        score,
        matchedSkills,
        reason,
        favorite: false, // Default to not favorite
      };
    });
    
    // Sort by score (highest first) and filter out low matches
    const sortedMatches = matches
      .filter(match => match.score >= 50)
      .sort((a, b) => b.score - a.score);
    
    // Paginate results
    const totalResults = sortedMatches.length;
    const totalPages = Math.ceil(totalResults / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = sortedMatches.slice(startIndex, endIndex);
    
    return {
      results: paginatedResults,
      totalResults,
      currentPage: page,
      totalPages,
    };
  } catch (error) {
    console.error('Error in findJobMatches:', error);
    throw error;
  }
}

// Alias for findJobMatches to maintain compatibility with existing code
export const findMatchingJobs = findJobMatches;