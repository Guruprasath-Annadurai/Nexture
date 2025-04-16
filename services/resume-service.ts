// Mock resume analysis service
import { useAIStore } from '@/stores/ai-store';

export interface ResumeAnalysisResult {
  matchScore: number;
  missingKeywords: string[];
  keywordMatches: { [keyword: string]: boolean };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  formattingIssues: string[];
  overallAssessment: string;
  resumeText?: string;
}

/**
 * Analyze a resume against a job description
 */
export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<ResumeAnalysisResult> {
  // Get the selected AI model
  const { selectedModel } = useAIStore.getState();
  
  console.log(`Using ${selectedModel} to analyze resume`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Extract keywords from job description
  const jobKeywords = extractKeywords(jobDescription);
  
  // Check which keywords are in the resume
  const keywordMatches: { [keyword: string]: boolean } = {};
  const missingKeywords: string[] = [];
  
  jobKeywords.forEach(keyword => {
    const isMatch = resumeText.toLowerCase().includes(keyword.toLowerCase());
    keywordMatches[keyword] = isMatch;
    
    if (!isMatch) {
      missingKeywords.push(keyword);
    }
  });
  
  // Calculate match score
  const matchedKeywords = jobKeywords.length - missingKeywords.length;
  const matchScore = Math.round((matchedKeywords / jobKeywords.length) * 100);
  
  // Generate strengths
  const strengths = generateStrengths(resumeText, jobDescription, selectedModel);
  
  // Generate weaknesses
  const weaknesses = generateWeaknesses(resumeText, jobDescription, missingKeywords, selectedModel);
  
  // Generate suggestions
  const suggestions = generateSuggestions(resumeText, jobDescription, missingKeywords, selectedModel);
  
  // Check formatting
  const formattingIssues = checkFormatting(resumeText, selectedModel);
  
  // Generate overall assessment
  const overallAssessment = generateOverallAssessment(matchScore, strengths.length, weaknesses.length, selectedModel);
  
  return {
    matchScore,
    missingKeywords,
    keywordMatches,
    strengths,
    weaknesses,
    suggestions,
    formattingIssues,
    overallAssessment,
    resumeText,
  };
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  // In a real implementation, this would use NLP to extract relevant keywords
  // For this demo, we'll use a simple approach
  
  // Common technical skills
  const technicalSkills = [
    'JavaScript', 'TypeScript', 'React', 'React Native', 'Node.js',
    'Python', 'Java', 'C#', 'C++', 'Ruby', 'PHP', 'Swift', 'Kotlin',
    'HTML', 'CSS', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
    'REST API', 'GraphQL', 'Redux', 'Vue.js', 'Angular', 'Express',
    'Django', 'Flask', 'Spring', 'ASP.NET', 'Laravel', 'Rails',
  ];
  
  // Common soft skills
  const softSkills = [
    'Communication', 'Teamwork', 'Problem-solving', 'Leadership',
    'Time management', 'Adaptability', 'Creativity', 'Critical thinking',
    'Collaboration', 'Attention to detail', 'Organization', 'Flexibility',
  ];
  
  // Extract skills mentioned in the text
  const keywords: string[] = [];
  
  [...technicalSkills, ...softSkills].forEach(skill => {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      keywords.push(skill);
    }
  });
  
  // Add some random keywords based on the text length to make it more realistic
  const additionalKeywords = [
    'Project management', 'Agile', 'Scrum', 'Kanban', 'Jira',
    'Confluence', 'Slack', 'Microsoft Office', 'Google Workspace',
    'Customer service', 'Sales', 'Marketing', 'Analytics', 'SEO',
    'Content creation', 'Social media', 'UX/UI design', 'Figma',
    'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'InDesign',
  ];
  
  // Add 3-5 random additional keywords
  const numAdditional = Math.floor(Math.random() * 3) + 3;
  for (let i = 0; i < numAdditional; i++) {
    const randomIndex = Math.floor(Math.random() * additionalKeywords.length);
    const keyword = additionalKeywords[randomIndex];
    
    if (!keywords.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  
  return keywords;
}

/**
 * Generate strengths based on resume and job description
 */
function generateStrengths(resumeText: string, jobDescription: string, model: string): string[] {
  // In a real implementation, this would use NLP to analyze the resume
  // For this demo, we'll return some generic strengths with variations based on the AI model
  
  const baseStrengths = [
    'Your resume effectively highlights your technical skills',
    'Good use of action verbs in your experience descriptions',
    'Clear presentation of your work history',
  ];
  
  // Add some conditional strengths
  if (resumeText.toLowerCase().includes('team')) {
    baseStrengths.push('You demonstrate strong teamwork abilities');
  }
  
  if (resumeText.toLowerCase().includes('lead') || resumeText.toLowerCase().includes('manage')) {
    baseStrengths.push('Your leadership experience is well-presented');
  }
  
  if (resumeText.toLowerCase().includes('problem')) {
    baseStrengths.push('You highlight your problem-solving capabilities');
  }
  
  // Add model-specific strengths
  const modelSpecificStrengths: Record<string, string[]> = {
    openai: [
      'Your resume is well-structured with clear sections',
      'Good balance of technical skills and soft skills',
      'Quantifiable achievements add credibility to your experience'
    ],
    claude: [
      'Your experience is presented in a logical progression',
      'You effectively demonstrate the impact of your work',
      'Your resume shows a clear career narrative'
    ],
    grok: [
      'Your resume stands out with specific technical accomplishments',
      "You have highlighted relevant technologies that match the job",
      'Your unique experiences differentiate you from other candidates'
    ]
  };
  
  // Combine base strengths with model-specific ones
  const allStrengths = [...baseStrengths, ...(modelSpecificStrengths[model] || [])];
  
  // Return 3-5 strengths
  return allStrengths.slice(0, Math.floor(Math.random() * 3) + 3);
}

/**
 * Generate weaknesses based on resume, job description, and missing keywords
 */
function generateWeaknesses(
  resumeText: string,
  jobDescription: string,
  missingKeywords: string[],
  model: string
): string[] {
  // In a real implementation, this would use NLP to analyze the resume
  // For this demo, we'll return some generic weaknesses with variations based on the AI model
  
  const weaknesses = [];
  
  // Add weaknesses based on missing keywords
  if (missingKeywords.length > 0) {
    weaknesses.push(`Your resume is missing key skills: ${missingKeywords.slice(0, 3).join(', ')}`);
  }
  
  // Add some generic weaknesses
  const genericWeaknesses = [
    'Your resume could benefit from more quantifiable achievements',
    'Consider adding more specific examples of your contributions',
    'The resume could be more tailored to the specific job description',
    'Your skills section could be more comprehensive',
    'Consider reorganizing your experience to highlight relevant roles first',
  ];
  
  // Add model-specific weaknesses
  const modelSpecificWeaknesses: Record<string, string[]> = {
    openai: [
      'The resume lacks a clear professional summary at the beginning',
      'Technical skills could be categorized more effectively',
      'Some job descriptions are too lengthy and could be more concise'
    ],
    claude: [
      'Your resume would benefit from a more consistent formatting style',
      'Consider adding more industry-specific terminology',
      'The chronology of your experience could be clearer'
    ],
    grok: [
      'Your resume could use more personality to stand out',
      'Consider highlighting unconventional skills that set you apart',
      'The resume feels too traditional for this creative role'
    ]
  };
  
  // Combine generic weaknesses with model-specific ones
  const allWeaknesses = [...genericWeaknesses, ...(modelSpecificWeaknesses[model] || [])];
  
  // Add 2-3 generic weaknesses
  const numGeneric = Math.floor(Math.random() * 2) + 2;
  for (let i = 0; i < numGeneric; i++) {
    const randomIndex = Math.floor(Math.random() * allWeaknesses.length);
    weaknesses.push(allWeaknesses[randomIndex]);
    allWeaknesses.splice(randomIndex, 1);
  }
  
  return weaknesses;
}

/**
 * Generate suggestions based on resume, job description, and missing keywords
 */
function generateSuggestions(
  resumeText: string,
  jobDescription: string,
  missingKeywords: string[],
  model: string
): string[] {
  // In a real implementation, this would use NLP to analyze the resume
  // For this demo, we'll return some generic suggestions with variations based on the AI model
  
  const suggestions = [];
  
  // Add suggestions based on missing keywords
  if (missingKeywords.length > 0) {
    suggestions.push(`Add these key skills to your resume: ${missingKeywords.slice(0, 3).join(', ')}`);
  }
  
  // Add some generic suggestions
  const genericSuggestions = [
    'Quantify your achievements with specific metrics and results',
    'Tailor your resume to match the job description more closely',
    'Use more action verbs to describe your responsibilities',
    'Consider adding a summary section to highlight your key qualifications',
    'Organize your skills into categories for better readability',
    'Include relevant certifications and professional development',
    'Ensure your most relevant experience is prominently featured',
  ];
  
  // Add model-specific suggestions
  const modelSpecificSuggestions: Record<string, string[]> = {
    openai: [
      'Use industry-standard terminology to pass ATS systems',
      'Add a "Core Competencies" section with 6-8 key skills',
      'Consider a functional resume format to highlight transferable skills'
    ],
    claude: [
      'Incorporate keywords from the job posting naturally throughout your resume',
      'Add a brief statement about your work philosophy or approach',
      'Consider including a "Projects" section to showcase relevant work'
    ],
    grok: [
      'Add a unique "Why Me" section to differentiate yourself',
      'Consider a more creative layout for this particular industry',
      'Include links to your portfolio or relevant online presence'
    ]
  };
  
  // Combine generic suggestions with model-specific ones
  const allSuggestions = [...genericSuggestions, ...(modelSpecificSuggestions[model] || [])];
  
  // Add 3-4 generic suggestions
  const numGeneric = Math.floor(Math.random() * 2) + 3;
  for (let i = 0; i < numGeneric; i++) {
    const randomIndex = Math.floor(Math.random() * allSuggestions.length);
    suggestions.push(allSuggestions[randomIndex]);
    allSuggestions.splice(randomIndex, 1);
  }
  
  return suggestions;
}

/**
 * Check formatting issues in the resume
 */
function checkFormatting(resumeText: string, model: string): string[] {
  // In a real implementation, this would analyze the resume format
  // For this demo, we'll return some generic formatting issues with variations based on the AI model
  
  const formattingIssues = [];
  
  // Check resume length
  if (resumeText.length < 1000) {
    formattingIssues.push('Your resume appears to be too short');
  } else if (resumeText.length > 5000) {
    formattingIssues.push('Your resume may be too long; consider condensing it');
  }
  
  // Add some random formatting issues
  const potentialIssues = [
    'Ensure consistent formatting of dates throughout your resume',
    'Check for consistent use of bullet points in your experience section',
    'Verify that your contact information is up-to-date and prominently displayed',
    'Consider using a more readable font and appropriate font size',
    'Ensure adequate spacing between sections for better readability',
    'Check for any spelling or grammatical errors',
  ];
  
  // Add model-specific formatting issues
  const modelSpecificIssues: Record<string, string[]> = {
    openai: [
      'Ensure your resume follows a standard ATS-friendly format',
      'Consider using a single-column layout for better parsing by ATS systems',
      'Make sure your PDF is properly tagged for accessibility'
    ],
    claude: [
      'Check that your section headings are clearly distinguished from body text',
      'Ensure consistent alignment throughout the document',
      "Consider adding subtle visual elements to guide the reader's eye"
    ],
    grok: [
      'Your resume could benefit from a more modern design approach',
      'Consider a strategic use of color to highlight key information',
      'Ensure your resume has a consistent visual hierarchy'
    ]
  };
  
  // Combine potential issues with model-specific ones
  const allIssues = [...potentialIssues, ...(modelSpecificIssues[model] || [])];
  
  // Add 0-2 random formatting issues
  const numIssues = Math.floor(Math.random() * 3);
  for (let i = 0; i < numIssues; i++) {
    const randomIndex = Math.floor(Math.random() * allIssues.length);
    formattingIssues.push(allIssues[randomIndex]);
    allIssues.splice(randomIndex, 1);
  }
  
  return formattingIssues;
}

/**
 * Generate overall assessment based on match score and strengths/weaknesses
 */
function generateOverallAssessment(
  matchScore: number,
  numStrengths: number,
  numWeaknesses: number,
  model: string
): string {
  // Generate different assessments based on the selected AI model
  const assessments: Record<string, Record<string, string>> = {
    openai: {
      high: "Your resume is well-aligned with this job. With a few minor adjustments, you'll be an excellent candidate. Focus on highlighting your relevant experience and addressing the few missing keywords to maximize your chances.",
      medium: "Your resume shows good potential for this position, but could benefit from some targeted improvements to better match the job requirements. Consider reorganizing your experience to emphasize relevant skills and adding the missing keywords.",
      low: "Your resume needs significant improvements to be competitive for this position. Focus on adding the missing skills and experiences highlighted in our analysis, and consider restructuring your resume to better align with this role.",
      poor: "Your resume doesn't currently align well with this job. Consider whether this role is the right fit, or make substantial revisions to highlight relevant experience and add the missing keywords identified in our analysis."
    },
    claude: {
      high: "Your resume demonstrates strong alignment with this position. The experience and skills you've highlighted position you as a promising candidate. With minor refinements to address the few gaps identified, you'll present an even more compelling application.",
      medium: "Your resume shows promise for this role, though there are areas for improvement. By addressing the missing keywords and restructuring certain sections to emphasize relevant experience, you can significantly strengthen your candidacy.",
      low: "Your resume requires considerable enhancement to effectively compete for this position. We recommend a targeted revision focusing on the missing skills and experience areas identified in our analysis, along with a clearer presentation of your relevant qualifications.",
      poor: "There appears to be a substantial gap between your current resume and this position's requirements. We suggest either exploring roles that better match your experience or undertaking a comprehensive revision to address the numerous missing keywords and experience areas."
    },
    grok: {
      high: "You're looking pretty solid for this job! Your resume hits most of the key points they're looking for. Just add those few missing keywords, maybe jazz up how you describe your achievements, and you'll be in great shape to land an interview.",
      medium: "Not bad, but your resume needs some work to really shine for this position. The bones are good, but you should highlight your relevant experience more clearly and definitely add those missing skills they're looking for. With some targeted updates, you could move from 'maybe' to 'must interview'.",
      low: "Your resume needs a serious overhaul for this job. The match isn't great right now, but don't give up! Focus on adding those missing keywords, restructuring to emphasize any relevant experience (even if it's tangential), and quantifying your achievements. It'll take work, but you can make yourself a much stronger candidate.",
      poor: "Let's be real - your resume and this job aren't matching up well. You might want to consider if this is really the right role for you, or if you're set on it, you'll need a major resume renovation. Add those missing skills (if you have them), completely rethink how you're presenting your experience, and consider addressing the gap directly in a cover letter."
    }
  };
  
  let category: string;
  if (matchScore >= 80) {
    category = 'high';
  } else if (matchScore >= 60) {
    category = 'medium';
  } else if (matchScore >= 40) {
    category = 'low';
  } else {
    category = 'poor';
  }
  
  // Return the appropriate assessment based on model and score category
  return assessments[model]?.[category] || assessments.claude[category];
}