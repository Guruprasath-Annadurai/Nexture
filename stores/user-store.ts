import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description?: string;
  earnedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  location?: string;
  website?: string;
  company?: string;
  position?: string;
  skills: string[];
  education: {
    school: string;
    degree: string;
    field: string;
    from: string;
    to: string;
  }[];
  experience: {
    company: string;
    position: string;
    from: string;
    to: string;
    description: string;
  }[];
  socialLinks: {
    platform: string;
    url: string;
  }[];
  lastProfileUpload?: string;
  photoFeedback?: string;
  avatarHistory?: string[];
  badges?: Badge[];
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    emailUpdates: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  profile: UserProfile;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  fetchProfile: () => Promise<void>;
  resetProfile: () => void;
  addBadge: (badge: Badge) => Promise<void>;
  removeBadge: (badgeId: string) => Promise<void>;
  addAvatarToHistory: (avatarUrl: string) => Promise<void>;
}

const defaultProfile: UserProfile = {
  id: '1',
  name: 'Demo User',
  email: 'user@example.com',
  bio: 'Software developer with a passion for building great products.',
  skills: ['JavaScript', 'React', 'Node.js'],
  education: [],
  experience: [],
  socialLinks: [],
  preferences: {
    theme: 'system',
    notifications: true,
    emailUpdates: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      isLoading: false,
      error: null,
      
      updateProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });
          
          // In a real app, this would be an API call
          // For this demo, we'll simulate a successful update
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const currentProfile = get().profile;
          const updatedProfile = {
            ...currentProfile,
            ...data,
            updatedAt: new Date().toISOString(),
          };
          
          set({
            profile: updatedProfile,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to update profile',
          });
        }
      },
      
      fetchProfile: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // In a real app, this would be an API call
          // For this demo, we'll simulate a successful fetch
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // If we already have a profile, we'll keep it
          // Otherwise, we'll use the default profile
          const currentProfile = get().profile;
          if (!currentProfile.id) {
            set({ profile: defaultProfile });
          }
          
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to fetch profile',
          });
        }
      },
      
      resetProfile: () => {
        set({ profile: defaultProfile });
      },
      
      addBadge: async (badge) => {
        try {
          set({ isLoading: true, error: null });
          
          // In a real app, this would be an API call
          // For this demo, we'll simulate a successful update
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const currentProfile = get().profile;
          const currentBadges = currentProfile.badges || [];
          
          // Check if badge already exists
          if (currentBadges.some(b => b.id === badge.id)) {
            set({ isLoading: false });
            return;
          }
          
          const updatedProfile = {
            ...currentProfile,
            badges: [...currentBadges, badge],
            updatedAt: new Date().toISOString(),
          };
          
          set({
            profile: updatedProfile,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to add badge',
          });
        }
      },
      
      removeBadge: async (badgeId) => {
        try {
          set({ isLoading: true, error: null });
          
          // In a real app, this would be an API call
          // For this demo, we'll simulate a successful update
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const currentProfile = get().profile;
          const currentBadges = currentProfile.badges || [];
          
          const updatedProfile = {
            ...currentProfile,
            badges: currentBadges.filter(b => b.id !== badgeId),
            updatedAt: new Date().toISOString(),
          };
          
          set({
            profile: updatedProfile,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to remove badge',
          });
        }
      },
      
      addAvatarToHistory: async (avatarUrl) => {
        try {
          set({ isLoading: true, error: null });
          
          // In a real app, this would be an API call
          // For this demo, we'll simulate a successful update
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const currentProfile = get().profile;
          const currentHistory = currentProfile.avatarHistory || [];
          
          // Add the avatar to the history, but limit to 5 most recent
          const updatedHistory = [avatarUrl, ...currentHistory].slice(0, 5);
          
          const updatedProfile = {
            ...currentProfile,
            avatarHistory: updatedHistory,
            updatedAt: new Date().toISOString(),
          };
          
          set({
            profile: updatedProfile,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to update avatar history',
          });
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);