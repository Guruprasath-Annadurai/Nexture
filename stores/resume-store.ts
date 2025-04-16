import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { extractSkills } from '@/services/job-matching';

export interface Resume {
  id: string;
  name: string;
  text: string;
  file?: string;
  createdAt: string;
  updatedAt: string;
  skills?: string[];
}

interface ResumeState {
  resumes: Resume[];
  activeResumeId: string | null;
  activeResume: Resume | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addResume: (resume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt' | 'skills'>) => Promise<Resume>;
  updateResume: (id: string, updates: Partial<Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Resume>;
  deleteResume: (id: string) => Promise<void>;
  setActiveResume: (id: string) => void;
  getResumeById: (id: string) => Resume | undefined;
  extractResumeSkills: (resumeText: string) => string[];
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resumes: [],
      activeResumeId: null,
      activeResume: null,
      isLoading: false,
      error: null,
      
      addResume: async (resumeData) => {
        const newResume: Resume = {
          id: Date.now().toString(),
          ...resumeData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          skills: extractSkills(resumeData.text),
        };
        
        set(state => {
          const updatedResumes = [...state.resumes, newResume];
          // If this is the first resume, make it active
          const shouldSetActive = state.resumes.length === 0;
          
          return {
            resumes: updatedResumes,
            activeResumeId: shouldSetActive ? newResume.id : state.activeResumeId,
            activeResume: shouldSetActive ? newResume : state.activeResume,
          };
        });
        
        return newResume;
      },
      
      updateResume: async (id, updates) => {
        const resume = get().getResumeById(id);
        if (!resume) {
          throw new Error(`Resume with id ${id} not found`);
        }
        
        const updatedResume: Resume = {
          ...resume,
          ...updates,
          updatedAt: new Date().toISOString(),
          // Update skills if text was updated
          skills: updates.text ? extractSkills(updates.text) : resume.skills,
        };
        
        set(state => {
          const updatedResumes = state.resumes.map(r => 
            r.id === id ? updatedResume : r
          );
          
          // Update active resume if this was the active one
          const isActive = state.activeResumeId === id;
          
          return {
            resumes: updatedResumes,
            activeResume: isActive ? updatedResume : state.activeResume,
          };
        });
        
        return updatedResume;
      },
      
      deleteResume: async (id) => {
        set(state => {
          const updatedResumes = state.resumes.filter(r => r.id !== id);
          const wasActive = state.activeResumeId === id;
          
          // If we deleted the active resume, set a new active resume
          const newActiveId = wasActive && updatedResumes.length > 0 
            ? updatedResumes[0].id 
            : wasActive ? null : state.activeResumeId;
            
          const newActiveResume = newActiveId 
            ? updatedResumes.find(r => r.id === newActiveId) || null
            : null;
          
          return {
            resumes: updatedResumes,
            activeResumeId: newActiveId,
            activeResume: newActiveResume,
          };
        });
      },
      
      setActiveResume: (id) => {
        const resume = get().getResumeById(id);
        if (!resume) {
          console.error(`Cannot set active resume: Resume with id ${id} not found`);
          return;
        }
        
        set({
          activeResumeId: id,
          activeResume: resume,
        });
      },
      
      getResumeById: (id) => {
        return get().resumes.find(r => r.id === id);
      },
      
      extractResumeSkills: (resumeText) => {
        return extractSkills(resumeText);
      },
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);