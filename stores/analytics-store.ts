import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApplicationAnalytics } from '@/services/analytics-service';
import { AnalyticsData, AnalyticsFilters } from '@/types/analytics';

interface AnalyticsState {
  analytics: AnalyticsData | null;
  filters: AnalyticsFilters;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // Actions
  fetchAnalytics: (userId: string) => Promise<void>;
  updateFilters: (filters: Partial<AnalyticsFilters>) => void;
  clearAnalytics: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      analytics: null,
      filters: {
        startDate: undefined,
        endDate: undefined,
        includeRejected: true,
        includeWithdrawn: false,
      },
      isLoading: false,
      error: null,
      lastUpdated: null,
      
      fetchAnalytics: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const data = await getApplicationAnalytics(userId);
          
          set({
            analytics: data,
            isLoading: false,
            lastUpdated: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error fetching analytics:', error);
          set({
            isLoading: false,
            error: 'Failed to load analytics data. Please try again.',
          });
        }
      },
      
      updateFilters: (filters: Partial<AnalyticsFilters>) => {
        set({
          filters: {
            ...get().filters,
            ...filters,
          },
        });
      },
      
      clearAnalytics: () => {
        set({
          analytics: null,
          lastUpdated: null,
        });
      },
    }),
    {
      name: 'analytics-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        analytics: state.analytics,
        filters: state.filters,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);