/**
 * Supported AI models
 */
export type AIModel = 'openai' | 'claude' | 'grok' | string;

/**
 * AI response structure
 */
export interface AIResponse {
  text: string;
  model: AIModel;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * AI analysis result for resume
 */
export interface ResumeAnalysis {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keySkills: string[];
  summary: string;
  matchScore?: number;
}

/**
 * AI-generated interview preparation
 */
export interface InterviewPrep {
  commonQuestions: string[];
  suggestedAnswers: Record<string, string>;
  technicalTopics: string[];
  preparationTips: string[];
}

/**
 * AI-generated cover letter
 */
export interface CoverLetter {
  text: string;
  highlights: string[];
  customizationTips: string[];
}