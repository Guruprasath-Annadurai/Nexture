import { useAuthStore } from '@/stores/auth-store';
import { 
  Candidate, 
  Interview, 
  InterviewTimeSuggestionRequest, 
  InterviewTimeSuggestionResponse, 
  TimeSuggestion,
  DownloadLog,
  EmailReport,
  EmailReportPreference,
  EmailReportStats
} from '@/types/jobs';

// Base API URL - would be an environment variable in a real app
export const API_URL = 'https://api.nexture.app/v1';

export class APIError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Fetch wrapper with authentication and error handling
 */
export async function fetchAPI<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  // For demo purposes, we'll simulate API responses
  // In a real app, this would make actual network requests
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Get auth token if available and not skipping auth
  const token = !options.skipAuth ? useAuthStore.getState().token : null;
  
  // Prepare headers
  const headers = new Headers(options.headers);
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Mock API response based on endpoint and method
  return mockAPIResponse(endpoint, {
    ...options,
    headers,
  });
}

/**
 * Mock API responses for demo purposes
 */
async function mockAPIResponse<T>(endpoint: string, options: RequestInit): Promise<T> {
  const method = options.method || 'GET';
  
  // Auth endpoints
  if (endpoint === '/auth/login') {
    return handleLogin(options) as T;
  }
  
  if (endpoint === '/auth/admin-login') {
    return handleAdminLogin(options) as T;
  }
  
  if (endpoint === '/auth/register') {
    return handleRegister(options) as T;
  }
  
  if (endpoint === '/auth/refresh') {
    return handleRefreshToken(options) as T;
  }
  
  // User endpoints
  if (endpoint === '/user/profile') {
    if (method === 'GET') {
      return handleGetUserProfile() as T;
    } else if (method === 'PUT') {
      return handleUpdateUserProfile(options) as T;
    }
  }
  
  if (endpoint === '/user/download-stats') {
    return handleGetUserDownloadStats() as T;
  }

  if (endpoint === '/user/email-preferences') {
    if (method === 'GET') {
      return handleGetEmailPreferences() as T;
    } else if (method === 'PUT') {
      return handleUpdateEmailPreferences(options) as T;
    }
  }

  if (endpoint === '/user/email-reports') {
    return handleGetUserEmailReports() as T;
  }
  
  // Admin endpoints
  if (endpoint === '/admin/list-admins') {
    return handleListAdmins() as T;
  }
  
  if (endpoint === '/admin/promote') {
    return handlePromoteUser(options) as T;
  }
  
  if (endpoint === '/admin/demote') {
    return handleDemoteAdmin(options) as T;
  }
  
  if (endpoint === '/admin/download-logs') {
    return handleGetDownloadLogs() as T;
  }

  if (endpoint === '/admin/email-reports') {
    return handleGetEmailReports() as T;
  }

  if (endpoint === '/admin/email-report-stats') {
    return handleGetEmailReportStats() as T;
  }
  
  // Calendar endpoints
  if (endpoint === '/calendar/events') {
    if (method === 'GET') {
      return handleGetCalendarEvents() as T;
    } else if (method === 'POST') {
      return handleCreateCalendarEvent(options) as T;
    }
  }
  
  if (endpoint.match(/\/calendar\/events\/\w+/) && method === 'PUT') {
    return handleUpdateCalendarEvent(endpoint, options) as T;
  }
  
  if (endpoint.match(/\/calendar\/events\/\w+/) && method === 'DELETE') {
    return handleDeleteCalendarEvent(endpoint) as T;
  }
  
  // Recruiter endpoints
  if (endpoint.match(/\/recruiter\/candidates/)) {
    return handleGetCandidates(endpoint) as T;
  }
  
  if (endpoint === '/recruiter/shortlist' && method === 'POST') {
    return handleShortlistCandidate(options) as T;
  }
  
  if (endpoint === '/interview/schedule' && method === 'POST') {
    return handleScheduleInterview(options) as T;
  }

  if (endpoint === '/interview/suggest-time' && method === 'POST') {
    return handleSuggestInterviewTime(options) as T;
  }
  
  if (endpoint === '/interview/suggest-duration' && method === 'POST') {
    return handleSuggestInterviewDuration(options) as T;
  }
  
  if (endpoint.match(/\/interview\/respond\/\w+/) && method === 'POST') {
    return handleInterviewResponse(endpoint, options) as T;
  }
  
  if (endpoint.match(/\/recruiter\/candidate\/\w+/) && method === 'GET') {
    return handleGetCandidateDetails(endpoint) as T;
  }
  
  if (endpoint === '/recruiter/stats') {
    return handleGetRecruiterStats() as T;
  }
  
  if (endpoint.match(/\/recruiter\/compare-candidates/)) {
    return handleCompareCandidates(endpoint) as T;
  }
  
  // If no mock handler is found, throw a 404 error
  throw new APIError('Endpoint not found', 404);
}

/**
 * Mock login handler
 */
