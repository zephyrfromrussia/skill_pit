import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SettingsState = {
  llmBaseUrl: string
  llmModel: string
  setLlmBaseUrl: (value: string) => void
  setLlmModel: (value: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      llmBaseUrl: 'http://127.0.0.1:1234/v1',
      llmModel: 'local-model',
      setLlmBaseUrl: (value) => set({ llmBaseUrl: value }),
      setLlmModel: (value) => set({ llmModel: value }),
    }),
    { name: 'skill-pit-settings' },
  ),
)

