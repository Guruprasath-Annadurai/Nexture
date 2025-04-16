export interface Candidate {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  avgScore: number;
  skillsText: string;
  resumeText: string;
  applications: number;
  shortlistedBy: string[];
  timezone: string;
  yearsOfExperience: number;
  education: string;
  photo?: string;
}

export interface Interview {
  id: string;
  recruiterId: string;
  candidateId: string;
  candidateIds?: string[];
  time: string;
  method: string;
  message: string;
  createdAt: string;
  isGroup?: boolean;
  calendarInviteSent: boolean;
  duration: number;
  status: 'pending' | 'accepted' | 'declined';
  acceptUrl: string;
  declineUrl: string;
}

export interface InterviewTimeSuggestionRequest {
  resumeText: string;
  timezone: string;
  preferredSlots: string[];
}

export interface TimeSuggestion {
  time: string;
  confidence: number;
  reason: string;
}

export interface InterviewTimeSuggestionResponse {
  suggestions: TimeSuggestion[];
  timezoneMessage: string;
}

export interface DownloadLog {
  id: string;
  userId: string;
  userEmail: string;
  userPhoto?: string;
  date: string;
  count: number;
  reportType: string;
}

export interface EmailReport {
  id: string;
  userId: string;
  userEmail: string;
  sentDate: string;
  reportType: string;
  status: 'sent' | 'failed';
  openedAt?: string;
  clickedAt?: string;
}

export interface EmailReportPreference {
  weekly: boolean;
  monthly: boolean;
  applicationUpdates: boolean;
  jobRecommendations: boolean;
  careerTips: boolean;
}

export interface EmailReportStats {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  byReportType: {
    reportType: string;
    sent: number;
    opened: number;
    clicked: number;
  }[];
}