function handleLogin(options: RequestInit) {
  try {
    const body = JSON.parse(options.body as string);
    const { email, password } = body;
    
    // Validate credentials (for demo, we accept any non-empty values)
    if (!email || !password) {
      throw new APIError('Email and password are required', 400);
    }
    
    // For demo, we'll accept specific credentials
    if (email === 'user@example.com' && password === 'password123') {
      return {
        token: 'mock-user-token-123',
        user: {
          id: 'user123',
          email: 'user@example.com',
          firstName: 'Demo',
          lastName: 'User',
          name: 'Demo User',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          photo: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
      };
    }
    
    // Simulate failed login
    throw new APIError('Invalid credentials', 401);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Invalid request format', 400);
  }
}

/**
 * Mock admin login handler
 */
function handleAdminLogin(options: RequestInit) {
  try {
    const body = JSON.parse(options.body as string);
    const { email, password } = body;
    
    // Validate credentials
    if (!email || !password) {
      throw new APIError('Email and password are required', 400);
    }
    
    // For demo, accept admin credentials
    if (email === 'admin@nexture.com' && password === 'admin123') {
      return {
        token: 'mock-admin-token-456',
        user: {
          id: 'admin456',
          email: 'admin@nexture.com',
          firstName: 'Admin',
          lastName: 'User',
          name: 'Admin User',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          photo: 'https://randomuser.me/api/portraits/men/44.jpg'
        },
      };
    }
    
    // For demo, accept superadmin credentials
    if (email === 'superadmin@nexture.com' && password === 'super123') {
      return {
        token: 'mock-superadmin-token-789',
        user: {
          id: 'super789',
          email: 'superadmin@nexture.com',
          firstName: 'Super',
          lastName: 'Admin',
          name: 'Super Admin',
          role: 'superadmin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          photo: 'https://randomuser.me/api/portraits/men/68.jpg'
        },
      };
    }
    
    // For demo, accept recruiter credentials
    if (email === 'recruiter@nexture.com' && password === 'recruiter123') {
      return {
        token: 'mock-recruiter-token-101',
        user: {
          id: 'recruiter101',
          email: 'recruiter@nexture.com',
          firstName: 'Recruiter',
          lastName: 'User',
          name: 'Recruiter User',
          role: 'recruiter',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          photo: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
      };
    }
    
    // Simulate failed login
    throw new APIError('Invalid admin credentials', 401);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Invalid request format', 400);
  }
}

/**
 * Mock register handler
 */
function handleRegister(options: RequestInit) {
  try {
    const body = JSON.parse(options.body as string);
    const { email, password, firstName, lastName, name } = body;
    
    // Validate input
    if (!email || !password) {
      throw new APIError('Email and password are required', 400);
    }
    
    // For demo, we'll accept any valid registration
    // Parse name into firstName and lastName if provided
    let userFirstName = firstName;
    let userLastName = lastName;
    
    if (!userFirstName && name) {
      const nameParts = name.split(' ');
      userFirstName = nameParts[0];
      userLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    }
    
    return {
      token: 'mock-new-user-token-999',
      user: {
        id: 'user999',
        email,
        firstName: userFirstName || email.split('@')[0],
        lastName: userLastName || '',
        name: name || (userFirstName && userLastName ? `${userFirstName} ${userLastName}` : email.split('@')[0]),
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      },
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Invalid request format', 400);
  }
}

/**
 * Mock token refresh handler
 */
function handleRefreshToken(options: RequestInit) {
  // In a real app, we would validate the refresh token
  // For demo, we'll just return a new token
  
  // Get the current user from auth store
  const { user } = useAuthStore.getState();
  
  if (!user) {
    throw new APIError('No user found', 401);
  }
  
  return {
    token: `mock-refreshed-token-${Date.now()}`,
    user,
  };
}

/**
 * Mock get user profile handler
 */
function handleGetUserProfile() {
  // Get the current user from auth store
  const { user } = useAuthStore.getState();
  
  if (!user) {
    throw new APIError('No user found', 401);
  }
  
  // Add additional profile information
  return {
    user: {
      ...user,
      bio: 'Software developer with a passion for building great products.',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      website: 'https://example.com',
      jobTitle: 'Senior Software Developer',
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'GraphQL'],
      social: {
        linkedin: 'https://linkedin.com/in/demouser',
        twitter: 'https://twitter.com/demouser',
        github: 'https://github.com/demouser'
      },
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of California, Berkeley',
          year: '2018'
        }
      ],
      experience: [
        {
          title: 'Senior Software Developer',
          company: 'Tech Innovations Inc.',
          startDate: '2020-01-01',
          description: 'Leading frontend development for enterprise applications.'
        },
        {
          title: 'Software Developer',
          company: 'StartUp Co.',
          startDate: '2018-06-01',
          endDate: '2019-12-31',
          description: 'Full-stack development for consumer-facing web applications.'
        }
      ]
    }
  };
}

/**
 * Mock update user profile handler
 */
