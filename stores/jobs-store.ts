import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { findJobMatches } from '@/services/job-matching';
import { 
  submitJobApplication, 
  autoApplyToJob,
  saveApplicationsToStorage, 
  updateApplicationStatus 
} from '@/services/application-service';
import { callAI } from '@/services/ai-service';
import { useAIStore } from '@/stores/ai-store';
import type { JobMatch, JobApplication, JobMatchHistoryEntry, ApplicationStatus } from '@/types/jobs';

interface JobMatchParams {
  resumeText: string;
  role?: string;
  location?: string;
  ai?: string;
  autoApply?: boolean;
  generateCoverLetter?: boolean;
}

interface JobsState {
  // Job listings
  jobs: JobMatch[];
  matchedJobs: JobMatch[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;

  // Filters
  selectedTags: string[];
  filters: {
    resumeText?: string;
    location?: string;
    role?: string;
    skills?: string[];
  };

  // Applications
  appliedJobs: JobApplication[];
  isApplying: boolean;

  // Job Match History
  jobMatchHistory: JobMatchHistoryEntry[];

  // Actions
  searchJobs: (params: { 
    resumeText: string;
    location?: string;
    role?: string;
    skills?: string[];
    page?: number;
  }) => Promise<void>;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
  loadMore: () => Promise<void>;
  getJobById: (id: string) => JobMatch | undefined;
  applyToJob: (jobId: string) => Promise<JobApplication | undefined>;
  autoApplyToJob: (jobId: string) => Promise<JobApplication | undefined>;
  updateApplicationStatus: (
    applicationId: string, 
    status: ApplicationStatus,
    note?: string
  ) => Promise<void>;
  updateFilters: (filters: Partial<JobsState['filters']>) => Promise<void>;
  getMatchExplanation: (jobId: string) => string | undefined;
  getMatchSummary: (resumeText: string) => Promise<string>;
  
  // Job Match History methods
  runJobMatch: (params: JobMatchParams) => Promise<void>;
  toggleFavoriteJob: (historyId: string, matchIndex: number) => void;
}

// Mock user ID for demo
const MOCK_USER_ID = 'user123';

// Helper function to generate match explanation
function generateMatchExplanation(resumeText: string, job: JobMatch): string {
  if (!resumeText || !job) return "No resume or job data provided.";
  
  let explanation = `Match Score: ${job.score}%\n\n`;
  
  // Skills match
  explanation += "Skills Match:\n";
  if (job.matchedSkills && job.matchedSkills.length > 0) {
    explanation += `✓ Your resume matches ${job.matchedSkills.length} skills required for this position: ${job.matchedSkills.join(", ")}\n`;
  } else {
    explanation += "• No direct skill matches were found. Consider updating your resume with relevant keywords.\n";
  }
  
  // Experience match
  explanation += "\nExperience Match:\n";
  if (job.requiredExperience) {
    explanation += `• The job requires ${job.requiredExperience} years of experience.\n`;
  } else {
    explanation += "• The job doesn't specify experience requirements.\n";
  }
  
  // Location match
  explanation += "\nLocation Match:\n";
  if (job.location) {
    explanation += `• The job is located in ${job.location}.\n`;
  } else {
    explanation += "• The job location couldn't be determined.\n";
  }
  
  // Recommendations
  explanation += "\nRecommendations:\n";
  if (job.score >= 80) {
    explanation += "✓ This is a strong match! Consider applying right away.\n";
  } else if (job.score >= 60) {
    explanation += "• This is a good match. Consider tailoring your resume to highlight relevant experience.\n";
  } else {
    explanation += "• This match could be improved. Consider adding more relevant skills and experience to your resume.\n";
  }
  
  return explanation;
}

// Helper function to generate job match summary
async function generateJobMatchSummary(
  resumeText: string,
  matches: JobMatch[],
  model: string = 'claude'
): Promise<string> {
  if (!resumeText || matches.length === 0) {
    return "No resume or job matches provided.";
  }

  try {
    // Create a prompt for the AI
    const topMatches = matches.slice(0, 5); // Use top 5 matches for summary
    
    const promptText = `Summarize these job match results for a job seeker:
${topMatches.map(m => `${m.title} at ${m.company}: ${m.score}% match`).join("\n")}

Provide a brief analysis of their best fit roles based on these matches and suggest one improvement to their resume to increase match quality.`;

    // Call the AI service
    const summary = await callAI({
      model,
      prompt: promptText,
      temperature: 0.7,
      maxTokens: 300
    });
    
    return summary.trim();
  } catch (error) {
    console.error('Error generating job match summary:', error);
    return "Based on your resume, you appear to be a good match for these positions. Consider highlighting your most relevant skills for each application.";
  }
}

export const useJobsStore = create<JobsState>()(
  persist(
    (set, get) => ({
      // Initial state
      jobs: [],
      matchedJobs: [],
      totalResults: 0,
      currentPage: 1,
      totalPages: 1,
      isLoading: false,
      error: null,
      hasMore: false,
      selectedTags: [],
      filters: {},
      appliedJobs: [],
      isApplying: false,
      jobMatchHistory: [],

      // Actions
      searchJobs: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const response = await findJobMatches({
            resumeText: params.resumeText || '',
            desired_role: params.role,
            location_filter: params.location,
            page: params.page || 1,
            limit: 10,
          });

          const jobs = response.results.map((job: JobMatch) => ({
            ...job,
            postedDate: job.postedDate || new Date().toISOString(), // Add default postedDate
          }));

          set({
            jobs: jobs, // Set jobs array for the dashboard
            matchedJobs: jobs,
            totalResults: response.totalResults,
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            hasMore: response.currentPage < response.totalPages,
            filters: params,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to search jobs',
            isLoading: false 
          });
        }
      },

      toggleTag: (tag: string) => {
        set(state => ({
          selectedTags: state.selectedTags.includes(tag)
            ? state.selectedTags.filter(t => t !== tag)
            : [...state.selectedTags, tag]
        }));
      },

      clearFilters: () => {
        set({ filters: {}, selectedTags: [] });
      },

      loadMore: async () => {
        const state = get();
        if (state.isLoading || !state.hasMore) return;

        const nextPage = state.currentPage + 1;
        await state.searchJobs({
          ...state.filters,
          resumeText: state.filters.resumeText || '',
          page: nextPage,
        });
      },

      getJobById: (id) => {
        return get().matchedJobs.find(job => job.id === id);
      },

      applyToJob: async (jobId) => {
        const job = get().getJobById(jobId);
        if (!job) return;

        set({ isApplying: true });

        try {
          // Submit application to API (or mock for demo)
          const application = await submitJobApplication(job, MOCK_USER_ID);
          
          // Update local state
          const updatedAppliedJobs = [...get().appliedJobs, application];
          
          set({ 
            appliedJobs: updatedAppliedJobs,
            isApplying: false
          });
          
          // Save to AsyncStorage for demo persistence
          await saveApplicationsToStorage(updatedAppliedJobs, MOCK_USER_ID);
          
          return application;
        } catch (error) {
          set({ isApplying: false });
          throw error;
        }
      },
      
      autoApplyToJob: async (jobId) => {
        const job = get().getJobById(jobId);
        if (!job) return;

        set({ isApplying: true });

        try {
          // Use the resume text from filters if available
          const resumeText = get().filters.resumeText;
          
          // Submit auto-application to API (or mock for demo)
          const application = await autoApplyToJob(job, MOCK_USER_ID, resumeText);
          
          // Update local state
          const updatedAppliedJobs = [...get().appliedJobs, application];
          
          set({ 
            appliedJobs: updatedAppliedJobs,
            isApplying: false
          });
          
          // Save to AsyncStorage for demo persistence
          await saveApplicationsToStorage(updatedAppliedJobs, MOCK_USER_ID);
          
          return application;
        } catch (error) {
          set({ isApplying: false });
          throw error;
        }
      },
      
      updateApplicationStatus: async (applicationId, status, note) => {
        try {
          // Update application status via API (or mock for demo)
          const updatedApp = await updateApplicationStatus(applicationId, status, note, MOCK_USER_ID);
          
          // Update local state
          const updatedAppliedJobs = get().appliedJobs.map(app => 
            app.id === applicationId ? updatedApp : app
          );
          
          set({ appliedJobs: updatedAppliedJobs });
          
          // Save to AsyncStorage for demo persistence
          await saveApplicationsToStorage(updatedAppliedJobs, MOCK_USER_ID);
        } catch (error) {
          console.error('Error updating application status:', error);
          throw error;
        }
      },

      updateFilters: async (newFilters) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters }
        }));
        
        // Optionally trigger a search with the updated filters
        const state = get();
        if (state.filters.resumeText) {
          await state.searchJobs({
            ...state.filters,
            resumeText: state.filters.resumeText,
          });
        }
      },

      getMatchExplanation: (jobId) => {
        const job = get().getJobById(jobId);
        if (!job) return undefined;
        
        // Generate an explanation
        const resumeText = get().filters.resumeText;
        if (!resumeText) return undefined;
        
        return generateMatchExplanation(resumeText, job);
      },
      
      getMatchSummary: async (resumeText) => {
        const { matchedJobs } = get();
        // Get the AI model from the store without causing a dependency
        const aiStore = useAIStore.getState();
        const selectedModel = aiStore.selectedModel;
        
        if (matchedJobs.length === 0) {
          return "No matching jobs found. Try adjusting your search criteria.";
        }
        
        // Generate a summary of the matches using AI
        const summary = await generateJobMatchSummary(
          resumeText,
          matchedJobs,
          selectedModel
        );
        
        return summary;
      },

      // Job Match History methods
      runJobMatch: async (params) => {
        set({ isLoading: true, error: null });
        try {
          // First, run the job search
          await get().searchJobs({
            resumeText: params.resumeText,
            location: params.location,
            role: params.role,
          });

          // Get the matched jobs
          const matchedJobs = get().matchedJobs;
          
          // Get the AI model from the store without causing a dependency
          const aiStore = useAIStore.getState();
          const selectedModel = aiStore.selectedModel;
          
          // Generate a summary
          const summary = await get().getMatchSummary(params.resumeText);
          
          // Create a history entry
          const historyEntry: JobMatchHistoryEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            resumeText: params.resumeText,
            role: params.role || '',
            location: params.location || '',
            ai: params.ai || selectedModel,
            summary,
            matches: matchedJobs.map(job => ({
              ...job,
              favorite: false, // Default to not favorite
            })),
          };
          
          // Update history
          set(state => ({
            jobMatchHistory: [historyEntry, ...state.jobMatchHistory],
            isLoading: false,
          }));

          // If autoApply is true, apply to all jobs
          if (params.autoApply) {
            for (const job of matchedJobs) {
              await get().autoApplyToJob(job.id);
            }
          }

          return;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to run job match',
            isLoading: false 
          });
          throw error;
        }
      },

      // Toggle favorite status for a job in history
      toggleFavoriteJob: (historyId, matchIndex) => {
        set(state => {
          const updatedHistory = state.jobMatchHistory.map(entry => {
            if (entry.id === historyId) {
              const updatedMatches = [...entry.matches];
              if (updatedMatches[matchIndex]) {
                updatedMatches[matchIndex] = {
                  ...updatedMatches[matchIndex],
                  favorite: !updatedMatches[matchIndex].favorite
                };
              }
              return {
                ...entry,
                matches: updatedMatches
              };
            }
            return entry;
          });
          
          return { jobMatchHistory: updatedHistory };
        });
      }
    }),
    {
      name: 'jobs-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        filters: state.filters,
        selectedTags: state.selectedTags,
        appliedJobs: state.appliedJobs,
        jobMatchHistory: state.jobMatchHistory,
      }),
    }
  )
);