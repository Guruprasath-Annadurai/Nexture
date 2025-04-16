import { getApplicationsByUser } from '@/services/application-service';
import { JobApplication, ApplicationStatus } from '@/types/jobs';
import { AnalyticsData, StatusCount, SkillCount, TimelinePoint } from '@/types/analytics';

/**
 * Get analytics data for a specific user
 */
export const getApplicationAnalytics = async (userId: string): Promise<AnalyticsData> => {
  try {
    // Get all applications for the user
    const applications = await getApplicationsByUser(userId);
    
    if (!applications || applications.length === 0) {
      return createEmptyAnalyticsData();
    }
    
    // Calculate total applications
    const totalApplications = applications.length;
    
    // Calculate applications by status
    const statusCounts = calculateStatusCounts(applications);
    
    // Calculate pending applications
    const pendingStatuses: ApplicationStatus[] = ['applied', 'submitted', 'pending', 'interview'];
    const pendingApplications = applications.filter(app => 
      pendingStatuses.includes(app.status)
    ).length;
    
    // Calculate success rate (offered or accepted)
    const successStatuses: ApplicationStatus[] = ['offered', 'accepted'];
    const successfulApplications = applications.filter(app => 
      successStatuses.includes(app.status)
    ).length;
    const successRate = Math.round((successfulApplications / totalApplications) * 100) || 0;
    
    // Calculate average match score
    const totalMatchScore = applications.reduce((sum, app) => {
      const score = app.job?.matchScore || app.matchScore || 0;
      return sum + score;
    }, 0);
    const avgMatchScore = Math.round(totalMatchScore / totalApplications) || 0;
    
    // Extract top skills
    const topSkills = extractTopSkills(applications);
    
    // Extract companies applied to
    const companiesAppliedTo = extractCompanies(applications);
    
    // Create application timeline
    const applicationTimeline = createApplicationTimeline(applications);
    
    return {
      totalApplications,
      applicationsByStatus: statusCounts,
      pendingApplications,
      successRate,
      avgMatchScore,
      topSkills,
      companiesAppliedTo,
      applicationTimeline,
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

/**
 * Calculate counts for each application status
 */
const calculateStatusCounts = (applications: JobApplication[]): StatusCount[] => {
  const statusMap: Record<string, number> = {};
  
  // Initialize with all possible statuses
  const allStatuses: ApplicationStatus[] = [
    'saved', 'applied', 'submitted', 'pending', 'interview', 'offered', 'accepted', 'rejected'
  ];
  
  allStatuses.forEach(status => {
    statusMap[status] = 0;
  });
  
  // Count applications by status
  applications.forEach(app => {
    if (app.status) {
      statusMap[app.status] = (statusMap[app.status] || 0) + 1;
    }
  });
  
  // Convert to array of objects
  return Object.entries(statusMap)
    .filter(([_, count]) => count > 0) // Only include statuses with applications
    .map(([status, count]) => ({
      status: status as ApplicationStatus,
      count,
    }));
};

/**
 * Extract top skills from applications
 */
const extractTopSkills = (applications: JobApplication[]): SkillCount[] => {
  const skillsMap: Record<string, number> = {};
  
  // Extract skills from job matches and resume snapshots
  applications.forEach(app => {
    // Extract from matched skills in job
    if (app.job?.matchedSkills) {
      app.job.matchedSkills.forEach(skill => {
        skillsMap[skill] = (skillsMap[skill] || 0) + 1;
      });
    }
    
    // Extract from job skills
    if (app.job?.skills) {
      app.job.skills.forEach(skill => {
        if (app.resumeSnapshot && app.resumeSnapshot.toLowerCase().includes(skill.toLowerCase())) {
          skillsMap[skill] = (skillsMap[skill] || 0) + 1;
        }
      });
    }
    
    // If no skills found, try to extract common skills from resume snapshot
    if (app.resumeSnapshot && Object.keys(skillsMap).length === 0) {
      const commonSkills = [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
        'Java', 'C#', 'SQL', 'AWS', 'Azure', 'Docker', 'Kubernetes',
        'Git', 'Agile', 'Scrum', 'REST API', 'GraphQL', 'HTML', 'CSS'
      ];
      
      commonSkills.forEach(skill => {
        if (app.resumeSnapshot!.toLowerCase().includes(skill.toLowerCase())) {
          skillsMap[skill] = (skillsMap[skill] || 0) + 1;
        }
      });
    }
  });
  
  // Convert to array and sort by count
  return Object.entries(skillsMap)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Extract companies applied to
 */
const extractCompanies = (applications: JobApplication[]): string[] => {
  const companies = new Set<string>();
  
  applications.forEach(app => {
    // Use app.company first, then try app.job?.company, then fallback to job title or unknown
    if (app.company) {
      companies.add(app.company);
    } else if (app.job?.company) {
      companies.add(app.job.company);
    } else if (app.jobTitle) {
      // If no company name is available, use job title as a fallback
      companies.add(`Unknown (${app.jobTitle})`);
    } else {
      // If neither company nor job title is available
      companies.add("Unknown Company");
    }
  });
  
  return Array.from(companies);
};

/**
 * Create application timeline
 */
const createApplicationTimeline = (applications: JobApplication[]): TimelinePoint[] => {
  // Group applications by date (YYYY-MM-DD)
  const dateMap: Record<string, number> = {};
  
  applications.forEach(app => {
    const date = app.appliedDate || app.appliedAt || app.updatedAt;
    if (date) {
      const dateKey = new Date(date).toISOString().split('T')[0];
      dateMap[dateKey] = (dateMap[dateKey] || 0) + 1;
    }
  });
  
  // Convert to array and sort by date
  return Object.entries(dateMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Create empty analytics data
 */
const createEmptyAnalyticsData = (): AnalyticsData => {
  return {
    totalApplications: 0,
    applicationsByStatus: [],
    pendingApplications: 0,
    successRate: 0,
    avgMatchScore: 0,
    topSkills: [],
    companiesAppliedTo: [],
    applicationTimeline: [],
  };
};