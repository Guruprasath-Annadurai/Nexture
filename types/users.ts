export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: 'user' | 'admin' | 'superadmin' | 'recruiter';
  matchScore?: number;
  skills?: string[];
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
  lastActive?: string;
  location?: string;
  bio?: string;
  phone?: string;
  website?: string;
  avatar?: string;
  jobTitle?: string;
  twoFactorEnabled?: boolean;
  twoFactorVerified?: boolean;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  education?: {
    degree: string;
    institution: string;
    year: string;
  }[];
  experience?: {
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }[];
  preferences?: {
    jobTypes?: string[];
    locations?: string[];
    remote?: boolean;
    salary?: {
      min: number;
      max: number;
      currency: string;
    };
  };
  status?: 'active' | 'inactive' | 'banned';
  permissions?: string[];
}