function handleUpdateUserProfile(options: RequestInit) {
  try {
    const body = JSON.parse(options.body as string);
    
    // Get the current user from auth store
    const { user } = useAuthStore.getState();
    
    if (!user) {
      throw new APIError('No user found', 401);
    }
    
    // Update the user profile
    const updatedUser = {
      ...user,
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    // In a real app, we would send an email confirmation here
    
    return {
      user: updatedUser,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Invalid request format', 400);
  }
}

/**
 * Mock list admins handler
 */
function handleListAdmins() {
  // For demo, return a list of mock admins
  return {
    admins: [
      {
        id: 'admin456',
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@nexture.com',
        role: 'admin',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        photo: 'https://randomuser.me/api/portraits/men/44.jpg'
      },
      {
        id: 'super789',
        name: 'Super Admin',
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@nexture.com',
        role: 'superadmin',
        createdAt: '2022-11-05T08:15:00Z',
        updatedAt: '2022-11-05T08:15:00Z',
        photo: 'https://randomuser.me/api/portraits/men/68.jpg'
      },
      {
        id: 'admin101',
        name: 'Marketing Admin',
        firstName: 'Marketing',
        lastName: 'Admin',
        email: 'marketing@nexture.com',
        role: 'admin',
        createdAt: '2023-03-22T14:45:00Z',
        updatedAt: '2023-03-22T14:45:00Z',
        photo: 'https://randomuser.me/api/portraits/women/28.jpg'
      },
      {
        id: 'recruiter101',
        name: 'Recruiter User',
        firstName: 'Recruiter',
        lastName: 'User',
        email: 'recruiter@nexture.com',
        role: 'recruiter',
        createdAt: '2023-05-10T09:20:00Z',
        updatedAt: '2023-05-10T09:20:00Z',
        photo: 'https://randomuser.me/api/portraits/women/44.jpg'
      },
      {
        id: 'user123',
        name: 'Regular User',
        firstName: 'Regular',
        lastName: 'User',
        email: 'user@example.com',
        role: 'user',
        createdAt: '2023-05-10T09:20:00Z',
        updatedAt: '2023-05-10T09:20:00Z',
        photo: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      {
        id: 'user456',
        name: 'Another User',
        firstName: 'Another',
        lastName: 'User',
        email: 'another@example.com',
        role: 'user',
        createdAt: '2023-06-18T11:30:00Z',
        updatedAt: '2023-06-18T11:30:00Z',
        photo: 'https://randomuser.me/api/portraits/women/32.jpg'
      },
    ],
  };
}

/**
 * Mock get download logs handler
 */
function handleGetDownloadLogs() {
  // For demo, return a list of mock download logs
  return {
    logs: [
      {
        id: 'log1',
        userId: 'user123',
        userEmail: 'user@example.com',
        userPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
        date: '2023-06-15T10:30:00Z',
        count: 3,
        reportType: 'Job Match History'
      },
      {
        id: 'log2',
        userId: 'user456',
        userEmail: 'another@example.com',
        userPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
        date: '2023-06-14T15:45:00Z',
        count: 1,
        reportType: 'Resume Analysis'
      },
      {
        id: 'log3',
        userId: 'user789',
        userEmail: 'jane.doe@example.com',
        userPhoto: 'https://randomuser.me/api/portraits/women/68.jpg',
        date: '2023-06-12T09:15:00Z',
        count: 5,
        reportType: 'Application Status'
      },
      {
        id: 'log4',
        userId: 'user123',
        userEmail: 'user@example.com',
        userPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
        date: '2023-06-10T14:20:00Z',
        count: 2,
        reportType: 'Job Match History'
      },
      {
        id: 'log5',
        userId: 'user101',
        userEmail: 'robert.smith@example.com',
        date: '2023-06-08T11:05:00Z',
        count: 1,
        reportType: 'Skills Assessment'
      }
    ]
  };
}

/**
 * Mock get email reports handler
 */
function handleGetEmailReports() {
  // For demo, return a list of mock email reports
  return {
    reports: [
      {
        id: 'report1',
        userId: 'user123',
        userEmail: 'user@example.com',
        sentDate: '2023-06-19T09:00:00Z',
        reportType: 'Weekly Career Summary',
        status: 'sent',
        openedAt: '2023-06-19T10:15:00Z',
        clickedAt: '2023-06-19T10:20:00Z'
      },
      {
        id: 'report2',
        userId: 'user456',
        userEmail: 'another@example.com',
        sentDate: '2023-06-19T09:00:00Z',
        reportType: 'Weekly Career Summary',
        status: 'sent',
        openedAt: '2023-06-19T14:30:00Z'
      },
      {
        id: 'report3',
        userId: 'user789',
        userEmail: 'jane.doe@example.com',
        sentDate: '2023-06-19T09:00:00Z',
        reportType: 'Weekly Career Summary',
        status: 'failed'
      },
      {
        id: 'report4',
        userId: 'user123',
        userEmail: 'user@example.com',
        sentDate: '2023-06-12T09:00:00Z',
        reportType: 'Weekly Career Summary',
        status: 'sent',
        openedAt: '2023-06-12T11:45:00Z',
        clickedAt: '2023-06-12T11:50:00Z'
      },
      {
        id: 'report5',
        userId: 'user456',
        userEmail: 'another@example.com',
        sentDate: '2023-06-12T09:00:00Z',
        reportType: 'Weekly Career Summary',
        status: 'sent'
      },
      {
        id: 'report6',
        userId: 'user123',
        userEmail: 'user@example.com',
        sentDate: '2023-06-05T09:00:00Z',
        reportType: 'Weekly Career Summary',
        status: 'sent',
        openedAt: '2023-06-05T09:30:00Z'
      },
      {
        id: 'report7',
        userId: 'user101',
        userEmail: 'robert.smith@example.com',
        sentDate: '2023-06-01T09:00:00Z',
        reportType: 'Monthly Application Analysis',
        status: 'sent',
        openedAt: '2023-06-01T10:05:00Z',
        clickedAt: '2023-06-01T10:10:00Z'
      }
    ]
  };
}

/**
 * Mock get email report stats handler
 */
function handleGetEmailReportStats() {
  // For demo, return mock email report stats
  return {
    stats: {
      totalSent: 120,
      totalOpened: 84,
      totalClicked: 52,
      openRate: 70, // percentage
      clickRate: 43, // percentage
      byReportType: [
        {
          reportType: 'Weekly Career Summary',
          sent: 80,
          opened: 60,
          clicked: 35
        },
        {
          reportType: 'Monthly Application Analysis',
          sent: 20,
          opened: 15,
          clicked: 10
        },
        {
          reportType: 'Job Recommendations',
          sent: 15,
          opened: 8,
          clicked: 6
        },
        {
          reportType: 'Career Tips',
          sent: 5,
          opened: 1,
          clicked: 1
        }
      ]
    }
  };
}

/**
 * Mock get user download stats handler
 */
function handleGetUserDownloadStats() {
  // For demo, return mock download stats for the current user
  return {
    stats: {
      totalDownloads: 12,
      recentDownloads: [
        {
          id: 'download1',
          date: '2023-06-15T10:30:00Z',
          reportType: 'Job Match History'
        },
        {
          id: 'download2',
          date: '2023-06-14T15:45:00Z',
          reportType: 'Resume Analysis'
        },
        {
          id: 'download3',
          date: '2023-06-12T09:15:00Z',
          reportType: 'Application Status'
        },
        {
          id: 'download4',
          date: '2023-06-10T14:20:00Z',
          reportType: 'Skills Assessment'
        }
      ],
      downloadsByType: [
        {
          reportType: 'Job Match History',
          count: 5
        },
        {
          reportType: 'Resume Analysis',
          count: 3
        },
        {
          reportType: 'Application Status',
          count: 2
        },
        {
          reportType: 'Skills Assessment',
          count: 2
        }
      ]
    }
  };
}

/**
 * Mock get user email reports handler
 */
function handleGetUserEmailReports() {
  // For demo, return mock email reports for the current user
  return {
    reports: [
      {
        id: 'report1',
        sentDate: '2023-06-19T09:00:00Z',
        reportType: 'Weekly Career Summary',
        status: 'sent',
        openedAt: '2023-06-19T10:15:00Z'
      },
      {
        id: 'report4',
        sentDate: '2023-06-12T09:00:00Z',
        reportType: 'Weekly Career Summary',
        status: 'sent',
        openedAt: '2023-06-12T11:45:00Z'
      },
      {
        id: 'report6',
        sentDate: '2023-06-05T09:00:00Z',
        reportType: 'Weekly Career Summary',
        status: 'sent',
        openedAt: '2023-06-05T09:30:00Z'
      },
      {
        id: 'report8',
        sentDate: '2023-05-29T09:00:00Z',
        reportType: 'Weekly Career Summary',
        status: 'sent'
      },
      {
        id: 'report9',
        sentDate: '2023-05-01T09:00:00Z',
        reportType: 'Monthly Application Analysis',
        status: 'sent',
        openedAt: '2023-05-01T13:20:00Z'
      }
    ]
  };
}

/**
 * Mock get email preferences handler
 */
function handleGetEmailPreferences() {
  // For demo, return mock email preferences for the current user
  return {
    preferences: {
      weekly: true,
      monthly: true,
      applicationUpdates: true,
      jobRecommendations: false,
      careerTips: true
    }
  };
}

/**
 * Mock update email preferences handler
 */
function handleUpdateEmailPreferences(options: RequestInit) {
  try {
    const body = JSON.parse(options.body as string);
    const { preferences } = body;
    
    // Validate input
    if (!preferences) {
      throw new APIError('Preferences are required', 400);
    }
    
    // For demo, return the updated preferences
    return {
      success: true,
      message: 'Email preferences updated successfully',
      preferences
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Invalid request format', 400);
  }
}

/**
 * Mock promote user handler
 */
function handlePromoteUser(options: RequestInit) {
  try {
    const body = JSON.parse(options.body as string);
    const { email, role } = body;
    
    // Validate input
    if (!email) {
      throw new APIError('Email is required', 400);
    }
    
    if (role !== 'admin' && role !== 'superadmin' && role !== 'recruiter') {
      throw new APIError('Invalid role', 400);
    }
    
    // For demo, we'll accept any promotion
    return {
      success: true,
      message: `User ${email} has been promoted to ${role}`,
      user: {
        id: `user${Date.now()}`,
        email,
        firstName: email.split('@')[0],
        lastName: '',
        name: email.split('@')[0],
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Invalid request format', 400);
  }
}

/**
 * Mock demote admin handler
 */
function handleDemoteAdmin(options: RequestInit) {
  try {
    const body = JSON.parse(options.body as string);
    const { adminId } = body;
    
    // Validate input
    if (!adminId) {
      throw new APIError('Admin ID is required', 400);
    }
    
    // For demo, we'll accept any demotion
    return {
      success: true,
      message: 'Admin has been demoted to a regular user',
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Invalid request format', 400);
  }
}

/**
 * Mock get calendar events handler
 */
function handleGetCalendarEvents() {
  // For demo, return mock calendar events
  return {
    events: [
      {
        id: 'event1',
        title: 'Interview with Acme Corp',
        description: 'Technical interview for Senior Developer position',
        startTime: '2023-06-15T10:00:00Z',
        endTime: '2023-06-15T11:30:00Z',
        location: 'Online - Zoom',
        type: 'interview',
        userId: 'user123',
        createdAt: '2023-06-10T08:00:00Z',
        updatedAt: '2023-06-10T08:00:00Z'
      },
      {
        id: 'event2',
        title: 'Resume Submission Deadline',
        description: 'Last day to submit resume for TechStart position',
        startTime: '2023-06-20T23:59:00Z',
        endTime: '2023-06-20T23:59:00Z',
        type: 'deadline',
        userId: 'user123',
        createdAt: '2023-06-12T14:30:00Z',
        updatedAt: '2023-06-12T14:30:00Z'
      },
    ]
  };
}

/**
 * Mock create calendar event handler
 */
function handleCreateCalendarEvent(options: RequestInit) {
  try {
    const body = JSON.parse(options.body as string);
    const { title, description, startTime, endTime, location, type } = body;
    
    // Validate input
    if (!title || !startTime || !endTime) {
      throw new APIError('Title, start time, and end time are required', 400);
    }
    
    // For demo, create a mock event
    const newEvent = {
      id: `event-${Date.now()}`,
      title,
      description,
      startTime,
      endTime,
      location,
      type: type || 'other',
      userId: 'user123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return { event: newEvent };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Invalid request format', 400);
  }
}

/**
 * Mock update calendar event handler
 */
function handleUpdateCalendarEvent(endpoint: string, options: RequestInit) {
  try {
    const eventId = endpoint.split('/').pop();
    const body = JSON.parse(options.body as string);
    
    // For demo, return updated event
    return {
      event: {
        id: eventId,
        ...body,
        userId: 'user123',
        updatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Invalid request format', 400);
  }
}

/**
 * Mock delete calendar event handler
 */
function handleDeleteCalendarEvent(endpoint: string) {
  const eventId = endpoint.split('/').pop();
  
  // For demo, return success
  return {
    success: true,
    message: `Event ${eventId} has been deleted`
  };
}

/**
 * Mock get candidates handler
 */
function handleGetCandidates(endpoint: string) {
  // Parse query parameters
  const url = new URL(`https://example.com${endpoint}`);
  const skill = url.searchParams.get('skill') || '';
  const minScore = url.searchParams.get('minScore') || '0';
  
  // Mock candidates data
  const candidates: Candidate[] = [
    {
      id: 'user1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      avgScore: 85,
      skillsText: 'react javascript typescript node.js express mongodb',
      resumeText: 'Experienced frontend developer with 5 years of experience in React and TypeScript.',
      applications: 7,
      shortlistedBy: ['admin456'],
      timezone: 'America/New_York',
      yearsOfExperience: 5,
      education: 'Bachelor of Science in Computer Science',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 'user2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      firstName: 'Jane',
      lastName: 'Smith',
      avgScore: 92,
      skillsText: 'python django flask machine learning data science',
      resumeText: 'Data scientist with expertise in Python, machine learning, and statistical analysis.',
      applications: 4,
      shortlistedBy: [],
      timezone: 'Europe/London',
      yearsOfExperience: 3,
      education: 'Master of Science in Data Science',
      photo: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 'user3',
      email: 'mike.johnson@example.com',
      name: 'Mike Johnson',
      firstName: 'Mike',
      lastName: 'Johnson',
      avgScore: 78,
      skillsText: 'java spring hibernate sql oracle',
      resumeText: 'Backend developer with Java and Spring Boot experience.',
      applications: 5,
      shortlistedBy: [],
      timezone: 'Asia/Tokyo',
      yearsOfExperience: 7,
      education: 'Bachelor of Engineering in Software Engineering',
      photo: 'https://randomuser.me/api/portraits/men/68.jpg'
    },
    {
      id: 'user4',
      email: 'sarah.williams@example.com',
      name: 'Sarah Williams',
      firstName: 'Sarah',
      lastName: 'Williams',
      avgScore: 88,
      skillsText: 'react react-native javascript mobile ios android',
      resumeText: 'Mobile developer specializing in React Native for cross-platform applications.',
      applications: 3,
      shortlistedBy: ['admin456'],
      timezone: 'America/Los_Angeles',
      yearsOfExperience: 4,
      education: 'Bachelor of Science in Computer Science',
      photo: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    {
      id: 'user5',
      email: 'david.brown@example.com',
      name: 'David Brown',
      firstName: 'David',
      lastName: 'Brown',
      avgScore: 72,
      skillsText: 'c# .net asp.net sql-server azure',
      resumeText: 'Full-stack developer with .NET and Azure cloud experience.',
      applications: 6,
      shortlistedBy: [],
      timezone: 'Europe/Berlin',
      yearsOfExperience: 6,
      education: 'Master of Science in Software Engineering',
      photo: 'https://randomuser.me/api/portraits/men/44.jpg'
    },
    {
      id: 'user6',
      email: 'emily.davis@example.com',
      name: 'Emily Davis',
      firstName: 'Emily',
      lastName: 'Davis',
      avgScore: 95,
      skillsText: 'ui/ux figma sketch adobe-xd user-research',
      resumeText: 'UI/UX designer with a focus on user-centered design and research.',
      applications: 2,
      shortlistedBy: [],
      timezone: 'Australia/Sydney',
      yearsOfExperience: 5,
      education: 'Bachelor of Design in Interaction Design',
      photo: 'https://randomuser.me/api/portraits/women/28.jpg'
    },
    {
      id: 'user7',
      email: 'alex.wilson@example.com',
      name: 'Alex Wilson',
      firstName: 'Alex',
      lastName: 'Wilson',
      avgScore: 81,
      skillsText: 'devops kubernetes docker aws ci/cd jenkins',
      resumeText: 'DevOps engineer with expertise in containerization and cloud infrastructure.',
      applications: 4,
      shortlistedBy: [],
      timezone: 'Asia/Singapore',
      yearsOfExperience: 8,
      education: 'Bachelor of Science in Information Technology',
      photo: 'https://randomuser.me/api/portraits/men/28.jpg'
    }
  ];
  
  // Filter candidates based on query parameters
  const filtered = candidates.filter(candidate => 
    (!skill || candidate.skillsText.toLowerCase().includes(skill.toLowerCase())) &&
    (candidate.avgScore >= parseInt(minScore))
  );
  
  return { candidates: filtered };
}

/**
 * Mock shortlist candidate handler
 */
function handleShortlistCandidate(options: RequestInit) {
  try {
    const body = JSON.parse(options.body as string);
    const { userId } = body;
    
    // Validate input
    if (!userId) {
      throw new APIError('User ID is required', 400);
    }
    
    // Get current user ID (admin/recruiter)
    const { user } = useAuthStore.getState();
    
    if (!user) {
      throw new APIError('Not authenticated', 401);
    }
    
    // For demo, return success
    return {
      success: true,
      message: 'Candidate has been shortlisted'
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Invalid request format', 400);
  }
}

/**
 * Mock schedule interview handler
 */
function handleScheduleInterview(options: RequestInit) {
  try {
    const body = JSON.parse(options.body as string);
    const { 
      candidateId, 
      candidateIds, 
      time, 
      method, 
      message, 
      sendCalendarInvite, 
      isGroup,
      duration 
    } = body;
    
    // Validate input for single interview
    if (!isGroup && !candidateId) {
      throw new APIError('Candidate ID is required for single interviews', 400);
    }
    
    // Validate input for group interview
    if (isGroup && (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0)) {
      throw new APIError('Candidate IDs array is required for group interviews', 400);
    }
    
    if (!time || !method) {
      throw new APIError('Time and method are required', 400);
    }
    
    // Get current user ID (admin/recruiter)
    const { user } = useAuthStore.getState();
    
    if (!user) {
      throw new APIError('Not authenticated', 401);
    }
    
    // Generate accept/decline URLs
    const interviewId = `interview-${Date.now()}`;
    const baseUrl = 'https://nexture.app/interview/respond';
    const acceptUrl = `${baseUrl}/${interviewId}?response=accept`;
    const declineUrl = `${baseUrl}/${interviewId}?response=decline`;
    
    // For demo, create a mock interview
    const interview: Interview = {
      id: interviewId,
      recruiterId: user.id,
      candidateId: isGroup ? '' : candidateId,
      candidateIds: isGroup ? candidateIds : undefined,
      time,
      method,
      message: message || '',
      createdAt: new Date().toISOString(),
      isGroup: isGroup || false,
      calendarInviteSent: sendCalendarInvite || false,
      duration: duration || 30, // Default to 30 minutes if not specified
      status: 'pending',
      acceptUrl,
      declineUrl
    };
    
    // In a real app, we would send calendar invites here
    // For demo, we'll just return a success message
    const calendarInviteMessage = sendCalendarInvite 
      ? 'Calendar invite has been sent to the candidate(s).' 
      : '';
    
    return { 
      interview,
      message: `Interview scheduled successfully. ${calendarInviteMessage}`,
      calendarInviteSent: sendCalendarInvite || false,
      acceptUrl,
      declineUrl
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Invalid request format', 400);
  }
}

/**
 * Mock suggest interview time handler
 */
function handleSuggestInterviewTime(options: RequestInit) {
  try {
    const body = JSON.parse(options.body as string) as InterviewTimeSuggestionRequest;
    const { resumeText, timezone, preferredSlots } = body;
    
    // Validate input
    if (!resumeText || !timezone || !preferredSlots || !Array.isArray(preferredSlots)) {
      throw new APIError('Resume text, timezone, and preferred slots are required', 400);
    }
    
    // For demo, generate mock suggestions based on resume content
    const suggestions: TimeSuggestion[] = [];
    
    // Check if resume contains certain keywords to determine profession
    const isDeveloper = resumeText.toLowerCase().includes('developer') || 
                        resumeText.toLowerCase().includes('engineer') ||
                        resumeText.toLowerCase().includes('programming');
    
    const isDesigner = resumeText.toLowerCase().includes('design') || 
                       resumeText.toLowerCase().includes('ui') || 
                       resumeText.toLowerCase().includes('ux');
    
    const isDataScientist = resumeText.toLowerCase().includes('data') || 
                           resumeText.toLowerCase().includes('machine learning') || 
                           resumeText.toLowerCase().includes('analytics');
    
    // Generate suggestions based on profession
    if (isDeveloper) {
      // Developers often prefer afternoon slots
      const afternoonSlots = preferredSlots.filter(slot => 
        slot.includes('pm') || 
        (slot.includes('am') && parseInt(slot.split('am')[0].trim()) >= 10)
      );
      
      if (afternoonSlots.length > 0) {
        suggestions.push({
          time: afternoonSlots[0],
          confidence: 0.85,
          reason: 'Software developers often prefer afternoon slots for interviews as they tend to be more productive later in the day.'
        });
        
        if (afternoonSlots.length > 1) {
          suggestions.push({
            time: afternoonSlots[1],
            confidence: 0.75,
            reason: 'This is another good afternoon slot that works well for technical interviews.'
          });
        }
      }
    } else if (isDesigner) {
      // Designers often prefer mid-day slots
      const middaySlots = preferredSlots.filter(slot => 
        slot.includes('11am') || 
        slot.includes('12pm') || 
        slot.includes('1pm') || 
        slot.includes('2pm')
      );
      
      if (middaySlots.length > 0) {
        suggestions.push({
          time: middaySlots[0],
          confidence: 0.82,
          reason: 'Designers often prefer mid-day slots when their creative energy is at its peak.'
        });
        
        if (middaySlots.length > 1) {
          suggestions.push({
            time: middaySlots[1],
            confidence: 0.78,
            reason: 'This is another good mid-day slot that works well for creative professionals.'
          });
        }
      }
    } else if (isDataScientist) {
      // Data scientists often prefer morning slots
      const morningSlots = preferredSlots.filter(slot => 
        slot.includes('am') && parseInt(slot.split('am')[0].trim()) < 12
      );
      
      if (morningSlots.length > 0) {
        suggestions.push({
          time: morningSlots[0],
          confidence: 0.88,
          reason: 'Data scientists often prefer morning slots when analytical thinking is at its best.'
        });
        
        if (morningSlots.length > 1) {
          suggestions.push({
            time: morningSlots[1],
            confidence: 0.76,
            reason: 'This is another good morning slot that works well for analytical discussions.'
          });
        }
      }
    }
    
    // If we couldn't generate profession-specific suggestions, provide generic ones
    if (suggestions.length === 0) {
      // Pick two random slots from the preferred slots
      const randomSlots = [...preferredSlots].sort(() => 0.5 - Math.random()).slice(0, 2);
      
      suggestions.push({
        time: randomSlots[0],
        confidence: 0.7,
        reason: 'This time slot generally works well for most candidates based on their timezone.'
      });
      
      if (randomSlots.length > 1) {
        suggestions.push({
          time: randomSlots[1],
          confidence: 0.65,
          reason: 'This is another good option that aligns with standard business hours in the candidate\'s timezone.'
        });
      }
    }
    
    // Add timezone adjustment message
    const timezoneMessage = `Based on the candidate's timezone (${timezone}), these times are adjusted to be during their business hours.`;
    
    return {
      suggestions,
      timezoneMessage
    } as InterviewTimeSuggestionResponse;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Invalid request format', 400);
  }
}

/**
 * Mock suggest interview duration handler
 */
function handleSuggestInterviewDuration(options: RequestInit) {
  try {
    const body = JSON.parse(options.body as string);
    const { jobTitle, resumeText } = body;
    
    // Validate input
    if (!jobTitle || !resumeText) {
      throw new APIError('Job title and resume text are required', 400);
    }
    
    // Determine appropriate duration based on job title and resume content
    let suggestedDuration: number;
    
    // Check if job title or resume contains certain keywords
    const isExecutive = jobTitle.toLowerCase().includes('director') || 
                       jobTitle.toLowerCase().includes('chief') || 
                       jobTitle.toLowerCase().includes('head') ||
                       jobTitle.toLowerCase().includes('lead') ||
                       resumeText.toLowerCase().includes('executive');
    
    const isTechnical = jobTitle.toLowerCase().includes('developer') || 
                       jobTitle.toLowerCase().includes('engineer') || 
                       jobTitle.toLowerCase().includes('architect') ||
                       resumeText.toLowerCase().includes('technical') ||
                       resumeText.toLowerCase().includes('programming');
    
    const isDesign = jobTitle.toLowerCase().includes('design') || 
                    jobTitle.toLowerCase().includes('ux') || 
                    jobTitle.toLowerCase().includes('ui') ||
                    resumeText.toLowerCase().includes('design');
    
    const isEntry = jobTitle.toLowerCase().includes('junior') || 
                   jobTitle.toLowerCase().includes('intern') || 
                   jobTitle.toLowerCase().includes('assistant') ||
                   resumeText.toLowerCase().includes('graduate') ||
                   resumeText.toLowerCase().includes('entry');
    
    if (isExecutive) {
      suggestedDuration = 60; // Executive roles typically need longer interviews
    } else if (isTechnical) {
      suggestedDuration = 45; // Technical roles need time for technical questions
    } else if (isDesign) {
      suggestedDuration = 45; // Design roles need time for portfolio review
    } else if (isEntry) {
      suggestedDuration = 30; // Entry-level roles typically need shorter interviews
    } else {
      suggestedDuration = 30; // Default duration
    }
    
    return {
      suggestedDuration,
      explanation: getExplanationForDuration(suggestedDuration, jobTitle)
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Invalid request format', 400);
  }
}

/**
 * Helper function to get explanation for suggested duration
 */
function getExplanationForDuration(duration: number, jobTitle: string): string {
  switch (duration) {
    case 15:
      return `A 15-minute interview is recommended for initial screening of ${jobTitle} candidates. This is enough time to assess basic qualifications and cultural fit.`;
    case 30:
      return `A 30-minute interview is recommended for ${jobTitle} positions. This provides enough time for standard questions while respecting everyone's schedule.`;
    case 45:
      return `A 45-minute interview is recommended for ${jobTitle} roles. This allows time for in-depth technical questions and discussion of past experience.`;
    case 60:
      return `A 60-minute interview is recommended for ${jobTitle} positions. This provides ample time for comprehensive evaluation including technical assessment and behavioral questions.`;
    case 90:
      return `A 90-minute interview is recommended for senior ${jobTitle} roles. This extended format allows for thorough technical evaluation, case studies, and detailed discussion of leadership experience.`;
    default:
      return `A ${duration}-minute interview is recommended for ${jobTitle} positions based on industry standards.`;
  }
}

/**
 * Mock interview response handler
 */
function handleInterviewResponse(endpoint: string, options: RequestInit) {
  try {
    const interviewId = endpoint.split('/').pop()?.split('?')[0];
    const body = JSON.parse(options.body as string);
    const { response } = body;
    
    // Validate input
    if (!interviewId) {
      throw new APIError('Interview ID is required', 400);
    }
    
    if (response !== 'accepted' && response !== 'declined') {
      throw new APIError('Invalid response. Must be "accepted" or "declined"', 400);
    }
    
    // For demo, return success
    return {
      success: true,
      message: `Interview ${response === 'accepted' ? 'accepted' : 'declined'} successfully`,
      status: response
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Invalid request format', 400);
  }
}

/**
 * Mock get candidate details handler
 */
function handleGetCandidateDetails(endpoint: string) {
  const candidateId = endpoint.split('/').pop();
  
  // Mock candidates data (same as in handleGetCandidates)
  const candidates: Candidate[] = [
    {
      id: 'user1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      avgScore: 85,
      skillsText: 'react javascript typescript node.js express mongodb',
      resumeText: 'Experienced frontend developer with 5 years of experience in React and TypeScript.',
      applications: 7,
      shortlistedBy: ['admin456'],
      timezone: 'America/New_York',
      yearsOfExperience: 5,
      education: 'Bachelor of Science in Computer Science',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 'user2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      firstName: 'Jane',
      lastName: 'Smith',
      avgScore: 92,
      skillsText: 'python django flask machine learning data science',
      resumeText: 'Data scientist with expertise in Python, machine learning, and statistical analysis.',
      applications: 4,
      shortlistedBy: [],
      timezone: 'Europe/London',
      yearsOfExperience: 3,
      education: 'Master of Science in Data Science',
      photo: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 'user3',
      email: 'mike.johnson@example.com',
      name: 'Mike Johnson',
      firstName: 'Mike',
      lastName: 'Johnson',
      avgScore: 78,
      skillsText: 'java spring hibernate sql oracle',
      resumeText: 'Backend developer with Java and Spring Boot experience.',
      applications: 5,
      shortlistedBy: [],
      timezone: 'Asia/Tokyo',
      yearsOfExperience: 7,
      education: 'Bachelor of Engineering in Software Engineering',
      photo: 'https://randomuser.me/api/portraits/men/68.jpg'
    },
    {
      id: 'user4',
      email: 'sarah.williams@example.com',
      name: 'Sarah Williams',
      firstName: 'Sarah',
      lastName: 'Williams',
      avgScore: 88,
      skillsText: 'react react-native javascript mobile ios android',
      resumeText: 'Mobile developer specializing in React Native for cross-platform applications.',
      applications: 3,
      shortlistedBy: ['admin456'],
      timezone: 'America/Los_Angeles',
      yearsOfExperience: 4,
      education: 'Bachelor of Science in Computer Science',
      photo: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    {
      id: 'user5',
      email: 'david.brown@example.com',
      name: 'David Brown',
      firstName: 'David',
      lastName: 'Brown',
      avgScore: 72,
      skillsText: 'c# .net asp.net sql-server azure',
      resumeText: 'Full-stack developer with .NET and Azure cloud experience.',
      applications: 6,
      shortlistedBy: [],
      timezone: 'Europe/Berlin',
      yearsOfExperience: 6,
      education: 'Master of Science in Software Engineering',
      photo: 'https://randomuser.me/api/portraits/men/44.jpg'
    }
  ];
  
  // Find candidate by ID
  const candidate = candidates.find(c => c.id === candidateId);
  
  if (!candidate) {
    throw new APIError('Candidate not found', 404);
  }
  
  // Mock applications for this candidate
  const applications = [
    {
      id: 'app1',
      jobId: 'job1',
      userId: candidate.id,
      status: 'applied',
      appliedDate: '2023-05-15T10:00:00Z',
      updatedAt: '2023-05-15T10:00:00Z',
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp',
      matchScore: 87
    },
    {
      id: 'app2',
      jobId: 'job2',
      userId: candidate.id,
      status: 'interview',
      appliedDate: '2023-05-20T14:30:00Z',
      interviewDate: '2023-06-01T11:00:00Z',
      updatedAt: '2023-05-25T09:15:00Z',
      jobTitle: 'Full Stack Engineer',
      company: 'InnovateTech',
      matchScore: 92
    },
    {
      id: 'app3',
      jobId: 'job3',
      userId: candidate.id,
      status: 'rejected',
      appliedDate: '2023-04-10T08:45:00Z',
      rejectedDate: '2023-04-25T16:20:00Z',
      updatedAt: '2023-04-25T16:20:00Z',
      jobTitle: 'Software Architect',
      company: 'GlobalSoft',
      matchScore: 75
    }
  ];
  
  // Mock interviews for this candidate
  const interviews = [
    {
      id: 'int1',
      recruiterId: 'admin456',
      candidateId: candidate.id,
      time: '2023-06-05T13:00:00Z',
      method: 'Zoom',
      message: 'Technical interview for the Frontend Developer position',
      createdAt: '2023-05-28T09:30:00Z',
      calendarInviteSent: true,
      duration: 45,
      status: 'pending',
      acceptUrl: 'https://nexture.app/interview/respond/int1?response=accept',
      declineUrl: 'https://nexture.app/interview/respond/int1?response=decline'
    }
  ];
  
  return {
    candidate,
    applications,
    interviews
  };
}

/**
 * Mock get recruiter stats handler
 */
function handleGetRecruiterStats() {
  // For demo, return mock recruiter stats
  return {
    stats: {
      totalScheduled: 24,
      accepted: 18,
      declined: 3,
      noResponse: 3,
      rescheduled: 5,
      acceptanceRate: 75, // percentage
      interviewsByMethod: [
        { method: 'Zoom', count: 12 },
        { method: 'Google Meet', count: 8 },
        { method: 'In-person', count: 3 },
        { method: 'Phone', count: 1 }
      ]
    }
  };
}

/**
 * Mock compare candidates handler
 */
function handleCompareCandidates(endpoint: string) {
  // Parse query parameters
  const url = new URL(`https://example.com${endpoint}`);
  const candidateIds = url.searchParams.get('ids')?.split(',') || [];
  
  if (candidateIds.length === 0) {
    throw new APIError('No candidate IDs provided', 400);
  }
  
  // Mock candidates data (same as in handleGetCandidates)
  const allCandidates: Candidate[] = [
    {
      id: 'user1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      avgScore: 85,
      skillsText: 'react javascript typescript node.js express mongodb',
      resumeText: 'Experienced frontend developer with 5 years of experience in React and TypeScript.',
      applications: 7,
      shortlistedBy: ['admin456'],
      timezone: 'America/New_York',
      yearsOfExperience: 5,
      education: 'Bachelor of Science in Computer Science',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 'user2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      firstName: 'Jane',
      lastName: 'Smith',
      avgScore: 92,
      skillsText: 'python django flask machine learning data science',
      resumeText: 'Data scientist with expertise in Python, machine learning, and statistical analysis.',
      applications: 4,
      shortlistedBy: [],
      timezone: 'Europe/London',
      yearsOfExperience: 3,
      education: 'Master of Science in Data Science',
      photo: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 'user3',
      email: 'mike.johnson@example.com',
      name: 'Mike Johnson',
      firstName: 'Mike',
      lastName: 'Johnson',
      avgScore: 78,
      skillsText: 'java spring hibernate sql oracle',
      resumeText: 'Backend developer with Java and Spring Boot experience.',
      applications: 5,
      shortlistedBy: [],
      timezone: 'Asia/Tokyo',
      yearsOfExperience: 7,
      education: 'Bachelor of Engineering in Software Engineering',
      photo: 'https://randomuser.me/api/portraits/men/68.jpg'
    },
    {
      id: 'user4',
      email: 'sarah.williams@example.com',
      name: 'Sarah Williams',
      firstName: 'Sarah',
      lastName: 'Williams',
      avgScore: 88,
      skillsText: 'react react-native javascript mobile ios android',
      resumeText: 'Mobile developer specializing in React Native for cross-platform applications.',
      applications: 3,
      shortlistedBy: ['admin456'],
      timezone: 'America/Los_Angeles',
      yearsOfExperience: 4,
      education: 'Bachelor of Science in Computer Science',
      photo: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    {
      id: 'user5',
      email: 'david.brown@example.com',
      name: 'David Brown',
      firstName: 'David',
      lastName: 'Brown',
      avgScore: 72,
      skillsText: 'c# .net asp.net sql-server azure',
      resumeText: 'Full-stack developer with .NET and Azure cloud experience.',
      applications: 6,
      shortlistedBy: [],
      timezone: 'Europe/Berlin',
      yearsOfExperience: 6,
      education: 'Master of Science in Software Engineering',
      photo: 'https://randomuser.me/api/portraits/men/44.jpg'
    }
  ];
  
  // Filter candidates by ID
  const filteredCandidates = allCandidates.filter(c => candidateIds.includes(c.id));
  
  if (filteredCandidates.length === 0) {
    throw new APIError('No candidates found with the provided IDs', 404);
  }
  
  // Convert to CandidateComparison type with additional comparison data
  const comparisonCandidates = filteredCandidates.map(c => ({
    ...c,
    skillsMatch: Math.floor(Math.random() * 30) + 70, // Random value between 70-100
    interviewScore: Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 7 : undefined, // 70% chance of having a score between 7-10
    availability: ['Immediate', '2 weeks', '1 month', 'Flexible'][Math.floor(Math.random() * 4)],
    salaryExpectation: ['$80,000 - $100,000', '$100,000 - $120,000', '$120,000 - $140,000', 'Negotiable'][Math.floor(Math.random() * 4)]
  }));
  
  return { candidates: comparisonCandidates };
}