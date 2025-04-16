import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAPI } from '@/services/api';

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'user' | 'admin' | 'superadmin' | 'recruiter';
  createdAt: string;
  updatedAt?: string;
  lastActive?: string;
  avatar?: string;
  photo?: string;
  twoFactorEnabled?: boolean;
  twoFactorVerified?: boolean;
  twoFactorSecret?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
  
  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  clearError: () => void;
  setRememberMe: (value: boolean) => void;
  refreshAccessToken: () => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  setupTwoFactor: () => Promise<{ otpauth_url: string }>;
  verifyTwoFactor: (code: string) => Promise<boolean>;
  disableTwoFactor: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: false,
      
      setRememberMe: (value) => {
        set({ rememberMe: value });
      },
      
      login: async (email, password, rememberMe = false) => {
        try {
          set({ isLoading: true, error: null });
          
          // In a real app, this would be an API call
          // For this demo, we'll simulate a successful login
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const user: User = {
            id: '1',
            email,
            firstName: 'Demo',
            lastName: 'User',
            name: 'Demo User',
            phone: '+12345678901',
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80',
            twoFactorEnabled: false,
            twoFactorVerified: false,
          };
          
          const token = 'demo-token-' + Math.random().toString(36).substring(2);
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            rememberMe
          });
          
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: 'Invalid email or password',
          });
          return false;
        }
      },
      
      adminLogin: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          // In a real app, this would be an API call
          // For this demo, we'll simulate a successful login
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (email !== 'admin@example.com') {
            throw new Error('Not an admin account');
          }
          
          const user: User = {
            id: 'admin1',
            email,
            firstName: 'Admin',
            lastName: 'User',
            name: 'Admin User',
            phone: '+19876543210',
            role: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80',
            twoFactorEnabled: true,
            twoFactorVerified: true,
          };
          
          const token = 'admin-token-' + Math.random().toString(36).substring(2);
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: 'Invalid admin credentials',
          });
          return false;
        }
      },
      
      register: async (email, password, name, phone) => {
        try {
          set({ isLoading: true, error: null });
          
          // In a real app, this would be an API call
          // For this demo, we'll simulate a successful registration
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Split name into firstName and lastName
          const nameParts = name.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          
          const user: User = {
            id: Math.random().toString(36).substring(2),
            email,
            firstName,
            lastName,
            name,
            phone,
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            twoFactorEnabled: false,
            twoFactorVerified: false,
          };
          
          const token = 'new-user-token-' + Math.random().toString(36).substring(2);
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: 'Registration failed. Please try again.',
          });
          return false;
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      
      checkAuth: async () => {
        const { token } = get();
        
        if (!token) {
          return false;
        }
        
        try {
          set({ isLoading: true });
          
          // In a real app, this would validate the token with the API
          // For this demo, we'll assume the token is valid if it exists
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({ isLoading: false, isAuthenticated: true });
          return true;
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return false;
        }
      },
      
      refreshAccessToken: async () => {
        const { token } = get();
        
        if (!token) {
          return false;
        }
        
        try {
          // In a real app, this would refresh the token with the API
          // For this demo, we'll just simulate a token refresh
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // If the token is valid, we'll keep the current user and token
          set({ isAuthenticated: true });
          return true;
        } catch (error) {
          // If the token is invalid, we'll clear the user and token
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          return false;
        }
      },
      
      updateProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });
          
          // In a real app, this would be an API call
          // For this demo, we'll simulate a successful update
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('No user logged in');
          }
          
          // If name is being updated, update firstName and lastName too
          let updatedData = { ...data };
          if (data.name) {
            const nameParts = data.name.split(' ');
            updatedData.firstName = nameParts[0];
            updatedData.lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          }
          
          // If firstName or lastName is updated, update name too
          if (data.firstName || data.lastName) {
            const firstName = data.firstName || currentUser.firstName || '';
            const lastName = data.lastName || currentUser.lastName || '';
            updatedData.name = `${firstName} ${lastName}`.trim();
          }
          
          const updatedUser = {
            ...currentUser,
            ...updatedData,
            updatedAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          };
          
          set({
            user: updatedUser,
            isLoading: false,
          });
          
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to update profile',
          });
          return false;
        }
      },
      
      changePassword: async (currentPassword, newPassword) => {
        try {
          set({ isLoading: true, error: null });
          
          // In a real app, this would be an API call
          // For this demo, we'll simulate a successful password change
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Simulate validation of current password
          if (currentPassword === 'wrong-password') {
            throw new Error('Current password is incorrect');
          }
          
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to change password',
          });
          return false;
        }
      },
      
      setupTwoFactor: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // In a real app, this would be an API call to generate a TOTP secret
          // For this demo, we'll simulate a successful setup
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('No user logged in');
          }
          
          // Generate a fake otpauth URL for demo purposes
          const otpauth_url = `otpauth://totp/Nexture:${currentUser.email}?secret=JBSWY3DPEHPK3PXP&issuer=Nexture`;
          
          // Update user with twoFactorEnabled flag
          const updatedUser = {
            ...currentUser,
            twoFactorEnabled: true,
            twoFactorVerified: false,
            twoFactorSecret: 'JBSWY3DPEHPK3PXP', // This would be securely stored in a real app
            updatedAt: new Date().toISOString(),
          };
          
          set({
            user: updatedUser,
            isLoading: false,
          });
          
          return { otpauth_url };
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to set up two-factor authentication',
          });
          throw error;
        }
      },
      
      verifyTwoFactor: async (code) => {
        try {
          set({ isLoading: true, error: null });
          
          // In a real app, this would be an API call to verify the TOTP code
          // For this demo, we'll simulate a successful verification
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('No user logged in');
          }
          
          // For demo purposes, any 6-digit code is valid
          if (code.length !== 6 || !/^\d+$/.test(code)) {
            throw new Error('Invalid verification code');
          }
          
          // Update user with twoFactorVerified flag
          const updatedUser = {
            ...currentUser,
            twoFactorVerified: true,
            updatedAt: new Date().toISOString(),
          };
          
          set({
            user: updatedUser,
            isLoading: false,
          });
          
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to verify two-factor authentication',
          });
          return false;
        }
      },
      
      disableTwoFactor: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // In a real app, this would be an API call to disable 2FA
          // For this demo, we'll simulate a successful operation
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('No user logged in');
          }
          
          // Update user to disable 2FA
          const updatedUser = {
            ...currentUser,
            twoFactorEnabled: false,
            twoFactorVerified: false,
            twoFactorSecret: undefined,
            updatedAt: new Date().toISOString(),
          };
          
          set({
            user: updatedUser,
            isLoading: false,
          });
          
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to disable two-factor authentication',
          });
          return false;
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);