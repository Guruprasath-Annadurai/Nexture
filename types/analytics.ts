export interface AnalyticsData {
  totalApplications: number;
  applicationsByStatus: StatusCount[];
  pendingApplications: number;
  successRate: number;
  avgMatchScore: number;
  topSkills: SkillCount[];
  companiesAppliedTo: string[];
  applicationTimeline: TimelinePoint[];
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface SkillCount {
  skill: string;
  count: number;
}

export interface TimelinePoint {
  date: string;
  count: number;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  includeRejected?: boolean;
  includeWithdrawn?: boolean;
}

export interface AnalyticsSummary {
  totalApplications: number;
  activeApplications: number;
  successRate: number;
  responseRate: number;
  averageTimeToResponse: number;
  mostCommonRejectionReason: string;
}

export interface SkillGapAnalysis {
  missingSkills: SkillCount[];
  overqualifiedSkills: SkillCount[];
  recommendedSkills: string[];
}

export interface CompanyAnalytics {
  company: string;
  applications: number;
  responses: number;
  interviews: number;
  offers: number;
  averageResponseTime: number;
}

export interface LocationAnalytics {
  location: string;
  applications: number;
  successRate: number;
  averageSalary: number;
}

export interface SalaryAnalytics {
  averageOffered: number;
  medianOffered: number;
  salaryRange: [number, number];
  byIndustry: {
    industry: string;
    average: number;
  }[];
  byExperience: {
    yearsOfExperience: string;
    average: number;
  }[];
}

export interface TrendAnalytics {
  weeklyApplications: TimelinePoint[];
  weeklyResponses: TimelinePoint[];
  weeklyInterviews: TimelinePoint[];
  weeklyOffers: TimelinePoint[];
}

export interface ComparisonAnalytics {
  user: AnalyticsSummary;
  industry: AnalyticsSummary;
  difference: {
    totalApplications: number;
    successRate: number;
    responseRate: number;
    averageTimeToResponse: number;
  };
}

export interface EmailReportAnalytics {
  totalSent: number;
  openRate: number;
  clickRate: number;
  mostPopularReport: string;
}

export interface DownloadAnalytics {
  totalDownloads: number;
  byReportType: {
    reportType: string;
    count: number;
  }[];
  byDate: TimelinePoint[];
}

export interface ResumeAnalytics {
  totalResumes: number;
  mostUsedResume: string;
  mostSuccessfulResume: string;
  averageMatchScore: number;
  keywordOccurrences: {
    keyword: string;
    count: number;
  }[];
}

export interface InsightMessage {
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  actionable: boolean;
  action?: string;
}