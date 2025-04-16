import { fetchAPI } from '@/services/api';
import { JobApplication, JobMatch, ApplicationStatus } from '@/types/jobs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '@/stores/user-store';
import { generateCoverLetter } from '@/services/ai-service';
import { useAIStore } from '@/stores/ai-store';

// Mock API for job applications
const STORAGE_KEY = 'job_applications';

/**
 * Get all applications for a specific user
 */
export const getApplicationsByUser = async (userId: string, token?: string): Promise<JobApplication[]> => {
  try {
    // In a real app, this would call an API
    const storedApps = await AsyncStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return storedApps ? JSON.parse(storedApps) : [];
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};

/**
 * Save applications to AsyncStorage (mock persistence)
 */
export const saveApplicationsToStorage = async (applications: JobApplication[], userId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(applications));
  } catch (error) {
    console.error('Error saving applications:', error);
    throw error;
  }
};

/**
 * Submit a job application
 */
export const submitJobApplication = async (job: JobMatch, userId: string): Promise<JobApplication> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get user's resume text for snapshot
    const { profile } = useUserStore.getState();
    const resumeText = profile.resumeText || '';
    
    const application: JobApplication = {
      id: `app_${Date.now()}`,
      jobId: job.id,
      userId,
      status: 'applied',
      appliedDate: new Date().toISOString(),
      job,
      updatedAt: new Date().toISOString(),
      notes: 'Applied manually',
      resumeSnapshot: resumeText // Save resume snapshot
    };
    
    // Simulate sending a confirmation email
    simulateSendConfirmationEmail(job, application);
    
    return application;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
};

/**
 * Auto-apply to a job using resume text
 */
export const autoApplyToJob = async (job: JobMatch, userId: string, resumeText?: string): Promise<JobApplication> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get user's resume text for snapshot if not provided
    if (!resumeText) {
      const { profile } = useUserStore.getState();
      resumeText = profile.resumeText || '';
    }
    
    // Get the selected AI model
    const { selectedModel } = useAIStore.getState();
    
    // Generate a cover letter using AI
    const coverLetterResult = await generateCoverLetter(
      resumeText,
      job.description,
      selectedModel
    );
    
    // In a real app, this would generate a cover letter and submit application
    const application: JobApplication = {
      id: `app_${Date.now()}`,
      jobId: job.id,
      userId,
      status: 'submitted',
      appliedDate: new Date().toISOString(),
      job,
      updatedAt: new Date().toISOString(),
      notes: 'Auto-applied using AI assistant',
      resumeSnapshot: resumeText, // Save resume snapshot
      coverLetter: coverLetterResult.content // Save generated cover letter
    };
    
    // Simulate sending a confirmation email
    simulateSendConfirmationEmail(job, application, true);
    
    return application;
  } catch (error) {
    console.error('Error auto-applying to job:', error);
    throw error;
  }
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (
  applicationId: string, 
  status: ApplicationStatus, 
  note?: string,
  userId?: string
): Promise<JobApplication> => {
  try {
    // In a real app, this would call an API
    const applications = await getApplicationsByUser(userId || '');
    
    const updatedApp = applications.find(app => app.id === applicationId);
    if (!updatedApp) {
      throw new Error('Application not found');
    }
    
    // Update status and add timestamp based on status
    updatedApp.status = status;
    updatedApp.notes = note || updatedApp.notes;
    updatedApp.updatedAt = new Date().toISOString();
    
    // Add date for specific statuses
    if (status === 'interview') {
      updatedApp.interviewDate = new Date().toISOString();
    } else if (status === 'offer') {
      updatedApp.offerDate = new Date().toISOString();
    } else if (status === 'accepted') {
      updatedApp.acceptedDate = new Date().toISOString();
    } else if (status === 'rejected') {
      updatedApp.rejectedDate = new Date().toISOString();
    }
    
    return updatedApp;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};

/**
 * Simulate sending a confirmation email
 * In a real app, this would call an email service
 */
const simulateSendConfirmationEmail = (
  job: JobMatch,
  application: JobApplication,
  isAutoApply: boolean = false
): void => {
  console.log(`
    ===== CONFIRMATION EMAIL =====
    To: ${useUserStore.getState().profile.email || 'user@example.com'}
    Subject: Application Submitted - ${job.title} at ${job.company}
    
    Dear ${useUserStore.getState().profile.name || 'User'},
    
    Your application for ${job.title} at ${job.company} has been successfully ${isAutoApply ? 'auto-' : ''}submitted.
    
    Application Details:
    - Job Title: ${job.title}
    - Company: ${job.company}
    - Match Score: ${job.matchScore}%
    - Application ID: ${application.id}
    - Status: ${application.status}
    - Applied Date: ${new Date(application.appliedDate || '').toLocaleString()}
    
    ${job.matchExplanation ? `Why this job matches your profile:
${job.matchExplanation}` : ''}
    
    We'll notify you of any updates to your application status.
    
    Best regards,
    The Nexture Team
    ===========================
  `);
};