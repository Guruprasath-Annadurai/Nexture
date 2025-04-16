import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIModel, AIModelOption } from '@/types/ai';

interface AIState {
  selectedModel: AIModel;
  supportedModels: AIModelOption[];
  setSelectedModel: (model: AIModel) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      selectedModel: 'claude',
      supportedModels: [
        { id: 'openai', label: 'OpenAI GPT-4', description: 'Powerful general-purpose AI model' },
        { id: 'claude', label: 'Claude 3.7', description: 'Excellent for nuanced text generation' },
        { id: 'grok', label: 'Grok (X AI)', description: 'Real-time data and witty responses' },
      ],
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: 'ai-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);