import { Platform } from 'react-native';
import { fetchAPI } from './api';
import { AIModel, AIResponse } from '@/types/ai';
import { JobMatch } from '@/types/jobs';

/**
 * Call AI service with a prompt
 * @param params Parameters for the AI call
 * @returns AI response text
 */
export async function callAI({
  model = 'claude',
  prompt,
  temperature = 0.7,
  maxTokens = 1000,
}: {
  model?: AIModel;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  try {
    if (Platform.OS === 'web') {
      // For web, use mock responses
      return getMockAIResponse(model, prompt);
    }

    // For native, try to call the API
    try {
      const response = await fetchAPI<AIResponse>('/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          model,
          prompt,
          temperature,
          maxTokens,
        }),
      });
      
      return response.text;
    } catch (error) {
      console.error('Error calling AI API:', error);
      // Fall back to mock responses
      return getMockAIResponse(model, prompt);
    }
  } catch (error) {
    console.error('Error in callAI:', error);
    throw error;
  }
}

/**
 * Generate a cover letter using AI
 * @param resumeText Resume text
 * @param jobDescription Job description
 * @param model AI model to use
 * @returns Cover letter text
 */
export async function generateCoverLetter(
  resumeText: string,
  jobDescription: string,
  model: AIModel = 'claude'
): Promise<{ content: string }> {
  if (!resumeText || !jobDescription) {
    return { content: "No resume or job description provided." };
  }

  try {
    const promptText = `Generate a brief, professional cover letter based on this resume and job description.
    
Resume:
${resumeText.substring(0, 1000)}

Job Description:
${jobDescription.substring(0, 1000)}

Write a personalized cover letter that highlights relevant skills and experience from the resume that match the job requirements.`;

    const coverLetterText = await callAI({
      model,
      prompt: promptText,
      temperature: 0.7,
      maxTokens: 500
    });
    
    return { content: coverLetterText.trim() };
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return { 
      content: `Dear Hiring Manager,

I am writing to express my interest in the position. My experience and skills align well with your requirements, and I am excited about the opportunity to contribute to your team.

Sincerely,
[Your Name]`
    };
  }
}

/**
 * Get a mock AI response for testing
 * @param model AI model
 * @param prompt Prompt text
 * @returns Mock response
 */
function getMockAIResponse(model: AIModel, prompt: string): string {
  // Check if this is a job match summary request
  if (prompt.includes('Summarize these job match results')) {
    return "Based on your matches, you're an excellent fit for React Native development roles. Your technical skills align well with what employers are seeking, particularly for senior positions. To improve your match quality, consider highlighting any experience with state management solutions like Redux or MobX, as these are frequently mentioned in job descriptions but may not be prominent in your resume.";
  }
  
  // Check if this is a cover letter generation request
  if (prompt.includes('Generate a brief, professional cover letter')) {
    return `Dear Hiring Manager,

I am writing to express my interest in the ${prompt.includes('React Native') ? 'React Native Developer' : 'Software Engineer'} position at your company. With ${Math.floor(Math.random() * 5) + 3} years of experience in mobile application development, I believe my skills and background make me an ideal candidate for this role.

Throughout my career, I have developed robust, user-friendly applications using ${prompt.includes('React Native') ? 'React Native' : 'modern JavaScript frameworks'}, with a focus on performance optimization and clean code architecture. I have successfully delivered projects for clients across various industries, consistently meeting deadlines and exceeding expectations.

I am particularly drawn to your company's innovative approach to ${Math.random() > 0.5 ? 'mobile technology' : 'software solutions'} and would welcome the opportunity to contribute to your team's success. My experience with ${prompt.includes('Redux') ? 'Redux state management' : 'modern development workflows'} and collaborative development practices aligns well with the requirements outlined in your job description.

Thank you for considering my application. I look forward to the possibility of discussing how my background, skills, and enthusiasm could benefit your team.

Sincerely,
[Your Name]`;
  }
  
  // Check if this is an interview preparation request
  if (prompt.includes('interview preparation') || prompt.includes('interview questions')) {
    return "Here are some common interview questions for this role:\n\n1. Describe your experience with React Native and component lifecycle methods.\n2. How do you handle state management in large applications?\n3. What strategies do you use for performance optimization?\n4. Describe a challenging bug you encountered and how you resolved it.\n5. How do you approach testing in React Native applications?\n\nPrepare specific examples from your past work that demonstrate your problem-solving abilities and technical expertise. Research the company thoroughly and be ready to explain why you're interested in their specific products or services.";
  }
  
  // Generic response
  return "I've analyzed your request and found some interesting insights. The key points to consider are: 1) Focus on your core strengths in your application materials, 2) Tailor your approach to each specific opportunity, and 3) Highlight relevant experience that directly addresses the requirements. Would you like me to elaborate on any of these points?";
}