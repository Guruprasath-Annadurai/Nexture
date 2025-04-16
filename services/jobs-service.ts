import { Platform } from 'react-native';
import { JobMatch, JobFilters, PaginatedResponse } from '@/types/jobs';
import { jobsData } from '@/data/jobs';

export const matchJobsWithResume = async (
  resumeText: string,
  filters?: JobFilters
): Promise<PaginatedResponse<JobMatch>> => {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;

  if (Platform.select({ web: true, default: false })) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let filteredJobs = [...jobsData];

    if (filters?.tags?.length) {
      filteredJobs = filteredJobs.filter(job =>
        filters.tags!.some(tag => job.tags.includes(tag))
      );
    }

    if (filters?.location) {
      filteredJobs = filteredJobs.filter(job =>
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters?.jobType) {
      filteredJobs = filteredJobs.filter(job =>
        job.type.toLowerCase() === filters.jobType!.toLowerCase()
      );
    }

    if (filters?.minSalary) {
      filteredJobs = filteredJobs.filter(job => {
        const salaryMatch = job.salary.match(/\$(\d+)k/);
        if (salaryMatch && salaryMatch[1]) {
          const minSalary = parseInt(salaryMatch[1]) * 1000;
          return minSalary >= (filters.minSalary || 0);
        }
        return true;
      });
    }

    if (filters?.minMatchScore) {
      filteredJobs = filteredJobs.filter(job =>
        job.matchScore >= (filters.minMatchScore || 0)
      );
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedResults = filteredJobs.slice(start, end);
    const total = filteredJobs.length;
    const totalPages = Math.ceil(total / limit);

    return {
      results: paginatedResults,
      total,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  // For non-web platforms, we would implement a real API call
  // For now, just return the same mock data
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedResults = jobsData.slice(start, end);
  const total = jobsData.length;
  const totalPages = Math.ceil(total / limit);

  return {
    results: paginatedResults,
    total,
    page,
    totalPages,
    hasMore: page < totalPages
  };
};