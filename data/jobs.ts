import { JobMatch } from '@/types/jobs';

export const jobsData: JobMatch[] = [
  {
    id: "1",
    title: "Senior React Developer",
    company: "Tech Corp Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120k - $180k",
    description: "We're looking for an experienced React Developer to join our team. You'll be responsible for building and maintaining high-performance web applications using React, TypeScript, and modern frontend tools.",
    skills: ["React", "TypeScript", "Node.js", "Redux", "GraphQL"],
    tags: ["Frontend", "Remote", "Senior"],
    postedDate: "2023-06-15T10:00:00Z",
    deadline: "2023-07-15T23:59:59Z",
    matchScore: 95,
    matchedSkills: ["React", "TypeScript", "Redux"],
    missingSkills: ["Node.js", "GraphQL"]
  },
  {
    id: "2",
    title: "React Native Developer",
    company: "Mobile Solutions",
    location: "New York, NY",
    type: "Full-time",
    salary: "$100k - $140k",
    description: "Join our mobile team to build cross-platform applications using React Native. You'll work on exciting projects for major clients across various industries.",
    skills: ["React Native", "JavaScript", "TypeScript", "Redux", "Mobile Development"],
    tags: ["Mobile", "Hybrid", "Mid-Level"],
    postedDate: "2023-06-10T09:30:00Z",
    deadline: "2023-07-10T23:59:59Z",
    matchScore: 88,
    matchedSkills: ["React Native", "JavaScript", "TypeScript"],
    missingSkills: ["Redux", "Mobile Development"]
  },
  {
    id: "3",
    title: "Frontend Engineer",
    company: "E-commerce Giant",
    location: "Seattle, WA",
    type: "Full-time",
    salary: "$110k - $150k",
    description: "Help us build the future of online shopping. We're looking for a talented frontend engineer to join our UI team and create exceptional user experiences.",
    skills: ["React", "JavaScript", "CSS", "HTML", "Webpack"],
    tags: ["Frontend", "On-site", "Mid-Level"],
    postedDate: "2023-06-05T14:00:00Z",
    deadline: "2023-07-05T23:59:59Z",
    matchScore: 82,
    matchedSkills: ["React", "JavaScript", "CSS"],
    missingSkills: ["HTML", "Webpack"]
  },
  {
    id: "4",
    title: "Full Stack Developer",
    company: "Startup Innovators",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$90k - $130k",
    description: "Join our fast-growing startup and work across the entire stack. We're building innovative solutions in the fintech space and need versatile developers.",
    skills: ["React", "Node.js", "MongoDB", "Express", "AWS"],
    tags: ["Full Stack", "Remote", "Junior"],
    postedDate: "2023-06-01T11:15:00Z",
    deadline: "2023-07-01T23:59:59Z",
    matchScore: 75,
    matchedSkills: ["React", "Node.js"],
    missingSkills: ["MongoDB", "Express", "AWS"]
  },
  {
    id: "5",
    title: "Senior Mobile Engineer",
    company: "HealthTech Inc.",
    location: "Boston, MA",
    type: "Full-time",
    salary: "$130k - $170k",
    description: "Lead the development of our mobile health platform. You'll be responsible for architecture decisions and implementing new features in our React Native app.",
    skills: ["React Native", "TypeScript", "Redux", "Native Modules", "Healthcare API"],
    tags: ["Mobile", "Healthcare", "Senior"],
    postedDate: "2023-05-28T08:45:00Z",
    deadline: "2023-06-28T23:59:59Z",
    matchScore: 92,
    matchedSkills: ["React Native", "TypeScript", "Redux", "Native Modules"],
    missingSkills: ["Healthcare API"]
  }
];